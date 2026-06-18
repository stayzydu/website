"use client";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) { setIsAdmin(false); return; }
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(u => setIsAdmin(u?.role === "admin"))
        .catch(() => setIsAdmin(false))
    );
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-8 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Stayzy" width={80} height={80} className="object-contain" />
      </Link>

      <div className="flex-1 flex items-center justify-center gap-10">
        <Link href="/pgs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Explore</Link>
        <Link href="/#how" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How it works</Link>
        <Link href="/#about" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">About</Link>
      </div>

      <div className="flex items-center gap-3" style={{ minWidth: 120 }}>
        {!isLoaded ? null : !isSignedIn ? (
          <>
            <Link href="/sign-in"
              className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Log in
            </Link>
            <Link href="/sign-up"
              className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors">
              Sign up
            </Link>
          </>
        ) : (
          <>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Admin</Link>
            )}
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8", userButtonTrigger: "focus:shadow-none" } }} />
          </>
        )}
      </div>
    </nav>
  );
}
