"use client";

/**
 * Reel Stats, from Impeccable.
 *
 * A stats section that answers a hover. On the left, a short list of
 * headings; on the right, a framed picture with a number on it. Point at a
 * heading and its picture rolls into the frame, its line of text opens, and
 * the soft tab glides behind it to its new place.
 *
 *   - One shape, one color. The open heading sits on a tab that grows out of
 *     the picture's frame (with curved inside corners where they meet), so
 *     the heading and its picture read as one piece. The tab and the frame
 *     share one soft tint that never changes; only the tab moves, gliding
 *     behind the text from one heading to the next (slow start, slow end).
 *   - A reel, not a swap. The pictures sit in a column inside the frame, as
 *     if they were always there. Going down the list, the next picture rises
 *     from below and pushes the current one up; going up, the reverse. Each
 *     picture also lags a little inside its own slot, so it is revealed more
 *     than slid, and the one leaving dims as it goes.
 *   - Text out, then in, both eased. The old line of text fades, softens and
 *     drifts away while its space closes, then the new one fades and drifts
 *     in from the same direction the pictures move. Nothing pops.
 *   - Light on the page. Pictures load only when the section comes near the
 *     screen: the open one first, the rest right after it (or the moment
 *     someone points at the list). Until a picture arrives, its slot shows
 *     the soft tint. Motion is transform and opacity only.
 *
 * Works with a mouse (hover), touch (tap) and the keyboard (Tab, arrow keys).
 * On narrow screens the picture sits on top and the list below it.
 * No packages. Colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg), so it follows light and dark mode.
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export type ReelStatsItem = {
  /** The heading in the list, like "Spatial planning". Keep it to a few words. */
  title: ReactNode;
  /** The line of text that opens under the heading. One or two sentences. */
  description: ReactNode;
  /** The picture. Any size: it is cropped to the frame (4:3). */
  src: string;
  /** What the picture shows, for screen readers. */
  alt: string;
  /** The big number on the picture, like "120+". Leave out to show no number. */
  value?: ReactNode;
  /** The short line under the number, like "Rooms redesigned". */
  label?: ReactNode;
};

