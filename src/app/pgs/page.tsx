"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

const AMENITY_OPTIONS = ["AC", "Wi-Fi", "Laundry", "Meals", "Parking", "CCTV", "Elevator", "Power Backup"];
const PG_FOR_OPTIONS = ["All", "Girls", "Boys", "Both"];

type Room = { type: string; pricePerBed: number; amenities: string[]; images: { url: string }[] };
type PG = { _id: string; name: string; location: string; pgFor: string; images: { url: string }[]; rooms: Room[]; commonAmenities: string[] };

export default function PGsPage() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [pgFor, setPgFor] = useState("All");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (pgFor !== "All") params.set("pgFor", pgFor);
    if (amenities.length) params.set("amenities", amenities.join(","));
    if (search) params.set("search", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    apiFetch(`/api/pgs?${params}`)
      .then(setPgs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pgFor, amenities, search, minPrice, maxPrice]);

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  function minPrice_(pg: PG) {
    return pg.rooms.length ? Math.min(...pg.rooms.map(r => r.pricePerBed)) : 0;
  }

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* sidebar filters */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-6">
            <h2 className="font-bold text-slate-800 text-base">Filters</h2>

            {/* search */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="PG name or area..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>

            {/* PG For */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">PG For</label>
              <div className="flex flex-wrap gap-2">
                {PG_FOR_OPTIONS.map(o => (
                  <button key={o} onClick={() => setPgFor(o)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${pgFor === o ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* price range */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Price / bed</label>
              <div className="flex gap-2 items-center">
                <input value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  placeholder="Min" type="number"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400" />
                <span className="text-slate-400 text-xs">–</span>
                <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Max" type="number"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>

            {/* amenities */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Amenities</label>
              <div className="space-y-1.5">
                {AMENITY_OPTIONS.map(a => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)}
                      className="accent-slate-900 w-3.5 h-3.5" />
                    <span className="text-sm text-slate-600">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            {(pgFor !== "All" || amenities.length || search || minPrice || maxPrice) && (
              <button onClick={() => { setPgFor("All"); setAmenities([]); setSearch(""); setMinPrice(""); setMaxPrice(""); }}
                className="w-full text-xs font-semibold text-red-500 hover:text-red-700 text-center">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* main grid */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              PGs near Delhi University
              {pgs.length > 0 && <span className="ml-2 text-base font-normal text-slate-400">({pgs.length} found)</span>}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : pgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <span className="text-5xl mb-4">🏠</span>
              <p className="text-lg font-semibold">No PGs found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pgs.map(pg => (
                <Link key={pg._id} href={`/pgs/${pg._id}`}>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      {pg.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pg.images[0].url} alt={pg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🏢</div>
                      )}
                      <span className="absolute top-3 left-3 bg-white/90 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {pg.pgFor}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 text-base truncate">{pg.name}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{pg.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-slate-900 font-bold text-base">
                          ₹{minPrice_(pg).toLocaleString()}<span className="text-slate-400 text-xs font-normal">/bed</span>
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {pg.commonAmenities?.slice(0, 3).map(a => (
                            <span key={a} className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
