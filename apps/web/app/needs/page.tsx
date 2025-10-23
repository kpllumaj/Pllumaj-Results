"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";

type Need = {
  id: string;
  title: string;
  description: string;
  budgetAmount: number | null;
  budgetCurrency: string;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function NeedsListContent() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNeeds = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/needs`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNeeds(data);
      } else {
        console.error("Unexpected needs response", data);
        setNeeds([]);
      }
    } catch (error) {
      console.error("Error fetching needs", error);
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    loadNeeds();
  }, [user, loadNeeds]);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="mb-4 text-3xl font-bold">All Posted Needs</h1>
      {needs.length === 0 ? (
        <p>No needs posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {needs.map((need) => (
            <li key={need.id} className="rounded-lg border p-4 shadow-sm transition hover:bg-gray-50">
              <Link href={`/needs/${need.id}`}>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">{need.title}</h2>
              </Link>
              <p className="text-gray-700">{need.description}</p>
              {need.budgetAmount && (
                <p className="text-sm text-gray-500">
                  Budget: {need.budgetAmount} {need.budgetCurrency}
                </p>
              )}
              <p className="text-xs text-gray-400">Posted on {new Date(need.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NeedsListPage() {
  return (
    <RequireAuth>
      <NeedsListContent />
    </RequireAuth>
  );
}
