"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

/**
 * Text-mirroring: bold header text that, on hover, turns into a mirror box.
 * Each letter becomes a glass frame, and inside its own outline smaller frames
 * of the same letter open one after another, each inside the last, like a
 * screen shared into itself. Everything stays inside the letter's shape, so it
 * reads as a mirror inside a mirror, not as extra letters. Leaving plays it
 * backwards.
 *
 * "Infinite" is a look, not a loop: there is a small, fixed number of frames
 * (5 on big text, 3 on phones, never more than 8), drawn once. Nothing repeats
 * or runs on a timer; every move is a CSS transition.
 */

/* ---------- Tuning: these values are the design ---------- */
const SHRINK = 0.8; // each reflection is 80% the size of the one in front of it
const LAYER_MS = 620; // how long one copy takes to settle into place
const LETTER_STAGGER = 18; // ms between letters, left to right
const OUT_MS = 420; // how long one copy takes to sink back on leave
const FACE_MS = 480; // the solid letter turning to glass
const EASE_IN = "cubic-bezier(0.23, 1, 0.32, 1)"; // copies arrive fast and land softly
const EASE_OUT = "cubic-bezier(0.65, 0, 0.35, 1)"; // copies leave smoothly
const MAX_DEPTH = 8; // hard cap on copies, whatever is passed
const PACE_COPIES = 5; // `duration` is the time a 5-frame build takes; fewer frames keep the same pace
const RIM_EM = 0.045; // the glass rim around each letter (em; only the inner half shows)
const LINE_EM = 0.03; // the edge line of each smaller letter inside (em)
const LONG_WORD = 24; // words longer than this may break between letters

export type TextMirroringProps = {
  /** The header text. */
  text: string;
  /** Which tag to render. Default "h2". */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  /** Font size in px: 64 or 52. It shrinks to fit narrow screens. Default 64. */
  size?: 64 | 52;
  /** How many frames open inside each letter (2 to 8). Default: 5, or 3 on a phone (when the text has shrunk to fit). */
  depth?: number;
  /** Time in ms for a 5-frame build, first frame to last (400 to 4000). Fewer frames keep the same pace. Default 1500. */
  duration?: number;
  /** Turn the mirror on or off yourself. Leave it out to use hover (and tap on touch screens). */
  active?: boolean;
  className?: string;
  style?: CSSProperties;
};

const clamp = (n: number, lo: number, hi: number, fallback: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;

const LAYER: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  userSelect: "none",
};

/**
 * Where the baseline sits in each letter box, in em. The mirror is drawn in SVG
 * over the letter, so it needs the baseline to line up with the real letter.
 */
type Metrics = { baseline: number };
const FALLBACK: Metrics = { baseline: 0.92 };
function fontMetrics(el: HTMLElement): Metrics {
  const cs = getComputedStyle(el);
  const px = parseFloat(cs.fontSize);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !px) return FALLBACK;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
  const lh = cs.lineHeight === "normal" ? px * 1.2 : parseFloat(cs.lineHeight);
  const m = ctx.measureText("I");
  if (!m.fontBoundingBoxAscent) return FALLBACK;
  const baseline = (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
  return { baseline: baseline / px };
}

