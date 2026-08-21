"use client";

import React from "react";

/**
 * Rendu d'un tapis de table — SVG/CSS généré, aucun asset externe.
 * Rend des couches en `absolute inset-0` : le parent doit être `relative`
 * et `overflow-hidden`. Les ambiances (transform/opacity) se coupent seules
 * en reduced-motion / animations réduites.
 */

// Champ d'étoiles déterministe (pas de Math.random → pas de mismatch SSR).
const STARS = Array.from({ length: 26 }, (_, i) => {
  const x = ((i * 61) % 100) + ((i * 7) % 5);
  const y = ((i * 37) % 100) + ((i * 3) % 5);
  return { x: x % 100, y: y % 100, r: 0.6 + ((i * 13) % 10) / 8, d: (i % 6) * 0.6 };
});

function Layer({ children, style, className }: { children?: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

function Vignette({ strength = 0.55 }: { strength?: number }) {
  return (
    <Layer
      style={{
        background: `radial-gradient(120% 90% at 50% 45%, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
      }}
    />
  );
}

function Starfield({ color = "#fff", animated }: { color?: string; animated: boolean }) {
  return (
    <Layer>
      {STARS.map((s, i) => (
        <span
          key={i}
          className={animated ? "amb-twinkle" : ""}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: "50%",
            background: color,
            opacity: 0.5,
            animationDelay: `${s.d}s`,
          }}
        />
      ))}
    </Layer>
  );
}

function Grain() {
  return (
    <Layer
      className="opacity-[0.06]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.9) 0.5px, transparent 0.5px), radial-gradient(rgba(0,0,0,0.9) 0.5px, transparent 0.5px)",
        backgroundSize: "6px 6px, 6px 6px",
        backgroundPosition: "0 0, 3px 3px",
      }}
    />
  );
}

/** Le composant principal. */
export function Felt({ id }: { id: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {render(id)}
      <Vignette />
    </div>
  );
}

function base(bg: string) {
  return <Layer style={{ background: bg }} />;
}

function render(id: string): React.ReactNode {
  switch (id) {
    // -------- Classique
    case "felt-emeraude":
      return (
        <>
          {base("radial-gradient(circle at 50% 35%, #1b5140, #0f3428 55%, #0a2019)")}
          <Grain />
        </>
      );
    case "felt-bordeaux":
      return (
        <>
          {base("radial-gradient(circle at 50% 35%, #6e1f2b, #4a141d 55%, #2a0b11)")}
          <Grain />
        </>
      );
    case "felt-noyer":
      return (
        <>
          {base("linear-gradient(120deg, #4a3520, #2e2113)")}
          <Layer
            className="opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(92deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 14px), repeating-linear-gradient(88deg, rgba(255,220,170,0.08) 0 1px, transparent 1px 22px)",
            }}
          />
          <Vignette strength={0.5} />
        </>
      );
    case "felt-cuir":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #9a5b2e, #6d3d1c 60%, #40230f)")}
          <Layer
            className="opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 26px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 26px)",
            }}
          />
          <Grain />
        </>
      );

    // -------- Prestige
    case "felt-marbre":
      return (
        <>
          {base("linear-gradient(135deg, #14141a, #05050a)")}
          <Layer
            className="amb-sheen opacity-40"
            style={{
              background:
                "repeating-linear-gradient(58deg, transparent 0 40px, rgba(212,175,55,0.5) 41px 42px, transparent 43px 90px)",
              filter: "blur(0.5px)",
            }}
          />
          <Layer
            style={{
              background:
                "repeating-linear-gradient(120deg, transparent 0 60px, rgba(212,175,55,0.25) 61px 62px, transparent 63px 140px)",
            }}
          />
        </>
      );
    case "felt-artdeco":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #143a30, #0a2019)")}
          <Layer style={{ background: fanSvg("#d4af37") }} />
          <Layer className="amb-sheen opacity-30" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)", width: "40%" }} />
          <Vignette />
        </>
      );
    case "felt-velours":
      return (
        <>
          {base("radial-gradient(circle at 50% 35%, #1a1f4a, #0c0f2a 60%, #060814)")}
          <Layer
            className="opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(192,200,255,0.12) 0 1px, transparent 1px 12px)" }}
          />
          <Grain />
        </>
      );
    case "felt-laque":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #2a0d10, #14060a)")}
          <Layer style={{ background: cranesSvg() }} className="opacity-70" />
          <Vignette />
        </>
      );

    // -------- Cosmos
    case "felt-nebuleuse":
      return (
        <>
          {base("radial-gradient(circle at 50% 45%, #241247, #0c0820 70%, #050310)")}
          <Layer className="amb-drift" style={{ background: "radial-gradient(40% 30% at 35% 40%, rgba(122,64,220,0.55), transparent 70%)" }} />
          <Layer className="amb-drift" style={{ background: "radial-gradient(45% 35% at 65% 60%, rgba(64,120,220,0.5), transparent 70%)", animationDelay: "-13s" }} />
          <Starfield animated />
        </>
      );
    case "felt-aurore":
      return (
        <>
          {base("radial-gradient(circle at 50% 60%, #061a1f, #030b12)")}
          <Layer className="amb-aurora" style={{ background: "linear-gradient(90deg, transparent, rgba(80,220,160,0.4), rgba(220,120,200,0.35), transparent)", top: "-20%", height: "70%" }} />
          <Starfield animated />
        </>
      );
    case "felt-eclipse":
      return (
        <>
          {base("radial-gradient(circle at 50% 42%, #1a1420, #05040a)")}
          <Layer className="amb-pulse" style={{ background: "radial-gradient(18% 18% at 50% 42%, transparent 60%, rgba(255,180,80,0.6) 66%, transparent 74%)" }} />
          <Starfield animated />
        </>
      );
    case "felt-voielactee":
      return (
        <>
          {base("radial-gradient(circle at 50% 45%, #10142e, #05060f)")}
          <Layer className="amb-drift" style={{ background: "linear-gradient(70deg, transparent 40%, rgba(180,200,255,0.18) 50%, transparent 60%)" }} />
          <Starfield animated />
          <Starfield animated color="#bcd" />
        </>
      );

    // -------- Néon
    case "felt-cybergrid":
      return (
        <>
          {base("linear-gradient(#0a0a1e, #05050f)")}
          <Layer className="amb-pulse" style={{ background: gridSvg("#e0447f", "#22d3ee") }} />
        </>
      );
    case "felt-synthwave":
      return (
        <>
          {base("linear-gradient(#1a0b2e 0%, #3a1050 55%, #ff5e8a 55.5%, #1a0b2e 60%)")}
          <Layer style={{ background: "radial-gradient(circle at 50% 52%, rgba(255,180,80,0.9), rgba(255,90,140,0.6) 20%, transparent 40%)" }} />
          <Layer className="amb-pulse" style={{ background: gridSvg("#ff5e8a", "#ff5e8a"), top: "56%" }} />
        </>
      );
    case "felt-hologramme":
      return (
        <>
          {base("linear-gradient(135deg, #0e2230, #0a1520)")}
          <Layer
            className="amb-sheen"
            style={{ background: "linear-gradient(90deg, transparent, rgba(120,230,255,0.35), rgba(200,120,255,0.3), transparent)", width: "50%" }}
          />
          <Layer className="opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 4px)" }} />
        </>
      );
    case "felt-circuit":
      return (
        <>
          {base("radial-gradient(circle at 50% 45%, #06251f, #041512)")}
          <Layer style={{ background: circuitSvg("#22d3ee") }} className="opacity-60" />
          <Layer className="amb-sheen opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)", width: "30%" }} />
        </>
      );

    // -------- Nature
    case "felt-seigaiha":
      return (
        <>
          {base("linear-gradient(#123a52, #0a2233)")}
          <Layer style={{ background: seigaihaSvg("#8fd3e8") }} className="amb-drift opacity-70" />
        </>
      );
    case "felt-zen":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #e9e2cf, #d8cbb0)")}
          <Layer className="opacity-40" style={{ background: seigaihaSvg("#b7a97f") }} />
          <Vignette strength={0.28} />
        </>
      );
    case "felt-foret":
      return (
        <>
          {base("radial-gradient(circle at 50% 55%, #0c2416, #05130c)")}
          {[15, 40, 62, 80, 30, 70].map((x, i) => (
            <span
              key={i}
              className="amb-rise"
              style={{ position: "absolute", left: `${x}%`, bottom: "10%", width: 4, height: 4, borderRadius: "50%", background: "#a8e063", boxShadow: "0 0 8px #a8e063", animationDelay: `${i * 1.4}s` }}
            />
          ))}
        </>
      );
    case "felt-ocean":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #0a3550, #04141f)")}
          <Layer className="amb-aurora opacity-40" style={{ background: "repeating-linear-gradient(60deg, transparent 0 30px, rgba(150,220,255,0.25) 31px 33px, transparent 34px 70px)" }} />
        </>
      );

    // -------- Légende
    case "felt-trone":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #3a2e0a, #17120a)")}
          <Layer style={{ background: fanSvg("#f4d670") }} className="opacity-60" />
          {[20, 45, 68, 85].map((x, i) => (
            <span key={i} className="amb-rise" style={{ position: "absolute", left: `${x}%`, bottom: "8%", width: 3, height: 3, borderRadius: "50%", background: "#f4d670", boxShadow: "0 0 6px #f4d670", animationDelay: `${i}s` }} />
          ))}
          <Vignette />
        </>
      );
    case "felt-dragon":
      return (
        <>
          {base("radial-gradient(circle at 50% 45%, #2a0d0d, #120606)")}
          <Layer style={{ background: dragonSvg() }} className="amb-drift opacity-60" />
          <Vignette />
        </>
      );
    case "felt-alchimie":
      return (
        <>
          {base("radial-gradient(circle at 50% 45%, #141a24, #070a10)")}
          <Layer className="amb-rotate" style={{ background: alchemySvg("#7fe3c0"), inset: "-20%" }} />
          <Vignette />
        </>
      );
    case "felt-centenaire":
      return (
        <>
          {base("radial-gradient(circle at 50% 40%, #efe6cf, #d7c69a)")}
          <Layer style={{ background: fanSvg("#b8912a") }} className="opacity-40" />
          <Layer className="amb-sheen opacity-30" style={{ background: "linear-gradient(90deg, transparent, rgba(184,145,42,0.4), transparent)", width: "40%" }} />
          <Vignette strength={0.3} />
        </>
      );

    default:
      return base("radial-gradient(circle at 50% 35%, #1b5140, #0f3428 55%, #0a2019)");
  }
}

// ---------------- motifs SVG (data-URI) ----------------

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function bg(svg: string) {
  return `${svgUrl(svg)} center/cover no-repeat`;
}

function fanSvg(color: string) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g fill='none' stroke='${color}' stroke-width='1.2' opacity='0.5'><path d='M60 60 L0 20 M60 60 L30 0 M60 60 L60 0 M60 60 L90 0 M60 60 L120 20'/><circle cx='60' cy='60' r='26'/><circle cx='60' cy='60' r='40'/></g></svg>`;
  return bg(s);
}
function cranesSvg() {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><g fill='none' stroke='#d4af37' stroke-width='1' opacity='0.35'><path d='M40 120 q20 -40 50 -30 q-15 -20 5 -35 q10 25 25 25 q-25 15 -20 45 q-30 -10 -65 30z'/><path d='M140 60 q15 -30 40 -22 q-12 -15 4 -26 q8 18 19 18 q-19 12 -15 34 q-24 -8 -52 22z'/></g></svg>`;
  return bg(s);
}
function gridSvg(a: string, b: string) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' preserveAspectRatio='none'><g stroke='${a}' stroke-width='0.7' opacity='0.6'><path d='M0 100 L50 0 M100 100 L50 0 M0 60 L100 60 M0 74 L100 74 M0 88 L100 88'/></g><g stroke='${b}' stroke-width='0.5' opacity='0.4'><path d='M20 100 L45 0 M80 100 L55 0'/></g></svg>`;
  return bg(s);
}
function circuitSvg(color: string) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><g fill='none' stroke='${color}' stroke-width='1' opacity='0.5'><path d='M10 10 H60 V50 H100 V90'/><path d='M130 20 V70 H80'/><path d='M20 130 H70 V100'/><circle cx='60' cy='50' r='3' fill='${color}'/><circle cx='100' cy='90' r='3' fill='${color}'/><circle cx='80' cy='70' r='3' fill='${color}'/></g></svg>`;
  return bg(s);
}
function seigaihaSvg(color: string) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30'><g fill='none' stroke='${color}' stroke-width='1' opacity='0.5'><circle cx='0' cy='30' r='28'/><circle cx='0' cy='30' r='20'/><circle cx='0' cy='30' r='12'/><circle cx='60' cy='30' r='28'/><circle cx='60' cy='30' r='20'/><circle cx='60' cy='30' r='12'/><circle cx='30' cy='30' r='28'/><circle cx='30' cy='30' r='20'/><circle cx='30' cy='30' r='12'/></g></svg>`;
  return `${svgUrl(s)} center/60px 30px repeat`;
}
function dragonSvg() {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160'><path d='M10 120 q40 -30 70 -10 q10 -40 40 -30 q-5 -25 20 -30 q5 20 25 15 q30 -5 40 20 q-25 5 -30 25 q30 10 25 40 q-35 -20 -60 0 q-20 -25 -50 -10 q-30 15 -45 -15z' fill='none' stroke='#c0392b' stroke-width='1.4' opacity='0.5'/></svg>`;
  return bg(s);
}
function alchemySvg(color: string) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='none' stroke='${color}' stroke-width='1' opacity='0.4'><circle cx='150' cy='150' r='120'/><circle cx='150' cy='150' r='90'/><polygon points='150,40 245,205 55,205'/><polygon points='150,260 55,95 245,95'/><circle cx='150' cy='150' r='45'/></g></svg>`;
  return bg(s);
}
