"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import WishlistButton from "@/components/WishlistButton";

const PRICE_MIN = 10000;
const PRICE_MAX = 50000;
const PROX_MIN = 100;
const PROX_MAX = 900;

const PG_FOR_OPTIONS = ["All", "Girls", "Boys", "Both"];
const ROOM_TYPES = ["Single", "Double", "Triple"];

type Room = { type: string; pricePerBed: number; amenities: string[]; images: { url: string }[] };
type PG = { _id: string; name: string; location: string; pgFor: string; images: { url: string }[]; rooms: Room[]; commonAmenities: string[]; distanceFromCampus?: number };

function RangeSlider({ label, min, max, valueMin, valueMax, step, format, onChange }: {
  label: string; min: number; max: number; valueMin: number; valueMax: number;
  step: number; format: (v: number) => string;
  onChange: (min: number, max: number) => void;
}) {
  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), valueMax - step);
    onChange(v, valueMax);
  }
  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), valueMin + step);
    onChange(valueMin, v);
  }
  const pMin = ((valueMin - min) / (max - min)) * 100;
  const pMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        <span className="text-xs font-semibold text-indigo-600">{format(valueMin)} – {format(valueMax)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* track */}
        <div className="absolute w-full h-1.5 rounded-full bg-slate-100" />
        {/* active fill */}
        <div className="absolute h-1.5 rounded-full bg-indigo-500"
          style={{ left: `${pMin}%`, right: `${100 - pMax}%` }} />
        {/* min thumb */}
        <input type="range" min={min} max={max} step={step} value={valueMin}
          onChange={handleMin}
          className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500"
          style={{ zIndex: valueMin > max - step ? 5 : 3 }} />
        {/* max thumb */}
        <input type="range" min={min} max={max} step={step} value={valueMax}
          onChange={handleMax}
          className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500"
          style={{ zIndex: 4 }} />
      </div>
    </div>
  );
}

function ToggleGroup({ label, options, value, onChange, multi }: {
  label: string; options: string[];
  value: string | string[]; multi?: boolean;
  onChange: (v: string | string[]) => void;
}) {
  function toggle(o: string) {
    if (!multi) { onChange(o); return; }
    const arr = value as string[];
    onChange(arr.includes(o) ? arr.filter(x => x !== o) : [...arr, o]);
  }
  function isActive(o: string) {
    return multi ? (value as string[]).includes(o) : value === o;
  }
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} onClick={() => toggle(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isActive(o) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PGsPage() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [pgFor, setPgFor] = useState("All");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [proxRange, setProxRange] = useState<[number, number]>([PROX_MIN, PROX_MAX]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (pgFor !== "All") params.set("pgFor", pgFor);
    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));
    if (roomTypes.length) params.set("roomTypes", roomTypes.join(","));
    apiFetch(`/api/pgs?${params}`)
      .then(setPgs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pgFor, priceRange, roomTypes]);

  function minPricePg(pg: PG) {
    return pg.rooms.length ? Math.min(...pg.rooms.map(r => r.pricePerBed)) : 0;
  }

  const hasFilters = pgFor !== "All" || roomTypes.length > 0 ||
    priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ||
    proxRange[0] !== PROX_MIN || proxRange[1] !== PROX_MAX;

  // client-side proximity filter (field may not exist on all PGs)
  const filtered = pgs.filter(pg => {
    if (pg.distanceFromCampus !== undefined) {
      return pg.distanceFromCampus >= proxRange[0] && pg.distanceFromCampus <= proxRange[1];
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "#f5f7ff", backgroundImage: "radial-gradient(circle, #c7d2fe 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }}>
      <Navbar />
      <div className="pt-28 sm:pt-36 pb-8 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── mobile filter toggle ── */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="lg:hidden flex items-center justify-between w-full bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm font-black text-slate-900 text-sm">
          <span>Filters{hasFilters && <span className="ml-2 text-indigo-500">• active</span>}</span>
          <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-none stroke-slate-500 transition-transform ${filtersOpen ? "rotate-180" : ""}`} strokeWidth={2} strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>

        {/* ── sidebar ── */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="lg:sticky lg:top-28 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-7">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-base">Filters</h2>
              {hasFilters && (
                <button
                  onClick={() => { setPgFor("All"); setRoomTypes([]); setPriceRange([PRICE_MIN, PRICE_MAX]); setProxRange([PROX_MIN, PROX_MAX]); }}
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                  Reset all
                </button>
              )}
            </div>

            <RangeSlider
              label="Price range"
              min={PRICE_MIN} max={PRICE_MAX} step={500}
              valueMin={priceRange[0]} valueMax={priceRange[1]}
              format={v => `₹${(v / 1000).toFixed(0)}k`}
              onChange={(a, b) => setPriceRange([a, b])}
            />

            <ToggleGroup
              label="PG type"
              options={PG_FOR_OPTIONS}
              value={pgFor}
              onChange={v => setPgFor(v as string)}
            />

            <ToggleGroup
              label="Room type"
              options={ROOM_TYPES}
              value={roomTypes}
              multi
              onChange={v => setRoomTypes(v as string[])}
            />

            <RangeSlider
              label="College proximity"
              min={PROX_MIN} max={PROX_MAX} step={50}
              valueMin={proxRange[0]} valueMax={proxRange[1]}
              format={v => `${v}m`}
              onChange={(a, b) => setProxRange([a, b])}
            />
          </div>
        </aside>

        {/* ── main grid ── */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-slate-900">
              PGs near Delhi University
              {!loading && <span className="ml-2 text-base font-normal text-slate-400">({filtered.length} found)</span>}
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <p className="text-5xl mb-4">🏠</p>
              <p className="text-lg font-semibold">No PGs found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(pg => (
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
                      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${pg.pgFor === "Girls" ? "bg-pink-50 text-pink-600" : pg.pgFor === "Boys" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                        {pg.pgFor}
                      </span>
                      <WishlistButton pgId={pg._id} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 text-base truncate">{pg.name}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{pg.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-slate-900 font-bold text-base">
                          ₹{minPricePg(pg).toLocaleString()}<span className="text-slate-400 text-xs font-normal">/bed</span>
                        </span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {pg.commonAmenities?.slice(0, 2).map(a => (
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
