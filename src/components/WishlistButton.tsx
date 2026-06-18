"use client";
import { useEffect, useState } from "react";
import { toggleWishlist, isWishlisted } from "@/lib/wishlist";

export default function WishlistButton({ pgId, className = "" }: { pgId: string; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSaved(isWishlisted(pgId)); }, [pgId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist(pgId);
    setSaved(next);
    window.dispatchEvent(new Event("wishlist-change"));
  }

  return (
    <button onClick={handleClick} className={`transition-all ${className}`} title={saved ? "Remove from wishlist" : "Add to wishlist"}>
      <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all ${saved ? "fill-red-500 stroke-red-500" : "fill-none stroke-slate-400 hover:stroke-red-400"}`} strokeWidth={2}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
