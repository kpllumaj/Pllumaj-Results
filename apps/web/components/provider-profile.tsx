'use client';

import { useMemo } from 'react';

const providerCatalog = {
  'sample-provider': {
    id: 'sample-provider',
    name: 'SwiftFix Plumbing',
    tagline: 'Rapid-response licensed plumbers for households and businesses.',
    rating: 4.8,
    completedJobs: 1243,
    responseTime: '12 min avg',
    serviceAreas: ['Midtown', 'Upper East Side', 'Downtown'],
    services: [
      { name: 'Emergency leak repair', price: 120 },
      { name: 'Water heater maintenance', price: 210 },
      { name: 'Pipe replacement (per ft)', price: 45 },
    ],
    certifications: ['NYC Master Plumber License #55612', 'OSHA Safety Certified'],
    teamSize: 14,
  },
};

function ProviderProfileContent({ providerId }: { providerId: string }) {
  const providerCatalogMap = providerCatalog as Record<
    string,
    (typeof providerCatalog)['sample-provider']
  >;

  const provider = useMemo(
    () => providerCatalogMap[providerId] ?? providerCatalogMap['sample-provider'],
    [providerId],
  );

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Verified business
          </span>
          <h1 className="text-3xl font-bold">{provider.name}</h1>
          <p className="text-slate-600">{provider.tagline}</p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-sm text-slate-600">
          <div>
            <dt className="font-semibold text-slate-800">Rating</dt>
            <dd>{provider.rating.toFixed(1)} / 5</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Jobs completed</dt>
            <dd>{provider.completedJobs.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Response time</dt>
            <dd>{provider.responseTime}</dd>
          </div>
        </dl>
        <section>
          <h2 className="text-xl font-semibold">Popular services</h2>
          <ul className="mt-3 space-y-3">
            {provider.services.map((service) => (
              <li key={service.name} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{service.name}</span>
                  <span className="text-sm text-slate-600">Starting at ${service.price}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Certifications</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            {provider.certifications.map((cert) => (
              <li key={cert} className="rounded-full bg-slate-100 px-3 py-1">
                {cert}
              </li>
            ))}
          </ul>
        </section>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Send offer</h2>
          <p className="mt-2 text-sm text-slate-600">
            Businesses customise proposals and availability before responding to a posted need.
          </p>
          <button className="mt-4 w-full rounded-md bg-primary px-4 py-2 font-semibold text-white shadow">
            Create tailored offer
          </button>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Team & service area</h2>
          <p className="text-sm text-slate-600">Team size: {provider.teamSize} professionals</p>
          <h3 className="mt-3 text-sm font-semibold text-slate-800">Serving</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {provider.serviceAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default function ProviderProfile({ providerId }: { providerId: string }) {
  return <ProviderProfileContent providerId={providerId} />;
}