// Runs before paint in the browser; on the server it is never called.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Letters as a person sees them, so emoji and accents stay in one piece. */
let segmenter: Intl.Segmenter | null | undefined;
function graphemes(word: string): string[] {
  if (segmenter === undefined) {
    const Seg = typeof Intl !== "undefined" ? (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter : undefined;
    segmenter = Seg ? new Seg(undefined, { granularity: "grapheme" }) : null;
  }
  if (!segmenter) return Array.from(word);
  return Array.from(segmenter.segment(word), (s) => s.segment);
}

const COMPLEX = /[\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0EFF\u1000-\u109F\uFB1D-\uFDFF\uFE70-\uFEFF]/;

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function TextMirroring({
  text,
  as = "h2",
  size = 64,
  depth,
  duration = 1500,
  active,
  className,
  style,
}: TextMirroringProps) {
  const Tag = as as ElementType;
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLElement>(null);
  const on = active ?? hovered;

  // Big text on a wide screen has room to show 5 copies; on a phone the letters are smaller, so 3.
  const [big, setBig] = useState(true);
  const auto = big ? 5 : 3;
  const n = Math.round(clamp(depth ?? auto, 2, MAX_DEPTH, auto));
  const total = clamp(duration, 400, 4000, 1500);
  // Copies start one after another at a steady pace.
  const step = Math.max(40, (total - LAYER_MS - FACE_MS * 0.35) / (PACE_COPIES - 1));
  const outStep = step * 0.4;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // On touch screens a tap turns it on; a tap anywhere else turns it off.
  useEffect(() => {
    if (!hovered || active !== undefined) return;
    const off = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !root.current?.contains(e.target as Node)) setHovered(false);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [hovered, active]);

  const value = typeof text === "string" ? text : String(text ?? "");
  const words = value.split(/(\s+)/);
  // Scripts whose letters join or run right to left (Arabic, Hebrew, Indic...) mirror
  // whole words, so their letters keep their shapes and order.
  const wholeWords = COMPLEX.test(value);
  const units = words.map((w) => (/^\s*$/.test(w) ? [] : wholeWords ? [w] : graphemes(w)));
  const count = units.reduce((sum, u) => sum + u.length, 0);

  // Measure the font (once, and again when fonts load) so the frames line up.
  const [metrics, setMetrics] = useState<Metrics>(FALLBACK);
  useIsoLayoutEffect(() => {
    let live = true;
    const measure = () => {
      if (live && root.current) setMetrics(fontMetrics(root.current));
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      live = false;
    };
  }, [size, as]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");


  // The size and room follow the screen (both shrink on phones), so watch them.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // The text only shrinks below its size when the room is phone-narrow
    // (under about 430px), so shrunk text means a phone: 3 copies.
    const read = () => setBig((parseFloat(getComputedStyle(el).fontSize) || size) >= size * 0.97);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  // On leave the glass turns solid again only once the copies are gone.
  const leaveEnd = (n - 1) * outStep + OUT_MS * 0.5;

  let index = 0; // position of each letter in the whole text
  const body = words.map((word, w) => {
    if (word === "") return null;
    if (/^\s+$/.test(word)) return <span key={w} aria-hidden="true">{word}</span>;
    const letters = units[w];
    const breakable = letters.length > LONG_WORD;
    return (
      // A word stays on one line; only a very long word may break between letters.
      <span key={w} aria-hidden="true" style={breakable ? undefined : { whiteSpace: "nowrap" }}>
        {letters.map((ch, j) => {
          const i = index++;
          return (
            <span key={j}>
              {breakable && j > 0 ? <wbr /> : null}
              <span style={{ position: "relative", display: "inline-block", whiteSpace: "pre" }}>
                {/* Holds the letter's place; the faces below draw it. */}
                <span style={{ visibility: "hidden" }}>{ch}</span>
                {/* Solid face: the plain letter you see at rest. On hover it turns to glass. */}
                <span
                  style={{
                    ...LAYER,
                    opacity: on ? 0 : 1,
                    transition: `opacity ${reduced ? 200 : on ? FACE_MS : OUT_MS}ms ${on ? EASE_IN : EASE_OUT} ${on ? i * LETTER_STAGGER : leaveEnd}ms`,
                  }}
                >
                  {ch}
                </span>
                {/* The mirror: drawn in SVG over the letter and clipped to its shape. */}
                <svg
                  aria-hidden="true"
                  style={{
                    ...LAYER,
                    width: "100%",
                    height: "100%",
                    overflow: "visible",
                    direction: "ltr", // x=0 is the letter's left edge, even in right-to-left text
                    opacity: on ? 1 : 0,
                    transition: `opacity ${reduced ? 200 : on ? FACE_MS : OUT_MS}ms ${on ? EASE_IN : EASE_OUT} ${on ? i * LETTER_STAGGER : leaveEnd}ms`,
                  }}
                >
                  <defs>
                    <clipPath id={`${uid}c${i}`}>
                      <text x="0" y={`${metrics.baseline}em`}>{ch}</text>
                    </clipPath>
                    <linearGradient id={`${uid}g${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
                      <stop offset="0.45" stopColor="currentColor" stopOpacity="0.04" />
                      <stop offset="0.55" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  <g clipPath={`url(#${uid}c${i})`}>
                    {/* Glass: a faint tint with a light streak across it */}
                    <text x="0" y={`${metrics.baseline}em`} fill={`url(#${uid}g${i})`}>{ch}</text>
                    {/* The reflections, deepest first: smaller copies of the letter, seen only
                        through the letter itself, like a mirror inside a mirror. */}
                    {Array.from({ length: n }, (_, c) => {
                      const k = n - c;
                      // In: reflection k opens out of reflection k-1 and settles one step deeper.
                      // Out: the deepest goes first, folding back into the one in front.
                      const delay = on
                        ? FACE_MS * 0.35 + (k - 1) * step + i * LETTER_STAGGER
                        : (n - k) * outStep + (count - 1 - i) * (LETTER_STAGGER * 0.5);
                      const ms = on ? LAYER_MS : OUT_MS;
                      const ease = on ? EASE_IN : EASE_OUT;
                      const scale = Math.pow(SHRINK, reduced || on ? k : k - 1);
                      return (
                        <text
                          key={k}
                          x="0"
                          y={`${metrics.baseline}em`}
                          fill="currentColor"
                          fillOpacity={0.1}
                          stroke="currentColor"
                          strokeLinejoin="round"
                          style={{
                            strokeWidth: `${LINE_EM}em`,
                            strokeOpacity: 0.85 - 0.1 * k,
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            transform: `scale(${scale.toFixed(4)})`,
                            opacity: on ? 1 : 0,
                            transition: reduced
                              ? "opacity 200ms ease"
                              : `transform ${ms}ms ${ease} ${delay}ms, opacity ${ms}ms ${ease} ${delay}ms`,
                          }}
                        >
                          {ch}
                        </text>
                      );
                    })}
                    {/* The glass rim: the letter's outline, crisp */}
                    <text
                      x="0"
                      y={`${metrics.baseline}em`}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.9"
                      style={{ strokeWidth: `${RIM_EM}em` }}
                    >
                      {ch}
                    </text>
                  </g>
                </svg>
              </span>
            </span>
          );
        })}
      </span>
    );
  });

  return (
    <Tag
      ref={root}
      dir="auto"
      className={className}
      data-mirror={on ? "on" : "off"}
      onPointerEnter={(e: React.PointerEvent) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(e: React.PointerEvent) => {
        if (e.pointerType === "mouse") setHovered(false);
      }}
      onPointerUp={(e: React.PointerEvent) => {
        if (e.pointerType !== "mouse") setHovered((h) => !h);
      }}
      style={{
        position: "relative",
        isolation: "isolate",
        margin: 0,
        fontSize: size === 52 ? "min(3.25rem, 13cqi)" : "min(4rem, 15cqi)",
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      <span style={SR_ONLY}>{value}</span>
      {body}
    </Tag>
  );
}

export default TextMirroring;
