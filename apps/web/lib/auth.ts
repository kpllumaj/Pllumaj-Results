"use client";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem("token");
}

export type UserShape = { id: string; email: string; role: "client" | "expert" } | null;

export function parseUser(token: string | null): UserShape {
  if (!token) return null;
  return null;
}
