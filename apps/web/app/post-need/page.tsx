"use client";

import PostNeedForm from "@/components/post-need-form";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function PostNeedPage() {
  const checking = useAuthRedirect();

  if (checking) {
    return <section className="flex min-h-screen items-center justify-center text-gray-500">Checking access...</section>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-primary">Step 1</p>
        <h1 className="text-3xl font-bold">Tell us what you need</h1>
        <p className="text-slate-600">
          The matching engine uses your details to recommend the best experts and businesses.
        </p>
      </header>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <PostNeedForm />
      </div>
    </section>
  );
}
