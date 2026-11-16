"use client";

/**
 * Capsule Testimonials, from Impeccable.
 *
 * A testimonial section where every review starts as a slim capsule: the
 * person's photo at the bottom and their name written up the side. One review
 * is open at a time as a wide card.
 *
 *   - Hover a capsule: it grows a little taller and wider, and its round photo
 *     stretches into a tall portrait, so you see more of the person.
 *   - Click (or tap) a capsule: it opens smoothly while the open card eases
 *     back into a capsule at the same pace, so the row never snaps.
 *   - As a card opens, its top part (quote mark, words, date) settles from 60%
 *     opacity and 90% size to full, and the rating stars pop in one by one.
 *   - Arrow keys move between reviews. Under 560px wide, the capsules lie
 *     down and stack, and the open card grows downward instead.
 *
 * No packages. Page colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg). Each review has its own
 * card color, with a default palette that reads well in light and dark mode.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ---------- the design: keep as written ---------- */

const CAP = 56; // capsule width (or height when the capsules lie down)
const CAP_HOVER = 64; // a capsule under the pointer grows to this
const GAP = 8; // space between capsules
const ROW_H = 400; // height of the row on a wide section
const OPEN_H = 320; // height of the open card when the capsules stack (under 560px)
const OPEN_MS = 720; // the open card grows while the old one shrinks, on the same curve
const EASE = "cubic-bezier(.32,.72,0,1)"; // quick to start, long soft landing: nothing snaps
const TEXT_FROM = { opacity: 0.6, scale: 0.9 }; // the quote, words and date settle from here to 100%
const STAR_STEP = 90; // ms between stars as they pop in
const STAR_DELAY = 380; // ms after opening before the first star

const clampIndex = (n, len) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(len - 1, Math.max(0, Math.round(n))) : 0;

/** The built-in card colors: [color, ink]. They read well on a light page and on a dark one. */
const PALETTE = [
  ["oklch(0.47 0.2 282)", "light"], // violet
  ["oklch(0.93 0.025 85)", "dark"], // oat
  ["oklch(0.36 0.05 175)", "light"], // pine
  ["oklch(0.85 0.09 62)", "dark"], // apricot
  ["oklch(0.38 0.07 262)", "light"], // ink blue
  ["oklch(0.83 0.07 330)", "dark"], // orchid
];

