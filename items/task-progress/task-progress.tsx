"use client";

/**
 * Task progress, from Impeccable.
 *
 * A list of tasks, each one of three states:
 *   - "pending": not started yet, a dotted circle.
 *   - "active":  in progress, a spinning arc over the dotted circle.
 *   - "done":    a filled circle with a check, the text faded and struck through.
 * Hover a done task (tap it on a phone) and the strike pulls back and the text
 * darkens, so it can be read. Only 5 tasks show at a time, and they follow the
 * work: the task in progress and the ones after it. When a task finishes, its
 * strike draws, then the list slides up and the finished task moves out of
 * view. "Show N more" opens everything (the earlier finished tasks too) and
 * "Show less" slides back to the task in progress.
 *
 * No packages. Colors come from the text color around the list, so it follows
 * light and dark mode on its own.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type TaskStatus = "pending" | "active" | "done";

export type Task = {
  /** A stable id, so a task keeps its animation when the list changes. Falls back to its position. */
  id?: string | number;
  label: ReactNode;
  status: TaskStatus;
};

export type TaskProgressProps = {
  tasks: Task[];
  /** How many tasks show at a time before "Show N more". The shown ones follow the task in progress. */
  limit?: number;
  /** Text of the button that opens the rest. Gets the number of hidden tasks. */
  moreLabel?: (hidden: number) => ReactNode;
  /** Text of the button that closes them again. */
  lessLabel?: ReactNode;
  /** Start with every task showing. */
  defaultExpanded?: boolean;
  /** Color of the spinning arc on the task in progress. Any CSS color, including var(--…). */
  activeColor?: string;
  /** Shown when there are no tasks. */
  emptyLabel?: ReactNode;
  /** Name of the list for screen readers. */
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.23,1,.32,1)"; // fast start, soft landing
const POP = "cubic-bezier(.34,1.56,.64,1)"; // a tiny overshoot
const SPIN_MS = 900; // one turn of the arc
const ARC = 0.62; // how much of the circle the arc covers while in progress
const STRIKE_MS = 520; // the strike drawing across a finished task
const STRIKE_DELAY = 300; // waits for the check before it strikes
const PEEK_MS = 260; // the strike pulling back on hover
const OPEN_MS = 420; // "Show more" opening or closing
const STAGGER = 45; // between rows as they open
const FOLLOW_MS = 560; // the list sliding up to the next task
const FOLLOW_WAIT = STRIKE_DELAY + STRIKE_MS; // lets the strike finish before the list slides
const FADE = 6; // soft edge, in px, where rows slide out of view

const R = 7; // circle radius in the 18px icon
const C = 2 * Math.PI * R; // its length

