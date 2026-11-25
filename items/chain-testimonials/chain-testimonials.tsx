"use client";

/**
 * Chain Testimonials, from Impeccable.
 *
 * A testimonial section where the reviews sit in one row of picture cards,
 * joined to each other by small curved links, like a chain. The card in the
 * middle is open: the result line, the quote and the person on the left, the
 * picture on the right. The cards beside it show only their picture, and get
 * smaller toward the edges.
 *
 *   - 5 cards on desktop (a row up to 1240px), 3 on tablets (up to 820px)
 *     and 1 on phones (up to 420px), where the next card slides in from the side.
 *   - Every few seconds (or on a click, a tap, a swipe or an arrow key) the
 *     whole chain shifts by one: the open card folds into a picture card while
 *     the next one opens, all on one curve, so the row never jumps.
 *   - The words leave quickly and the new ones come in line by line, after the
 *     card has mostly opened: result first, then the quote, then the person.
 *   - Under the row, a pill with a fill shows the time left on this review and
 *     slides to the next dot when it changes. It waits while you point at the
 *     row, while the keyboard is inside it and while it is off screen.
 *
 * No packages. Colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg): the cards are a faint
 * tint of the text color, so it reads on a light page and a dark one.
 */

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export type ChainTestimonial = {
  /** The result, short and concrete, like "Our launch page went live in 2 days". The biggest words on the card. */
  heading: ReactNode;
  /** What they said. One to three sentences reads best. */
  quote: ReactNode;
  /** Full name. */
  name: string;
  /** Their role or company, like "Head of Product, Lumen". */
  role?: ReactNode;
  /** The picture: a product shot, their work or a portrait. Square or portrait pictures crop best. */
  image?: string;
  /** Alt text for the picture. Defaults to the name. */
  alt?: string;
};