const CSS = `
.ict {
  --ict-fg: var(--foreground, var(--fg, CanvasText));
  --ict-bg: var(--background, var(--bg, Canvas));
  --ict-muted: color-mix(in oklab, var(--ict-fg) 62%, var(--ict-bg));
  --ict-cap: ${CAP}px;
  --ict-gap: ${GAP}px;
  --ict-r: calc(var(--radius-lg, 8px) * 3.5); /* the open card: soft, calm corners (28px with an 8px theme radius) */
  --ict-ease: ${EASE};
  --ict-ms: ${OPEN_MS}ms;
  container-type: inline-size;
  position: relative; box-sizing: border-box; width: 100%;
  color: var(--ict-fg); font-family: inherit; -webkit-font-smoothing: antialiased;
}
.ict *, .ict *::before, .ict *::after { box-sizing: border-box; }
.ict-in { max-width: 56rem; margin: 0 auto; padding: 96px 24px; }
.ict-head { text-align: center; margin-bottom: 48px; }
.ict-title { margin: 0; font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.ict-desc { margin: 14px auto 0; max-width: 460px; font-size: 17px; line-height: 1.55; color: var(--ict-muted); text-wrap: pretty; overflow-wrap: anywhere; }

/* The row: every review is a flex item. Closed ones keep their capsule width;
   the open one takes all the room left (flex-grow 1). Both grow values ease on
   the same curve at the same time, so one opens exactly as fast as the other closes. */
.ict-row { display: flex; gap: var(--ict-gap); height: ${ROW_H}px; margin: 0; padding: 0; list-style: none; }
.ict-item {
  --c: ${PALETTE[0][0]};
  position: relative; min-width: 0; min-height: 0;
  flex: 0 0 var(--ict-cap);
  transition: flex-grow var(--ict-ms) var(--ict-ease), flex-basis 380ms var(--ict-ease);
}
.ict-item[data-open] { flex-grow: 1; }
.ict-item[data-ink="light"] { --ink: #fff; }
.ict-item[data-ink="dark"] { --ink: #1b1915; }

/* The colored shape. A capsule sits a little shorter than the open card; it reaches full height when open. */
.ict-shape {
  position: absolute; inset: 22px 0; overflow: hidden;
  border-radius: calc(var(--ict-cap) / 2);
  background: var(--c); color: var(--ink);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 10%, transparent);
  transition: inset var(--ict-ms) var(--ict-ease), border-radius var(--ict-ms) var(--ict-ease);
}
.ict-item[data-open] .ict-shape { inset: 0; border-radius: var(--ict-r); }

/* The capsule face: the name written upward, the photo at the bottom. */
.ict-cap {
  all: unset; position: absolute; inset: 0; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  gap: 10px; padding: 14px 6px 6px;
  border-radius: inherit;
  transition: opacity 260ms ease 220ms;
}
.ict-item[data-open] .ict-cap { opacity: 0; pointer-events: none; transition: opacity 160ms ease; }
.ict-cap:focus-visible { outline: 2px solid var(--ink); outline-offset: -4px; }
.ict-name {
  flex: 0 1 auto; min-height: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  writing-mode: vertical-rl; transform: rotate(180deg);
  font-size: 13px; font-weight: 500; line-height: 1; letter-spacing: -.005em;
}
/* The photo: a circle with a 6px ring of the capsule color around it (inner radius = outer radius - 6px). */
.ict-ph {
  flex: none; position: relative; overflow: hidden; display: grid; place-items: center;
  width: calc(var(--ict-cap) - 12px); height: calc(var(--ict-cap) - 12px);
  border-radius: calc((var(--ict-cap) - 12px) / 2);
  background: color-mix(in oklab, var(--ink) 14%, var(--c));
  font-size: 15px; font-weight: 600;
  transition: width 380ms var(--ict-ease), height 380ms var(--ict-ease), border-radius 380ms var(--ict-ease);
}
.ict-ph img, .ict-av img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%;
  user-select: none; -webkit-user-drag: none; pointer-events: none;
}
.ict-ph img { filter: saturate(.8); transform: scale(1.12); transition: filter 380ms ease, transform 380ms var(--ict-ease); }

/* Hover a capsule: it grows taller and wider, and the photo stretches into a tall portrait in full color. */
@media (hover: hover) {
  .ict-item:not([data-open]):has(.ict-cap:hover) { flex-basis: ${CAP_HOVER}px; --ict-cap: ${CAP_HOVER}px; }
  .ict-item:not([data-open]):has(.ict-cap:hover) .ict-shape { inset: 8px 0; }
  .ict-item:not([data-open]) .ict-cap:hover .ict-ph { height: calc((var(--ict-cap) - 12px) * 1.45); }
  .ict-item:not([data-open]) .ict-cap:hover .ict-ph img { filter: none; transform: scale(1); }
}

/* The open card. Its content is laid out at the full open width (set from the script),
   so the words never re-wrap while the card grows: the card simply uncovers them. */
.ict-card {
  position: absolute; top: 0; left: 0; bottom: 0; width: var(--ict-open-w, 100%);
  display: flex; flex-direction: column; margin: 0; padding: 28px 30px 24px;
  container: ict-card / inline-size;
  opacity: 0; transition: opacity 220ms ease;
}
.ict-item[data-open] .ict-card { opacity: 1; transition: opacity 320ms ease 80ms; }
.ict-card:focus { outline: none; }
.ict-card:focus-visible { outline: 2px solid var(--ink); outline-offset: -6px; border-radius: var(--ict-r); }
.ict-top {
  flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
  transform-origin: 0 0;
  opacity: ${TEXT_FROM.opacity}; transform: scale(${TEXT_FROM.scale});
  transition: opacity 240ms ease, transform 240ms ease;
}
.ict-item[data-open][data-seen] .ict-top {
  opacity: 1; transform: none;
  transition: opacity 640ms ease 120ms, transform 760ms var(--ict-ease) 120ms;
}
.ict-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ict-mark { width: 32px; height: 32px; flex: none; }
.ict-date { font-size: 13px; line-height: 1; opacity: .7; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ict-quote {
  margin: 20px 0 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; /* a very long quote scrolls inside the card */
  font-size: 24px; line-height: 1.32; font-weight: 500; letter-spacing: -.02em; text-wrap: pretty; overflow-wrap: anywhere;
}
.ict-foot {
  flex: none; display: flex; align-items: center; gap: 12px; margin-top: 20px; padding-top: 18px;
  border-top: 1px solid color-mix(in oklab, var(--ink) 16%, transparent);
  opacity: 0; transform: translateY(6px); transition: opacity 200ms ease, transform 200ms ease;
}
.ict-item[data-open][data-seen] .ict-foot { opacity: 1; transform: none; transition: opacity 420ms ease 220ms, transform 520ms var(--ict-ease) 220ms; }
.ict-av {
  flex: none; position: relative; overflow: hidden; display: grid; place-items: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: color-mix(in oklab, var(--ink) 14%, var(--c)); font-size: 14px; font-weight: 600;
}
.ict-who { min-width: 0; flex: 1 1 0; }
.ict-who b { display: block; font-size: 15px; line-height: 1.25; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ict-who span { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; margin-top: 2px; font-size: 13px; line-height: 1.3; opacity: .72; overflow: hidden; overflow-wrap: anywhere; }

/* The stars pop in one after another. Unearned stars stay faint. */
.ict-stars { flex: none; display: flex; gap: 3px; }
.ict-star {
  width: 16px; height: 16px; display: block;
  opacity: 0; transform: scale(.3) rotate(-40deg);
  transition: opacity 120ms ease, transform 120ms ease;
}
.ict-star[data-off] { --dim: .26; }
.ict-item[data-open][data-seen] .ict-star {
  opacity: var(--dim, 1); transform: none;
  transition: opacity 260ms ease, transform 520ms cubic-bezier(.34,1.56,.64,1);
  transition-delay: calc(${STAR_DELAY}ms + var(--i) * ${STAR_STEP}ms);
}
/* A narrow open card (a small preview, or many reviews in a short row): smaller words, stars on their own line. */
@container ict-card (max-width: 360px) {
  .ict-quote { font-size: 20px; }
  .ict-foot { flex-wrap: wrap; row-gap: 14px; }
  .ict-stars { order: -1; flex-basis: 100%; }
}
@container ict-card (max-width: 260px) {
  .ict-quote { font-size: 17px; margin-top: 14px; }
}
.ict-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Narrow sections: the capsules lie down and stack, photo on the left; the open card grows downward. */
@container (max-width: 559px) {
  .ict-in { padding: 64px 16px; }
  .ict-head { margin-bottom: 32px; }
  .ict-title { font-size: 30px; }
  .ict-desc { font-size: 16px; }
  .ict-row { flex-direction: column; height: calc(${OPEN_H}px + (var(--ict-n, 6) - 1) * (var(--ict-cap) + var(--ict-gap))); }
  .ict-shape { inset: 0 14px; }
  .ict-item[data-open] .ict-shape { inset: 0; }
  .ict-cap { flex-direction: row-reverse; justify-content: flex-end; padding: 6px 18px 6px 6px; }
  .ict-name { writing-mode: horizontal-tb; transform: none; font-size: 14px; }
  .ict-card { width: auto; right: 0; bottom: auto; height: var(--ict-open-h, ${OPEN_H}px); padding: 22px 20px 18px; }
  .ict-quote { font-size: 19px; margin-top: 14px; }
  .ict-mark { width: 26px; height: 26px; }
  @media (hover: hover) {
    .ict-item:not([data-open]):has(.ict-cap:hover) .ict-shape { inset: 0 6px; }
    .ict-item:not([data-open]) .ict-cap:hover .ict-ph { height: calc(var(--ict-cap) - 12px); width: calc((var(--ict-cap) - 12px) * 1.45); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .ict-item, .ict-shape, .ict-ph, .ict-ph img { transition-duration: 1ms !important; }
  .ict-item[data-open][data-seen] .ict-top { transition: opacity 200ms ease; transform: none; }
  .ict-top { transform: none; }
  .ict-item[data-open][data-seen] .ict-star { transition: opacity 200ms ease; transition-delay: 0ms; }
  .ict-star { transform: none; }
}
`;

