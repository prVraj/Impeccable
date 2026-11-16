"use client";

/**
 * Window Stats, from Impeccable.
 *
 * A stats section you scroll through. A short statement sits in the middle of
 * the screen and stays there (sticky) while picture cards slide up over it.
 * As the first card arrives, the statement softens into a blur and sinks
 * behind the cards, and stays there: once the last card has passed, the
 * blurred statement scrolls away with it. At the very end a small "Back to
 * the start" pill glides you back to the top of the section (an ease-out
 * scroll) to watch it again.
 *
 *   - Above the statement, a row of little faces with a rating; below it, a
 *     strip of logos that slides slowly sideways. Both are optional.
 *
 *   - Each card is a window: its picture also moves upward inside the frame
 *     as you scroll (parallax), so the picture feels deeper than the card.
 *   - Each card's number and label sit on a soft dark mask that fades up from
 *     the bottom of the picture. No box, no frosted glass.
 *   - Native scrolling moves everything. The script only nudges pictures and
 *     fades the blur, with transform and opacity, and only while the section
 *     is on screen. Pictures load lazily.
 *   - Works in a scrolling box too (it finds the nearest scrolling parent).
 *     No parent between it and that scroller may clip it with overflow: hidden.
 *
 * No packages. Colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg), so it follows light and dark mode.
 */

import { useEffect, useRef } from "react";

/* ---------- the design: keep as written ---------- */

const PARALLAX = 0.12; // pictures travel 12% of the card's height each way inside it
const BLUR = 10; // px of blur on the statement behind the cards
const SINK_SCALE = 0.06; // the statement shrinks 6% as it goes behind
const SINK_DIM = 0.4; // ...and fades 40%
const TOP_GAP = 0.85; // the first card starts 85% of a screen below the statement's top
const END_GAP = 0.15; // the statement lets go 15% of a screen after the last card, so it leaves with the cards
// The statement blurs while the first card climbs from 80% to 45% of the screen, and stays blurred.
const IN_FROM = 0.8;
const IN_TO = 0.45;
const SHOW_MS = 500; // the back pill rises in
const BACK_MS = [700, 1500]; // the glide back: shortest and longest, in ms (longer for longer trips)
const LOGO_S = 4; // seconds each logo takes to slide past
const easeOut = (x) => 1 - Math.pow(1 - x, 3); // fast start, soft landing

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const num = (n, fallback, lo, hi) =>
  typeof n === "number" && Number.isFinite(n) ? clamp(n, lo, hi) : fallback;

