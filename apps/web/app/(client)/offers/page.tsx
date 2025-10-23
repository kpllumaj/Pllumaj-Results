import OffersComparison from '@/components/offers-comparison';

export default function OffersInboxPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Step 2</p>
        <h1 className="text-3xl font-bold">Compare offers</h1>
        <p className="text-slate-600">
          Review each provider on price, ETA, rating, and platform-calculated match score.
        </p>
      </header>
      <OffersComparison />
    </section>
  );
}