/* Hugeicons quote, the two blocks filled. */
function QuoteMark() {
  return (
    <svg
      className="ict-mark"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path
        d="M14 16c0-1.886 0-2.828.586-3.414C15.172 12 16.114 12 18 12s2.828 0 3.414.586C22 13.172 22 14.114 22 16s0 2.828-.586 3.414C20.828 20 19.886 20 18 20s-2.828 0-3.414-.586C14 18.828 14 17.886 14 16Z"
        fill="currentColor"
      />
      <path d="M14 16v-4.137C14 8.196 16.516 5.086 20 4" />
      <path
        d="M2 16c0-1.886 0-2.828.586-3.414C3.172 12 4.114 12 6 12s2.828 0 3.414.586C10 13.172 10 14.114 10 16s0 2.828-.586 3.414C8.828 20 7.886 20 6 20s-2.828 0-3.414-.586C2 18.828 2 17.886 2 16Z"
        fill="currentColor"
      />
      <path d="M2 16v-4.137C2 8.196 4.516 5.086 8 4" />
    </svg>
  );
}

/* Hugeicons star, filled. */
const STAR =
  "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.2581 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z";

function Stars({ rating }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="ict-stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          className="ict-star"
          data-off={i >= r ? "" : undefined}
          style={{ "--i": i }}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={STAR} />
        </svg>
      ))}
      <span className="ict-sr">Rated {r} out of 5</span>
    </span>
  );
}

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? "") // whole letters, so an emoji is never cut in half
    .join("");

