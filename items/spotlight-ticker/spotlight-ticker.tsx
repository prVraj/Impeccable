"use client";

/**
 * Spotlight Ticker, from Impeccable.
 *
 * A row of pictures that glides sideways forever, like a ticker. Point at a
 * picture and the row stops, that picture grows and the others dim, so it is
 * the one in focus. Click it and the others fade away while the picture glides
 * to the left and its story comes in beside it: a heading, a few short bullet
 * points and one button. It works like a pop up: close it with the X, Esc, a
 * click on the picture or a click anywhere outside the story, and the picture glides back, the row returns and carries on from where it stopped.
 *
 * Touch screens have no hover, so one tap opens the story straight away.
 * Reduced motion: the row stands still and scrolls by hand, nothing glides.
 *
 * Colors come from your theme: the text from --foreground (else --fg), the page
 * from --background (else --bg), so it follows light and dark mode.
 * One file, React only, no packages.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

export type SpotlightTickerItem = {
  /** The picture. Shown square. alt is read by screen readers. */
  image: { src: string; alt: string };
  /** The heading in the story. */
  title: string;
  /** The story, as short bullet points. Two to four reads best. */
  points: string[];
  /** The one button under the points. With href it is a link, with only onClick a button. */
  cta?: {
    label: string;
    href?: string;
    /** Link target, like "_blank" (then rel="noopener noreferrer" is added). */
    target?: string;
    onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  };
};

