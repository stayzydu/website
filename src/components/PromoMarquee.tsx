"use client";

import { useEffect, useState } from "react";

export default function PromoMarquee({ onOpenPopup }: { onOpenPopup: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const TEXT = "    ✨ Pay ₹500 now and get ₹1000 off your first booking — limited slots only";
  const repeated = Array(8).fill(TEXT).join("");

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] bg-indigo-600 text-white text-xs font-semibold h-8 overflow-hidden cursor-pointer select-none"
      onClick={onOpenPopup}
      title="Click to claim offer">
      <div className="flex h-full items-center whitespace-nowrap animate-marquee">
        <span>{repeated}</span>
        <span aria-hidden>{repeated}</span>
      </div>
    </div>
  );
}