const CSS = `
.itp { --itp-soft: color-mix(in oklab, currentColor 46%, transparent); --itp-line: color-mix(in oklab, currentColor 13%, transparent); --itp-dot: color-mix(in oklab, currentColor 52%, transparent); --itp-disc: color-mix(in oklab, currentColor 46%, transparent); box-sizing: border-box; border: 1px solid var(--itp-line); border-radius: 16px; padding: 10px 14px; font-size: 15px; line-height: 22px; }
.itp ul { list-style: none; margin: 0; padding: 0; }
.itp-row { display: flex; align-items: flex-start; gap: 12px; padding: 3px 0; -webkit-tap-highlight-color: transparent; }
.itp-icon { position: relative; flex: none; width: 18px; height: 22px; display: grid; place-items: center; }
.itp-icon > * { grid-area: 1 / 1; }
.itp-spin { width: 18px; height: 18px; animation: itp-spin ${SPIN_MS}ms linear infinite; animation-play-state: paused; }
.itp-row[data-status="active"] .itp-spin { animation-play-state: running; }
@keyframes itp-spin { to { transform: rotate(360deg); } }
.itp-dots { stroke: var(--itp-dot); transition: opacity .3s ${EASE}; }
.itp-arc { stroke: var(--itp-arc, currentColor); stroke-dasharray: ${C.toFixed(3)} ${C.toFixed(3)}; stroke-dashoffset: ${C.toFixed(3)}; transition: stroke-dashoffset .5s ${EASE}, opacity .2s; }
.itp-row[data-status="active"] .itp-arc { stroke-dashoffset: ${(C * (1 - ARC)).toFixed(3)}; }
.itp-row[data-status="done"] .itp-arc { stroke-dashoffset: 0; opacity: 0; transition: stroke-dashoffset .22s ${EASE}, opacity .2s .26s; }
.itp-row[data-status="done"] .itp-dots { opacity: 0; transition-delay: .2s; }
.itp-done { width: 18px; height: 18px; overflow: visible; }
.itp-disc { fill: var(--itp-disc); transform-origin: 9px 9px; transform: scale(.4); opacity: 0; transition: transform .2s ${EASE}, opacity .15s; }
.itp-row[data-status="done"] .itp-disc { transform: scale(1); opacity: 1; transition: transform .38s ${POP} .16s, opacity .16s .16s; }
.itp-check { stroke-dasharray: 10; stroke-dashoffset: 10; transition: stroke-dashoffset .12s; }
.itp-row[data-status="done"] .itp-check { stroke-dashoffset: 0; transition: stroke-dashoffset .28s ${EASE} .3s; }
.itp-text { min-width: 0; flex: 1; overflow-wrap: anywhere; }
.itp-label { color: currentColor; background: linear-gradient(currentColor, currentColor) 0 58% / 0% 1.25px no-repeat; transition: color .3s ${EASE}, background-size ${PEEK_MS}ms ${EASE}; }
.itp-row[data-status="done"] .itp-label { color: var(--itp-soft); background-size: 100% 1.25px; }
.itp-row[data-status="done"][data-fresh] .itp-label { transition: color .4s ${EASE} ${STRIKE_DELAY}ms, background-size ${STRIKE_MS}ms cubic-bezier(.65,0,.35,1) ${STRIKE_DELAY}ms; }
@media (hover: hover) {
  .itp-row[data-status="done"]:hover .itp-label { color: color-mix(in oklab, currentColor 88%, transparent); background-size: 0% 1.25px; transition: color .2s ${EASE}, background-size ${PEEK_MS}ms ${EASE}; }
}
.itp-row[data-status="done"][data-peek] .itp-label { color: color-mix(in oklab, currentColor 88%, transparent); background-size: 0% 1.25px; transition: color .2s ${EASE}, background-size ${PEEK_MS}ms ${EASE}; }
.itp-view { position: relative; margin: -${FADE}px 0; padding: ${FADE}px 0; overflow: hidden; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 ${FADE}px, #000 calc(100% - ${FADE}px), transparent); mask-image: linear-gradient(to bottom, transparent, #000 ${FADE}px, #000 calc(100% - ${FADE}px), transparent); }
.itp-view > ul { position: relative; }
.itp-view[data-anim] { transition: height ${OPEN_MS}ms ${EASE}; }
.itp-view[data-anim] > ul { transition: transform ${OPEN_MS}ms ${EASE}; }
.itp-view[data-anim][data-follow] { transition-duration: ${FOLLOW_MS}ms; }
.itp-view[data-anim][data-follow] > ul { transition-duration: ${FOLLOW_MS}ms; }
.itp-view:not([data-measured]) .itp-row[data-out] { display: none; }
.itp-row[data-out] { opacity: 0; filter: blur(2px); }
.itp-view[data-anim] .itp-row { transition: opacity .35s ${EASE}, filter .35s ${EASE}; }
.itp-view[data-anim] .itp-row[data-out] { transition: opacity .25s, filter .25s; }
.itp-toggle { all: unset; box-sizing: border-box; display: inline-flex; margin: 4px 0 2px 24px; padding: 3px 6px; border-radius: 8px; cursor: pointer; color: var(--itp-soft); transition: color .15s, background-color .15s; -webkit-tap-highlight-color: transparent; }
.itp-toggle:focus-visible { box-shadow: 0 0 0 2px var(--itp-soft); }
@media (hover: hover) { .itp-toggle:hover { color: color-mix(in oklab, currentColor 88%, transparent); } }
.itp-toggle span { display: inline-block; animation: itp-swap .26s ${EASE} both; }
@keyframes itp-swap { from { opacity: 0; transform: translateY(3px); filter: blur(2px); } }
.itp-empty { color: var(--itp-soft); padding: 3px 0; }
.itp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .itp-spin { animation: none; }
  .itp-arc, .itp-dots, .itp-disc, .itp-check, .itp-row, .itp-row .itp-label, .itp-view, .itp-view > ul { transition-duration: .15s !important; transition-delay: 0s !important; }
  .itp-disc { transform: none !important; }
  .itp-row[data-out] { filter: none; }
  .itp-label { transition-property: color, opacity !important; }
  .itp-toggle span { animation: none; }
}`;

