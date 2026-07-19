"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import WishlistButton from "@/components/WishlistButton";
import { getWishlist } from "@/lib/wishlist";
import { apiFetch } from "@/lib/api";

type PG = { _id: string; name: string; location: string; pgFor: string; images: { url: string }[]; rooms: { pricePerBed: number }[] };

const FOR_COLOR: Record<string, string> = {
  Girls: "bg-pink-50 text-pink-600",
  Boys: "bg-blue-50 text-blue-600",
  Both: "bg-purple-50 text-purple-600",
};

export default function WishlistPage() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", date: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function loadPGs() {
    const ids = getWishlist();
    if (!ids.length) { setPgs([]); setLoading(false); return; }
    const results: PG[] = [];
    for (const id of ids) {
      try { results.push(await apiFetch(`/api/pgs/${id}`)); } catch { /* skip */ }
    }
    setPgs(results);
    setLoading(false);
  }

  useEffect(() => {
    loadPGs();
    window.addEventListener("wishlist-change", loadPGs);
    return () => window.removeEventListener("wishlist-change", loadPGs);
  }, []);

  function field(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pgs.length) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pgs: pgs.map(p => ({ id: p._id, name: p.name, location: p.location })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="flex items-center justify-center pt-40">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-28 sm:pt-36 pb-10 max-w-7xl mx-auto px-4 sm:px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">My Wishlist</h1>
          <p className="text-sm text-slate-400 mt-1">{pgs.length} PG{pgs.length !== 1 ? "s" : ""} saved</p>
        </div>

        {pgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-6xl mb-5">🏠</div>
            <p className="text-xl font-black text-slate-800">Your wishlist is empty</p>
            <p className="text-slate-400 text-sm mt-2">Heart a PG from the listings to save it here</p>
            <Link href="/pgs" className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
              Browse PGs
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* LEFT — PG cards */}
            <div className="flex-1 min-w-0 space-y-4">
              {pgs.map(pg => {
                const minPrice = pg.rooms.length ? Math.min(...pg.rooms.map(r => r.pricePerBed)) : 0;
                return (
                  <div key={pg._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex gap-0 shadow-sm">
                    {/* square image */}
                    <div className="w-28 h-28 sm:w-40 sm:h-40 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pg.images?.[0]?.url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80"}
                        alt={pg.name} className="w-full h-full object-cover" />
                    </div>
                    {/* info */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base truncate">{pg.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">📍 {pg.location}</p>
                          </div>
                          <WishlistButton pgId={pg._id} className="shrink-0 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-red-50 transition-colors" />
                        </div>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${FOR_COLOR[pg.pgFor] ?? "bg-slate-100 text-slate-600"}`}>
                          {pg.pgFor}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">/bed/month</span>
                        </div>
                        <Link href={`/pgs/${pg._id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                          View details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — booking form */}
            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="font-black text-slate-900 text-lg">Book a Visit</h2>
                  <p className="text-xs text-slate-400 mt-0.5">For all {pgs.length} PG{pgs.length !== 1 ? "s" : ""} in your wishlist</p>
                </div>

                {done ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="font-black text-slate-900 text-lg">Visit Booked!</p>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      We'll contact you on <span className="font-semibold text-slate-700">{form.phone}</span> to confirm your visit on <span className="font-semibold text-slate-700">{new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</span>.
                    </p>
                    <button onClick={() => setDone(false)} className="mt-6 text-xs font-semibold text-indigo-600 hover:text-indigo-800">Book another visit</button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="px-6 py-5 space-y-4">
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Name *</label>
                      <input required value={form.name} onChange={e => field("name", e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                      <input required value={form.phone} onChange={e => field("phone", e.target.value)}
                        placeholder="e.g. 9876543210" type="tel"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Preferred Visit Date *</label>
                      <input required value={form.date} onChange={e => field("date", e.target.value)}
                        type="date" min={new Date().toISOString().split("T")[0]}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message (optional)</label>
                      <textarea value={form.message} onChange={e => field("message", e.target.value)}
                        rows={3} placeholder="Any specific requirements or questions..."
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors resize-none" />
                    </div>

                    {/* PG summary */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Visiting</p>
                      {pgs.map(pg => (
                        <div key={pg._id} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="font-medium">{pg.name}</span>
                          <span className="text-slate-400">· {pg.location}</span>
                        </div>
                      ))}
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm disabled:opacity-50">
                      {submitting ? "Booking..." : `Confirm Visit →`}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
