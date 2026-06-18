"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { HARDCODED_PGS } from "@/lib/hardcodedPGs";
import WishlistButton from "@/components/WishlistButton";
import BookVisitModal from "@/components/BookVisitModal";

type Room = { type: string; pricePerBed: number; amenities: string[]; images: { url: string }[] };
type PG = {
  _id: string; name: string; managerName: string; location: string; pgFor: string;
  lockInPeriod: string; mealTypes: string[]; noticePeriod: string;
  commonAmenities: string[]; thingsToKnow: { allowed: string[]; notAllowed: string[] };
  images: { url: string }[]; rooms: Room[]; mapLat?: number; mapLng?: number;
};

const AMENITY_ICONS: Record<string, string> = {
  "AC": "❄️", "Wi-Fi": "📶", "Laundry": "🧺", "Parking": "🚗",
  "CCTV": "📷", "Elevator": "🛗", "Power Backup": "🔋", "Bed": "🛏️",
  "Study Table": "📚", "Chair": "🪑", "Fan": "🌀", "Wardrobe": "🚪",
  "Balcony": "🏠", "Refrigerator": "🧊", "Doctor Consultation": "🏥",
  "Daily Housekeeping": "🧹", "Security Guard": "💂", "Dining Area": "🍽️",
  "Bathroom": "🚿", "Meals": "🍱", "Snacks": "🥪",
};

export default function PGDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [queryMsg, setQueryMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    const hardcoded = HARDCODED_PGS.find(p => p._id === id);
    if (hardcoded) {
      setPg(hardcoded as unknown as PG);
      setLoading(false);
      return;
    }
    apiFetch(`/api/pgs/${id}`)
      .then(setPg)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-36 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!pg) return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-36 text-center text-slate-400 text-lg">PG not found</div>
    </div>
  );

  const minPrice = pg.rooms.length ? Math.min(...pg.rooms.map(r => r.pricePerBed)) : 0;

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-36 pb-8 max-w-7xl mx-auto px-6">

        {/* breadcrumb */}
        <p className="text-sm text-slate-400 mb-4">
          <a href="/pgs" className="hover:text-slate-700">Explore</a> / {pg.name}
        </p>

        {/* hero split */}
        <div className="flex gap-8 mb-10">

          {/* image gallery */}
          <div className="w-1/2 space-y-3">
            <div className="rounded-2xl overflow-hidden h-80 bg-slate-100">
              {pg.images?.[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pg.images[activeImg].url} alt={pg.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">🏢</div>
              )}
            </div>
            {pg.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pg.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img.url} alt="" onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-lg shrink-0 cursor-pointer border-2 transition-all ${activeImg === i ? "border-slate-900" : "border-transparent hover:border-slate-300"}`} />
                ))}
              </div>
            )}
          </div>

          {/* key info */}
          <div className="w-1/2 space-y-5">
            <div>
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">{pg.pgFor} Only</span>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">{pg.name}</h1>
              <p className="text-slate-400 mt-1 text-sm">📍 {pg.location}</p>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
              <span className="text-slate-400 text-sm mb-1">/bed/month starting</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-slate-400 text-xs mb-0.5">Manager</p>
                <p className="font-semibold text-slate-800">{pg.managerName}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-slate-400 text-xs mb-0.5">Lock-in Period</p>
                <p className="font-semibold text-slate-800">{pg.lockInPeriod || "—"}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-slate-400 text-xs mb-0.5">Notice Period</p>
                <p className="font-semibold text-slate-800">{pg.noticePeriod || "—"}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-slate-400 text-xs mb-0.5">Meals</p>
                <p className="font-semibold text-slate-800">{pg.mealTypes?.join(", ") || "Not provided"}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowBookModal(true)}
                className="flex-1 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors text-sm">
                Book a Visit →
              </button>
              <WishlistButton pgId={pg._id} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-red-50 transition-colors" />
            </div>
          </div>
        </div>

        {/* common amenities */}
        <Section title="Common Amenities">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {pg.commonAmenities.map(a => (
              <div key={a} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <span className="text-2xl">{AMENITY_ICONS[a] || "✅"}</span>
                <span className="text-xs text-slate-600 font-medium">{a}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* things to know */}
        {(pg.thingsToKnow?.allowed?.length > 0 || pg.thingsToKnow?.notAllowed?.length > 0) && (
          <Section title="Things You Should Know">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {pg.thingsToKnow.allowed?.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500 font-bold">✓</span> {t}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {pg.thingsToKnow.notAllowed?.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-red-400 font-bold">✗</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* rooms */}
        <Section title="Rooms Offered">
          <div className="space-y-5">
            {pg.rooms.map((room, i) => (
              <RoomCard key={i} room={room} onBook={() => setShowBookModal(true)} />
            ))}
          </div>
        </Section>

        {/* query form */}
        <Section title="Still have a Query?" id="query">
          <div className="max-w-xl bg-white border border-slate-100 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-4">
              Hang tight! Our team will get back to you shortly to help with your inquiry.
            </p>
            {submitted ? (
              <div className="text-green-600 font-semibold">✓ Message sent! We'll be in touch soon.</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-3">
                <textarea value={queryMsg} onChange={e => setQueryMsg(e.target.value)}
                  rows={4} placeholder="Type your message here..."
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                <button type="submit"
                  className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors text-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </Section>

      </div>

      {showBookModal && pg && (
        <BookVisitModal pgs={[{ _id: pg._id, name: pg.name, location: pg.location }]} onClose={() => setShowBookModal(false)} />
      )}
    </div>
  );
}

function RoomCard({ room, onBook }: { room: Room; onBook: () => void }) {
  const [active, setActive] = useState(0);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex gap-0">
      {/* square image block */}
      <div className="shrink-0 w-64 h-64 relative">
        {room.images?.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={room.images[active].url} alt={room.type} className="w-full h-full object-cover" />
            {room.images.length > 1 && (
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                {room.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img.url} alt="" onClick={() => setActive(i)}
                    className={`w-10 h-10 object-cover rounded-lg cursor-pointer border-2 transition-all ${active === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-4xl">🛏️</div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xl">{room.type} Sharing</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">
                ₹{room.pricePerBed.toLocaleString()}<span className="text-slate-400 text-sm font-normal">/bed/month</span>
              </p>
            </div>
            <button onClick={onBook} className="shrink-0 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors">
              Book a Visit →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map(a => (
              <span key={a} className="inline-flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                {AMENITY_ICONS[a] || "✦"} {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
