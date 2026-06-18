"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { HARDCODED_PGS } from "@/lib/hardcodedPGs";

const FOR_COLOR: Record<string, string> = {
  Girls: "bg-pink-50 text-pink-600",
  Boys: "bg-blue-50 text-blue-600",
  Both: "bg-purple-50 text-purple-600",
};

export default function FeaturedPGs() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = HARDCODED_PGS.length;

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

  return (
    <section className="py-20 bg-white" id="featured">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Near Delhi University</p>
            <h2 className="text-3xl font-black text-slate-900">Featured PGs</h2>
            <p className="text-slate-500 mt-1">Handpicked stays within walking distance of your campus</p>
          </div>
          <Link href="/pgs" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            View all <span>→</span>
          </Link>
        </div>

        <div ref={trackRef} onScroll={onScroll}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {HARDCODED_PGS.map((pg) => {
            const minPrice = Math.min(...pg.rooms.map(r => r.pricePerBed));
            const roomTypes = [...new Set(pg.rooms.map(r => r.type))].join(", ");
            return (
              <div key={pg._id} className="shrink-0 w-72 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pg.images[0].url} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${FOR_COLOR[pg.pgFor]}`}>{pg.pgFor}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-base truncate">{pg.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {pg.location}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">/month</span>
                    </div>
                    <span className="text-xs text-slate-500">{roomTypes}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {pg.commonAmenities.slice(0, 3).map(a => (
                      <span key={a} className="text-xs bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    {pg.commonAmenities.length > 3 && <span className="text-xs text-slate-400">+{pg.commonAmenities.length - 3}</span>}
                  </div>
                  <Link href={`/pgs/${pg._id}`}
                    className="mt-4 block w-full text-center py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {HARDCODED_PGS.map((_, i) => (
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
