'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

interface CheckoutFormState {
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const DEFAULT_STATE: CheckoutFormState = {
  cardNumber: '',
  expiry: '',
  cvc: '',
};

export default function CheckoutCard() {
  const router = useRouter();
  const params = useParams();
  const orderId = useMemo(() => {
    const value = params?.orderId;
    return Array.isArray(value) ? value[0] : value ?? 'pending-order';
  }, [params]);
  const [form, setForm] = useState(DEFAULT_STATE);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Real integration would create a PaymentIntent and confirm via Stripe.js.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(`/orders/${orderId}/confirmation`);
    } catch (err) {
      setError('Unable to process payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <dt>Provider</dt>
            <dd className="font-semibold text-slate-900">SwiftFix Plumbing</dd>
          </div>
          <div className="flex justify-between">
            <dt>Service</dt>
            <dd>Kitchen faucet repair</dd>
          </div>
          <div className="flex justify-between">
            <dt>Scheduled</dt>
            <dd>Today at 3:30 PM</dd>
          </div>
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>$120.00</dd>
          </div>
          <div className="flex justify-between">
            <dt>Platform fee</dt>
            <dd>$4.80</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd>$124.80</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Payment</h2>
        <p className="mt-2 text-sm text-slate-600">
          Payments are handled through Stripe Connect to route provider payouts securely.
        </p>
        <div className="mt-4 space-y-4">
          <label className="space-y-2 text-sm font-semibold">
            Card number
            <input
              required
              inputMode="numeric"
              pattern="[0-9 ]*"
              autoComplete="cc-number"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              placeholder="4242 4242 4242 4242"
              value={form.cardNumber}
              onChange={(event) => setForm({ ...form, cardNumber: event.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm font-semibold">
              Expiry
              <input
                required
                placeholder="MM/YY"
                autoComplete="cc-exp"
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={form.expiry}
                onChange={(event) => setForm({ ...form, expiry: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              CVC
              <input
                required
                placeholder="123"
                autoComplete="cc-csc"
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={form.cvc}
                onChange={(event) => setForm({ ...form, cvc: event.target.value })}
              />
            </label>
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-accent px-4 py-3 text-base font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Processing...' : 'Pay securely'}
      </button>
    </form>
  );
}
