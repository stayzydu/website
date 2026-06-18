"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Visit = {
  _id: string; name: string; phone: string; date: string; message?: string;
  pgs: { id: string; name: string; location: string }[];
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function AdminVisits() {
  const { getToken } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setVisits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const token = await getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" /></div>;

  if (!visits.length) return (
    <div className="text-center py-20 text-slate-400">
      <div className="text-4xl mb-3">📅</div>
      <p className="font-semibold">No visit requests yet</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {visits.map(v => (
        <div key={v._id} className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-900 text-base">{v.name}</p>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[v.status]}`}>
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-slate-500">📞 {v.phone} · 📅 {new Date(v.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              {v.message && <p className="text-sm text-slate-400 italic">"{v.message}"</p>}
            </div>
            <div className="flex gap-2">
              {v.status !== "confirmed" && (
                <button onClick={() => updateStatus(v._id, "confirmed")}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">Confirm</button>
              )}
              {v.status !== "cancelled" && (
                <button onClick={() => updateStatus(v._id, "cancelled")}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Cancel</button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">PGs Requested</p>
            <div className="flex flex-wrap gap-2">
              {v.pgs.map((pg, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg font-medium">
                  {pg.name} · {pg.location}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">Submitted {new Date(v.createdAt).toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}