export type ReelStatsProps = {
  /** The rows, top to bottom. 3 to 6 reads best. */
  items: ReelStatsItem[];
  /** An optional heading above the section. */
  title?: ReactNode;
  /** The one color of the frame and the tab behind the open heading (any CSS color). Defaults to a soft tint of your text color in your page color. */
  tint?: string;
  /** Which row is open at the start (0 is the first). */
  defaultIndex?: number;
  /** Move to the next row by itself every so many ms (1500 or more). It rests while someone points at or tabs into it. 0 turns it off. */
  autoplay?: number;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const ROLL_MS = 680; // one step of the reel...
const STEP_MS = 110; // ...plus this for every extra row it passes...
const MAX_MS = 1000; // ...but never longer than this
const LAG = 0.36; // each picture trails 36% of the frame's height inside its slot (the reveal)
const DIM = 0.35; // the picture leaving dims 35%
const INTENT_MS = 60; // the pointer rests this long on a heading before it opens (no flicker on a fast sweep)
const TEXT_OUT_MS = 380; // the old line fades and drifts out...
const TEXT_IN_MS = 640; // ...the new one fades and drifts in...
const TEXT_IN_DELAY = 240; // ...once the old one is mostly gone
const TEXT_SHIFT = 8; // px they drift
const TEXT_BLUR = 3; // px of softness while they come and go
const EASE = "cubic-bezier(.32,.72,0,1)"; // the reel: fast start, long soft landing
const GLIDE = "cubic-bezier(.45,.05,.25,1)"; // the tab and the rows: slow start, slow end, so it glides
const TEXT_OUT_EASE = "cubic-bezier(.4,0,.2,1)"; // eased out, never cut
const TEXT_IN_EASE = "cubic-bezier(.22,1,.36,1)"; // eased in, settles softly

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CSS = `
.irs {
  --irs-fg: var(--foreground, var(--fg, CanvasText));
  --irs-bg: var(--background, var(--bg, Canvas));
  --irs-muted: color-mix(in oklab, var(--irs-fg) 64%, var(--irs-bg));
  --irs-r: calc(var(--radius-lg, 8px) * 3); /* soft, calm corners: 24px with an 8px theme radius */
  --irs-pad: 8px; /* the frame's tinted rim around the picture */
  --irs-in: calc(var(--irs-r) - var(--irs-pad)); /* nested corners: inner radius = outer radius - rim */
  --irs-cut: 16px; /* the curved inside corners where the tab meets the frame */
  --irs-ease: ${EASE};
  --irs-glide: ${GLIDE};
  --irs-ms: ${ROLL_MS}ms;
  --irs-tint: color-mix(in oklab, var(--irs-fg) 8%, var(--irs-bg));
  position: relative;
  container-type: inline-size;
  color: var(--irs-fg);
}
.irs-stage { max-width: 72rem; margin-inline: auto; padding: 64px 16px; }
.irs-title {
  margin: 0 0 28px;
  max-width: 24ch;
  font-size: clamp(26px, 4cqi, 40px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 600;
  text-wrap: balance;
}
.irs-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }

/* The frame: a tinted rim with the picture window inside. */
.irs-frame {
  position: relative;
  order: -1;
  border-radius: var(--irs-r);
  background-color: var(--irs-tint);
}
.irs-frame::before { content: ""; display: block; aspect-ratio: 4 / 3; }
.irs-window {
  position: absolute;
  inset: var(--irs-pad);
  z-index: 2;
  overflow: hidden;
  isolation: isolate;
  border-radius: var(--irs-in);
  user-select: none;
  -webkit-user-select: none;
}

/* The reel: every picture has a slot; the open one sits at 0, the rest above or below. */
.irs-slide {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: var(--irs-tint);
  transform: translate3d(0, calc(var(--o) * 100%), 0);
}
.irs-slide img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: translate3d(0, calc(var(--o) * ${-LAG * 100}%), 0);
  -webkit-user-drag: none;
  pointer-events: none;
}
.irs-slide img[data-ok] { opacity: 1; }
.irs-shade { position: absolute; inset: 0; background: #000; opacity: calc(var(--d) * ${DIM}); pointer-events: none; }
.irs-stat {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 72px 22px 20px;
  color: #fff; /* fixed: it sits on photos in both themes */
  background: linear-gradient(to top, rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.18) 55%, transparent);
  pointer-events: none;
}
.irs-value { font-size: clamp(32px, 5cqi, 48px); line-height: 1; font-weight: 600; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.irs-label { font-size: 14px; line-height: 1.4; opacity: 0.86; overflow-wrap: anywhere; }

/* The list and the tab that slides behind the open row. */
.irs-list { position: relative; z-index: 1; isolation: isolate; padding: 4px 0; }
.irs-rows { margin: 0; padding: 0; list-style: none; }
.irs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.irs-tab {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 0;
  z-index: -1;
  border-radius: var(--irs-in);
  background-color: var(--irs-tint);
  opacity: 0;
  pointer-events: none;
}
.irs-ready .irs-tab { opacity: 1; }
.irs-row { position: relative; padding: 14px 20px; cursor: pointer; }
.irs-btn {
  appearance: none;
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 18px;
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: -0.012em;
  text-align: left;
  overflow-wrap: anywhere;
  color: color-mix(in oklab, var(--irs-fg) 68%, var(--irs-bg));
  cursor: pointer;
  border-radius: 6px;
  -webkit-tap-highlight-color: transparent;
}
.irs-on .irs-btn { color: var(--irs-fg); }
.irs-btn:focus-visible { outline: 2px solid color-mix(in oklab, var(--irs-fg) 55%, transparent); outline-offset: 4px; }
@media (hover: hover) { .irs-row:hover .irs-btn { color: var(--irs-fg); } }
.irs-desc { height: 0; overflow: hidden; }
.irs:not(.irs-ready) .irs-on .irs-desc { height: auto; } /* before the script measures */
.irs-text { margin: 0; padding-top: 8px; max-width: 38ch; overflow-wrap: anywhere; font-size: 15px; line-height: 1.55; color: var(--irs-muted); opacity: 0; }
.irs-on .irs-text { opacity: 1; }

/* Motion, once the script has measured. All on one curve so the tab, the rows and the reel stay in step. */
.irs-ready .irs-tab { transition: transform var(--irs-ms) var(--irs-glide), height var(--irs-ms) var(--irs-glide); }
.irs-ready .irs-desc { transition: height var(--irs-ms) var(--irs-glide); }
.irs-ready .irs-slide,
.irs-ready .irs-slide img { transition: transform var(--irs-ms) var(--irs-ease), opacity 260ms ease; }
.irs-ready .irs-shade { transition: opacity var(--irs-ms) var(--irs-ease); }
.irs-ready .irs-btn { transition: color 420ms ease; }
.irs[data-hold] .irs-tab, .irs[data-hold] .irs-desc { transition: none !important; } /* resizing: follow at once */

/* Wide: list on the left, frame on the right, the tab joined to the frame. */
@container (min-width: 600px) {
  .irs-body { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 0; }
  .irs-frame { order: 0; }
  /* Room above and below so the curved corners never reach the frame's own rounded corners. */
  .irs-list { padding-block: calc(var(--irs-r) + var(--irs-cut) + 4px); }
  .irs-row { padding: 16px 32px 16px 22px; }
  .irs-tab { right: calc(var(--irs-pad) * -1); border-radius: var(--irs-in) 0 0 var(--irs-in); }
  .irs-tab::before,
  .irs-tab::after {
    content: "";
    position: absolute;
    right: var(--irs-pad);
    width: var(--irs-cut);
    height: var(--irs-cut);
    background-color: inherit;
  }
  .irs-tab::before {
    bottom: 100%;
    -webkit-mask: radial-gradient(circle at 0 0, transparent calc(var(--irs-cut) - 0.5px), #000 var(--irs-cut));
    mask: radial-gradient(circle at 0 0, transparent calc(var(--irs-cut) - 0.5px), #000 var(--irs-cut));
  }
  .irs-tab::after {
    top: 100%;
    -webkit-mask: radial-gradient(circle at 0 100%, transparent calc(var(--irs-cut) - 0.5px), #000 var(--irs-cut));
    mask: radial-gradient(circle at 0 100%, transparent calc(var(--irs-cut) - 0.5px), #000 var(--irs-cut));
  }
  .irs-btn { font-size: 20px; }
}

/* Reduced motion: no rolling or drifting; pictures cross-fade and rows open at once. */
@media (prefers-reduced-motion: reduce) {
  .irs .irs-slide, .irs .irs-slide img { transform: none; }
  .irs .irs-slide { opacity: var(--v); }
  .irs-ready .irs-slide { transition: opacity 200ms ease; }
  .irs-ready .irs-shade { opacity: 0; }
  .irs-ready .irs-tab, .irs-ready .irs-desc { transition-duration: 0ms; }
}
`;

export function ReelStats({ items, title = null, tint, defaultIndex = 0, autoplay = 0, className, style }: ReelStatsProps) {
  const n = items.length;
  const uid = useId().replace(/:/g, "");
  const [move, setMove] = useState(() => {
    const i = clamp(Math.round(Number(defaultIndex) || 0), 0, Math.max(0, n - 1));
    return { i, from: i };
  });
  const active = clamp(move.i, 0, Math.max(0, n - 1));
  // 0: nothing loaded yet, 1: the open picture, 2: all of them.
  const [load, setLoad] = useState(0);

  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const tab = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const descs = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLParagraphElement | null)[]>([]);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const intent = useRef<{ i: number; t: number } | null>(null);
  const paused = useRef({ hover: false, focus: false });

  const go = useCallback(
    (next: number) => {
      setMove((m) => (m.i === next || next < 0 || next >= n ? m : { i: next, from: m.i }));
      setLoad((l) => (l > 0 ? 2 : l)); // someone is choosing: bring the rest of the pictures now
    },
    [n],
  );

  // Place the tab and open the right row. Measured, then written straight to the DOM so React never fights the transitions.
  const place = useCallback(() => {
    const ul = list.current;
    const t = tab.current;
    if (!ul || !t || !n) return;
    // Rects are in screen pixels; divide by any scale on a parent (a scaled preview) to get layout pixels.
    const k0 = ul.offsetWidth ? ul.getBoundingClientRect().width / ul.offsetWidth : 1;
    const px = (el: Element) => el.getBoundingClientRect().height / (k0 || 1);
    let y = parseFloat(getComputedStyle(ul).paddingTop) || 0;
    let top = 0;
    let height = 0;
    for (let k = 0; k < n; k++) {
      const row = rows.current[k];
      const wrap = descs.current[k];
      const text = texts.current[k];
      if (!row || !wrap || !text) continue;
      const head = px(row) - px(wrap);
      const open = px(text);
      wrap.style.height = k === active ? `${open}px` : "0px";
      if (k === active) {
        top = y;
        height = head + open;
      }
      y += head;
    }
    t.style.transform = `translate3d(0, ${top}px, 0)`;
    t.style.height = `${height}px`;
  }, [active, n]);

  // Motion switches on one frame after the first measure, so nothing slides in from zero.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // On every change: place the tab, and drift the old line out and the new one in, the way the reel moves.
  useIsoLayoutEffect(() => {
    place();
    if (move.from === move.i || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dir = move.i > move.from ? 1 : -1;
    const outEl = texts.current[move.from];
    const inEl = texts.current[move.i];
    if (outEl && typeof outEl.animate === "function") {
      // It just lost its "open" class (so CSS already says 0): start from what is on screen, fully shown unless it was still coming in.
      const start = outEl.getAnimations().length ? getComputedStyle(outEl).opacity : "1";
      outEl.getAnimations().forEach((a) => a.cancel());
      outEl.animate(
        [
          { opacity: start, filter: "blur(0px)", transform: "translateY(0)" },
          { opacity: 0, filter: `blur(${TEXT_BLUR}px)`, transform: `translateY(${-TEXT_SHIFT * dir}px)` },
        ],
        { duration: TEXT_OUT_MS, easing: TEXT_OUT_EASE },
      );
    }
    if (inEl && typeof inEl.animate === "function") {
      inEl.getAnimations().forEach((a) => a.cancel());
      inEl.animate(
        [
          { opacity: 0, filter: `blur(${TEXT_BLUR}px)`, transform: `translateY(${TEXT_SHIFT * dir}px)` },
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
        ],
        { duration: TEXT_IN_MS, delay: TEXT_IN_DELAY, easing: TEXT_IN_EASE, fill: "backwards" },
      );
    }
  }, [move, place]);

  // Re-measure when the width (and so the line breaks) or the fonts change; follow at once, no slide.
  // Set up once: it calls the latest place() through a ref, so a hover never re-runs it (that would cancel the glide).
  const placeRef = useRef(place);
  placeRef.current = place;
  useEffect(() => {
    const ul = list.current;
    const el = root.current;
    if (!ul || !el) return;
    let raf = 0;
    let live = true;
    const snap = () => {
      el.dataset.hold = "";
      placeRef.current();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => delete el.dataset.hold)));
    };
    let lastW = ul.clientWidth;
    const ro = new ResizeObserver(() => {
      if (ul.clientWidth === lastW) return;
      lastW = ul.clientWidth;
      snap();
    });
    ro.observe(ul);
    document.fonts?.ready.then(() => live && snap());
    return () => {
      live = false;
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pictures load only when the section comes near the screen: the open one first.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setLoad(2);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad((l) => Math.max(l, 1));
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay: only while on screen, the tab is visible and nobody is pointing at or tabbing through it.
  useEffect(() => {
    const every = Number(autoplay) || 0;
    if (every <= 0 || n < 2) return;
    const el = root.current;
    if (!el) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    const id = window.setInterval(() => {
      if (!seen || document.hidden || paused.current.hover || paused.current.focus) return;
      setMove((m) => ({ i: (m.i + 1) % n, from: m.i }));
      setLoad((l) => (l > 0 ? 2 : l));
    }, Math.max(1500, every));
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [autoplay, n]);

  useEffect(() => () => window.clearTimeout(intent.current?.t), []);

  if (!n) return null;

  // Longer trips roll a little longer, so passing pictures still read as a reel.
  const steps = Math.abs(move.i - move.from);
  const ms = Math.min(MAX_MS, ROLL_MS + Math.max(0, steps - 1) * STEP_MS);

  const onPoint = (k: number, type: string) => {
    if (type === "touch" || k === active) {
      if (intent.current && intent.current.i !== k) {
        window.clearTimeout(intent.current.t);
        intent.current = null;
      }
      return;
    }
    if (intent.current?.i === k) return;
    window.clearTimeout(intent.current?.t);
    intent.current = {
      i: k,
      t: window.setTimeout(() => {
        intent.current = null;
        go(k);
      }, INTENT_MS),
    };
  };

  const onKey = (e: ReactKeyboardEvent, k: number) => {
    const to = e.key === "ArrowDown" ? k + 1 : e.key === "ArrowUp" ? k - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0 || to >= n) return;
    e.preventDefault();
    btns.current[to]?.focus();
  };

  const rootStyle = {
    ...style,
    "--irs-ms": `${ms}ms`,
    ...(tint ? { "--irs-tint": tint } : null),
  } as CSSProperties;

  return (
    <section
      ref={root}
      className={["irs", ready && "irs-ready", className].filter(Boolean).join(" ")}
      style={rootStyle}
      onPointerEnter={() => (paused.current.hover = true)}
      onPointerLeave={() => {
        paused.current.hover = false;
        window.clearTimeout(intent.current?.t);
        intent.current = null;
      }}
      onFocus={() => (paused.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) paused.current.focus = false;
      }}
    >
      <style>{CSS}</style>
      <div className="irs-stage">
        {title ? <h2 className="irs-title">{title}</h2> : null}
        <div className="irs-body">
          <div ref={list} className="irs-list">
            <div ref={tab} className="irs-tab" aria-hidden="true" />
            <ul className="irs-rows">
            {items.map((it, k) => {
              const on = k === active;
              return (
                <li
                  key={k}
                  ref={(el) => {
                    rows.current[k] = el;
                  }}
                  className={on ? "irs-row irs-on" : "irs-row"}
                  onPointerMove={(e) => onPoint(k, e.pointerType)}
                  onClick={() => go(k)}
                >
                  <button
                    ref={(el) => {
                      btns.current[k] = el;
                    }}
                    type="button"
                    className="irs-btn"
                    aria-expanded={on}
                    aria-controls={`${uid}-d${k}`}
                    onFocus={() => go(k)}
                    onKeyDown={(e) => onKey(e, k)}
                  >
                    {it.title}
                  </button>
                  <div
                    ref={(el) => {
                      descs.current[k] = el;
                    }}
                    id={`${uid}-d${k}`}
                    className="irs-desc"
                    aria-hidden={!on}
                  >
                    <p
                      ref={(el) => {
                        texts.current[k] = el;
                      }}
                      className="irs-text"
                    >
                      {it.description}
                      {it.value != null || it.label != null ? (
                        <span className="irs-sr">
                          {" "}
                          {it.value} {it.label}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
            </ul>
          </div>

          <div className="irs-frame">
            <div className="irs-window" role="img" aria-label={items[active]?.alt}>
              {items.map((it, k) => {
                const o = k - active;
                const show = load === 2 || (load === 1 && k === active);
                return (
                  <div
                    key={k}
                    className="irs-slide"
                    aria-hidden="true"
                    style={
                      {
                        "--o": o,
                        "--d": Math.min(1, Math.abs(o)),
                        "--v": o === 0 ? 1 : 0,
                      } as CSSProperties
                    }
                  >
                    {show ? (
                      <img
                        src={it.src}
                        alt=""
                        decoding="async"
                        draggable={false}
                        onLoad={(e) => {
                          e.currentTarget.dataset.ok = "1";
                          if (k === active) setLoad(2);
                        }}
                        onError={() => {
                          if (k === active) setLoad(2);
                        }}
                      />
                    ) : null}
                    <div className="irs-shade" />
                    {it.value != null || it.label != null ? (
                      <div className="irs-stat">
                        {it.value != null ? <span className="irs-value">{it.value}</span> : null}
                        {it.label != null ? <span className="irs-label">{it.label}</span> : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReelStats;
