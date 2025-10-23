"use client";

import PostNeedForm from "@/components/post-need-form";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function PostPage() {
  const checking = useAuthRedirect();

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center text-gray-500">Checking access...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold text-primary uppercase">Create</p>
        <h1 className="text-3xl font-bold">Post a Need</h1>
        <p className="text-slate-600">
          Share details about your request so we can match you with the best providers.
        </p>
      </header>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <PostNeedForm />
      </div>
    </main>
  );
}
