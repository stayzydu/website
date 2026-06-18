"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface Payment {
  _id: string;
  name: string;
  phone: string;
  amount: number;
  status: "pending" | "paid";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export default function AdminPaidUsers() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then(token =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false))
    );
  }, [getToken]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (payments.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
      <p className="text-4xl mb-3">💳</p>
      <p className="font-semibold">No promo payments yet</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Promo Payments</h3>
        <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">
          {payments.filter(p => p.status === "paid").length} paid
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {payments.map(p => (
          <div key={p._id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{p.phone}</p>
              {p.razorpayPaymentId && (
                <p className="text-slate-400 text-xs mt-0.5 font-mono truncate">{p.razorpayPaymentId}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-slate-900 text-sm">₹{p.amount}</p>
              <p className="text-slate-400 text-xs mt-0.5">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${p.status === "paid" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
              {p.status === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
