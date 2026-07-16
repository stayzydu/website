const STEPS = [
  { num: "01", title: "Browse & Filter", desc: "Search PGs by location, budget, gender preference, and amenities. Every listing on HeyStay is physically verified." },
  { num: "02", title: "Save to Wishlist", desc: "Heart the PGs you like. Add as many as you want and they sit in your wishlist ready to compare side by side." },
  { num: "03", title: "Book a Visit", desc: "Pick a date, enter your details once, and schedule visits to all your wishlisted PGs in a single form." },
  { num: "04", title: "Move In", desc: "Visit the shortlist, pick the one you like, and move in. Our team is on WhatsApp if anything comes up." },
];

export default function HowItWorks() {
  return (
    <section className="pt-10 pb-20" id="how">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Simple process</p>
          <h2 className="text-3xl font-black text-slate-900">How HeyStay works</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Four steps from browsing to moving in</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="relative group">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-8px)] w-full h-px bg-slate-200 z-0" />
              )}
              <div className="relative z-10 bg-white border border-slate-100 rounded-2xl p-6 h-full hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <span className="text-lg font-black text-indigo-500">{step.num}</span>
                </div>
                <h3 className="font-black text-slate-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
