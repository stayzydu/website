"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { apiFetch, authFetch } from "@/lib/api";

type PG = { _id: string; name: string; location: string; pgFor: string; images: { url: string }[]; rooms: { pricePerBed: number }[]; isPublished: boolean };

export default function AdminPGs() {
  const { getToken } = useAuth();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    // admin sees all including unpublished — use auth fetch
    const token = await getToken();
    if (!token) return;
    authFetch("/api/pgs?all=true", token).then(setPgs).catch(() => apiFetch("/api/pgs").then(setPgs)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function deletePG(id: string) {
    if (!confirm("Delete this PG? This cannot be undone.")) return;
    const token = await getToken();
    if (!token) return;
    await authFetch(`/api/pgs/${id}`, token, { method: "DELETE" });
    setPgs(prev => prev.filter(p => p._id !== id));
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading PGs...</div>;

  return (
    <div className="space-y-3">
      {pgs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <p className="text-lg font-semibold mb-1">No PGs yet</p>
          <p className="text-sm mb-4">Add your first PG to get started</p>
          <Link href="/admin/pgs/new"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors">
            + Add New PG
          </Link>
        </div>
      )}
      {pgs.map(pg => {
        const minP = pg.rooms.length ? Math.min(...pg.rooms.map(r => r.pricePerBed)) : 0;
        return (
          <div key={pg._id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap hover:shadow-sm transition-shadow">
            <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {pg.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pg.images[0].url} alt={pg.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">🏢</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 truncate">{pg.name}</h3>
                {!pg.isPublished && (
                  <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full font-medium shrink-0">Draft</span>
                )}
              </div>
              <p className="text-sm text-slate-400">{pg.location} · {pg.pgFor}</p>
              {minP > 0 && <p className="text-sm font-semibold text-slate-700 mt-0.5">from ₹{minP.toLocaleString()}/bed</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <Link href={`/pgs/${pg._id}`}
                className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                View
              </Link>
              <Link href={`/admin/pgs/${pg._id}/edit`}
                className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                Edit
              </Link>
              <button onClick={() => deletePG(pg._id)}
                className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium">
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
