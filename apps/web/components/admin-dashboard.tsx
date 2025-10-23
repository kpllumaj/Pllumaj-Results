'use client';

import { useState } from 'react';

interface PendingProvider {
  id: string;
  name: string;
  category: string;
  documents: string[];
}

interface OpenDispute {
  id: string;
  orderId: string;
  reason: string;
  submittedBy: string;
}

const pendingProviders: PendingProvider[] = [
  {
    id: 'biz-122',
    name: 'BrightClean Co.',
    category: 'Cleaning',
    documents: ['DBA Certificate', 'Liability Insurance PDF'],
  },
  {
    id: 'biz-891',
    name: 'HandyPro Repairs',
    category: 'Handyman',
    documents: ['Business License', 'Background checks'],
  },
];

const openDisputes: OpenDispute[] = [
  {
    id: 'disp-11',
    orderId: 'order-442',
    reason: 'Provider arrived two hours late',
    submittedBy: 'Client',
  },
  {
    id: 'disp-12',
    orderId: 'order-448',
    reason: 'Service quality not as described',
    submittedBy: 'Client',
  },
];

export default function AdminDashboard() {
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);

  function handleVerify(id: string) {
    setVerifiedIds((prev) => [...prev, id]);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Providers awaiting verification</h2>
            <p className="text-sm text-slate-600">Review documentation before activating.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {pendingProviders.length} pending
          </span>
        </header>
        <ul className="mt-4 space-y-4 text-sm text-slate-600">
          {pendingProviders.map((provider) => (
            <li key={provider.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-800">{provider.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {provider.category}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {provider.documents.map((doc) => (
                      <li key={doc} className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  disabled={verifiedIds.includes(provider.id)}
                  onClick={() => handleVerify(provider.id)}
                  className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {verifiedIds.includes(provider.id) ? 'Verified' : 'Verify'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Open disputes</h2>
            <p className="text-sm text-slate-600">Coordinate mediation and refunds.</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            SLA: Less than 24h
          </span>
        </header>
        <ul className="mt-4 space-y-4 text-sm text-slate-600">
          {openDisputes.map((dispute) => (
            <li key={dispute.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-800">{dispute.reason}</p>
                  <p className="text-xs text-slate-500">Order {dispute.orderId}</p>
                  <p className="mt-1 text-xs text-slate-500">Submitted by {dispute.submittedBy}</p>
                </div>
                <button className="rounded-md border border-accent px-3 py-2 text-xs font-semibold text-accent">
                  Review case
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
