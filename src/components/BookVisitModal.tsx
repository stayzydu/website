"use client";
import { useState } from "react";

type PGRef = { _id: string; name: string; location: string };

export default function BookVisitModal({ pgs, onClose }: { pgs: PGRef[]; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function field(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pgs: pgs.map(p => ({ id: p._id, name: p.name, location: p.location })) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Book a Visit</h2>
            <p className="text-xs text-slate-400 mt-0.5">{pgs.length} PG{pgs.length > 1 ? "s" : ""} selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">✕</button>
        </div>

        {/* selected PGs */}
        <div className="px-6 py-3 flex flex-col gap-1.5 max-h-28 overflow-y-auto">
          {pgs.map(pg => (
            <div key={pg._id} className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="font-medium text-slate-700">{pg.name}</span>
              <span className="text-slate-400">· {pg.location}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          {done ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-slate-900 text-lg">Visit Requested!</p>
              <p className="text-slate-400 text-sm mt-1">We'll reach out on {form.phone} to confirm your visit.</p>
              <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">Done</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 mt-2">
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Full Name *</label>
                  <input required value={form.name} onChange={e => field("name", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Phone Number *</label>
                  <input required value={form.phone} onChange={e => field("phone", e.target.value)}
                    placeholder="e.g. 9876543210" type="tel"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Preferred Visit Date *</label>
                <input required value={form.date} onChange={e => field("date", e.target.value)}
                  type="date" min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Message (optional)</label>
                <textarea value={form.message} onChange={e => field("message", e.target.value)}
                  rows={2} placeholder="Any specific requirements or questions..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors text-sm disabled:opacity-50">
                {loading ? "Submitting..." : "Confirm Visit Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