function Photo({ item, className }) {
  const [broken, setBroken] = useState(false);
  const img = useRef(null);
  // A new photo gets a fresh try. A photo can also fail before the page wakes up, when onError
  // is not listening yet, so check once after.
  useEffect(() => {
    const el = img.current;
    setBroken(Boolean(el && el.complete && el.naturalWidth === 0));
  }, [item.photo]);
  return (
    <span className={className}>
      {item.photo && !broken ? (
        <img
          ref={img}
          src={item.photo}
          alt={item.alt ?? item.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(item.name)}</span>
      )}
    </span>
  );
}

/** Six made-up reviews, so it looks right before you add your own. Replace them with real ones. */
export const CAPSULE_TESTIMONIALS = [
  {
    name: "Amara Okafor",
    role: "Product Designer, Lumen Health",
    quote:
      "I dropped in one section and the whole landing page finally felt finished. My developer asked which agency we hired.",
    date: "Oct 2026",
    rating: 5,
  },
  {
    name: "Theo Marchetti",
    role: "Founder, Pasta Labs",
    quote:
      "We shipped the new pricing page on a Friday and nothing broke. In our team, that counts as a small miracle.",
    date: "Sep 2026",
    rating: 5,
  },
  {
    name: "Hana Sato",
    role: "Front-end Lead, Kumo",
    quote:
      "The motion is calm the way good motion should be. I stopped tweaking easing curves at 2 a.m., and my sleep says thank you.",
    date: "Sep 2026",
    rating: 5,
  },
  {
    name: "Diego Alvarez",
    role: "Indie Maker",
    quote:
      "Blend asked me four short questions, then it looked like I had designed it myself. I had not. One star off for making me look too good.",
    date: "Aug 2026",
    rating: 4,
  },
  {
    name: "Priya Raman",
    role: "Head of Brand, Northbeam",
    quote:
      "Our brand team rejects most new components. This one passed review on the first try. I am still a little suspicious.",
    date: "Jul 2026",
    rating: 5,
  },
  {
    name: "Jonas Weber",
    role: "Developer, Fieldnote",
    quote:
      "One file, no extra packages, works in dark mode. I read the source twice looking for the catch. There isn't one.",
    date: "Jun 2026",
    rating: 5,
  },
];

