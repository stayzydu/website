"use client";

import { useEffect, useState } from "react";

type Step = "offer" | "form" | "success";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const GiftSVG = ({ size = 72 }: { size?: number }) => (
  <svg viewBox="0 0 72 72" width={size} height={size} fill="none">
    <rect x="8" y="34" width="56" height="34" rx="4" fill="url(#pb)" />
    <rect x="6" y="24" width="60" height="12" rx="3" fill="url(#pl)" />
    <rect x="32" y="24" width="8" height="44" fill="url(#pr)" />
    <rect x="6" y="27" width="60" height="6" rx="1" fill="url(#pr)" />
    <ellipse cx="24" cy="21" rx="10" ry="7" transform="rotate(-20 24 21)" fill="url(#pbow)" opacity="0.9" />
    <ellipse cx="48" cy="21" rx="10" ry="7" transform="rotate(20 48 21)" fill="url(#pbow)" opacity="0.9" />
    <circle cx="36" cy="24" r="5" fill="url(#pknot)" />
    <circle cx="58" cy="14" r="2" fill="#fbbf24" />
    <circle cx="64" cy="22" r="1.5" fill="#f472b6" />
    <circle cx="10" cy="18" r="1.5" fill="#34d399" />
    <defs>
      <linearGradient id="pb" x1="8" y1="34" x2="64" y2="68" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
      <linearGradient id="pl" x1="6" y1="24" x2="66" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8" /><stop offset="1" stopColor="#a78bfa" /></linearGradient>
      <linearGradient id="pr" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#f9a8d4" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
      <linearGradient id="pbow" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#fda4af" /><stop offset="1" stopColor="#f43f5e" /></linearGradient>
      <linearGradient id="pknot" x1="31" y1="19" x2="41" y2="29" gradientUnits="userSpaceOnUse"><stop stopColor="#fecdd3" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
    </defs>
  </svg>
);

export default function PromoPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("offer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [instituteName, setInstituteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; setStep("offer"); }
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function validateCode() {
    if (!referralCode.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutes/validate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setReferralStatus("valid");
        setInstituteName(data.instituteName);
      } else {
        setReferralStatus("invalid");
        setInstituteName("");
      }
    } catch {
      setReferralStatus("invalid");
    }
  }

  async function handlePay() {
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return setError("Enter a valid 10-digit mobile number.");
    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Please try again.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), referralCode: referralCode.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not initiate payment.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Stayzy",
        description: "₹500 token — get ₹1000 off your first booking",
        prefill: { name: name.trim(), contact: phone.trim() },
        theme: { color: "#6366f1" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          setStep("success");
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-4" onClick={step !== "success" ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1.5 bg-linear-to-r from-indigo-500 via-pink-500 to-orange-400" />

        {step !== "success" && (
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors text-xs">
            ✕
          </button>
        )}

        {/* OFFER */}
        {step === "offer" && (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4"><GiftSVG /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Limited time offer</p>
            <h2 className="text-2xl font-black text-slate-900 leading-snug mb-3">
              Pay <span className="text-indigo-600">₹500</span> now,<br />
              get <span className="text-green-600">₹1000 off</span> your first booking
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Lock in your slot with a small token payment. We'll apply ₹1000 off your first month's rent. Limited slots available.
            </p>
            <button onClick={() => setStep("form")}
              className="w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-indigo-200">
              Claim the offer now
            </button>
            <button onClick={onClose} className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              No thanks
            </button>
          </div>
        )}

        {/* FORM */}
        {step === "form" && (
          <div className="p-8">
            <button onClick={() => setStep("offer")} className="text-xs text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors">
              ← Back
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-1">Your details</h2>
            <p className="text-slate-500 text-sm mb-5">We'll use these to confirm your offer after payment.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Mobile number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210" maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>

              {/* Referral code */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Referral code <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" value={referralCode}
                    onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus("idle"); setInstituteName(""); }}
                    placeholder="e.g. MIRANDA2025"
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-indigo-100
                      ${referralStatus === "valid" ? "border-green-400 bg-green-50" : referralStatus === "invalid" ? "border-red-300 bg-red-50" : "border-slate-200"}`} />
                  <button onClick={validateCode} type="button"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors shrink-0">
                    Apply
                  </button>
                </div>
                {referralStatus === "valid" && (
                  <p className="text-green-600 text-xs mt-1.5 font-semibold">Code applied — {instituteName}</p>
                )}
                {referralStatus === "invalid" && (
                  <p className="text-red-500 text-xs mt-1.5">Invalid referral code</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

            <button onClick={handlePay} disabled={loading}
              className="mt-6 w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? "Opening payment..." : "Pay ₹500 now"}
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payment received!</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              We have successfully received your payment. Our team will contact you shortly with further details about your ₹1000 discount.
            </p>
            <button onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-2xl transition-colors text-sm">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
