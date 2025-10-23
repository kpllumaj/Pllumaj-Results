"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChannel } from "@/hooks/useChannel";

type Need = {
  id: string;
  title: string;
  description: string;
  budgetAmount: number | null;
  budgetCurrency: string;
  client?: { email?: string | null } | null;
};

type Offer = {
  id: string;
  amount: number;
  message: string;
  createdAt: string;
  updatedAt?: string;
  needId: string;
  status: OfferStatus;
  expert?: { id: string; email?: string | null } | null;
  need?: { id: string; clientId: string };
};

type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

const STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

function formatStatus(status: OfferStatus) {
  return STATUS_LABELS[status] ?? status.toLowerCase();
}

export default function ClientDashboard() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedNeedId, setExpandedNeedId] = useState<string | null>(null);
  const [offersByNeed, setOffersByNeed] = useState<Record<string, Offer[]>>({});
  const [offersLoading, setOffersLoading] = useState<Record<string, boolean>>({});
  const [offersError, setOffersError] = useState<Record<string, string | null>>({});
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );

  const loadNeeds = useCallback(async () => {
    if (!user?.email) {
      setNeeds([]);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/needs`);
      if (!res.ok) {
        throw new Error("Failed to load needs");
      }
      const data = await res.json();
      const ownedNeeds = Array.isArray(data)
        ? data.filter((need: Need) => need?.client?.email === user.email)
        : [];
      setNeeds(ownedNeeds);
    } catch (error) {
      console.error("Failed to fetch needs", error);
    }
  }, [apiBase, user?.email]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }
    loadNeeds();
  }, [loading, user, loadNeeds]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const needId = expandedNeedId;
    if (!needId) {
      return;
    }

    if (offersByNeed[needId]) {
      return;
    }

    let cancelled = false;

    const fetchOffers = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setOffersError((prev) => ({
          ...prev,
          [needId]: "Please log in again to view offers.",
        }));
        return;
      }

      setOffersLoading((prev) => ({ ...prev, [needId]: true }));
      setOffersError((prev) => ({ ...prev, [needId]: null }));

      try {
        const res = await fetch(`${apiBase}/offers/for-need/${needId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || `Failed to load offers (${res.status})`);
        }

        const offers = await res.json();
        if (!cancelled) {
          setOffersByNeed((prev) => ({
            ...prev,
            [needId]: Array.isArray(offers) ? offers : [],
          }));
        }
      } catch (error) {
        console.error("Failed to load offers", error);
        if (!cancelled) {
          setOffersError((prev) => ({
            ...prev,
            [needId]:
              error instanceof Error
                ? error.message
                : "Could not load offers. Please try again.",
          }));
        }
      } finally {
        if (!cancelled) {
          setOffersLoading((prev) => ({ ...prev, [needId]: false }));
        }
      }
    };

    fetchOffers();

    return () => {
      cancelled = true;
    };
  }, [expandedNeedId, apiBase, loading, user, offersByNeed]);

  const handleNeedToggle = useCallback(
    (needId: string) => {
      setOffersError((prev) => ({ ...prev, [needId]: null }));
      setExpandedNeedId((current) => (current === needId ? null : needId));
    },
    [],
  );

  const handleOfferCreated = useCallback((needId: string, offer: Offer) => {
    setOffersByNeed((prev) => {
      const existing = prev[needId] ?? [];
      if (existing.some((item) => item.id === offer.id)) {
        return prev;
      }

      const nextOffers = [offer, ...existing].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return { ...prev, [needId]: nextOffers };
    });
  }, []);

  const handleOfferUpdated = useCallback((needId: string, offer: Offer) => {
    setOffersByNeed((prev) => {
      const existing = prev[needId] ?? [];
      const hasOffer = existing.some((item) => item.id === offer.id);
      const nextOffers = hasOffer
        ? existing.map((item) => (item.id === offer.id ? { ...item, ...offer } : item))
        : [offer, ...existing];

      const sorted = nextOffers.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return { ...prev, [needId]: sorted };
    });
  }, []);

  const clientChannel = useMemo(() => (user?.id ? `client-${user.id}` : null), [user?.id]);

  const clientChannelHandlers = useMemo(
    () => ({
      "offer:created": (payload: unknown) => {
        const offer = payload as Offer;
        const targetNeedId = offer?.needId ?? offer?.need?.id;
        if (!targetNeedId) {
          return;
        }
        handleOfferCreated(targetNeedId, offer);
      },
      "offer:updated": (payload: unknown) => {
        const offer = payload as Offer;
        const targetNeedId = offer?.needId ?? offer?.need?.id;
        if (!targetNeedId) {
          return;
        }
        handleOfferUpdated(targetNeedId, offer);
      },
    }),
    [handleOfferCreated, handleOfferUpdated],
  );

  useChannel(clientChannel, clientChannelHandlers);

  const handleOfferAction = useCallback(
    async (needId: string, offerId: string, action: "accept" | "decline") => {
      const normalizedAction = action === "accept" ? "accept" : "decline";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setOffersError((prev) => ({
          ...prev,
          [needId]: "Please log in again to respond to offers.",
        }));
        return;
      }

      setUpdatingOfferId(offerId);
      setOffersError((prev) => ({ ...prev, [needId]: null }));

      try {
        const res = await fetch(`${apiBase}/offers/${offerId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: normalizedAction }),
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || `Failed to ${normalizedAction} offer`);
        }

        const updated = (await res.json()) as Offer;
        handleOfferUpdated(needId, updated);
        setToast({
          message: normalizedAction === "accept" ? "Offer accepted." : "Offer declined.",
          tone: "success",
        });
      } catch (error) {
        console.error("Failed to update offer", error);
        setOffersError((prev) => ({
          ...prev,
          [needId]:
            error instanceof Error ? error.message : "Failed to update offer. Please try again.",
        }));
        setToast({
          message: error instanceof Error ? error.message : "Unable to update offer.",
          tone: "error",
        });
      } finally {
        setUpdatingOfferId(null);
      }
    },
    [apiBase, handleOfferUpdated],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-gray-500">
        Checking account...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-gray-500">
        Redirecting...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {toast ? (
        <div
          className={`fixed top-24 left-1/2 z-40 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg ${
            toast.tone === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border p-6 text-center shadow">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Welcome to your Dashboard</h1>
          <p className="text-gray-700">
            This page is protected and only visible to logged-in users.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-3 text-left text-sm text-gray-800">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 grid w-full max-w-2xl gap-6 text-left">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Post a New Need</h2>
          <p className="text-sm text-gray-500">
            Share what you need help with and providers will respond.
          </p>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!title.trim() || !description.trim()) {
                return;
              }

              try {
                setPosting(true);
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const res = await fetch(`${apiBase}/needs`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    title,
                    description,
                    budgetAmount: budget ? Number(budget) : undefined,
                  }),
                });

                if (!res.ok) {
                  const text = await res.text();
                  throw new Error(text || "Failed to create need");
                }

                setTitle("");
                setDescription("");
                setBudget("");
                setExpandedNeedId(null);
                setOffersByNeed({});
                setOffersError({});
                setOffersLoading({});

                await loadNeeds();
              } catch (error) {
                console.error("Failed to post need", error);
                alert("Could not post need. Please try again.");
              } finally {
                setPosting(false);
              }
            }}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Need title"
              className="rounded border p-2"
              required
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your need"
              className="min-h-[120px] rounded border p-2"
              required
            />
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="Budget (optional, USD)"
              className="rounded border p-2"
              type="number"
              min="0"
              step="0.01"
            />
            <button
              type="submit"
              disabled={posting}
              className="rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {posting ? "Posting..." : "Post Need"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">My Posted Needs</h2>
          <p className="mb-4 text-sm text-gray-500">Recent needs you have created.</p>
          {needs.length === 0 ? (
            <p className="text-sm text-gray-500">No needs posted yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {needs.map((need) => (
                <NeedOffersPanel
                  key={need.id}
                  need={need}
                  isExpanded={expandedNeedId === need.id}
                  offers={offersByNeed[need.id] ?? []}
                  isLoading={Boolean(offersLoading[need.id])}
                  error={offersError[need.id]}
                  onToggle={() => handleNeedToggle(need.id)}
                  onOfferAction={(offerId, action) => handleOfferAction(need.id, offerId, action)}
                  updatingOfferId={updatingOfferId}
                  onOfferCreated={handleOfferCreated}
                  onOfferUpdated={handleOfferUpdated}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

type NeedOffersPanelProps = {
  need: Need;
  isExpanded: boolean;
  offers: Offer[];
  isLoading: boolean;
  error?: string | null;
  onToggle: () => void;
  onOfferAction: (offerId: string, action: "accept" | "decline") => void;
  updatingOfferId: string | null;
  onOfferCreated: (needId: string, offer: Offer) => void;
  onOfferUpdated: (needId: string, offer: Offer) => void;
};

function NeedOffersPanel({
  need,
  isExpanded,
  offers,
  isLoading,
  error,
  onToggle,
  onOfferAction,
  updatingOfferId,
  onOfferCreated,
  onOfferUpdated,
}: NeedOffersPanelProps) {
  const channelName = isExpanded ? `need-${need.id}` : null;

  const eventHandlers = useMemo(
    () => ({
      "offer:created": (payload: unknown) => {
        onOfferCreated(need.id, payload as Offer);
      },
      "offer:updated": (payload: unknown) => {
        onOfferUpdated(need.id, payload as Offer);
      },
    }),
    [need.id, onOfferCreated, onOfferUpdated],
  );

  useChannel(channelName, eventHandlers);

  return (
    <li className="rounded border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">{need.title}</h3>
          <p className="text-gray-600">{need.description}</p>
          <p className="mt-1 text-xs text-gray-500">
            Budget: {need.budgetAmount != null ? `$${Number(need.budgetAmount).toFixed(2)}` : "N/A"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-200"
        >
          {isExpanded ? "Hide Offers" : "View Offers"}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-gray-700">
          {isLoading ? (
            <p className="text-sm text-gray-600">Loading offers...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : offers.length === 0 ? (
            <p className="text-sm text-gray-600">No offers yet. Experts will respond soon.</p>
          ) : (
            <ul className="space-y-2">
              {offers.map((offer) => {
                const isPending = offer.status === "PENDING";
                const disabled = updatingOfferId === offer.id;
                return (
                  <li
                    key={offer.id}
                    className="rounded border border-emerald-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-emerald-700">
                      <span>
                        {offer.amount != null ? `$${Number(offer.amount).toFixed(2)}` : "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(offer.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{offer.message}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      From: {offer.expert?.email ?? "Unknown expert"}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      Status: {formatStatus(offer.status)}
                    </p>
                    {isPending ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onOfferAction(offer.id, "accept")}
                          className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                          disabled={disabled}
                        >
                          {disabled ? "Processing..." : "Accept"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onOfferAction(offer.id, "decline")}
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                          disabled={disabled}
                        >
                          {disabled ? "Processing..." : "Decline"}
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}
