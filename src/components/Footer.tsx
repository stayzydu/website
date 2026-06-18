import Link from "next/link";
import Image from "next/image";

const LINKS = {
  Explore: [
    { label: "Browse PGs", href: "/pgs" },
    { label: "Girls PGs", href: "/pgs?for=Girls" },
    { label: "Boys PGs", href: "/pgs?for=Boys" },
    { label: "Near North Campus", href: "/pgs?location=North+Campus" },
    { label: "Near GTB Nagar", href: "/pgs?location=GTB+Nagar" },
  ],
  Company: [
    { label: "About Us", href: "/#about" },
    { label: "How it Works", href: "/#how" },
    { label: "List Your PG", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Support: [
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "mailto:support@stayzy.in" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Stayzy" width={40} height={40} className="object-contain brightness-200" />
              <span className="text-white font-black text-xl">Stayzy</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Finding the perfect PG near Delhi University — verified, rated, and ready to move in.
            </p>
            <div className="flex gap-3 mt-5">
              {["𝕏", "in", "f"].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-xs text-slate-400 hover:border-slate-400 hover:text-white transition-colors">{s}</a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* trust badges */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "🔒", label: "Secure Payments" },
              { icon: "✅", label: "Verified Listings" },
              { icon: "🏠", label: "500+ PGs Listed" },
              { icon: "⭐", label: "4.8 Avg Rating" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2.5 bg-slate-800/50 rounded-xl px-4 py-3">
                <span className="text-xl">{b.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Stayzy. All rights reserved.</p>
          <p className="text-xs text-slate-500">Made with ❤️ for DU students</p>
        </div>
      </div>
    </footer>
  );
}
