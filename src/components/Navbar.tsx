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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const linkCls = "text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors";
  // Desktop center links (includes Browse PGs).
  const navLinks = (
    <>
      <Link href="/pgs" onClick={() => setMenuOpen(false)} className={linkCls}>Browse PGs</Link>
      <Link href="/#how" onClick={() => setMenuOpen(false)} className={linkCls}>How it works</Link>
      <Link href="/#about" onClick={() => setMenuOpen(false)} className={linkCls}>Why HeyStay</Link>
      <Link href="/#faq" onClick={() => setMenuOpen(false)} className={linkCls}>FAQ</Link>
    </>
  );
  // Mobile menu links — Browse/Favourites live in the bottom tab bar, so keep only the marketing anchors here.
  const mobileMenuLinks = (
    <>
      <Link href="/#how" onClick={() => setMenuOpen(false)} className={linkCls}>How it works</Link>
      <Link href="/#about" onClick={() => setMenuOpen(false)} className={linkCls}>Why HeyStay</Link>
      <Link href="/#faq" onClick={() => setMenuOpen(false)} className={linkCls}>FAQ</Link>
    </>
  );

  return (
    <nav className={`fixed left-0 right-0 z-50 flex items-center px-4 sm:px-8 h-16 bg-transparent md:bg-white/80 md:backdrop-blur-md border-b border-transparent md:border-slate-100 transition-all duration-300 ${scrolled ? "top-0" : "top-8"}`}>
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/Logo.png" alt="HeyStay" width={80} height={80} className="object-contain w-16 h-16 sm:w-20 sm:h-20" />
      </Link>

      <div className="hidden md:flex flex-1 items-center justify-center gap-10">
        {navLinks}
      </div>

      <div className="flex flex-1 md:flex-none items-center justify-end gap-2 sm:gap-3">
        <Link href="/wishlist" className="hidden md:flex relative items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors" title="Wishlist">
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
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Log in
            </Link>
            <Link href="/sign-up"
              className="px-3 sm:px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors">
              Sign up
            </Link>
          </>
        ) : (
          <>
            {isAdmin && (
              <Link href="/admin" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Admin</Link>
            )}
            {isInstitute && (
              <Link href="/institute" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">My Institute</Link>
            )}
            <span className="hidden md:block">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8", userButtonTrigger: "focus:shadow-none" } }} />
            </span>
          </>
        )}

        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-slate-700" strokeWidth={2} strokeLinecap="round">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg flex flex-col gap-2.5 px-4 py-4">
          {mobileMenuLinks}
          {isLoaded && !isSignedIn && (
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-slate-700 mt-1">Log in</Link>
          )}
          {isLoaded && isSignedIn && isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-slate-600">Admin</Link>
          )}
          {isLoaded && isSignedIn && isInstitute && (
            <Link href="/institute" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-slate-600">My Institute</Link>
          )}
        </div>
      )}
    </nav>
  );
}
