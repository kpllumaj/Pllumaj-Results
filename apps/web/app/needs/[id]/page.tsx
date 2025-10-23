"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api-client";
import { useChannel } from "@/hooks/useChannel";

type Offer = {
  id: string;
  amount?: number;
  price?: number;
  currency?: string;
  message: string;
  createdAt: string;
  status?: string;
  expert?: { id: string; email?: string | null };
  providerName?: string;
};

type Need = {
  id: string;
  title: string;
  description: string;
  budgetAmount: number | null;
  budgetCurrency: string | null;
};

function NeedDetailsContent({ id }: { id: string }) {
  const { user } = useAuth();
  const [need, setNeed] = useState<Need | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const isClient = user?.role === "client";
  const isExpert = user?.role === "expert";

  const loadNeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Need[]>("/needs");
      if (Array.isArray(data)) {
        const found = data.find((item: Need) => item.id === id) ?? null;
        setNeed(found);
      } else {
        setNeed(null);
      }
    } catch (error) {
      console.error("Failed to load need", error);
      setNeed(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadOffers = useCallback(async () => {
    try {
      setOffersLoading(true);
      const data = await apiFetch<Offer[]>(`/offers/for-need/${id}`);
      if (!Array.isArray(data)) {
        setOffers([]);
        return;
      }

      setOffers(data);
    } catch (error) {
      console.error("Failed to load offers", error);
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, [id, isExpert, user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }
    loadNeed();
    loadOffers();
  }, [user, loadNeed, loadOffers]);

  const filteredOffers = useMemo(() => offers, [offers]);

  useChannel(
    `need-${id}`,
    useMemo(
      () => ({
        "offer:created": (payload: any) => {
          setOffers((prev) => {
            if (!Array.isArray(prev)) {
              return [payload];
            }
            if (prev.some((offer) => offer.id === payload.id)) {
              return prev;
            }
            if (isExpert && user?.id && payload?.expert?.id === user.id) {
              return prev;
            }
            return [...prev, payload];
          });
        },
        "offer:updated": (payload: any) => {
          setOffers((prev) =>
            prev.map((offer) => (offer.id === payload.id ? { ...offer, ...payload } : offer)),
          );
        },
      }),
      [id, isExpert, user?.id],
    ),
  );

  async function submitOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const token = getToken();
    if (!token) {
      alert("You must be logged in to send an offer.");
      return;
    }

    const message = String(form.get("message") ?? "").trim();
    const providerName = String(form.get("providerName") ?? "").trim();
    const rawAmount = form.get("price");
    const amount = rawAmount ? Number(rawAmount) : 0;
    const currency = String(form.get("currency") ?? "USD");

    if (!message) {
      alert("Message is required.");
      return;
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      alert("Please provide a valid offer amount above 0.");
      return;
    }

    try {
      setSubmittingOffer(true);
      await apiFetch("/offers", {
        method: "POST",
        body: JSON.stringify({
          needId: id,
          amount,
          message: providerName ? `${providerName}: ${message}` : message,
          currency,
        }),
      });
      alert("Offer sent successfully!");
      event.currentTarget.reset();
      await loadOffers();
      return;
    } catch (error) {
      console.error("Failed to submit offer", error);
      alert("Failed to send offer");
    } finally {
      setSubmittingOffer(false);
    }
  }

  async function handleOfferAction(offerId: string, action: "ACCEPTED" | "DECLINED") {
    try {
      await apiFetch(`/offers/${offerId}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: action === "ACCEPTED" ? "accept" : "decline",
        }),
      });
      alert(`Offer ${action === "ACCEPTED" ? "accepted" : "declined"} successfully!`);
      await loadOffers();
    } catch (error) {
      console.error("Failed to update offer", error);
      alert("Failed to update offer.");
    }
  }

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading need...</p>;
  }

  if (!need) {
    return <p className="p-6 text-center text-gray-500">Need not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-bold">{need.title}</h1>
      <p>{need.description}</p>
      {need.budgetAmount && (
        <p>
          <b>Budget:</b> {need.budgetAmount} {need.budgetCurrency ?? "USD"}
        </p>
      )}

      <hr />

      <h2 className="text-xl font-semibold">Offers</h2>
      {offersLoading ? (
        <p>Loading offers...</p>
      ) : filteredOffers.length === 0 ? (
        <p>No offers yet.</p>
      ) : (
        <ul className="space-y-2">
          {filteredOffers.map((offer) => (
            <li key={offer.id} className="border rounded-md p-3">
              <p className="font-semibold">{offer.providerName ?? offer.expert?.email ?? "Provider"}</p>
              <p>{offer.message}</p>
              {offer.amount != null || offer.price != null ? (
                <p>
                  Offer: {offer.amount ?? offer.price} {offer.currency ?? "USD"}
                </p>
              ) : null}
              <p className="text-xs text-gray-400">{new Date(offer.createdAt).toLocaleString()}</p>

              {isClient ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOfferAction(offer.id, "ACCEPTED")}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOfferAction(offer.id, "DECLINED")}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <hr />

      {isExpert ? (
        <>
          <h2 className="text-xl font-semibold">Submit an Offer</h2>
          <form onSubmit={submitOffer} className="space-y-3">
            <input
              name="providerName"
              placeholder="Your name"
              className="border rounded-md p-2 w-full"
              required
            />
            <textarea
              name="message"
              placeholder="Your message"
              className="border rounded-md p-2 w-full"
              required
            />
            <input name="price" type="number" placeholder="Price" className="border rounded-md p-2 w-full" required />
            <select name="currency" className="border rounded-md p-2 w-full">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-blue-400" disabled={submittingOffer}>
              Submit Offer
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}

export default function NeedDetailsPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <NeedDetailsContent id={params.id} />
    </RequireAuth>
  );
}



