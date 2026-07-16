"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";

function TypeLine({ show, text }: { show: boolean; text: string }) {
  const [typed, setTyped] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);
  useEffect(() => {
    if (!show) return;
    idxRef.current = 0;
    setTyped("");
    function tick() {
      idxRef.current++;
      setTyped(text.slice(0, idxRef.current));
      if (idxRef.current < text.length) timerRef.current = setTimeout(tick, 38);
    }
    timerRef.current = setTimeout(tick, 200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [show, text]);
  const done = typed.length >= text.length;
  return (
    <span>
      {typed}
      {!done && <span className="inline-block w-0.5 h-[0.9em] bg-indigo-400 ml-0.5 align-middle" style={{ animation: "pulse 0.7s ease-in-out infinite" }} />}
    </span>
  );
}

function Orb({ cx, cy, r, color, delay }: { cx: string; cy: string; r: string; color: string; delay: string }) {
  return (
    <div className="absolute rounded-full pointer-events-none animate-orb"
      style={{ left: cx, top: cy, width: r, height: r, background: color, filter: "blur(60px)", opacity: 0.35, animationDelay: delay }} />
  );
}

function fadeUp(show: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.55s ease-out ${delay}ms, transform 0.55s ease-out ${delay}ms`,
  };
}

function fadeIn(show: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transition: `opacity 0.5s ease-out ${delay}ms`,
  };
}

/* ── building definitions ─────────────────────────────────── */
type Win = { x: number; y: number; w: number; h: number; lit?: boolean };

const BUILDINGS: {
  id: string; x: number; y: number; w: number; h: number; fill: string;
  roofX?: number; roofW?: number; antennaX?: number;
  winCols: number; winStartY: number; winGapX: number; winGapY: number; winW: number; winH: number;
  litWins?: [number, number][];
}[] = [
  { id:"a", x:10,  y:230, w:55,  h:150, fill:"#eef4fc", winCols:2, winStartY:240, winGapX:20, winGapY:16, winW:12, winH:9, litWins:[[0,2]] },
  { id:"b", x:75,  y:175, w:75,  h:205, fill:"#f0f7ff", roofX:86,  roofW:53, winCols:3, winStartY:185, winGapX:22, winGapY:16, winW:13, winH:9, litWins:[[1,3]] },
  { id:"c", x:160, y:95,  w:90,  h:285, fill:"#f8fbff", roofX:172, roofW:66, antennaX:205, winCols:4, winStartY:108, winGapX:20, winGapY:16, winW:12, winH:9, litWins:[[2,1],[0,4]] },
  { id:"d", x:265, y:138, w:70,  h:242, fill:"#eef4fc", winCols:3, winStartY:150, winGapX:21, winGapY:16, winW:13, winH:9, litWins:[[1,2]] },
  { id:"e", x:345, y:76,  w:105, h:304, fill:"#f0f7ff", roofX:360, roofW:75, antennaX:397, winCols:4, winStartY:90, winGapX:24, winGapY:16, winW:15, winH:10, litWins:[[1,4],[3,6]] },
  { id:"f", x:460, y:152, w:75,  h:228, fill:"#eef4fc", winCols:3, winStartY:163, winGapX:22, winGapY:16, winW:13, winH:9, litWins:[[0,3]] },
  { id:"g", x:545, y:107, w:90,  h:273, fill:"#f0f7ff", roofX:558, roofW:64, winCols:3, winStartY:120, winGapX:26, winGapY:16, winW:16, winH:10, litWins:[[1,2],[2,5]] },
  { id:"h", x:648, y:142, w:72,  h:238, fill:"#eef4fc", winCols:3, winStartY:155, winGapX:21, winGapY:16, winW:13, winH:9, litWins:[[0,1]] },
];

function buildWindows(b: typeof BUILDINGS[0]): Win[][] {
  const rows: Win[][] = [];
  const totalH = b.h - (b.winStartY - b.y);
  const rowCount = Math.floor((totalH - 12) / b.winGapY);
  for (let r = 0; r < rowCount; r++) {
    const row: Win[] = [];
    for (let c = 0; c < b.winCols; c++) {
      const isLit = (b.litWins ?? []).some(([lc, lr]) => lc === c && lr === r);
      row.push({ x: b.x + 8 + c * b.winGapX, y: b.winStartY + r * b.winGapY, w: b.winW, h: b.winH, lit: isLit });
    }
    rows.push(row);
  }
  return rows;
}

/* ── skyline + student illustration (shared by desktop & mobile) ── */
function Skyline({ phase, bldPhase }: { phase: number; bldPhase: number }) {
  return (
    <>
      <svg viewBox="0 0 720 384" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-auto" preserveAspectRatio="xMidYMid meet">

        {/* background silhouette layer */}
        {[
          {x:0,  y:200,w:60, h:180,fill:"#dbe9f8"},{x:70, y:160,w:80, h:220,fill:"#d4e4f5"},
          {x:160,y:120,w:90, h:260,fill:"#dbe9f8"},{x:260,y:150,w:70, h:230,fill:"#d4e4f5"},
          {x:340,y:100,w:110,h:280,fill:"#dbe9f8"},{x:460,y:170,w:75, h:210,fill:"#d4e4f5"},
          {x:545,y:130,w:95, h:250,fill:"#dbe9f8"},{x:650,y:160,w:70, h:220,fill:"#d4e4f5"},
        ].map((b,i) => (
          <rect key={`bg-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={b.fill}
            style={fadeIn(phase >= 2 && bldPhase >= i, i * 30)} />
        ))}

        {/* foreground buildings */}
        {BUILDINGS.map((b, i) => {
          const show = phase >= 2 && bldPhase >= i;
          const winRows = buildWindows(b);
          return (
            <g key={b.id}>
              {/* body */}
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={b.fill} style={fadeUp(show, 0)} />
              {/* roof */}
              {b.roofX && <rect x={b.roofX} y={b.y - 16} width={b.roofW!} height={16} rx="2" fill={b.fill} style={fadeUp(show, 80)} />}
              {/* antenna */}
              {b.antennaX && (
                <g style={fadeIn(show, 180)}>
                  <line x1={b.antennaX} y1={b.y - 16} x2={b.antennaX} y2={b.y - 46} stroke="#bfdbfe" strokeWidth="1.5" />
                  <circle cx={b.antennaX} cy={b.y - 47} r="2.5" fill="#60a5fa" opacity="0.85" />
                </g>
              )}
              {/* windows — all rows, staggered */}
              {winRows.map((row, ri) =>
                row.map((w, wi) => (
                  <rect key={`${b.id}-${ri}-${wi}`}
                    x={w.x} y={w.y} width={w.w} height={w.h} rx="2"
                    fill={w.lit ? "#93c5fd" : "#dbeafe"}
                    opacity={w.lit ? 0.92 : 0.48}
                    style={fadeIn(show, 240 + ri * 50 + wi * 15)} />
                ))
              )}
            </g>
          );
        })}

        {/* ground */}
        <rect x="0" y="380" width="720" height="4" fill="#cde0f5" style={fadeIn(phase >= 2, 300)} />
      </svg>

      {/* student */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/student-cropped.svg" alt=""
        style={{
          position: "absolute",
          top: "42%", left: "28%",
          width: "36%",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translate(-50%,-50%) translateY(0)" : "translate(-50%,-50%) translateY(28px)",
          transition: "opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        } as React.CSSProperties}
      />
    </>
  );
}

export default function HeroSection() {
  const [phase, setPhase] = useState(0);
  const [bldPhase, setBldPhase] = useState(-1);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 200);
    const t1 = setTimeout(() => setPhase(2), 600);
    const bldTimers = BUILDINGS.map((_, i) => setTimeout(() => setBldPhase(i), 700 + i * 200));
    const t3 = setTimeout(() => setPhase(3), 700 + 8 * 200 + 350);
    const t4 = setTimeout(() => setPhase(4), 700 + 8 * 200 + 850);
    const t5 = setTimeout(() => setPhase(5), 700 + 8 * 200 + 1500);
    return () => [t0, t1, t3, t4, t5, ...bldTimers].forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#f0f6ff]">

      {/* ── background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 1s ease-out" }}>
        <div className="absolute inset-0 bg-linear-to-br from-[#e8f1ff] via-[#f3ecff] to-[#ffeef5]" />
        <div className="absolute inset-0 bg-linear-to-tl from-[#fff3e6]/70 via-transparent to-[#e6fbff]/60" />
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: "linear-gradient(rgba(148,181,234,0.10) 1px,transparent 1px),linear-gradient(90deg,rgba(148,181,234,0.10) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        <Orb cx="6%"  cy="12%" r="440px" color="radial-gradient(circle,#bfdbfe,transparent)" delay="0s" />
        <Orb cx="58%" cy="2%"  r="380px" color="radial-gradient(circle,#ddd6fe,transparent)" delay="1.5s" />
        <Orb cx="82%" cy="20%" r="340px" color="radial-gradient(circle,#fbcfe8,transparent)" delay="3s" />
        <Orb cx="72%" cy="58%" r="320px" color="radial-gradient(circle,#bae6fd,transparent)" delay="4.5s" />
        <Orb cx="18%" cy="62%" r="300px" color="radial-gradient(circle,#fde9c8,transparent)" delay="2.5s" />
      </div>

      {/* ── bottom blur + fade into next section ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20" style={{ height: "160px" }}>
        {/* fade to the next section's background color (#f5f7ff) so there's no hard seam */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #f5f7ff 0%, #f5f7ff 18%, rgba(245,247,255,0.85) 42%, rgba(245,247,255,0.4) 70%, transparent 100%)" }} />
        {/* soft blur only near the very bottom */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: "72px", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)" }} />
        {/* many small white dots over the blur */}
        {[
          {l:"2%",  b:"8px", s:2.5}, {l:"5%",  b:"24px",s:2},   {l:"8%",  b:"10px",s:3},
          {l:"11%", b:"32px",s:2},   {l:"14%", b:"14px",s:2.5}, {l:"17%", b:"40px",s:2},
          {l:"20%", b:"8px", s:2},   {l:"23%", b:"28px",s:3},   {l:"26%", b:"16px",s:2},
          {l:"29%", b:"44px",s:2},   {l:"32%", b:"10px",s:2.5}, {l:"35%", b:"36px",s:2},
          {l:"38%", b:"20px",s:3},   {l:"41%", b:"48px",s:2},   {l:"44%", b:"12px",s:2},
          {l:"47%", b:"30px",s:2.5}, {l:"50%", b:"8px", s:2},   {l:"53%", b:"42px",s:2},
          {l:"56%", b:"18px",s:3},   {l:"59%", b:"52px",s:2},   {l:"62%", b:"10px",s:2},
          {l:"65%", b:"34px",s:2.5}, {l:"68%", b:"22px",s:2},   {l:"71%", b:"46px",s:3},
          {l:"74%", b:"14px",s:2},   {l:"77%", b:"38px",s:2},   {l:"80%", b:"8px", s:2.5},
          {l:"83%", b:"28px",s:2},   {l:"86%", b:"50px",s:2},   {l:"89%", b:"16px",s:3},
          {l:"92%", b:"36px",s:2},   {l:"95%", b:"10px",s:2.5}, {l:"98%", b:"24px",s:2},
          {l:"3.5%",b:"54px",s:2},   {l:"13%", b:"58px",s:2},   {l:"37%", b:"60px",s:2},
          {l:"55%", b:"64px",s:2},   {l:"76%", b:"62px",s:2},   {l:"91%", b:"56px",s:2},
        ].map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: d.l, bottom: d.b,
              width: d.s, height: d.s,
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 0 4px 1px rgba(255,255,255,0.7)",
            }} />
        ))}
      </div>

      {/* ── left: buildings + student (desktop only) ── */}
      <div className="hidden lg:flex absolute inset-y-0 left-0 pointer-events-none z-0 items-center justify-center" style={{ width: "50%" }}>
        <div className="relative" style={{ width: "90%" }}>
          <Skyline phase={phase} bldPhase={bldPhase} />
        </div>
      </div>

      {/* ── layout shell ── */}
      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:block shrink-0" style={{ width: "50%" }} />

        {/* right — branding */}
        <div className="flex-1 min-w-0 flex items-center justify-center px-5 sm:px-8 py-24 lg:py-0">
          <div className="flex flex-col items-center text-center w-full min-w-0 lg:mt-[6vh]">

            {/* wordmark */}
            <div style={{ ...fadeUp(phase >= 1, 300), width: "100%" }}>
              <h1
                className="leading-none tracking-tight italic"
                style={{
                  fontSize: "clamp(3.25rem,12vw,9.5rem)",
                  fontWeight: 900,
                  background: "linear-gradient(to right, #0f172a 0%, #0f172a 43%, #3b82f6 43%, #6366f1 72%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                HeyStay
              </h1>
            </div>

            {/* headline / tagline */}
            <div style={fadeUp(phase >= 4, 0)}>
              <p className="mt-4 lg:mt-5 text-slate-600 leading-snug" style={{ fontSize: "clamp(1.15rem,4vw,1.9rem)", fontWeight: 600 }}>
                Find the{" "}
                <em className="not-italic font-black text-slate-800">perfect</em>{" "}
                <span className="bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent italic font-bold" style={{ paddingRight: "4px" }}>
                  <TypeLine show={phase >= 4} text="PG near you" />
                </span>
              </p>
            </div>

            {/* mobile skyline — below the name/tagline (mobile only) */}
            <div className="lg:hidden relative w-full max-w-sm mx-auto mt-8 pointer-events-none">
              <Skyline phase={phase} bldPhase={bldPhase} />
            </div>

            {/* subtext — desktop only */}
            <div className="hidden lg:block" style={fadeUp(phase >= 5, 0)}>
              <p className="mt-3 text-slate-400 leading-relaxed" style={{ fontSize: "1rem" }}>
                Verified PGs near Delhi University —{" "}
                <span className="text-slate-500 font-medium italic">rated, reviewed,</span> and ready to move in.
              </p>
            </div>

            {/* CTA — desktop only */}
            <div className="hidden lg:block" style={fadeUp(phase >= 5, 150)}>
              <button className="mt-7 px-7 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-xl tracking-wide cursor-pointer"
                style={{ transition: "background 0.2s, transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0f172a")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
                Find your perfect stay &rarr;
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── navbar ── */}
      <Navbar />

    </section>
  );
}
