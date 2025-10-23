"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect(): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    setChecking(false);
  }, [router]);

  return checking;
}
