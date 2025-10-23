"use client";

import ClientDashboard from "@/components/dashboard/client-dashboard";
import ExpertDashboard from "@/components/dashboard/expert-dashboard";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

function DashboardContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === "client") {
    return <ClientDashboard />;
  }

  if (user.role === "expert") {
    return <ExpertDashboard />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center text-gray-500">
      Dashboard not available for this role.
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
