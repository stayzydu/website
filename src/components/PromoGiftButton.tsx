"use client";

export default function PromoGiftButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Claim special offer"
      className="fixed bottom-8 left-8 z-[100] animate-gift-float-left"
      style={{ filter: "drop-shadow(0 8px 24px rgba(99,102,241,0.5))" }}>
      <svg viewBox="0 0 72 72" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* box body */}
        <rect x="8" y="34" width="56" height="34" rx="4" fill="url(#boxGrad)" />
        {/* lid */}
        <rect x="6" y="24" width="60" height="12" rx="3" fill="url(#lidGrad)" />
        {/* ribbon vertical */}
        <rect x="32" y="24" width="8" height="44" fill="url(#ribbonGrad)" />
        {/* ribbon horizontal on lid */}
        <rect x="6" y="27" width="60" height="6" rx="1" fill="url(#ribbonGrad)" />
        {/* bow left loop */}
        <ellipse cx="24" cy="21" rx="10" ry="7" transform="rotate(-20 24 21)" fill="url(#bowGrad)" opacity="0.9" />
        {/* bow right loop */}
        <ellipse cx="48" cy="21" rx="10" ry="7" transform="rotate(20 48 21)" fill="url(#bowGrad)" opacity="0.9" />
        {/* bow center knot */}
        <circle cx="36" cy="24" r="5" fill="url(#knotGrad)" />
        {/* shine on lid */}
        <rect x="12" y="26" width="18" height="3" rx="1.5" fill="white" opacity="0.25" />
        {/* sparkles */}
        <circle cx="58" cy="14" r="2" fill="#fbbf24" opacity="0.9" />
        <circle cx="64" cy="22" r="1.5" fill="#f472b6" opacity="0.8" />
        <circle cx="10" cy="18" r="1.5" fill="#34d399" opacity="0.8" />
        <circle cx="16" cy="10" r="2" fill="#a78bfa" opacity="0.9" />
        <defs>
          <linearGradient id="boxGrad" x1="8" y1="34" x2="64" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="lidGrad" x1="6" y1="24" x2="66" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#f9a8d4" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
          <linearGradient id="bowGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#fda4af" />
            <stop offset="1" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="knotGrad" x1="31" y1="19" x2="41" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fecdd3" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}