const STATUS_TEXT: Record<TaskStatus, string> = { pending: "Not started: ", active: "In progress: ", done: "Done: " };

/** True when the text around the list is light (dark mode), so the check mark can be dark. */
function useLightText(ref: React.RefObject<HTMLElement | null>) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => {
      const c = ref.current && getComputedStyle(ref.current).color.match(/[\d.]+/g);
      if (!c) return;
      const [r, g, b] = c.map(Number);
      setLight(0.299 * r + 0.587 * g + 0.114 * b > 140);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, [ref]);
  return light;
}

/** One task. Remembers when it has just finished, so only that strike waits for the check. */
function Row({ task, lightText, out, style }: { task: Task; lightText: boolean; out: boolean; style?: CSSProperties }) {
  const { status, label } = task;
  // Set during render (not in an effect), so the strike's delay is in place on the very frame the task turns done.
  const [seen, setSeen] = useState(status);
  const [fresh, setFresh] = useState(false);
  const [peek, setPeek] = useState(false);
  const touch = useRef(false);
  if (seen !== status) {
    setSeen(status);
    setFresh(status === "done");
    setPeek(false);
  }

  useEffect(() => {
    if (!fresh) return;
    const t = window.setTimeout(() => setFresh(false), STRIKE_DELAY + STRIKE_MS + 60);
    return () => clearTimeout(t);
  }, [fresh]);

  return (
    <li
      className="itp-row"
      data-status={status}
      data-fresh={fresh ? "" : undefined}
      data-peek={peek && status === "done" ? "" : undefined}
      data-out={out ? "" : undefined}
      inert={out}
      aria-current={status === "active" ? "step" : undefined}
      style={style}
      onPointerDown={(e) => (touch.current = e.pointerType !== "mouse")}
      onClick={() => {
        // Phones have no hover: a tap on a done task shows it clearly, another tap strikes it again.
        if (touch.current && status === "done") setPeek((p) => !p);
      }}
    >
      <span className="itp-icon" aria-hidden="true">
        <svg className="itp-spin" viewBox="0 0 18 18" fill="none">
          <circle className="itp-dots" cx="9" cy="9" r={R} strokeWidth="1.7" strokeLinecap="round" strokeDasharray={`0 ${(C / 8).toFixed(4)}`} />
          <circle className="itp-arc" cx="9" cy="9" r={R} strokeWidth="1.7" strokeLinecap="round" transform="rotate(-90 9 9)" />
        </svg>
        <svg className="itp-done" viewBox="0 0 18 18" fill="none">
          <circle className="itp-disc" cx="9" cy="9" r="8" />
          <path className="itp-check" d="M5.6 9.3L7.9 11.5L12.4 6.7" stroke={lightText ? "#0a0a0a" : "#ffffff"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="itp-text">
        <span className="itp-sr">{STATUS_TEXT[status]}</span>
        <span className="itp-label">{label}</span>
      </span>
    </li>
  );
}

export function TaskProgress({
  tasks,
  limit = 5,
  moreLabel = (n) => `Show ${n} more`,
  lessLabel = "Show less",
  defaultExpanded = false,
  activeColor,
  emptyLabel = "No tasks yet.",
  "aria-label": ariaLabel = "Tasks",
  className,
  style,
}: TaskProgressProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lightText = useLightText(rootRef);
  const [open, setOpen] = useState(defaultExpanded);
  const viewId = useId();

  const list = Array.isArray(tasks) ? tasks : [];
  const n = list.length;
  const shown = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 5;
  const folds = n > shown;
  const collapsed = folds && !open;
  const key = (t: Task, i: number) => t.id ?? i;

  // The window of tasks that shows while folded: the task in progress and the ones after it.
  // It moves down at once, but moves up only after the finished task's strike has drawn.
  const target = focusIndex(list, shown);
  const [start, setStart] = useState(target);
  const from = Math.min(start, Math.max(0, n - shown));
  useEffect(() => {
    if (target === start) return;
    if (target < start) return setStart(target);
    const t = window.setTimeout(() => setStart(target), FOLLOW_WAIT);
    return () => clearTimeout(t);
  }, [target, start]);

  // Measured size of the window, so it can slide and grow smoothly whatever the rows' heights.
  const [measured, setMeasured] = useState(false);
  const [box, setBox] = useState<{ h: number; y: number } | null>(null);
  const [anim, setAnim] = useState(false);
  // Following the work is a slower glide than opening or closing. Decided during render, so the
  // right speed is in place on the same frame the window moves.
  const [seen, setSeen] = useState({ from, open, follow: false });
  if (seen.from !== from || seen.open !== open) setSeen({ from, open, follow: seen.open === open });
  const follow = seen.follow;
  useLayoutEffect(() => setMeasured(true), []);
  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!measured || !ul) return;
    const measure = () => {
      const rows = ul.children as HTMLCollectionOf<HTMLElement>;
      const a = rows[from];
      const b = rows[Math.min(n, from + shown) - 1];
      const next = !collapsed ? { h: ul.offsetHeight, y: 0 } : a && b ? { h: b.offsetTop + b.offsetHeight - a.offsetTop, y: a.offsetTop } : null;
      if (next) setBox((p) => (p && p.h === next.h && p.y === next.y ? p : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [measured, collapsed, from, shown, n, tasks]);
  useEffect(() => {
    // Animate only after the first paint, so the list doesn't slide into place on load.
    if (!box || anim) return;
    const r = requestAnimationFrame(() => setAnim(true));
    return () => cancelAnimationFrame(r);
  }, [box, anim]);

  return (
    <div
      ref={rootRef}
      className={`itp${className ? ` ${className}` : ""}`}
      style={{ ...(activeColor ? ({ "--itp-arc": activeColor } as CSSProperties) : null), ...style }}
    >
      <style>{CSS}</style>
      {n === 0 ? (
        <p className="itp-empty" style={{ margin: 0 }}>{emptyLabel}</p>
      ) : (
        <div
          className="itp-view"
          id={viewId}
          data-measured={measured ? "" : undefined}
          data-anim={anim ? "" : undefined}
          data-follow={follow ? "" : undefined}
          style={folds && box ? { height: box.h + FADE * 2 } : undefined}
        >
          <ul ref={listRef} aria-label={ariaLabel} style={folds && box ? { transform: `translateY(${-box.y}px)` } : undefined}>
            {list.map((t, i) => {
              const out = collapsed && (i < from || i >= from + shown);
              // Opening: the hidden rows fade in one after another, nearest first.
              const dist = i < from ? from - 1 - i : i - (from + shown);
              return (
                <Row
                  key={key(t, i)}
                  task={t}
                  lightText={lightText}
                  out={out}
                  style={open && folds && dist >= 0 ? { transitionDelay: `${60 + dist * STAGGER}ms` } : undefined}
                />
              );
            })}
          </ul>
        </div>
      )}
      {folds && (
        <button type="button" className="itp-toggle" aria-expanded={open} aria-controls={viewId} onClick={() => setOpen((o) => !o)}>
          <span key={open ? "less" : "more"}>{open ? lessLabel : moreLabel(n - shown)}</span>
        </button>
      )}
    </div>
  );
}

/** First task in progress (or, if none, the first not done), kept so a full window still shows. */
function focusIndex(list: Task[], shown: number) {
  const n = list.length;
  if (n <= shown) return 0;
  let i = list.findIndex((t) => t.status === "active");
  if (i < 0) i = list.findIndex((t) => t.status !== "done");
  if (i < 0) i = n;
  return Math.min(i, n - shown);
}
