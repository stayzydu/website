"use client";
import { useState } from "react";

const FAQS = [
  { q: "How do I book a PG through HeyStay?", a: "Browse listings, pick a PG you like, and fill out the enquiry form on the detail page. The PG manager will contact you within 24 hours to confirm availability and schedule a visit." },
  { q: "Are the PGs verified?", a: "Yes. Every PG listed on HeyStay is physically verified by our team. We check amenities, safety standards, and match the listing details before publishing." },
  { q: "Is there a security deposit?", a: "Security deposit varies by PG, typically 1–2 months' rent. This is paid directly to the PG owner and is fully refundable per the lock-in terms." },
  { q: "Can I visit the PG before committing?", a: "Absolutely. We encourage site visits before any commitment. Use the enquiry form to schedule one — most PGs offer walkthroughs on weekdays and weekends." },
  { q: "What does the lock-in period mean?", a: "The lock-in period is the minimum duration you agree to stay. Leaving before this period may mean forfeiting part or all of your security deposit." },
  { q: "Are meals included in the rent?", a: "Some PGs offer meal plans (breakfast, lunch, dinner). This is shown clearly on each listing under the 'Meals' section. Pricing may or may not include meals — check the listing." },
  { q: "How do I report an issue with a PG?", a: "You can reach us at support@heystay.in. If a listing doesn't match what was advertised, we'll investigate and take necessary action including delisting." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 dot-bg" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Got questions?</p>
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 mt-2">Everything you need to know before moving in</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="font-semibold text-slate-800 text-sm pr-4">{faq.q}</span>
                <span className={`shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 text-xs transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
