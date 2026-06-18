function ShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function HandCoins() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 17c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" />
      <path d="M3 17h2.5l1.5 2h10l1.5-2H21" />
    </svg>
  );
}

function MapPin() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CalendarCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

const FEATURES = [
  { Icon: ShieldCheck, title: "Verified listings only", desc: "Every PG is physically inspected before it goes live. What you see in the photos is what you get on the ground." },
  { Icon: HandCoins,   title: "Zero brokerage", desc: "You deal directly with the PG owner. We never charge a rupee from students." },
  { Icon: MapPin,      title: "Built for DU students", desc: "Every listing is within reach of North or South Campus. No generic city-wide results to sift through." },
  { Icon: Lock,        title: "Safe options for girls", desc: "Filter specifically for girls-only PGs with CCTV, warden, and security details listed upfront." },
  { Icon: CalendarCheck, title: "Visit multiple PGs in one trip", desc: "Add PGs to your wishlist and book visits for all of them together. One form, one day, done." },
];

export default function WhyStayzy() {
  return (
    <section className="py-24 bg-slate-900" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Why Stayzy</p>
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Built for one thing.<br />
              <span className="text-indigo-400">Finding your PG.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Most rental sites are built for entire cities. We only care about Delhi University students. That focus is why the listings are better, the process is faster, and you actually end up with a place you like.
            </p>
          </div>

          {/* RIGHT */}
          <div className="divide-y divide-white/5">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="py-5 flex gap-4 items-start group">
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                  <Icon />
                </div>
                <div>
                  <p className="font-bold text-white text-base">{title}</p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
