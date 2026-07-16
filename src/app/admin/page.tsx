"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPGs from "@/components/admin/AdminPGs";
import AdminVisits from "@/components/admin/AdminVisits";
import AdminPaidUsers from "@/components/admin/AdminPaidUsers";
import AdminReferrals from "@/components/admin/AdminReferrals";

type Tab = "users" | "pgs" | "visits" | "paid" | "referrals";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("pgs");
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in"); return; }
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(u => {
          if (u?.role === "admin") setAllowed(true);
          else router.replace("/");
        })
        .catch(() => router.replace("/"))
        .finally(() => setChecking(false))
    );
  }, [isLoaded, isSignedIn, getToken, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-28 sm:pt-36 pb-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
          <h1 className="text-2xl font-black text-slate-900">Admin Panel</h1>
          <Link href="/admin/pgs/new"
            className="px-4 sm:px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors">
            + Add New PG
          </Link>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-max max-w-full overflow-x-auto mb-8">
          {([["pgs", "PG Listings"], ["visits", "Visit Requests"], ["users", "Users"], ["paid", "Paid Users"], ["referrals", "Referrals"]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "pgs" && <AdminPGs />}
        {tab === "visits" && <AdminVisits />}
        {tab === "users" && <AdminUsers />}
        {tab === "paid" && <AdminPaidUsers />}
        {tab === "referrals" && <AdminReferrals />}
      </div>
    </div>
  );
}
