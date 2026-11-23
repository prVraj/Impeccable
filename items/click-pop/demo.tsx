"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { clickPop, ClickPop, type ClickPopType } from "./click-pop";

export const TYPES: { type: ClickPopType; label: string }[] = [
  { type: "burst", label: "Burst" },
  { type: "ring", label: "Ring" },
  { type: "particles", label: "Particles" },
  { type: "crosshair", label: "Crosshair" },
  { type: "wavy", label: "Wavy" },
];

/** The site's brand violet: brand-300 on dark, a touch deeper on light so it doesn't wash out. */
export const DEMO_COLOR = "light-dark(color-mix(in oklab, var(--brand-300) 75%, var(--brand-400)), var(--brand-300))";

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

/** A drawn mouse pointer whose tip sits exactly on its spot (top left of the box). */
export function Pointer({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="5 3 19 19" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path d="M5 3l14 8.5-6.2 1.3L9.6 19z" fill="var(--fg)" stroke="var(--bg)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The preview: the dotted card pops on every click, and the five pills pick the type.
 * It fires clickPop() itself (instead of wrapping in <ClickPop>) so a press on a pill pops with the
 * type that pill picks, not the one before it.
 */
export function ClickPopDemo() {
  const [type, setType] = useState<ClickPopType>("burst");
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const picked = (e.target as Element).closest<HTMLElement>("[data-pick]")?.dataset.pick as ClickPopType | undefined;
    if (picked) setType(picked);
    clickPop(e.clientX, e.clientY, { type: picked ?? type, color: DEMO_COLOR });
  };
  return (
    <div
      data-click-pop=""
      onPointerDown={onDown}
      className="card dots flex min-h-80 flex-col items-center justify-between gap-10 rounded-2xl px-5 pt-16 pb-8 select-none @min-[40rem]:min-h-96 @min-[40rem]:pt-24"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-[22px] font-medium tracking-tight text-[var(--fg)] @min-[40rem]:text-[28px]">Click anywhere</span>
        <span className="text-[14px] text-[var(--muted)]">Every click on Impeccable UI gets a little pop.</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Pop type">
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            data-pick={t.type}
            onClick={() => setType(t.type)}
            aria-pressed={t.type === type}
            className={PILL}
            style={t.type === type ? { boxShadow: "0 0 0 1.5px var(--accent)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const EVERY_MS = 1800; // each type cell pops on its own this often
const STAGGER_MS = 360; // cells take turns, left to right

/** Pops a cell's own type at its pointer every so often, but only while the cell is on screen and the tab is open. */
function useAutoPop(type: ClickPopType, index: number) {
  const tip = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = tip.current;
    if (!el) return;
    let seen = false;
    const io = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting));
    io.observe(el);
    const fire = () => {
      if (!seen || document.hidden) return;
      const r = el.getBoundingClientRect();
      clickPop(r.left, r.top, { type, color: DEMO_COLOR });
    };
    let id = 0;
    const start = window.setTimeout(() => {
      fire();
      id = window.setInterval(fire, EVERY_MS);
    }, 600 + index * STAGGER_MS);
    return () => {
      io.disconnect();
      clearTimeout(start);
      clearInterval(id);
    };
  }, [type, index]);
  return tip;
}

function TypeCell({ type, label, index }: { type: ClickPopType; label: string; index: number }) {
  const tip = useAutoPop(type, index);
  // Burst and wavy shoot up from the tip, so their pointer sits lower in the cell.
  const up = type === "burst" || type === "wavy";
  return (
    <ClickPop type={type} color={DEMO_COLOR} className="card dots relative flex h-40 flex-col items-center justify-end rounded-xl pb-3 select-none">
      <span ref={tip} className="absolute left-1/2" style={{ top: up ? "58%" : "42%" }}>
        <Pointer size={18} />
      </span>
      <span className="text-[13px] text-[var(--muted)]">{label}</span>
    </ClickPop>
  );
}

/** The five types, each popping on its own in turn. Click a cell to pop it yourself. */
export function ClickPopTypesDemo() {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))" }}>
      {TYPES.map((t, i) => (
        <TypeCell key={t.type} type={t.type} label={t.label} index={i} />
      ))}
    </div>
  );
}