export function CapsuleTestimonials({
  items = CAPSULE_TESTIMONIALS,
  title = "People said nice things. We kept them.",
  description = "Real words from people who shipped with us. Open a capsule to read one.",
  defaultOpen = 0,
  open: openProp,
  onOpenChange,
  className,
  style,
}) {
  const list = Array.isArray(items) ? items : CAPSULE_TESTIMONIALS;
  const n = Math.max(1, list.length);
  const [open, setOpen] = useState(() => clampIndex(defaultOpen, n));
  const [seen, setSeen] = useState(false);
  const [size, setSize] = useState(null);
  const row = useRef(null);
  const cards = useRef([]);
  const base = useId();

  // A controlled open index wins; either way it stays valid if the list gets shorter.
  const current = openProp === undefined ? Math.min(open, n - 1) : clampIndex(openProp, n);

  // The open card's content is laid out at the full open size, so its words never re-wrap mid-animation.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const stacked = cs.flexDirection === "column";
      const w = el.clientWidth;
      const h = el.clientHeight;
      const rest = (n - 1) * (CAP + GAP);
      setSize(stacked ? { w, h: Math.max(0, h - rest) } : { w: Math.max(0, w - rest), h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // The first card's words and stars play when the section first comes into view.
  useEffect(() => {
    const el = row.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const choose = useCallback(
    (i, focus) => {
      const next = ((i % n) + n) % n;
      setSeen(true);
      setOpen(next);
      if (next !== current) onOpenChange?.(next);
      // Keyboard and screen reader users land on the card they opened.
      if (focus) requestAnimationFrame(() => cards.current[next]?.focus({ preventScroll: true }));
    },
    [n, current, onOpenChange],
  );

  const onKey = (e) => {
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
    if (!back && !fwd && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    if (e.key === "Home") choose(0, true);
    else if (e.key === "End") choose(n - 1, true);
    else choose(current + (fwd ? 1 : -1), true);
  };

  const vars = {
    "--ict-n": n,
    ...(size ? { "--ict-open-w": `${size.w}px`, "--ict-open-h": `${size.h}px` } : null),
  };

  // No reviews yet (still loading, or none): show nothing rather than an empty row or made-up ones.
  if (!list.length) return null;

  return (
    <section
      className={className ? `ict ${className}` : "ict"}
      style={style}
      aria-label={typeof title === "string" ? title : "Testimonials"}
    >
      <style>{CSS}</style>
      <div className="ict-in">
        {(title != null || description != null) && (
          <div className="ict-head">
            {title != null && <h2 className="ict-title">{title}</h2>}
            {description != null && <p className="ict-desc">{description}</p>}
          </div>
        )}

        <ul ref={row} className="ict-row" style={vars} onKeyDown={onKey}>
          {list.map((item, i) => {
            const isOpen = i === current;
            const [palette, paletteInk] = PALETTE[i % PALETTE.length];
            const color = item.color ?? palette;
            const ink = item.ink ?? (item.color ? "dark" : paletteInk);
            const cardId = `${base}-card-${i}`;
            return (
              <li
                key={i}
                className="ict-item"
                data-open={isOpen ? "" : undefined}
                data-seen={seen ? "" : undefined}
                data-ink={ink}
                style={{ "--c": color }}
              >
                <div className="ict-shape">
                  <button
                    type="button"
                    className="ict-cap"
                    aria-expanded={isOpen}
                    aria-controls={cardId}
                    aria-label={`Read ${item.name}'s review`}
                    tabIndex={isOpen ? -1 : 0}
                    aria-hidden={isOpen || undefined}
                    onClick={(e) => choose(i, e.detail === 0)}
                  >
                    <span className="ict-name" aria-hidden="true">
                      {item.name}
                    </span>
                    <Photo item={{ ...item, alt: "" }} className="ict-ph" />
                  </button>

                  <figure
                    id={cardId}
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    className="ict-card"
                    tabIndex={isOpen ? -1 : undefined}
                    aria-hidden={!isOpen || undefined}
                    inert={!isOpen || undefined}
                  >
                    <div className="ict-top">
                      <div className="ict-meta">
                        <QuoteMark />
                        {item.date != null && <span className="ict-date">{item.date}</span>}
                      </div>
                      <blockquote className="ict-quote">{item.quote}</blockquote>
                    </div>
                    <figcaption className="ict-foot">
                      <Photo item={item} className="ict-av" />
                      <span className="ict-who">
                        <b>{item.name}</b>
                        {item.role != null && <span>{item.role}</span>}
                      </span>
                      {typeof item.rating === "number" && Number.isFinite(item.rating) && (
                        <Stars rating={item.rating} />
                      )}
                    </figcaption>
                  </figure>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default CapsuleTestimonials;
