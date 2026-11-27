"use client";

import { ParticleWake } from "./particle-wake";

/** The Impeccable mark (the same hexagon as the site icon), passed in as SVG markup like a person's own logo. */
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 71 82">
  <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="69" height="80">
    <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#fff"/>
    <g stroke="#000" stroke-width="3" fill="none"><path d="M0-11.5 69 28.5M0-6 69 34M0-.5 69 39.5"/></g>
  </mask>
  <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" mask="url(#cut)"/>
</svg>`;

/** The words under each shape: a pointer hint on mouse screens, a finger hint on phones (never a hover hint there). */
export function Hint() {
  return (
    <span className="text-[14px] text-[var(--muted)]">
      <span className="pw-hover">Move your pointer through it, or click.</span>
      <span className="pw-touch">Drag a finger sideways through it, or tap.</span>
      <style>{`.pw-touch{display:none}@media (hover:none){.pw-hover{display:none}.pw-touch{display:inline}}`}</style>
    </span>
  );
}

/** The preview: the word Impeccable in dots on the dotted card. */
export function ParticleWakeDemo() {
  return (
    <div data-click-pop="" className="card dots flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl px-3 py-10 select-none @min-[40rem]:min-h-96 @min-[40rem]:px-8">
      <ParticleWake
        text="Impeccable"
        color="var(--fg)"
        gap={3}
        className="font-bold tracking-tight"
        style={{ aspectRatio: "3 / 1" }}
      />
      <Hint />
    </div>
  );
}

/** Types: the same dots from an SVG (the Impeccable mark) and from a word. */
export function ParticleWakeTypesDemo() {
  const cell = "card dots flex flex-col items-center gap-2 rounded-xl px-3 pt-4 pb-3 select-none";
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      <div data-click-pop="" className={cell}>
        <ParticleWake svg={LOGO_SVG} color="var(--fg)" gap={3} radius={48} label="Impeccable mark" style={{ aspectRatio: "3 / 2" }} />
        <span className="text-[13px] text-[var(--muted)]">From your SVG</span>
      </div>
      <div data-click-pop="" className={cell}>
        <ParticleWake text="Humans" color="var(--fg)" gap={3} radius={48} className="font-bold tracking-tight" style={{ aspectRatio: "3 / 2" }} />
        <span className="text-[13px] text-[var(--muted)]">From a word</span>
      </div>
    </div>
  );
}
