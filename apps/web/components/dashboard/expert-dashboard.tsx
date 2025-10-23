"use client";

import { useEffect, useMemo, useState } from "react";

type Need = {
  id: string;
  title: string;
  description: string;
  budgetAmount: number | null;
  budgetCurrency: string;
  createdAt: string;
  client?: {
    email?: string | null;
  } | null;
};

interface OfferFormState {
  price: string;
  message: string;
}

export default function ExpertDashboard() {
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    [],
  );
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNeed, setActiveNeed] = useState<Need | null>(null);
  const [form, setForm] = useState<OfferFormState>({ price: "", message: "" });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/needs`);
        if (!res.ok) throw new Error(`Failed to load needs (${res.status})`);
        const data = await res.json();
        setNeeds(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load needs.");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  function openModal(need: Need) {
    setActiveNeed(need);
    setForm({
      price: need.budgetAmount ? Number(need.budgetAmount).toFixed(2) : "",
      message: "",
    });
  }

  function closeModal() {
    setActiveNeed(null);
    setForm({ price: "", message: "" });
  }

  function submitOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeNeed) return;

    console.log("Offer submitted", {
      needId: activeNeed.id,
      price: Number(form.price),
      message: form.message,
    });

    closeModal();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Expert Opportunities</h1>
        <p className="mt-2 text-gray-600">
          Review recent client requests and send offers tailored to your expertise.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-gray-500">Loading needs…</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : needs.length === 0 ? (
        <p className="text-center text-gray-500">No active needs at this time.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {needs.map((need) => (
            <li
              key={need.id}
              className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition ease-out hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex-grow space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{need.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{need.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {need.budgetAmount != null
                      ? `${need.budgetCurrency || "USD"} ${Number(need.budgetAmount).toFixed(2)}`
                      : "Budget TBD"}
                  </span>
                  <span>{new Date(need.createdAt).toLocaleString()}</span>
                  <span className="text-xs text-gray-400">
                    Client: {need.client?.email ?? "Hidden"}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => openModal(need)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Send Offer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {activeNeed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Send Offer for “{activeNeed.title}”
            </h2>
            <form className="mt-4 space-y-4" onSubmit={submitOffer}>
              <label className="block text-sm font-medium text-gray-700">
                Price (USD)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Message
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={4}
                  placeholder="Share availability, approach, or questions for the client."
                  required
                />
              </label>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Submit Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
