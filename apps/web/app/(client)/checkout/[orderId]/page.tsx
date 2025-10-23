import CheckoutCard from '@/components/checkout-card';

interface CheckoutPageProps {
  params: { orderId: string };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Step 3</p>
        <h1 className="text-3xl font-bold">Checkout & track</h1>
        <p className="text-slate-600">
          Stripe Connect secures payments while we orchestrate fulfillment and provider payouts.
        </p>
        <p className="text-sm text-slate-500">Order #{params.orderId}</p>
      </header>
      <CheckoutCard />
    </section>
  );
}
