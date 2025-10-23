"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, parseUser, type UserShape } from "@/lib/auth";

type AuthContextType = {
  user: UserShape;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserShape>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = () => {
    const token = getToken();
    const parsed = parseUser(token);
    setUser(parsed ?? (token ? ({ id: "unknown", email: "unknown", role: "client" } as any) : null));
  };

  useEffect(() => {
    try {
      hydrate();
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("token");
    setUser(null);
  };

  const refresh = () => {
    hydrate();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
