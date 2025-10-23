"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JwtPayload = {
  email?: string;
  role?: string;
  exp?: number;
};

interface Props {
  children: React.ReactNode;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return payload ? (JSON.parse(atob(payload)) as JwtPayload) : null;
  } catch (error) {
    console.error("Failed to parse token", error);
    return null;
  }
}

export default function AuthGuard({ children }: Props) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = decodeToken(token);
    if (!payload?.exp) {
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return <p className="text-center mt-20">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
