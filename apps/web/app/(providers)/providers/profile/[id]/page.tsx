import ProviderProfile from '@/components/provider-profile';

interface ProviderProfilePageProps {
  params: { id: string };
}

export default function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Provider HQ</p>
        <h1 className="text-3xl font-bold">Business profile</h1>
        <p className="text-slate-600">
          Manage your offers, highlight expertise, and demonstrate verified credentials.
        </p>
      </header>
      <ProviderProfile providerId={params.id} />
    </section>
  );
}