export type ChainTestimonialsProps = {
  /** The reviews, in order. 5 or more fills the desktop row (3 or more on tablets). */
  items?: ChainTestimonial[];
  /** The heading above the row. Pass null to hide it. */
  title?: ReactNode;
  /** The line under the heading. Pass null to hide it. */
  description?: ReactNode;
  /** Milliseconds each review stays open before the next one. 0 turns the timer off. */
  interval?: number;
  /** Which review starts open (0 is the first). */
  defaultIndex?: number;
  /** Control which review is open yourself. Pair it with onIndexChange. */
  index?: number;
  /** Called with the index of the review that opens. */
  onIndexChange?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const MOVE_MS = 640; // the chain shifts by one card: smooth, not slow
const EASE = "cubic-bezier(.45,0,.2,1)"; // a soft start and a long, calm landing
const TEXT_IN = { delay: 260, step: 70, ms: 460 }; // words come in after the card has mostly opened, line by line
const TEXT_OUT_MS = 160; // and leave quickly, before the card folds
const INTERVAL = 6000; // each review stays open 6s
const ROW = { desktop: 1240, tablet: 820, phone: 420 }; // the widest the row gets: 5 cards, 3 cards, 1 card
const TABLET_AT = 600; // the row's room from here up: 3 cards (under it, 1 card with the picture on top)
const DESKTOP_AT = 1000; // and from here up: 5 cards
const EDGE = 16; // phones: the soft edge where the next card's link peeks in
const PAD = 8; // the frame around each picture
const RADIUS = 24; // the open card's corners (the picture inside: 24 - 8 = 16)
const DOT = 6; // the dots under the row
const DOT_GAP = 8;
const PILL = 32; // the open review's pill

const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Sizes for a section this wide: the open card, the cards beside it, the links between them. */
function measure(width: number, count: number) {
  const room = Math.max(240, width);
  const mode: "desktop" | "tablet" | "phone" = room >= DESKTOP_AT ? "desktop" : room >= TABLET_AT ? "tablet" : "phone";
  const phone = mode === "phone";
  const W = Math.min(room, ROW[mode]);
  // How many cards on each side of the open one. Fewer reviews: fewer sides, so nobody shows twice.
  const reach = phone ? 0 : Math.max(0, Math.min(mode === "desktop" ? 2 : 1, Math.floor((count - 1) / 2)));
  const gap = phone ? 24 : Math.round(clamp(12, W * 0.018, 20)); // phones: wider than the soft edge, so only the link peeks in
  const near = Math.round(clamp(48, W * 0.075, 88)); // the cards right beside it
  const far = Math.round(clamp(34, W * 0.05, 60)); // the cards at the ends
  const open = Math.round(W - (reach >= 1 ? 2 * (near + gap) : 0) - (reach >= 2 ? 2 * (far + gap) : 0));
  const split = !phone && open >= 440; // words beside the picture; otherwise the picture sits on top
  const picH = split ? 0 : Math.round((open - 2 * PAD) * 0.56);
  const height = split ? Math.round(clamp(380, open * 0.56, 460)) : PAD + picH + 290;
  const textW = split ? Math.round(open * 0.5) : open;
  return {
    mode,
    phone,
    room,
    reach,
    gap,
    split,
    open,
    height,
    textW,
    picH: split ? height - 2 * PAD : picH,
    // On phones the cards beside the open one are full size, just out of view, so the next one slides in.
    near: phone ? { w: open, h: height } : { w: near, h: Math.round(height * 0.7) },
    far: { w: far, h: Math.round(height * 0.46) },
    link: { h: phone ? 44 : 56, neck: phone ? 12 : 16 },
  };
}
type Geo = ReturnType<typeof measure>;

const CSS = `
.ich {
  --ich-fg: var(--foreground, var(--fg, CanvasText));
  --ich-bg: var(--background, var(--bg, Canvas));
  --ich-card: color-mix(in oklab, var(--ich-fg) 6%, var(--ich-bg));
  --ich-muted: color-mix(in oklab, var(--ich-fg) 62%, var(--ich-bg));
  --ich-ease: ${EASE};
  --ich-ms: ${MOVE_MS}ms;
  container-type: inline-size;
  position: relative; box-sizing: border-box; width: 100%;
  color: var(--ich-fg); font-family: inherit; -webkit-font-smoothing: antialiased;
}
.ich *, .ich *::before, .ich *::after { box-sizing: border-box; }
.ich-in { max-width: ${ROW.desktop + 48}px; margin: 0 auto; padding: 96px 24px 72px; }
.ich-head { text-align: center; margin-bottom: 48px; }
.ich-title { margin: 0; font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.ich-desc { margin: 14px auto 0; max-width: 460px; font-size: 17px; line-height: 1.55; color: var(--ich-muted); text-wrap: pretty; overflow-wrap: anywhere; }

/* The row. Each card is a slot; its size comes from how far it is from the open one.
   Every size eases on the same curve at the same time, so the row's width never changes mid-move. */
.ich-stage { position: relative; display: flex; align-items: center; justify-content: center; height: 440px; touch-action: pan-y; } /* the script sets the real height */
/* Phones: one card in view. The row is clipped just past it, with a soft edge where the links peek in. */
.ich[data-mode="phone"] .ich-stage {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 ${EDGE}px, #000 calc(100% - ${EDGE}px), transparent);
  mask-image: linear-gradient(to right, transparent, #000 ${EDGE}px, #000 calc(100% - ${EDGE}px), transparent);
}
.ich[data-mode="phone"] .ich-text { padding: 18px 18px 16px; gap: 14px; }
.ich[data-mode="phone"] .ich-h { font-size: 22px; -webkit-line-clamp: 2; }
.ich-slot {
  position: relative; flex: none;
  transition: width var(--ich-ms) var(--ich-ease), height var(--ich-ms) var(--ich-ease), margin var(--ich-ms) var(--ich-ease), opacity 320ms ease;
}
.ich-slot[data-gone] { opacity: 0; pointer-events: none; }
.ich-frame {
  position: absolute; inset: 0; overflow: hidden;
  background: var(--ich-card);
  transition: border-radius var(--ich-ms) var(--ich-ease);
}

/* The link between two cards: a short bridge whose top and bottom curve in, like a neck. */
.ich-link {
  position: absolute; left: calc(100% - 1px); top: 50%; transform: translateY(-50%);
  display: block; overflow: visible; color: var(--ich-card);
  opacity: 0; transition: opacity 200ms ease;
}
.ich-link[data-on] { opacity: 1; transition: opacity 260ms ease calc(var(--ich-ms) * .45); }

/* The picture. In a side card it fills the frame; in the open card it moves to the right (or the top on phones). */
.ich-pic {
  position: absolute; overflow: hidden;
  background: color-mix(in oklab, var(--ich-fg) 10%, var(--ich-bg));
  display: grid; place-items: center; color: var(--ich-muted); font-size: 18px; font-weight: 600;
  transition: top var(--ich-ms) var(--ich-ease), left var(--ich-ms) var(--ich-ease), right var(--ich-ms) var(--ich-ease), bottom var(--ich-ms) var(--ich-ease), border-radius var(--ich-ms) var(--ich-ease);
}
.ich-pic > span { transition: opacity 200ms ease; }
.ich-slot:not([data-open]) .ich-pic > span { opacity: 0; } /* initials only on the open card; a side card is too slim */
.ich-pic img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  user-select: none; -webkit-user-drag: none; pointer-events: none;
}

/* The words. Laid out at the open card's full size, so they never re-wrap while the card opens. */
.ich-text {
  position: absolute; left: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
  padding: 28px 28px 24px 30px; pointer-events: none;
  container: ich-text / size; /* its size is set from the script, so the words can fit themselves to it */
}
.ich-slot[data-open] .ich-text { pointer-events: auto; }
.ich-line {
  opacity: 0; transform: translateY(8px); filter: blur(3px);
  transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease, filter ${TEXT_OUT_MS}ms ease;
}
.ich-slot[data-open][data-shown] .ich-line {
  opacity: 1; transform: none; filter: none;
  transition: opacity ${TEXT_IN.ms}ms ease, transform ${TEXT_IN.ms + 120}ms var(--ich-ease), filter ${TEXT_IN.ms}ms ease;
  transition-delay: calc(${TEXT_IN.delay}ms + var(--i) * ${TEXT_IN.step}ms);
}
.ich-h {
  margin: 0; font-size: 28px; line-height: 1.15; font-weight: 600; letter-spacing: -.025em;
  text-wrap: balance; overflow-wrap: anywhere; padding-bottom: .08em; /* room for the g and y under the line */
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
}
.ich-foot { display: flex; flex-direction: column; gap: 16px; min-height: 0; }
.ich-q {
  margin: 0; font-size: 17px; line-height: 1.55; color: color-mix(in oklab, var(--ich-fg) 82%, var(--ich-bg));
  text-wrap: pretty; overflow-wrap: anywhere;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden;
}
/* The words fit themselves to the open card: smaller on a narrow one, more quote lines on a tall one. */
@container ich-text (max-width: 340px) { .ich-h { font-size: 22px; } .ich-q { font-size: 15px; line-height: 1.5; } }
@container ich-text (min-height: 310px) { .ich-q { -webkit-line-clamp: 5; } }
@container ich-text (min-height: 400px) { .ich-q { -webkit-line-clamp: 6; } }
.ich-who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ich-who b { font-size: 14px; line-height: 1.3; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ich-who span { font-size: 13px; line-height: 1.35; color: var(--ich-muted); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

/* A side card is one big button: it opens that review. */
.ich-hit { all: unset; position: absolute; inset: 0; cursor: pointer; border-radius: inherit; }
.ich-hit:focus-visible { outline: 2px solid var(--ich-fg); outline-offset: 2px; }

/* The dots. The open review's dot is a pill whose fill shows the time left, and it slides to the next dot. */
.ich-dots { position: relative; display: flex; justify-content: center; margin-top: 28px; }
.ich-track { position: relative; display: flex; gap: ${DOT_GAP}px; height: 24px; align-items: center; }
.ich-dot {
  all: unset; position: relative; height: ${DOT}px; width: ${DOT}px; border-radius: ${DOT}px; cursor: pointer;
  transition: width var(--ich-ms) var(--ich-ease);
}
/* Each dot keeps its size; only the room around the open one grows, and the pill slides over it.
   The dot under the pill hides once the pill is on its way, and the one it left shows again as it moves off. */
.ich-dot::before {
  content: ""; position: absolute; left: 0; top: 0; width: ${DOT}px; height: ${DOT}px; border-radius: inherit;
  background: color-mix(in oklab, var(--ich-fg) 22%, transparent); transition: opacity 120ms ease;
}
.ich-dot[data-on]::before { opacity: 0; transition: opacity 160ms ease calc(var(--ich-ms) * .5); }
.ich-dot::after { content: ""; position: absolute; inset: -9px -4px; } /* a bigger target for a finger */
.ich-dot[data-on] { width: ${PILL}px; }
.ich-dot:focus-visible { outline: 2px solid var(--ich-fg); outline-offset: 3px; }
.ich-pill {
  position: absolute; top: 50%; left: 0; width: ${PILL}px; height: ${DOT}px; margin-top: -${DOT / 2}px; border-radius: ${DOT}px; overflow: hidden;
  background: color-mix(in oklab, var(--ich-fg) 16%, var(--ich-bg)); pointer-events: none;
  transition: transform var(--ich-ms) var(--ich-ease);
}
.ich-fill { position: absolute; inset: 0; border-radius: inherit; background: var(--ich-fg); transform-origin: 0 50%; transform: scaleX(0); }
.ich-fill[data-run] { animation: ich-fill var(--ich-wait) linear forwards; }
.ich[data-paused] .ich-fill { animation-play-state: paused; }
.ich-fill[data-full] { transform: none; }
@keyframes ich-fill { to { transform: none; } }
.ich-count { font-size: 13px; color: var(--ich-muted); font-variant-numeric: tabular-nums; }
.ich-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Phones: 3 cards, the picture above the words, smaller words. */
@container (max-width: ${TABLET_AT + 47}px) {
  .ich-in { padding: 64px 16px 48px; }
  .ich-head { margin-bottom: 32px; }
  .ich-title { font-size: 30px; }
  .ich-desc { font-size: 16px; }
  .ich-stage { height: 480px; }
  .ich-dots { margin-top: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .ich-slot, .ich-frame, .ich-pic, .ich-pill, .ich-dot { transition-duration: 1ms !important; }
  .ich-line, .ich-slot[data-open][data-shown] .ich-line { transform: none; filter: none; transition-delay: 0ms; transition-duration: 200ms; }
}
`;

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? "") // whole letters, so an emoji is never cut in half
    .join("");

