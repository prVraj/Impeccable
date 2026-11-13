"use client";

import { Kalam } from "next/font/google";
import { TextMirroring } from "./text-mirroring";

const hand = Kalam({ subsets: ["latin"], weight: ["400"], display: "swap" });

/**
 * The handwritten note, drawn like a quick margin scribble. The words and the
 * arrow are one piece, tilted together, so the pen stroke starts right where
 * the words start: it leaves just before the first letter, loops once, and
 * drops onto the text with an uneven arrowhead. Touch screens read "Tap on this".
 * Website demo only; it never ships.
 */
export function HoverNote({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={`${hand.className} pointer-events-none select-none`}
      style={{
        position: "absolute",
        display: "block",
        lineHeight: 1,
        color: "color-mix(in oklab, var(--fg) 62%, transparent)",
        transform: "rotate(-7deg)",
        transformOrigin: "left top",
        ...style,
      }}
    >
      {/* The pen stroke: it sets the note's size, so the tip sits at the bottom */}
      <svg viewBox="0 0 100 70" fill="none" style={{ display: "block", width: "3.6em", height: "2.52em", marginTop: "0.32em", overflow: "visible" }}>
        <g stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M97 9 C 88 5.5, 76 7, 67.5 13.5 C 59.5 19.5, 61 30, 68.5 27 C 75.5 24, 71 12.5, 60.5 15.5 C 44 20.5, 26.5 37.5, 16.2 62.5" />
          <path d="M12.8 50.2 C 14 54.4, 15 58.6, 16.2 62.8" />
          <path d="M16.2 62.8 C 18.6 59.6, 21.8 57.1, 26.2 55.6" />
        </g>
      </svg>
      <span style={{ position: "absolute", top: 0, left: "3.75em", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
        <span className="[@media(hover:none)]:hidden">Hover on this</span>
        <span className="hidden [@media(hover:none)]:inline">Tap on this</span>
      </span>
    </span>
  );
}

export function TextMirroringDemo() {
  return (
    // Inline min height, so the preview never collapses, even when scaled down
    // in the Desktop and Tablet views.
    <div
      className="card grid place-items-center overflow-hidden rounded-2xl px-4 text-[var(--fg)]"
      style={{ minHeight: 520, paddingTop: 72, paddingBottom: 48 }}
    >
      <div style={{ position: "relative" }}>
        <HoverNote style={{ fontSize: "clamp(18px, 4cqi, 26px)", bottom: "calc(100% - 0.6em)", left: "17%" }} />
        <TextMirroring as="h2" text="Vraj Sensei" />
      </div>
    </div>
  );
}

/** Sizes section: 64 and 52 side by side, each with its own hover. */
export function TextMirroringSizesDemo() {
  return (
    <div className="card grid gap-10 overflow-hidden rounded-2xl px-5 py-10 text-[var(--fg)] @min-[40rem]:px-10">
      {([64, 52] as const).map((s) => (
        <div key={s} className="grid gap-2">
          <span className="font-mono text-xs text-[var(--muted)]">size={"{" + s + "}"}</span>
          <TextMirroring as="p" size={s} text={s === 64 ? "Made for humans" : "Built with care"} />
        </div>
      ))}
    </div>
  );
}
