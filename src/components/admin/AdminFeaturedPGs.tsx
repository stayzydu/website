"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch, authFetch } from "@/lib/api";

type PG = {
  _id: string;
  name: string;
  location: string;
  pgFor: string;
  images: { url: string }[];
  isPublished: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
};

export default function AdminFeaturedPGs() {
  const { getToken } = useAuth();
  const [all, setAll] = useState<PG[]>([]);
  const [featured, setFeatured] = useState<PG[]>([]); // ordered
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const list: PG[] = token
          ? await authFetch("/api/pgs?all=true", token).catch(() => apiFetch("/api/pgs"))
          : await apiFetch("/api/pgs");
        const arr = Array.isArray(list) ? list : [];
        setAll(arr);
        setFeatured(
          arr
            .filter(p => p.isFeatured)
            .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
        );
      } catch {
        setAll([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  const featuredIds = new Set(featured.map(p => p._id));
  const available = all.filter(p => !featuredIds.has(p._id));

  function addToFeatured(pg: PG) {
    setFeatured(prev => [...prev, pg]);
    setMsg("");
  }
  function removeFromFeatured(id: string) {
    setFeatured(prev => prev.filter(p => p._id !== id));
    setMsg("");
  }
  function move(idx: number, dir: -1 | 1) {
    setFeatured(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setMsg("");
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await authFetch("/api/pgs/featured/set", token, {
        method: "PATCH",
        body: JSON.stringify({ items: featured.map((p, i) => ({ id: p._id, order: i })) }),
      });
      setMsg("Featured PGs saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading PGs...</div>;

  return (
    <div className="space-y-6">
      {/* Featured list (ordered) */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-slate-900">Featured on home page</h3>
            <p className="text-xs text-slate-400 mt-0.5">Shown in this order in the home carousel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">{featured.length} featured</span>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Save order"}
            </button>
          </div>
        </div>

        {msg && <p className="px-6 py-2 text-xs text-slate-600 bg-slate-50 border-b border-slate-100">{msg}</p>}

        {featured.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p className="text-3xl mb-2">⭐</p>
            <p className="font-semibold">No featured PGs yet</p>
            <p className="text-sm mt-1">Add PGs from the list below — they&apos;ll show on the home page.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {featured.map((pg, i) => (
              <div key={pg._id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {pg.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pg.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">🏢</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{pg.name}</p>
                  <p className="text-xs text-slate-400 truncate">{pg.location} · {pg.pgFor}</p>
                </div>
                {!pg.isPublished && (
                  <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">Draft</span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors" title="Move up">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === featured.length - 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors" title="Move down">↓</button>
                  <button onClick={() => removeFromFeatured(pg._id)}
                    className="w-7 h-7 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors" title="Remove">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available PGs */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">All PGs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Click “+ Feature” to add to the home carousel</p>
        </div>
        {available.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">Every PG is already featured.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {available.map(pg => (
              <div key={pg._id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {pg.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pg.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">🏢</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{pg.name}</p>
                  <p className="text-xs text-slate-400 truncate">{pg.location} · {pg.pgFor}</p>
                </div>
                {!pg.isPublished && (
                  <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">Draft</span>
                )}
                <button onClick={() => addToFeatured(pg)}
                  className="shrink-0 text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors">
                  + Feature
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
