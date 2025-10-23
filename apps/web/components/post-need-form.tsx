"use client";

import { useState } from "react";

type FormState = {
  title: string;
  description: string;
  budgetAmount: string; // keep as string for the input; we’ll coerce to number on submit
  budgetCurrency: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PostNeedForm() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    budgetAmount: "",
    budgetCurrency: "USD",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert("Title and description are required.");
      return;
    }

    const amount = Number(form.budgetAmount);
    if (form.budgetAmount && (Number.isNaN(amount) || amount < 0)) {
      alert("Budget must be a valid non-negative number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/needs", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          budgetAmount: form.budgetAmount ? amount : null,
          budgetCurrency: form.budgetCurrency || "USD",
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
      }

      alert("Need posted successfully.");
      setForm({ title: "", description: "", budgetAmount: "", budgetCurrency: "USD" });
    } catch (err: any) {
      console.error(err);
      alert(`Failed to post need: ${err?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Fix leaking sink"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          placeholder="Describe the problem and any details providers should know."
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Budget</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border px-3 py-2"
            placeholder="50"
            value={form.budgetAmount}
            onChange={(e) => update("budgetAmount", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={form.budgetCurrency}
            onChange={(e) => update("budgetCurrency", e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post Need"}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        API: <code>{API_URL}/needs</code>
      </p>
    </form>
  );
}
