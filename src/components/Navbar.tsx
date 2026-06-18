"use client";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getWishlist } from "@/lib/wishlist";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export default function Navbar() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstitute, setIsInstitute] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const scrolled = useScrolled();

  useEffect(() => {
    setWishCount(getWishlist().length);
    const update = () => setWishCount(getWishlist().length);
    window.addEventListener("wishlist-change", update);
    return () => window.removeEventListener("wishlist-change", update);
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) { setIsAdmin(false); setIsInstitute(false); return; }
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(u => { setIsAdmin(u?.role === "admin"); setIsInstitute(u?.role === "institute"); })
        .catch(() => { setIsAdmin(false); setIsInstitute(false); })
    );
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <nav className={`fixed left-0 right-0 z-50 flex items-center px-8 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${scrolled ? "top-0" : "top-8"}`}>
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Stayzy" width={80} height={80} className="object-contain" />
      </Link>

      <div className="flex-1 flex items-center justify-center gap-10">
        <Link href="/pgs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Browse PGs</Link>
        <Link href="/#how" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How it works</Link>
        <Link href="/#about" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Why Stayzy</Link>
        <Link href="/#faq" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">FAQ</Link>
      </div>

      <div className="flex items-center gap-3" style={{ minWidth: 120 }}>
        <Link href="/wishlist" className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors" title="Wishlist">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-slate-500" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {wishCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>
          )}
        </Link>
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
            {isInstitute && (
              <Link href="/institute" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">My Institute</Link>
            )}
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8", userButtonTrigger: "focus:shadow-none" } }} />
          </>
        )}
        </div>
    </nav>
  );
}