function Picture({ item }: { item: ChainTestimonial }) {
  const [broken, setBroken] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // A new picture gets a fresh try. A picture can also fail before the page wakes up, when onError
  // is not listening yet, so check once after.
  useEffect(() => {
    const el = img.current;
    setBroken(Boolean(el && el.complete && el.naturalWidth === 0));
  }, [item.image]);
  return item.image && !broken ? (
    <img ref={img} src={item.image} alt={item.alt ?? item.name} loading="lazy" decoding="async" draggable={false} onError={() => setBroken(true)} />
  ) : (
    <span aria-hidden="true">{initials(item.name)}</span>
  );
}

/** The link between two cards, drawn to the gap: its top and bottom curve in from both cards. */
function Link({ geo, on }: { geo: Geo; on: boolean }) {
  const w = geo.gap + 2; // 1px into each card, so no hairline shows at the joins
  const { h, neck } = geo.link;
  const rx = w / 2;
  const ry = (h - neck) / 2;
  return (
    <svg className="ich-link" data-on={on ? "" : undefined} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={`M0 0A${rx} ${ry} 0 0 0 ${w} 0V${h}A${rx} ${ry} 0 0 0 0 ${h}Z`} fill="currentColor" />
    </svg>
  );
}

/** Six made-up reviews, so it looks right before you add your own. Replace them with real ones. */
export const CHAIN_TESTIMONIALS: ChainTestimonial[] = [
  {
    heading: "Our launch page went live in 2 days",
    quote: "One button on the sign up and the whole page felt alive. My developer asked which agency we hired.",
    name: "Amara Okafor",
    role: "Product Designer, Lumen Health",
  },
  {
    heading: "3 hours saved on every hero section",
    quote: "Blend asked me four short questions and the section looked like our brand.",
    name: "Hana Sato",
    role: "Front-end Lead, Kumo",
  },
  {
    heading: "Error messages people actually read",
    quote: "Our boring error messages became the part people screenshot. Support tickets went down.",
    name: "Theo Marchetti",
    role: "Founder, Pasta Labs",
  },
  {
    heading: "Passed brand review on the first try",
    quote: "Our brand team rejects most new components. This one passed on the first try.",
    name: "Priya Raman",
    role: "Head of Brand, Northbeam",
  },
  {
    heading: "Zero extra packages to install",
    quote: "One file, works in dark mode. I read the source twice looking for the catch.",
    name: "Jonas Weber",
    role: "Developer, Fieldnote",
  },
  {
    heading: "Our portfolio finally feels finished",
    quote: "Clients stop scrolling to point at the screen. Two asked for the same gallery.",
    name: "Diego Alvarez",
    role: "Indie Maker",
  },
];

