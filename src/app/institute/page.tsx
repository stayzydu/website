"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Referral {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface InstituteData {
  institute: { _id: string; name: string; referralCode: string; createdAt: string };
  referrals: Referral[];
}

export default function InstitutePage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<InstituteData | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    getToken().then(async token => {
      const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      if (me?.role !== "institute") { router.replace("/"); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutes/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.replace("/"); return; }
      setData(await res.json());
      setChecking(false);
    }).catch(() => router.replace("/"));
  }, [isLoaded, isSignedIn, getToken, router]);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7ff]">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;

  const { institute, referrals } = data;

  return (
    <div className="min-h-screen bg-[#f5f7ff]" style={{ backgroundImage: "radial-gradient(circle, #c7d2fe 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }}>
      <Navbar />
      <div className="pt-36 pb-8 max-w-4xl mx-auto px-6">

        {/* header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Institute Panel</p>
            <h1 className="text-2xl font-black text-slate-900">{institute.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Your referral code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-indigo-600 text-lg bg-white border border-indigo-100 px-4 py-2 rounded-xl">
                {institute.referralCode}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(institute.referralCode)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500"
                title="Copy code">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* stat card */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Total referrals</p>
            <p className="text-4xl font-black text-indigo-600">{referrals.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Active since</p>
            <p className="text-xl font-black text-slate-900">
              {new Date(institute.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* referral list */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Students who used your code</h2>
          </div>
          {referrals.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-400">
              <p className="text-4xl mb-3">🎓</p>
              <p className="font-semibold">No referrals yet</p>
              <p className="text-sm mt-1">Share your code <span className="font-mono font-bold text-indigo-600">{institute.referralCode}</span> with students</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {referrals.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{r.name}</td>
                    <td className="px-6 py-3.5 text-slate-500">{r.phone}</td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
