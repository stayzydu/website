import Link from "next/link";
import Image from "next/image";

const LINKS = {
  Discover: [
    { label: "Browse PGs", href: "/pgs" },
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Featured PGs", href: "/#featured" },
  ],
  Learn: [
    { label: "How it Works", href: "/#how" },
    { label: "Why HeyStay", href: "/#about" },
    { label: "Testimonials", href: "/#testimonials" },
  ],
  Support: [
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "mailto:support@heystay.in" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10">
          {/* brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/Logo.png" alt="HeyStay" width={120} height={40} className="object-contain brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Finding the perfect PG near Delhi University — verified and ready to move in.
            </p>
          </div>

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

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} HeyStay. All rights reserved.</p>
          <p className="text-xs text-slate-500">Made with ❤️ for DU students</p>
        </div>
      </div>
    </footer>
  );
}