export function ChainTestimonials({
  items = CHAIN_TESTIMONIALS,
  title = "Loved by 100k+ humans",
  description = "Real words from people who build with Impeccable UI.",
  interval = INTERVAL,
  defaultIndex = 0,
  index: indexProp,
  onIndexChange,
  className,
  style,
}: ChainTestimonialsProps) {
  const list = Array.isArray(items) ? items : CHAIN_TESTIMONIALS;
  const n = list.length;
  const start = indexProp ?? defaultIndex;
  const first = n ? mod(Math.round(Number.isFinite(start) ? start : 0), n) : 0;

  // `pos` counts every step and never wraps, so each card keeps its place in the chain as it moves.
  const [pos, setPos] = useState(first);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [span, setSpan] = useState({ lo: first - 3, hi: first + 3 }); // the cards on the page, kept a moment longer while they move
  const [shown, setShown] = useState(false); // the words of the open card come in one frame after it opens
  const [paused, setPaused] = useState({ hover: false, focus: false, away: true, hidden: false });
  const [still, setStill] = useState(false); // prefers-reduced-motion: no timer
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const base = useId();

  const current = n ? mod(pos, n) : 0;
  const reach = geo?.reach ?? 2;

  // Measure the room inside the section; the sizes follow its own width, not the screen's.
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const fit = () => {
      if (!el.clientWidth) return; // hidden or not laid out yet
      const cs = getComputedStyle(el);
      const room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setGeo((g) => {
        const next = measure(room, n);
        return g && JSON.stringify(g) === JSON.stringify(next) ? g : next;
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // Moving: keep the cards that are leaving on the page until they have folded away.
  useEffect(() => {
    setSpan((s) => ({ lo: Math.min(s.lo, pos - 3), hi: Math.max(s.hi, pos + 3) }));
    const t = window.setTimeout(() => setSpan({ lo: pos - 3, hi: pos + 3 }), MOVE_MS + 80);
    return () => window.clearTimeout(t);
  }, [pos]);

  // The words come in one frame after the card is marked open, so the browser sees the change and eases it.
  useEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [pos]);

  const go = useCallback(
    (to: number) => {
      if (n < 2) return;
      setPos((p) => {
        const from = mod(p, n);
        let d = mod(Math.round(to) - from, n);
        if (d > n / 2) d -= n; // the short way round
        return p + d;
      });
    },
    [n],
  );
  const step = useCallback((d: number) => n > 1 && setPos((p) => p + d), [n]);

  // Tell the page which review opened (not on the first paint).
  const told = useRef(current);
  useEffect(() => {
    if (told.current === current) return;
    told.current = current;
    onIndexChange?.(current);
  }, [current, onIndexChange]);

  // A controlled index wins.
  useEffect(() => {
    if (indexProp === undefined || !n || !Number.isFinite(indexProp)) return;
    const to = mod(Math.round(indexProp), n);
    told.current = to; // the page set it, so it already knows
    go(to);
  }, [indexProp, n, go]);

  // The timer waits while it is off screen, while the tab is hidden, and for people who asked for less motion.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setStill(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const io = new IntersectionObserver(([e]) => setPaused((p) => ({ ...p, away: !e.isIntersecting })), { threshold: 0.25 });
    io.observe(el);
    const onVis = () => setPaused((p) => ({ ...p, hidden: document.hidden }));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", onMq);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const wait = Number.isFinite(interval) && interval > 0 ? Math.max(1500, interval) : 0;
  const timed = wait > 0 && !still && n > 1;
  const isPaused = paused.hover || paused.focus || paused.away || paused.hidden;

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  // A finger swipe moves the chain; a page scroll (mostly up and down) is left alone.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    if (e.pointerType === "mouse") return;
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped.current = true;
      step(dx < 0 ? 1 : -1);
    }
  };

  if (!n) return null;

  const slots: number[] = [];
  for (let p = span.lo; p <= span.hi; p++) slots.push(p);

  const sizeOf = (d: number) => {
    if (!geo) return null;
    const a = Math.abs(d);
    if (a === 0) return { w: geo.open, h: geo.height };
    if (a === 1 && (reach >= 1 || (geo.phone && n > 1))) return geo.near;
    if (a === 2 && reach >= 2) return geo.far;
    return null;
  };

  const dots = n > 1 && n <= 12;

  return (
    <section
      ref={root}
      className={["ich", className].filter(Boolean).join(" ")}
      style={{ ...style, "--ich-wait": `${wait}ms` } as CSSProperties}
      data-paused={isPaused ? "" : undefined}
      data-mode={geo?.mode}
      aria-roledescription="carousel"
      aria-labelledby={title != null ? `${base}-t` : undefined}
      aria-label={title == null ? "Testimonials" : undefined}
      onKeyDown={onKey}
      onFocus={() => setPaused((p) => ({ ...p, focus: true }))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused((p) => ({ ...p, focus: false }));
      }}
    >
      <style href="impeccable-chain-testimonials" precedence="medium">
        {CSS}
      </style>
      <div ref={inner} className="ich-in">
        {(title != null || description != null) && (
          <header className="ich-head">
            {title != null && (
              <h2 id={`${base}-t`} className="ich-title">
                {title}
              </h2>
            )}
            {description != null && <p className="ich-desc">{description}</p>}
          </header>
        )}

        <div
          ref={stage}
          className="ich-stage"
          style={
            !geo
              ? { visibility: "hidden" }
              : geo.phone
                ? { height: geo.height, width: geo.open + 2 * EDGE, marginInline: (geo.room - geo.open - 2 * EDGE) / 2 }
                : { height: geo.height }
          }
          onPointerEnter={(e) => e.pointerType === "mouse" && setPaused((p) => ({ ...p, hover: true }))}
          onPointerLeave={() => setPaused((p) => ({ ...p, hover: false }))}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => (swipe.current = null)}
        >
          {geo &&
            slots.map((p) => {
              const d = p - pos;
              const item = list[mod(p, n)];
              const size = sizeOf(d);
              const open = d === 0;
              const gone = !size;
              const w = size?.w ?? 0;
              const h = size?.h ?? geo.far.h * 0.8;
              const radius = open ? RADIUS : Math.min(RADIUS, w / 2);
              const inner = Math.max(0, radius - PAD);
              // Where the picture sits inside the frame: all of it on a side card, the right part (or the top) when open.
              // On phones every card keeps the open layout, so the next one simply slides in.
              const pic = open || geo.phone
                ? geo.split
                  ? { top: PAD, right: PAD, bottom: PAD, left: geo.textW }
                  : { top: PAD, right: PAD, bottom: geo.height - PAD - geo.picH, left: PAD }
                : { top: PAD, right: PAD, bottom: PAD, left: PAD };
              const text: CSSProperties = geo.split
                ? { top: 0, width: geo.textW, height: geo.height }
                : { top: PAD + geo.picH, width: geo.open, height: geo.height - PAD - geo.picH };
              // A link to the next card while both are on show (on phones, the links either side of the open card peek in).
              const linked = geo.phone ? n > 1 && d >= -1 && d < 1 : d >= -reach && d < reach;
              return (
                <div
                  key={p}
                  className="ich-slot"
                  data-open={open ? "" : undefined}
                  data-shown={open && shown ? "" : undefined}
                  data-gone={gone ? "" : undefined}
                  aria-hidden={open ? undefined : true}
                  inert={!open && gone ? true : undefined}
                  style={{ width: w, height: h, marginInline: gone ? 0 : geo.gap / 2 }}
                >
                  <div className="ich-frame" style={{ borderRadius: radius }}>
                    <div className="ich-pic" style={{ ...pic, borderRadius: inner }}>
                      <Picture item={item} />
                    </div>
                    <figure
                      className="ich-text"
                      style={{ ...text, margin: 0 }}
                      aria-hidden={open ? undefined : true}
                      aria-roledescription={open ? "slide" : undefined}
                      aria-label={open ? `${current + 1} of ${n}` : undefined}
                    >
                      <h3 className="ich-h ich-line" style={{ "--i": 0 } as CSSProperties}>
                        {item.heading}
                      </h3>
                      <div className="ich-foot">
                        <blockquote className="ich-q ich-line" style={{ "--i": 1, margin: 0 } as CSSProperties}>
                          “{item.quote}”
                        </blockquote>
                        <figcaption className="ich-who ich-line" style={{ "--i": 2 } as CSSProperties}>
                          <b>{item.name}</b>
                          {item.role != null && <span>{item.role}</span>}
                        </figcaption>
                      </div>
                    </figure>
                    {!open && !gone && (
                      <button
                        type="button"
                        className="ich-hit"
                        tabIndex={-1}
                        aria-label={`Show the review from ${item.name}`}
                        onClick={() => {
                          if (swiped.current) return; // that touch was a swipe, not a tap
                          step(d);
                        }}
                      />
                    )}
                  </div>
                  {p < span.hi && <Link geo={geo} on={linked} />}
                </div>
              );
            })}
        </div>

        {dots ? (
          <div className="ich-dots">
            <div className="ich-track" role="group" aria-label="Choose a review">
              {list.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  className="ich-dot"
                  data-on={i === current ? "" : undefined}
                  aria-label={`Review ${i + 1} of ${n}, ${it.name}`}
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => go(i)}
                />
              ))}
              <span className="ich-pill" style={{ transform: `translateX(${current * (DOT + DOT_GAP)}px)` }} aria-hidden="true">
                {timed ? (
                  <span key={pos} className="ich-fill" data-run="" onAnimationEnd={() => step(1)} />
                ) : (
                  <span className="ich-fill" data-full="" />
                )}
              </span>
            </div>
          </div>
        ) : n > 12 ? (
          <div className="ich-dots">
            <span className="ich-count">
              {current + 1} / {n}
            </span>
            {/* Too many reviews for dots: a count instead, and the same timer, out of sight. */}
            {timed && <span key={pos} className="ich-fill ich-sr" data-run="" onAnimationEnd={() => step(1)} aria-hidden="true" />}
          </div>
        ) : null}
      </div>
    </section>
  );
}
