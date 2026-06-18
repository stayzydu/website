"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    content: "Honestly was not expecting much but this site actually had listings I hadn't seen on other platforms. Found a PG in Kamla Nagar, went for a visit the next day and moved in within the week. Super easy process.",
    rating: 5,
  },
  {
    id: 2,
    name: "Arjun Mehta",
    content: "Me and my friend were looking for a double room near GTB Nagar and we found one through Stayzy. The wishlist thing where you can book visits for multiple PGs at once is really useful, saved us a lot of calls.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sneha Gupta",
    content: "I needed a girls only PG with a study table and decent wifi. Filtered it out on Stayzy and got exactly that. Visited 3 places in one day and locked one in by evening. Did not think it would be this fast.",
    rating: 5,
  },
  {
    id: 4,
    name: "Rohan Kapoor",
    content: "Saved a bunch of PGs to my wishlist and booked visits for all of them in one go. Got calls back pretty quickly. Went with one in Hudson Lane and it has been good so far. No issues with the process at all.",
    rating: 5,
  },
  {
    id: 5,
    name: "Ananya Singh",
    content: "My parents came with me for the visit and they felt a lot better seeing the security details listed out on the page. Took us one visit to finalize. The whole thing felt more trustworthy than just randomly calling numbers.",
    rating: 5,
  },
  {
    id: 6,
    name: "Karan Bhatia",
    content: "Was hunting for a PG near Mukherjee Nagar for my prep. The filters on Stayzy let me sort by meals and amenities which other sites just don't have. Found a good place without spending days on it.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  useEffect(() => {
    const interval = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-slate-900 overflow-hidden relative">
      {/* bg dots */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={controls} variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-500/20 text-indigo-300">
                <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                Trusted by DU students
              </div>
              <h2 className="text-4xl font-black text-white leading-tight">Loved by students<br />across Delhi University</h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Don't just take our word for it — here's what students who found their PG through Stayzy have to say.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${active === i ? "w-10 bg-indigo-400" : "w-2.5 bg-slate-600 hover:bg-slate-400"}`}
                    aria-label={`Testimonial ${i + 1}`} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div variants={itemVariants} className="relative min-h-80">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: active === i ? 1 : 0, x: active === i ? 0 : 80, scale: active === i ? 1 : 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ zIndex: active === i ? 10 : 0 }}>
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 h-full flex flex-col">
                  {/* stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, s) => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>

                  {/* quote */}
                  <div className="relative flex-1 mb-6">
                    <Quote className="absolute -top-1 -left-1 w-7 h-7 text-indigo-400/30 rotate-180" />
                    <p className="relative z-10 text-slate-200 text-base leading-relaxed pl-4">"{t.content}"</p>
                  </div>

                  {/* divider */}
                  <div className="h-px bg-white/10 my-4" />

                  {/* author */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <p className="font-bold text-white">{t.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* decorative corners */}
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl bg-indigo-500/10" />
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-purple-500/10" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
