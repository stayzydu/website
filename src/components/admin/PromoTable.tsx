"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// Row shape covers both collections. Leads have `paid` (bool); PaidLeads are
// implicitly paid and carry amount + razorpay ids.
export interface Row {
  _id: string;
  name: string;
  phone: string;
  budget?: number | null;
  college?: string;
  visitDate?: string;
  amount?: number;
  paid?: boolean;
  razorpayPaymentId?: string;
  referralCode?: string | null;
  instituteName?: string | null;
  createdAt: string;
}

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/**
 * mode="leads"      → GET /promo/leads       (everyone who filled the form)
 * mode="paid-leads" → GET /promo/paid-leads  (those who paid)
 */
export default function PromoTable({ mode }: { mode: "leads" | "paid-leads" }) {
  const { getToken } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const isPaidTab = mode === "paid-leads";
  const endpoint = isPaidTab ? "/api/promo/paid-leads" : "/api/promo/leads";

  useEffect(() => {
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false))
    );
  }, [getToken, endpoint]);

  // In the paid-leads collection every record is paid; in leads, use the flag.
  const isPaid = (r: Row) => (isPaidTab ? true : !!r.paid);
  const paidCount = rows.filter(isPaid).length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (rows.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
      <p className="text-4xl mb-3">{isPaidTab ? "💳" : "📋"}</p>
      <p className="font-semibold">{isPaidTab ? "No paid leads yet" : "No leads yet"}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-bold text-slate-900">{isPaidTab ? "Paid Leads" : "Leads"}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full">
            {rows.length} total
          </span>
          {!isPaidTab && (
            <span className="text-xs bg-green-50 text-green-600 font-semibold px-3 py-1 rounded-full">
              {paidCount} paid
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.map(r => {
          const paid = isPaid(r);
          return (
            <div key={r._id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{r.phone}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                  {r.budget ? <span>💰 ₹{r.budget.toLocaleString("en-IN")}/mo</span> : null}
                  {r.college ? <span>🎓 {r.college}</span> : null}
                  {r.visitDate ? <span>📅 {fmtDate(r.visitDate)}</span> : null}
                  {r.instituteName ? <span className="text-indigo-500">🏷️ {r.instituteName}</span> : null}
                </div>
                {r.razorpayPaymentId && (
                  <p className="text-slate-400 text-xs mt-0.5 font-mono truncate">{r.razorpayPaymentId}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {isPaidTab && <p className="font-black text-slate-900 text-sm">₹{r.amount ?? 500}</p>}
                <p className="text-slate-400 text-xs mt-0.5">{fmtDate(r.createdAt)}</p>
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${paid ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                {paid ? "Paid" : "Not paid"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
