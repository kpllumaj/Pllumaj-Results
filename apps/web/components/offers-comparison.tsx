'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { sampleMatchScores, sampleOffers, sampleNeed } from '@/lib/mock-data';

export default function OffersComparison() {
  const [selectedOfferId, setSelectedOfferId] = useState(sampleOffers[0]?.id ?? null);
  const selectedOffer = useMemo(
    () => sampleOffers.find((offer) => offer.id === selectedOfferId) ?? sampleOffers[0],
    [selectedOfferId],
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
      <section className="space-y-4">
        <header className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Need summary</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-800">Title</dt>
              <dd>{sampleNeed.title}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Category</dt>
              <dd>{sampleNeed.category}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Location</dt>
              <dd>{sampleNeed.location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Budget</dt>
              <dd>{sampleNeed.budget}</dd>
            </div>
          </dl>
        </header>
        <div className="space-y-3">
          {sampleOffers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className={clsx(
                'w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:border-primary hover:shadow-md',
                selectedOfferId === offer.id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">{offer.providerName}</p>
                  <p className="mt-1 text-sm text-slate-600">{offer.message}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p className="text-lg font-bold text-slate-800">${offer.price}</p>
                  <p>{offer.etaMinutes} min ETA</p>
                  <p>{offer.rating.toFixed(1)} stars</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Match score</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {sampleMatchScores.map((match) => (
              <li
                key={match.providerId}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <span className="font-medium capitalize">
                  {match.providerId.replace('-', ' ')}
                </span>
                <span className="text-base font-semibold text-primary">{match.score}</span>
              </li>
            ))}
          </ul>
        </div>
        {selectedOffer ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Selected offer</h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Price</dt>
                <dd className="font-semibold text-slate-900">${selectedOffer.price}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>ETA</dt>
                <dd>{selectedOffer.etaMinutes} minutes</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Rating</dt>
                <dd>{selectedOffer.rating.toFixed(1)} / 5</dd>
              </div>
            </dl>
            <button className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-white shadow">
              Proceed to checkout
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