const CSS = `
.iws {
  --iws-fg: var(--foreground, var(--fg, CanvasText));
  --iws-bg: var(--background, var(--bg, Canvas));
  --iws-muted: color-mix(in oklab, var(--iws-fg) 60%, var(--iws-bg));
  --iws-line: color-mix(in oklab, var(--iws-fg) 10%, transparent);
  --iws-radius: calc(var(--radius-lg, 8px) * 3); /* soft, calm corners: 24px with an 8px theme radius */
  --iws-vh: 100svh;
  position: relative;
  container-type: inline-size;
  color: var(--iws-fg);
}
.iws-stage {
  display: grid;
  grid-template-areas: "all";
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: 16px;
}
.iws-sticky {
  grid-area: all;
  align-self: start;
  position: sticky;
  top: 0;
  height: var(--iws-vh);
  display: grid;
  place-items: center;
  z-index: 0;
  pointer-events: none;
}
.iws-copy {
  display: grid;
  grid-template-areas: "all";
  max-width: 40rem;
  will-change: transform, opacity;
}
.iws-copy > * { grid-area: all; will-change: opacity; }
.iws-soft { opacity: 0; filter: blur(var(--iws-blur, ${BLUR}px)); }
.iws-text { display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; pointer-events: auto; }
.iws-soft .iws-text { pointer-events: none; }
/* The little row above the statement: faces, stars, score, a line. */
.iws-proof { display: flex; align-items: center; gap: 12px; text-align: left; }
.iws-faces { display: flex; flex: none; }
.iws-face {
  width: 30px; height: 30px; border-radius: 50%; display: block; color: var(--iws-fg);
  box-shadow: 0 0 0 2px var(--iws-bg);
}
.iws-face + .iws-face { margin-left: -8px; }
.iws-face:nth-child(1) { background: color-mix(in oklab, var(--iws-fg) 8%, var(--iws-bg)); }
.iws-face:nth-child(2) { background: color-mix(in oklab, var(--iws-fg) 14%, var(--iws-bg)); }
.iws-face:nth-child(3) { background: color-mix(in oklab, var(--iws-fg) 20%, var(--iws-bg)); }
.iws-face:nth-child(4) { background: color-mix(in oklab, var(--iws-fg) 11%, var(--iws-bg)); }
.iws-rating { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.iws-stars { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; line-height: 1; }
.iws-stars svg { width: 13px; height: 13px; flex: none; }
.iws-stars span { margin-left: 5px; font-variant-numeric: tabular-nums; }
.iws-proof-text { font-size: 13px; line-height: 1.3; color: var(--iws-muted); overflow-wrap: anywhere; }
/* The logo strip: it slides sideways forever, and fades out at both ends (a mask, not an overlay). */
.iws-logos {
  width: min(34rem, 86cqi); overflow: hidden; margin-top: 6px;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 18%, #000 82%, transparent);
}
.iws-track {
  display: flex; width: max-content;
  animation: iws-slide var(--iws-logo-s, 32s) linear infinite;
  animation-play-state: paused;
}
/* It only moves while the section is on screen and the statement is sharp. */
.iws[data-live]:not([data-sunk]) .iws-track { animation-play-state: running; }
/* Resting a pointer on the strip holds it still (both copies, so they stay in step). */
@media (hover: hover) { .iws:has(.iws-sharp .iws-logos:hover) .iws-track { animation-play-state: paused; } }
.iws-row { display: flex; align-items: center; gap: 36px; padding-right: 36px; margin: 0; list-style: none; }
.iws-row > li { flex: none; display: flex; }
.iws-logo {
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
  font-size: 14px; font-weight: 600; letter-spacing: -0.01em; color: color-mix(in oklab, var(--iws-fg) 72%, var(--iws-bg));
}
.iws-logo svg { width: 18px; height: 18px; flex: none; }
@keyframes iws-slide { to { transform: translate3d(-50%, 0, 0); } }
.iws-title {
  margin: 0; font-size: clamp(1.375rem, 4.6cqi, 2.5rem); line-height: 1.2; font-weight: 500;
  letter-spacing: -0.025em; text-wrap: balance; overflow-wrap: anywhere;
}
.iws-caption { margin: 0; font-size: 14px; color: var(--iws-muted); overflow-wrap: anywhere; }

.iws-cards {
  grid-area: all;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: calc(var(--iws-vh) * 0.1);
  align-items: start;
  padding-top: calc(var(--iws-vh) * ${TOP_GAP});
  padding-bottom: calc(var(--iws-vh) * ${END_GAP});
  margin: 0;
  list-style: none;
}
.iws-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--iws-radius);
  container-type: inline-size;
  background: color-mix(in oklab, var(--iws-fg) 7%, var(--iws-bg));
  box-shadow: 0 1px 2px rgb(0 0 0 / .06), 0 18px 40px -18px rgb(0 0 0 / .35);
  -webkit-user-select: none; user-select: none;
  -webkit-touch-callout: none;
  isolation: isolate;
}
/* Phones: one card per row, swinging left and right. */
.iws-card { grid-column: 1 / span 10; aspect-ratio: 4 / 5; }
.iws-card:nth-child(even) { grid-column: 3 / span 10; }
.iws-card[data-slot="2"] { grid-column: 1 / -1; aspect-ratio: 4 / 3; }
/* Wider: a left and right pair, then one wide card in the middle. */
@container (min-width: 640px) {
  .iws-cards { row-gap: calc(var(--iws-vh) * 0.16); column-gap: 24px; }
  .iws-card[data-slot="0"] { grid-column: 1 / span 5; aspect-ratio: 1; }
  .iws-card[data-slot="1"] { grid-column: 9 / span 4; aspect-ratio: 1; margin-top: calc(var(--iws-vh) * 0.14); }
  .iws-card[data-slot="2"] { grid-column: 3 / span 8; aspect-ratio: 16 / 9; }
  .iws-card[data-slot="3"] { grid-column: 1 / span 4; aspect-ratio: 4 / 3; margin-top: calc(var(--iws-vh) * 0.1); }
  .iws-card[data-slot="4"] { grid-column: 8 / span 5; aspect-ratio: 5 / 4; }
}
.iws-pic {
  position: absolute;
  left: 0;
  width: 100%;
  top: calc(var(--iws-r) * -100%);
  height: calc((1 + 2 * var(--iws-r)) * 100%);
  object-fit: cover;
  display: block;
  pointer-events: none;
  -webkit-user-drag: none;
  will-change: transform;
}
.iws-pic[data-broken] { display: none; }
/* The mask: a dark layer that fades up from the bottom, so the white text reads on any picture. */
.iws-shade {
  position: absolute; inset: 35% 0 0; z-index: 1;
  background: rgb(0 0 0 / .62);
  -webkit-mask-image: linear-gradient(to top, #000 0%, rgb(0 0 0 / .78) 22%, rgb(0 0 0 / .42) 48%, rgb(0 0 0 / .14) 74%, transparent);
  mask-image: linear-gradient(to top, #000 0%, rgb(0 0 0 / .78) 22%, rgb(0 0 0 / .42) 48%, rgb(0 0 0 / .14) 74%, transparent);
  pointer-events: none;
}
.iws-stat {
  position: absolute; inset: auto 0 0; z-index: 2;
  display: flex; align-items: center; gap: 14px;
  padding: clamp(14px, 5.5cqi, 24px);
  color: #fff;
}
.iws-value {
  font-size: clamp(1.375rem, 10cqi, 2.5rem); line-height: 1; font-weight: 600; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums; white-space: nowrap; flex: 0 1 auto; min-width: 0;
  overflow: hidden; text-overflow: ellipsis;
}
.iws-rule { flex: 1; min-width: 12px; height: 1px; background: rgb(255 255 255 / .38); }
.iws-label {
  flex: 0 1 auto; max-width: 55%; font-size: clamp(.75rem, 4.2cqi, .875rem); line-height: 1.3; font-weight: 500;
  text-align: right; color: rgb(255 255 255 / .86); overflow-wrap: anywhere;
}
/* After the last card: the pill that takes you back to the start. */
.iws-end { display: flex; justify-content: center; padding: 8px 16px clamp(48px, 10cqi, 96px); }
.iws-back {
  display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 16px 0 12px; border: 0; border-radius: 999px;
  font: inherit; font-size: 14px; font-weight: 500; color: var(--iws-fg); cursor: pointer;
  background: var(--iws-bg);
  box-shadow: 0 0 0 1px var(--iws-line), 0 1px 2px rgb(0 0 0 / .06), 0 6px 16px -8px rgb(0 0 0 / .2);
  opacity: 0; transform: translateY(8px);
  transition: opacity ${SHOW_MS}ms cubic-bezier(.23,1,.32,1), transform ${SHOW_MS}ms cubic-bezier(.23,1,.32,1), box-shadow .2s;
}
.iws-back[data-shown] { opacity: 1; transform: none; }
.iws-back:active { transform: scale(.97); }
.iws-back:focus-visible { outline: 2px solid var(--iws-fg); outline-offset: 2px; }
.iws-back svg { width: 16px; height: 16px; flex: none; }
@media (hover: hover) {
  .iws-back:hover { box-shadow: 0 0 0 1px color-mix(in oklab, var(--iws-fg) 22%, transparent), 0 1px 2px rgb(0 0 0 / .06), 0 8px 20px -8px rgb(0 0 0 / .25); }
}
@media (prefers-reduced-motion: reduce) {
  .iws-pic { transform: none !important; }
  .iws-back { transform: none; transition: opacity ${SHOW_MS}ms; }
  .iws-track { animation: none; }
}
`;

