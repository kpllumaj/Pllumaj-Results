import AdminDashboard from '@/components/admin-dashboard';

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Command center</p>
        <h1 className="text-3xl font-bold">Admin controls</h1>
        <p className="text-slate-600">
          Monitor marketplace quality, enforce compliance, and resolve escalations quickly.
        </p>
      </header>
      <AdminDashboard />
    </section>
  );
}
