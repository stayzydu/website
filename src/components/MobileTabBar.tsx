"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { getWishlist } from "@/lib/wishlist";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth={2} />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

function Tab({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
      <div className="relative">{children}</div>
      <span className="text-[11px] font-semibold leading-none">{label}</span>
    </Link>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [wishCount, setWishCount] = useState(0);

  useEffect(() => {
    setWishCount(getWishlist().length);
    const update = () => setWishCount(getWishlist().length);
    window.addEventListener("wishlist-change", update);
    return () => window.removeEventListener("wishlist-change", update);
  }, []);

  // Hide on auth pages where a bottom bar would be noise.
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) return null;

  const isHome = pathname === "/";
  const isBrowse = pathname === "/pgs" || pathname?.startsWith("/pgs/");
  const isWish = pathname === "/wishlist";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 h-16 flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
      <Tab href="/" label="Home" active={isHome}><HomeIcon active={isHome} /></Tab>
      <Tab href="/pgs" label="Browse" active={!!isBrowse}><SearchIcon active={!!isBrowse} /></Tab>
      <Tab href="/wishlist" label="Favourites" active={isWish}>
        <HeartIcon active={isWish} />
        {wishCount > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>
        )}
      </Tab>

      {/* Profile — Clerk avatar when signed in, else a Log-in tab */}
      {isLoaded && isSignedIn ? (
        <div className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-500">
          <div className="relative flex items-center justify-center">
            <UserButton appearance={{ elements: { avatarBox: "w-6 h-6", userButtonTrigger: "focus:shadow-none" } }} />
          </div>
          <span className="text-[11px] font-semibold leading-none">Profile</span>
        </div>
      ) : (
        <Tab href="/sign-in" label="Log in" active={false}><ProfileIcon /></Tab>
      )}
    </nav>
  );
}