/** The scrolling parent the section moves in: the nearest box that really scrolls, else the page. */
function scrollParent(el) {
  let node = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const oy = getComputedStyle(node).overflowY;
    // A wrapper with overflow-x: hidden also reports overflow-y: auto, but it grows instead of scrolling: skip it.
    if (oy !== "visible" && oy !== "clip" && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return null;
}

/** Little faces for the proof row: four people, four moods. Drawn here, no pictures to load. */
const FACES = [
  <path key="m" d="M10 18.5q5 4 10 0" />,
  <path key="m" d="M10.5 18.5q4.5 3.2 9 0" />,
  <circle key="m" cx="15" cy="19.5" r="2" />,
  <path key="m" d="M9.5 18q5.5 5.5 11 0z" fill="currentColor" />,
];
function Face({ i }) {
  const wink = i === 1;
  return (
    <svg
      className="iws-face"
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {wink ? (
        <path d="M9 12.5h3.4" />
      ) : (
        <circle cx="10.7" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
      )}
      <circle cx="19.3" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
      {FACES[i % FACES.length]}
    </svg>
  );
}

/* Hugeicons star, filled. */
const STAR =
  "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.2581 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z";

/** Made-up studios for the logo strip, one small mark each. Swap in real logos with the logos prop. */
const MARKS = [
  [
    "Kerning & Co",
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>,
  ],
  ["Lorem Labs", <path d="M12 4.5l7.5 14h-15z" />],
  [
    "8px Grid",
    <>
      <circle cx="8" cy="8" r="2.2" fill="currentColor" />
      <circle cx="16" cy="8" r="2.2" fill="currentColor" />
      <circle cx="8" cy="16" r="2.2" fill="currentColor" />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
    </>,
  ],
  [
    "Undo Studio",
    <>
      <path d="M9 13.5L4.5 9 9 4.5" />
      <path d="M4.5 9H14a5.5 5.5 0 0 1 0 11h-3" />
    </>,
  ],
  [
    "Squircle Inc",
    <path d="M12 3.5c6.5 0 8.5 2 8.5 8.5s-2 8.5-8.5 8.5-8.5-2-8.5-8.5 2-8.5 8.5-8.5z" />,
  ],
  ["Dark Mode Ltd", <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />],
  ["Hex Bakery", <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />],
  [
    "Pixel Pushers",
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </>,
  ],
];
const DEFAULT_LOGOS = MARKS.map(([name, mark]) => (
  <span className="iws-logo">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mark}
    </svg>
    {name}
  </span>
));

