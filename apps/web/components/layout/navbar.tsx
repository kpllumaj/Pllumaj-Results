"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white">
      <Link href="/" className="text-lg font-semibold">
        Pllumaj Results
      </Link>
      <div className="flex gap-4 items-center text-sm">
        <Link href="/feed">Public Feed</Link>
        {!loading && user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/needs">Post Need</Link>
            <span className="text-gray-500">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
