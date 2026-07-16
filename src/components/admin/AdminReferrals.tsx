"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface Institute {
  _id: string;
  name: string;
  referralCode: string;
  referralCount: number;
  userId: { name: string; email: string };
  createdAt: string;
}

interface Referral {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function AdminReferrals() {
  const { getToken } = useAuth();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Record<string, Referral[]>>({});
  const [loadingRefs, setLoadingRefs] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { setInstitutes(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false))
    );
  }, [getToken]);

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (referrals[id]) return;
    setLoadingRefs(id);
    const token = await getToken();
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutes/${id}/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json());
    setReferrals(prev => ({ ...prev, [id]: Array.isArray(data) ? data : [] }));
    setLoadingRefs(null);
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (institutes.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
      <p className="text-4xl mb-3">🏫</p>
      <p className="font-semibold">No institutes set up yet</p>
      <p className="text-sm mt-1">Assign a user the institute role from the Users tab to get started</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {institutes.map(inst => (
        <div key={inst._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleExpand(inst._id)}
            className="w-full px-4 sm:px-6 py-5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3 sm:gap-5 text-left min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-indigo-600 font-black text-sm">{inst.name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{inst.name}</p>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{inst.userId?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{inst.referralCode}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{inst.referralCount}</p>
                <p className="text-xs text-slate-400">referrals</p>
              </div>
              <span className={`text-slate-400 transition-transform ${expanded === inst._id ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>

          {expanded === inst._id && (
            <div className="border-t border-slate-100 px-6 py-4">
              {loadingRefs === inst._id ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                </div>
              ) : referrals[inst._id]?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No referrals claimed yet</p>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      <th className="text-left pb-2 font-semibold">Name</th>
                      <th className="text-left pb-2 font-semibold">Phone</th>
                      <th className="text-left pb-2 font-semibold">Claimed on</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {referrals[inst._id].map(r => (
                      <tr key={r._id}>
                        <td className="py-2.5 font-medium text-slate-800">{r.name}</td>
                        <td className="py-2.5 text-slate-500">{r.phone}</td>
                        <td className="py-2.5 text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
