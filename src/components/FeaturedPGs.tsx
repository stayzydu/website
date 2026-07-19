"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const FOR_COLOR: Record<string, string> = {
  Girls: "bg-pink-50 text-pink-600",
  Boys: "bg-blue-50 text-blue-600",
  Both: "bg-purple-50 text-purple-600",
};

type Room = { type: string; pricePerBed: number };
type FeaturedPG = {
  _id: string;
  name: string;
  location: string;
  pgFor: string;
  images: { url: string }[];
  rooms: Room[];
  commonAmenities: string[];
};

export default function FeaturedPGs() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pgs, setPgs] = useState<FeaturedPG[]>([]);
  const [loading, setLoading] = useState(true);
  const total = pgs.length;

  useEffect(() => {
    apiFetch("/api/pgs/featured")
      .then(data => setPgs(Array.isArray(data) ? data : []))
      .catch(() => setPgs([]))
      .finally(() => setLoading(false));
  }, []);

  function scrollTo(idx: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement;
    if (card) el.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
    setActive(idx);
  }

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement;
      const cc = el.children[closest] as HTMLElement;
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - center) < Math.abs(cc.offsetLeft + cc.offsetWidth / 2 - center))
        closest = i;
    }
    setActive(closest);
  }

  // Nothing to show until the admin features some PGs — hide the whole section.
  if (!loading && total === 0) return null;

  if (loading) return (
    <section className="pt-20 pb-10 dot-bg" id="featured">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Near Delhi University</p>
          <h2 className="text-3xl font-black text-slate-900">Featured PGs</h2>
        </div>
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className="pt-20 pb-10 dot-bg" id="featured">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative mb-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Near Delhi University</p>
            <h2 className="text-3xl font-black text-slate-900">Featured PGs</h2>
            <p className="text-slate-500 mt-1">Handpicked stays within walking distance of your campus</p>
          </div>
          <Link href="/pgs" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors absolute right-0 bottom-0">
            View all <span>→</span>
          </Link>
        </div>

        <div ref={trackRef} onScroll={onScroll}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {pgs.map((pg) => {
            const prices = pg.rooms?.map(r => r.pricePerBed) ?? [];
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const roomTypes = [...new Set(pg.rooms?.map(r => r.type) ?? [])].join(", ");
            const cover = pg.images?.[0]?.url;
            const amenities = pg.commonAmenities ?? [];
            return (
              <div key={pg._id} className="shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <div className="relative h-44 overflow-hidden shrink-0 bg-slate-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🏢</div>
                  )}
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${FOR_COLOR[pg.pgFor] ?? "bg-slate-100 text-slate-600"}`}>{pg.pgFor}</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-base truncate">{pg.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {pg.location}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs text-slate-500">{roomTypes}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-3 min-h-7">
                    {amenities.slice(0, 3).map(a => (
                      <span key={a} className="text-xs bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    {amenities.length > 3 && <span className="text-xs text-slate-400">+{amenities.length - 3}</span>}
                  </div>
                  <Link href={`/pgs/${pg._id}`}
                    className="mt-auto pt-4 block w-full text-center py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {pgs.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)}
              className={`rounded-full transition-all ${i === active ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-slate-200"}`} />
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => scrollTo(Math.max(0, active - 1))} disabled={active === 0}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">←</button>
          <button onClick={() => scrollTo(Math.min(total - 1, active + 1))} disabled={active === total - 1}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">→</button>
        </div>
      </div>
    </section>
  );
}