export type SpotlightTickerProps = {
  /** The pictures and their stories, in order. */
  items: SpotlightTickerItem[];
  /** Which way the row moves. */
  direction?: "left" | "right";
  /** How fast the row moves, in pixels per second (like most marquees). 32 lets people read each picture; 50 is brisk, 80 is fast. */
  speed?: number;
  /** Side of each picture at rest, in px. Smaller screens shrink it. */
  size?: number;
  /** Corner radius of the pictures, in px. */
  radius?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

/* ---------- the design: keep as written ---------- */

const ZOOM = 1.8; // the picture in focus grows to 1.8 times its size
const DIM = 0.4; // the others drop to 40% opacity
const GAP = 0.15; // space between pictures, as a share of their size
const FOCUS_MS = 450; // grow and dim: slow enough to feel calm, never snappy
const FOCUS_EASE = "cubic-bezier(.22,1,.36,1)"; // gentle start, long soft landing
const STOP_MS = 450; // the row glides to a stop in about this time
const START_MS = 1000; // and takes its time to get going again
const FADE_MS = 420; // the other pictures fade out (and back in)
const GLIDE_MS = 720; // the picture glides to the story
const CLOSE_MS = 620; // and back home on close
const GLIDE_EASE = "cubic-bezier(.4,0,.2,1)"; // eases in, travels, settles softly
const TEXT_DELAY = 520; // the story starts to drop in as the picture settles
const TEXT_MS = 650; // each line drops from above and comes into focus
const TEXT_DROP = 16; // px each line falls
const TEXT_BLUR = 4; // px of soft blur it loses as it lands
const TEXT_STAGGER = 110; // line by line, top to bottom
const TEXT_OUT_MS = 240; // on close the story lifts away first
const EDGE = 0.4; // the row fades out at both sides over 40% of a picture (at most 8% of the row), never a hard cut
const SHADOW_ROOM = 48; // px above and below the grown picture, so its shadow is never clipped
const STACK_AT = 560; // px: narrower than this, the story sits under the picture
const SMALL_AT = 640; // px: on screens narrower than this (phones), pictures are 70% of size
const SMALL = 0.7;

const CSS = `
.spt { --spt-fg: var(--foreground, var(--fg, CanvasText)); --spt-bg: var(--background, var(--bg, Canvas));
  position: relative; width: 100%; box-sizing: border-box; color: var(--spt-fg); transition: height 600ms ${GLIDE_EASE}; }
.spt *, .spt *::before { box-sizing: border-box; }
.spt-view { position: relative; overflow: hidden; height: var(--spt-h); touch-action: pan-y pinch-zoom;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--spt-fade), #000 calc(100% - var(--spt-fade)), transparent);
  mask-image: linear-gradient(to right, transparent, #000 var(--spt-fade), #000 calc(100% - var(--spt-fade)), transparent); }
.spt[data-still="true"] .spt-view { overflow-x: auto; scrollbar-width: none; touch-action: auto; }
.spt[data-still="true"] .spt-view::-webkit-scrollbar { display: none; }
.spt-track { position: absolute; left: 0; top: 0; bottom: 0; display: flex; align-items: center; will-change: transform; }
.spt[data-still="true"] .spt-track { position: relative; height: 100%; will-change: auto; }
.spt-slot { position: relative; flex: none; height: 100%; }
.spt-card { position: absolute; left: 50%; top: 50%; width: var(--spt-s); height: var(--spt-s); transform: translate(-50%, -50%);
  margin: 0; padding: 0; border: 0; background: color-mix(in oklab, var(--spt-fg) 8%, var(--spt-bg)); border-radius: var(--spt-r);
  overflow: hidden; cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; z-index: 1;
  transition: width ${FOCUS_MS}ms ${FOCUS_EASE}, height ${FOCUS_MS}ms ${FOCUS_EASE}, transform ${FOCUS_MS}ms ${FOCUS_EASE},
    opacity ${FOCUS_MS}ms ${FOCUS_EASE}, box-shadow ${FOCUS_MS}ms ${FOCUS_EASE}; }
.spt-card::after, .spt-pic::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--spt-fg) 9%, transparent); z-index: 1; }
.spt-card img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; display: block;
  pointer-events: none; -webkit-user-drag: none; user-select: none; }
.spt-card:focus-visible, .spt-card[data-hot="true"]:focus-visible { box-shadow: 0 0 0 2px var(--spt-bg), 0 0 0 4px color-mix(in oklab, var(--spt-fg) 55%, transparent); }
/* One picture in focus: it grows (and steps inward at the edges), the others dim. */
.spt[data-hot="true"] .spt-card { opacity: ${DIM}; }
.spt-card[data-hot="true"] { opacity: 1 !important; z-index: 2; width: calc(var(--spt-s) * ${ZOOM}); height: calc(var(--spt-s) * ${ZOOM});
  transform: translate(calc(-50% + var(--spt-dx, 0px)), -50%); box-shadow: 0 18px 40px -22px rgba(0,0,0,.45); }
/* Closing: the others come back to full strength while the picture glides home. */
.spt[data-closing="true"] .spt-card { opacity: 1; transition: opacity ${FADE_MS}ms ${FOCUS_EASE} ${TEXT_OUT_MS}ms; }
.spt[data-closing="true"] .spt-card[data-hot="true"] { visibility: hidden; transition: none; width: var(--spt-s); height: var(--spt-s); transform: translate(-50%, -50%); }
/* Story open: every picture fades away; the one that opened hides at once, its copy glides. */
.spt[data-open="true"] .spt-card { opacity: 0 !important; pointer-events: none; transition-duration: ${FADE_MS}ms; }
.spt[data-open="true"] .spt-card[data-hot="true"] { transition: none; visibility: hidden; }
.spt-story { position: absolute; left: 0; right: 0; top: 0; display: grid; grid-template-columns: auto minmax(0, 27rem);
  align-items: center; justify-content: center; gap: clamp(20px, 4vw, 36px); visibility: hidden; pointer-events: none; }
.spt[data-stack="true"] .spt-story { grid-template-columns: minmax(0, 1fr); justify-items: start; gap: 18px; }
.spt[data-open="true"] .spt-story, .spt[data-closing="true"] .spt-story { visibility: visible; pointer-events: auto; }
.spt-pic { position: relative; display: block; width: var(--spt-big); height: var(--spt-big); margin: 0; padding: 0; border: 0; overflow: hidden;
  border-radius: var(--spt-r); background: color-mix(in oklab, var(--spt-fg) 8%, var(--spt-bg)); cursor: pointer; outline: none; transform-origin: 0 0; }
.spt-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; -webkit-user-drag: none; user-select: none; }
.spt-pic:focus-visible { box-shadow: 0 0 0 2px var(--spt-bg), 0 0 0 4px color-mix(in oklab, var(--spt-fg) 55%, transparent); }
.spt-text { min-width: 0; padding-right: 28px; }
.spt[data-stack="true"] .spt-text { padding-right: 0; }
.spt[data-stack="true"] .spt-title { font-size: 22px; }
/* The story drops in from above, line by line, coming into focus as it lands. */
.spt-line { opacity: 0; transform: translateY(-${TEXT_DROP}px); filter: blur(${TEXT_BLUR}px); }
.spt[data-shown="true"] .spt-line { opacity: 1; transform: none; filter: none;
  transition: opacity ${TEXT_MS}ms ${FOCUS_EASE}, transform ${TEXT_MS}ms ${FOCUS_EASE}, filter ${TEXT_MS}ms ${FOCUS_EASE};
  transition-delay: calc(${TEXT_DELAY}ms + var(--i) * ${TEXT_STAGGER}ms); }
.spt[data-closing="true"] .spt-line { opacity: 0; transform: translateY(-${TEXT_DROP / 2}px); filter: none;
  transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease; }
.spt-title { margin: 0 0 12px; font-size: 26px; font-weight: 500; line-height: 1.2; letter-spacing: -0.015em; overflow-wrap: anywhere; }
.spt-points { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.spt-points li { position: relative; padding-left: 18px; font-size: 15px; line-height: 1.5; color: color-mix(in oklab, var(--spt-fg) 72%, transparent); overflow-wrap: anywhere; }
.spt-points li::before { content: ""; position: absolute; left: 3px; top: .62em; width: 5px; height: 5px; border-radius: 50%; background: color-mix(in oklab, var(--spt-fg) 45%, transparent); }
.spt-cta { display: inline-flex; align-items: center; height: 36px; margin-top: 18px; padding: 0 16px; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 500;
  color: var(--spt-fg); text-decoration: none; cursor: pointer; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  background: color-mix(in oklab, var(--spt-fg) 6%, var(--spt-bg)); border: 1px solid color-mix(in oklab, var(--spt-fg) 14%, transparent);
  transition: background-color 150ms ease, transform 150ms ease; outline: none; -webkit-tap-highlight-color: transparent; }
.spt-cta:active { transform: scale(.97); }
.spt-cta:focus-visible, .spt-close:focus-visible { box-shadow: 0 0 0 2px var(--spt-bg), 0 0 0 4px color-mix(in oklab, var(--spt-fg) 55%, transparent); }
.spt-close { position: absolute; top: 0; right: 0; z-index: 3; display: grid; place-items: center; width: 32px; height: 32px; margin: 0; padding: 0; border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--spt-fg) 12%, transparent); background: color-mix(in oklab, var(--spt-fg) 4%, var(--spt-bg)); color: var(--spt-fg);
  cursor: pointer; outline: none; transition: background-color 150ms ease; -webkit-tap-highlight-color: transparent; }
.spt[data-stack="true"] .spt-close { top: 8px; right: 8px; }
@media (hover: hover) {
  .spt-cta:hover { background: color-mix(in oklab, var(--spt-fg) 11%, var(--spt-bg)); }
  .spt-close:hover { background: color-mix(in oklab, var(--spt-fg) 10%, var(--spt-bg)); }
}
@media (prefers-reduced-motion: reduce) {
  .spt, .spt-card, .spt-line { transition-property: opacity !important; }
  .spt-line { transform: none !important; filter: none !important; }
}`;

type Hot = { key: string; index: number; el: HTMLElement };

/** A picture that fails to load hides, so the soft square behind it shows instead of a broken icon. */
const hideBroken = (e: { currentTarget: HTMLImageElement }) => {
  e.currentTarget.style.visibility = "hidden";
};
/** The same check for a picture that failed before the page came alive (its error event is already gone). */
const checkBroken = (img: HTMLImageElement | null) => {
  if (img?.complete && !img.naturalWidth) img.style.visibility = "hidden";
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function SpotlightTicker({
  items,
  direction = "left",
  speed = 32,
  size = 160,
  radius = 16,
  className,
  style,
  "aria-label": ariaLabel = "Pictures",
}: SpotlightTickerProps) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const [width, setWidth] = useState(0);
  const [canHover, setCanHover] = useState(false);
  const [still, setStill] = useState(false); // reduced motion: no auto scroll
  const [phone, setPhone] = useState(false); // a small screen: smaller pictures
  const [hot, setHot] = useState<Hot | null>(null);
  const [open, setOpen] = useState<number | null>(null); // index of the open story
  const [closing, setClosing] = useState(false);
  const [linesIn, setLinesIn] = useState(false); // the story's lines, a frame after it mounts, so they can drop in
  const [height, setHeight] = useState<number | null>(null);

  const n = items.length;
  // Smaller screens shrink the pictures, so a few always show.
  const s = width ? Math.round(clamp(Math.min(phone ? size * SMALL : size, width * 0.36), 56, size)) : size;
  const gap = Math.round(s * GAP);
  const step = s + gap;
  const setW = n * step;
  const restH = Math.ceil(canHover ? s * ZOOM + SHADOW_ROOM * 2 : s + 24); // room for the grown picture and its shadow
  const fade = Math.round(Math.min(s * EDGE, width * 0.08));
  const stack = width > 0 && width < STACK_AT;
  const big = Math.round(stack ? Math.min(width, s * ZOOM) : s * ZOOM);
  const copies = still || !setW ? 1 : Math.max(2, Math.ceil(width / setW) + 1);

  // Motion state lives in refs so the row moves without re-rendering.
  const offset = useRef(0);
  const velocity = useRef(0);
  const paused = useRef(false);
  const visible = useRef(true);
  const openedAt = useRef(0); // when the story opened, so the click that opened it doesn't close it

  /* Watch the width, hover support and reduced motion. */
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    const hoverQ = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phoneQ = window.matchMedia(`(max-width: ${SMALL_AT - 0.02}px)`);
    const qs = [hoverQ, motionQ, phoneQ];
    const sync = () => {
      setCanHover(hoverQ.matches);
      setStill(motionQ.matches);
      setPhone(phoneQ.matches);
    };
    sync();
    qs.forEach((q) => q.addEventListener("change", sync));
    return () => {
      ro.disconnect();
      qs.forEach((q) => q.removeEventListener("change", sync));
    };
  }, []);

  /* The ticker: eases toward full speed, or toward a stop while something is in focus. */
  useEffect(() => {
    if (still || !setW) return;
    const dir = direction === "right" ? -1 : 1;
    let raf = 0;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = paused.current ? 0 : Math.max(0, speed || 0);
      const ease = target < velocity.current ? STOP_MS : START_MS;
      velocity.current += (target - velocity.current) * Math.min(1, (dt * 1000 * 3) / ease);
      if (Math.abs(target - velocity.current) < 0.6) velocity.current = target; // a clean stop, no endless creep
      if (visible.current && !document.hidden) {
        offset.current = (((offset.current + velocity.current * dt * dir) % setW) + setW) % setW;
        if (track.current) track.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [still, setW, speed, direction]);

  paused.current = hot !== null || open !== null || closing;

  /* Where a picture sits in the view right now, in px from the view's left edge. */
  const leftInView = useCallback(
    (el: HTMLElement) => {
      const v = view.current!.getBoundingClientRect();
      const slot = (el.parentElement as HTMLElement).getBoundingClientRect();
      return slot.left - v.left + (slot.width - s) / 2;
    },
    [s],
  );

  /* Bring a picture into focus: it grows, steps inward if it would spill off an edge. */
  const placeGrown = useCallback(
    (el: HTMLElement) => {
      const vw = view.current?.clientWidth ?? 0;
      const zw = s * ZOOM;
      const want = leftInView(el) + s / 2 - zw / 2;
      // Keep it clear of the faded edges too.
      const f = Math.round(Math.min(s * EDGE, vw * 0.08));
      el.style.setProperty("--spt-dx", `${Math.round(clamp(want, f, Math.max(f, vw - zw - f)) - want)}px`);
    },
    [s, leftInView],
  );

  const focusOn = useCallback(
    (el: HTMLElement, key: string, index: number) => {
      if (open !== null || closing) return;
      placeGrown(el);
      setHot({ key, index, el });
    },
    [open, closing, placeGrown],
  );

  /* The row drifts a few px while it slows down: place the grown picture again once it has stopped. */
  useEffect(() => {
    if (!hot || open !== null || closing) return;
    const t = setTimeout(() => placeGrown(hot.el), STOP_MS * 2);
    return () => clearTimeout(t);
  }, [hot, open, closing, placeGrown]);

  const blur = useCallback(() => {
    if (open === null && !closing) setHot(null);
  }, [open, closing]);

  /* Open a story: the others fade, the picture glides from where it is to its place beside the story. */
  const openStory = useCallback(
    (el: HTMLElement, key: string, index: number) => {
      if (open !== null || closing) return;
      const from = el.getBoundingClientRect();
      openedAt.current = performance.now();
      setHot({ key, index, el });
      setOpen(index);
      requestAnimationFrame(() => {
        const p = pic.current;
        if (!p) return;
        const to = p.getBoundingClientRect();
        const k = from.width / to.width;
        p.animate(
          [
            { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})`, borderRadius: `${radius / k}px` },
            { transform: "none", borderRadius: `${radius}px` },
          ],
          { duration: still ? 0 : GLIDE_MS, easing: GLIDE_EASE },
        );
        closeBtn.current?.focus({ preventScroll: true });
        // Wait one more frame so the lines are drawn hidden first; then they drop in.
        requestAnimationFrame(() => setLinesIn(true));
      });
    },
    [open, closing, radius, still],
  );

  /* Close it: the story leaves, the picture glides back to its place in the row, the others return. */
  const closeStory = useCallback(() => {
    if (open === null || closing || !hot) return;
    const p = pic.current;
    const el = hot.el;
    setClosing(true);
    setOpen(null);
    setLinesIn(false);
    const done = () => {
      returnTo.current = hot;
      setClosing(false);
      setHot(null);
    };
    if (!p || still) return done();
    // Closed mid-glide: start from where the picture is right now.
    const now = p.getBoundingClientRect();
    p.getAnimations().forEach((a) => a.cancel());
    const to = p.getBoundingClientRect();
    const k0 = now.width / to.width;
    const slot = (el.parentElement as HTMLElement).getBoundingClientRect();
    const fx = slot.left + (slot.width - s) / 2;
    const fy = slot.top + (slot.height - s) / 2;
    const k = s / to.width;
    const anim = p.animate(
      [
        { transform: `translate(${now.left - to.left}px, ${now.top - to.top}px) scale(${k0})`, borderRadius: `${radius / k0}px` },
        { transform: `translate(${fx - to.left}px, ${fy - to.top}px) scale(${k})`, borderRadius: `${radius / k}px` },
      ],
      { duration: CLOSE_MS, delay: TEXT_OUT_MS / 2, easing: GLIDE_EASE, fill: "forwards" },
    );
    anim.onfinish = () => {
      done();
      // Let the row paint first, then drop the held frame.
      requestAnimationFrame(() => anim.cancel());
    };
  }, [open, closing, hot, still, s, radius]);

  /* Once the picture shows in the row again: focus goes back to it, and if the mouse is still on it, it grows again. */
  const returnTo = useRef<Hot | null>(null);
  useEffect(() => {
    const back = returnTo.current;
    if (closing || open !== null || !back) return;
    returnTo.current = null;
    back.el.focus({ preventScroll: true });
    if (canHover && back.el.matches(":hover")) focusOn(back.el, back.key, back.index);
  }, [closing, open, canHover, focusOn]);

  /* Like a pop up: Esc or a click anywhere outside the story closes it. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeStory();
    // A click, not a touch: a finger scrolling the page past it leaves it open.
    const onClick = (e: MouseEvent) => {
      if (e.timeStamp <= openedAt.current) return;
      const t = e.target as Element | null;
      if (!t?.closest?.(".spt-pic, .spt-text, .spt-close") || !root.current?.contains(t)) closeStory();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [open, closeStory]);

  /* The block grows to fit a tall story, then shrinks back. */
  useLayoutEffect(() => {
    if (open === null) return setHeight(null);
    const el = story.current;
    if (!el) return;
    const fit = () => setHeight(Math.max(restH, el.offsetHeight));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, restH]);

  /* Keyboard: a focused picture comes into view (the view never scrolls on its own). */
  const onCardFocus = (el: HTMLElement, key: string, index: number) => {
    const v = view.current;
    if (!v) return;
    if (!still) {
      v.scrollLeft = 0;
      const vw = v.clientWidth;
      const x = leftInView(el);
      if (x < 0 || x + s > vw) {
        offset.current = (((offset.current + x - (vw - s) / 2) % setW) + setW) % setW;
        if (track.current) track.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }
    }
    if (el.matches(":focus-visible")) focusOn(el, key, index);
  };

  const shown = open ?? (closing ? hot?.index ?? null : null);
  const item = shown !== null ? items[shown] : null;

  if (!n) return null;

  return (
    <div
      ref={root}
      className={["spt", className].filter(Boolean).join(" ")}
      role="region"
      aria-roledescription="ticker"
      aria-label={ariaLabel}
      data-hot={hot !== null || undefined}
      data-open={open !== null || undefined}
      data-shown={linesIn || undefined}
      data-closing={closing || undefined}
      data-stack={stack || undefined}
      data-still={still || undefined}
      style={
        {
          "--spt-s": `${s}px`,
          "--spt-r": `${radius}px`,
          "--spt-big": `${big}px`,
          "--spt-h": `${restH}px`,
          "--spt-fade": `${fade}px`,
          height: height ?? restH,
          ...style,
        } as CSSProperties
      }
      onPointerLeave={blur}
    >
      <style>{CSS}</style>
      <div ref={view} className="spt-view" onScroll={(e) => !still && (e.currentTarget.scrollLeft = 0)}>
        <div ref={track} className="spt-track" style={{ width: setW * copies }}>
          {Array.from({ length: copies }, (_, c) =>
            items.map((it, i) => {
              const key = `${c}-${i}`;
              const copy = c > 0;
              return (
                <div key={key} className="spt-slot" style={{ width: step }}>
                  <button
                    type="button"
                    className="spt-card"
                    data-hot={hot?.key === key || undefined}
                    aria-hidden={copy || undefined}
                    tabIndex={copy || open !== null ? -1 : 0}
                    aria-label={`${it.title}: open`}
                    onPointerEnter={(e) => e.pointerType === "mouse" && focusOn(e.currentTarget, key, i)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && hot?.key === key && blur()}
                    onFocus={(e) => onCardFocus(e.currentTarget, key, i)}
                    onBlur={() => hot?.key === key && open === null && blur()}
                    onClick={(e) => openStory(e.currentTarget, key, i)}
                  >
                    <img src={it.image.src} alt={copy ? "" : it.image.alt} loading="lazy" decoding="async" draggable={false} onError={hideBroken} ref={checkBroken} />
                  </button>
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div ref={story} className="spt-story" aria-hidden={open === null} style={{ minHeight: restH }}>
        {item && (
          <>
            <button ref={closeBtn} type="button" className="spt-close spt-line" style={{ "--i": 0 } as CSSProperties} aria-label="Close" onClick={closeStory}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18.9991 19L5 5.00098" />
                <path d="M19 5L5.00092 18.999" />
              </svg>
            </button>
            <button
              ref={pic}
              type="button"
              className="spt-pic"
              tabIndex={-1}
              aria-label="Close"
              onClick={closeStory}
            >
              <img src={item.image.src} alt={item.image.alt} draggable={false} onError={hideBroken} ref={checkBroken} />
            </button>
            <div className="spt-text">
              <h3 className="spt-title spt-line" style={{ "--i": 0 } as CSSProperties}>
                {item.title}
              </h3>
              <ul className="spt-points">
                {item.points.map((p, j) => (
                  <li key={j} className="spt-line" style={{ "--i": j + 1 } as CSSProperties}>
                    {p}
                  </li>
                ))}
              </ul>
              {item.cta && (
                <div className="spt-line" style={{ "--i": item.points.length + 1 } as CSSProperties}>
                  {item.cta.href ? (
                    <a
                      className="spt-cta"
                      href={item.cta.href}
                      target={item.cta.target}
                      rel={item.cta.target === "_blank" ? "noopener noreferrer" : undefined}
                      onClick={item.cta.onClick}
                    >
                      {item.cta.label}
                    </a>
                  ) : (
                    <button type="button" className="spt-cta" onClick={item.cta.onClick}>
                      {item.cta.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SpotlightTicker;