/** Its spot in the left, right, middle rhythm. */
const slotOf = (i) => i % 5;

export function WindowStats({
  cards,
  proof = { score: "4.9/5", text: "Loved by 1,200+ humans and one very picky mom" },
  title = "I design with brain. Present with heart.",
  caption = null,
  logos = DEFAULT_LOGOS,
  parallax = PARALLAX,
  blur = BLUR,
  backLabel = "Back to the start",
  className,
  style,
}) {
  const root = useRef(null);
  const copy = useRef(null);
  const sharp = useRef(null);
  const soft = useRef(null);
  const back = useRef(null);
  const stopGlide = useRef(null);
  const logoList = Array.isArray(logos) ? logos.filter((l) => l != null && l !== false) : [];
  const list = cards ?? [];
  const r = num(parallax, PARALLAX, 0, 0.3);
  const b = num(blur, BLUR, 0, 24);
  const count = list.length;

  useEffect(() => {
    const el = root.current;
    if (!el || !count) return;
    const scroller = scrollParent(el);
    const target = scroller ?? window;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let live = false;
    let lastT = -1;
    const pics = () => Array.from(el.querySelectorAll(".iws-pic"));
    // A picture can fail before the page is interactive, when onError isn't listening yet: check once now.
    for (const img of pics())
      if (img.complete && img.naturalWidth === 0) img.setAttribute("data-broken", "");
    const lastShift = new Map();

    // In a scrolling box, the sticky statement is as tall as the box, not the screen.
    const sizeToBox = () => {
      if (scroller) el.style.setProperty("--iws-vh", `${scroller.clientHeight}px`);
    };

    const frame = () => {
      raf = 0;
      const stage = el.querySelector(".iws-stage");
      if (!stage) return;
      // Read everything first, then write (transform and opacity only), so the page never re-lays out.
      const s = stage.getBoundingClientRect();
      let top = 0;
      let h = window.innerHeight;
      if (scroller) {
        const box = scroller.getBoundingClientRect();
        top = box.top;
        h = box.height;
      }
      if (!h || !s.height) return;
      // Everything here is in on-screen px, so it also works inside a scaled box.
      const vh = h;
      const firstTop = s.top - top + TOP_GAP * vh;
      const t = clamp((IN_FROM * vh - firstTop) / ((IN_FROM - IN_TO) * vh), 0, 1);
      const still = motion.matches;

      const shifts = [];
      if (r > 0 && !still) {
        for (const img of pics()) {
          const card = img.parentElement;
          const c = card.getBoundingClientRect();
          const y = c.top - top;
          if (y > vh + 40 || y + c.height < -40) continue; // off screen: leave it
          const p = clamp((vh - y) / (vh + c.height), 0, 1); // 0 entering at the bottom, 1 leaving at the top
          shifts.push([img, ((r * (1 - 2 * p)) / (1 + 2 * r)) * 100]);
        }
      }

      if (Math.abs(t - lastT) > 0.002) {
        lastT = t;
        const k = still ? 0 : t;
        if (copy.current) {
          copy.current.style.transform = `scale(${1 - SINK_SCALE * k})`;
          copy.current.style.opacity = String(1 - SINK_DIM * t);
        }
        if (sharp.current) sharp.current.style.opacity = String(1 - t);
        if (soft.current) soft.current.style.opacity = String(t);
        // The logo strip rests once the statement starts to sink (no moving parts under the blur).
        el.toggleAttribute("data-sunk", t > 0.05);
      }
      for (const [img, pct] of shifts) {
        if (Math.abs((lastShift.get(img) ?? 99) - pct) < 0.02) continue;
        lastShift.set(img, pct);
        img.style.transform = `translate3d(0, ${pct.toFixed(3)}%, 0)`;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    // Listen to scrolling only while the section is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting;
        if (on === live) return;
        live = on;
        el.toggleAttribute("data-live", on);
        if (on) {
          target.addEventListener("scroll", kick, { passive: true });
          kick();
        } else target.removeEventListener("scroll", kick);
      },
      { root: scroller, rootMargin: "100px 0px" },
    );
    io.observe(el);

    // The back pill rises in each time it comes into view.
    const pill = back.current;
    const pillIo = pill
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) pill.setAttribute("data-shown", "");
            else if (entry.boundingClientRect.top > (entry.rootBounds?.bottom ?? Infinity))
              pill.removeAttribute("data-shown");
          },
          { root: scroller, threshold: 0.6 },
        )
      : null;
    if (pill) pillIo.observe(pill);

    const ro = new ResizeObserver(() => {
      sizeToBox();
      lastT = -1;
      lastShift.clear();
      kick();
    });
    ro.observe(el);
    if (scroller) ro.observe(scroller);
    window.addEventListener("resize", kick, { passive: true });
    const onMotion = () => {
      lastT = -1;
      lastShift.clear();
      pics().forEach((i) => (i.style.transform = ""));
      kick();
    };
    motion.addEventListener?.("change", onMotion);
    sizeToBox();
    kick();

    return () => {
      stopGlide.current?.();
      cancelAnimationFrame(raf);
      io.disconnect();
      pillIo?.disconnect();
      ro.disconnect();
      target.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      motion.removeEventListener?.("change", onMotion);
    };
  }, [count, r, backLabel != null]);

  /** Back to where the section starts: the statement sharp in the middle, the first cards waiting below.
   *  It glides there on an ease-out curve (fast start, soft landing), and lets go the moment you scroll yourself. */
  const toStart = () => {
    const el = root.current;
    if (!el) return;
    stopGlide.current?.();
    const scroller = scrollParent(el);
    const rect = el.getBoundingClientRect();
    let from;
    let to;
    if (scroller) {
      const box = scroller.getBoundingClientRect();
      const scale = box.height / (scroller.clientHeight || box.height) || 1;
      from = scroller.scrollTop;
      to = from + (rect.top - box.top) / scale;
    } else {
      from = window.scrollY;
      to = from + rect.top;
    }
    to = Math.max(0, to);
    const set = (y) => (scroller ? (scroller.scrollTop = y) : window.scrollTo(0, y));
    // Keyboard users land on the statement, without a second jump.
    const land = () => el.querySelector(".iws-sticky h2")?.focus({ preventScroll: true });
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dist = Math.abs(to - from);
    if (still || dist < 2) {
      set(to);
      land();
      return;
    }
    // A page-wide scroll-behavior: smooth would fight each step: switch it off for the trip.
    const owner = scroller ?? document.documentElement;
    const before = owner.style.scrollBehavior;
    owner.style.scrollBehavior = "auto";
    const ms = clamp(BACK_MS[0] + dist * 0.12, BACK_MS[0], BACK_MS[1]);
    const input = scroller ?? window;
    const cuts = ["wheel", "touchstart", "pointerdown", "keydown"];
    let id = 0;
    const start = performance.now();
    const stop = () => {
      cancelAnimationFrame(id);
      cuts.forEach((c) => input.removeEventListener(c, stop));
      owner.style.scrollBehavior = before;
      if (stopGlide.current === stop) stopGlide.current = null;
    };
    const step = (now) => {
      const x = Math.min(1, (now - start) / ms);
      set(from + (to - from) * easeOut(x));
      if (x < 1) id = requestAnimationFrame(step);
      else {
        stop();
        land();
      }
    };
    cuts.forEach((c) => input.addEventListener(c, stop, { passive: true }));
    stopGlide.current = stop;
    id = requestAnimationFrame(step);
  };

  const text = (hidden) => (
    <div className="iws-text">
      {proof != null && (
        <div className="iws-proof">
          <span className="iws-faces" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Face key={i} i={i} />
            ))}
          </span>
          <span className="iws-rating">
            <span className="iws-stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={STAR} />
                </svg>
              ))}
              <span>{proof.score}</span>
            </span>
            <span className="iws-proof-text">{proof.text}</span>
          </span>
        </div>
      )}
      {/* Only the sharp copy is a heading; the blurred one is a picture of it. */}
      {hidden ? (
        <p className="iws-title">{title}</p>
      ) : (
        <h2 className="iws-title" tabIndex={-1} style={{ outline: "none" }}>
          {title}
        </h2>
      )}
      {caption != null && <p className="iws-caption">{caption}</p>}
      {logoList.length > 0 && (
        <div className="iws-logos">
          <div className="iws-track">
            {/* Two copies side by side, so the strip loops without a seam. Only the first is read out. */}
            {[0, 1].map((n) => (
              <ul key={n} className="iws-row" aria-hidden={n === 1 || hidden ? true : undefined}>
                {logoList.map((logo, i) => (
                  <li key={i}>{logo}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={root}
      className={["iws", className].filter(Boolean).join(" ")}
      style={{
        ...style,
        ["--iws-r"]: String(r),
        ["--iws-blur"]: `${b}px`,
        ["--iws-logo-s"]: `${Math.max(1, logoList.length) * LOGO_S}s`,
      }}
    >
      <style>{CSS}</style>
      <div className="iws-stage">
        <div className="iws-sticky">
          <div ref={copy} className="iws-copy">
            <div ref={sharp} className="iws-sharp">
              {text(false)}
            </div>
            <div ref={soft} className="iws-soft" aria-hidden="true" inert>
              {text(true)}
            </div>
          </div>
        </div>
        {count > 0 && (
          <ul className="iws-cards">
            {list.map((card, i) => (
              <li key={i} className="iws-card" data-slot={slotOf(i)}>
                <img
                  className="iws-pic"
                  src={card.src}
                  alt={card.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onError={(e) => e.currentTarget.setAttribute("data-broken", "")}
                />
                <span className="iws-shade" aria-hidden="true" />
                <p className="iws-stat" style={{ margin: 0 }}>
                  <span className="iws-value">{card.value}</span>
                  <span className="iws-rule" aria-hidden="true" />
                  <span className="iws-label">{card.label}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {count > 0 && backLabel != null && (
        <div className="iws-end">
          <button ref={back} type="button" className="iws-back" onClick={toStart}>
            {/* Hugeicons arrow-up-02, stroke rounded */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4v16" />
              <path d="M17 9s-3.682-5-5-5-5 5-5 5" />
            </svg>
            {backLabel}
          </button>
        </div>
      )}
    </section>
  );
}
