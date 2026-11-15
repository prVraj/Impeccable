"use client";

/**
 * Task-progress, from Impeccable.
 *
 * A list of tasks, each one of three states:
 *   - "pending": not started yet, a dotted circle.
 *   - "active":  in progress, a spinning arc over the dotted circle.
 *   - "done":    a filled circle with a check, the text faded and struck through.
 * Hover a done task (tap it on a phone) and the strike pulls back and the text
 * darkens, so it can be read. Only the first 5 tasks show; the rest open
 * under "Show N more" and close again with "Show less".
 *
 * No packages. Colors come from the text color around the list, so it follows
 * light and dark mode on its own.
 */

import { useEffect, useId, useRef, useState } from "react";

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
.itp-more { display: grid; grid-template-rows: 0fr; transition: grid-template-rows ${OPEN_MS}ms ${EASE}; }
.itp-more[data-open="true"] { grid-template-rows: 1fr; }
.itp-more > ul { min-height: 0; overflow: hidden; }
.itp-more .itp-row { opacity: 0; transform: translateY(-6px); filter: blur(2px); transition: opacity .2s, transform .25s ${EASE}, filter .2s; }
.itp-more[data-open="true"] .itp-row { opacity: 1; transform: none; filter: none; transition: opacity .3s ${EASE}, transform .4s ${EASE}, filter .3s; }
.itp-toggle { all: unset; box-sizing: border-box; display: inline-flex; margin: 4px 0 2px 24px; padding: 3px 6px; border-radius: 8px; cursor: pointer; color: var(--itp-soft); transition: color .15s, background-color .15s; -webkit-tap-highlight-color: transparent; }
.itp-toggle:focus-visible { box-shadow: 0 0 0 2px var(--itp-soft); }
@media (hover: hover) { .itp-toggle:hover { color: color-mix(in oklab, currentColor 88%, transparent); } }
.itp-toggle span { display: inline-block; animation: itp-swap .26s ${EASE} both; }
@keyframes itp-swap { from { opacity: 0; transform: translateY(3px); filter: blur(2px); } }
.itp-empty { color: var(--itp-soft); padding: 3px 0; }
.itp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .itp-spin { animation: none; }
  .itp-arc, .itp-dots, .itp-disc, .itp-check, .itp-row .itp-label, .itp-more, .itp-more .itp-row { transition-duration: .15s !important; transition-delay: 0s !important; }
  .itp-disc, .itp-more .itp-row { transform: none !important; filter: none !important; }
  .itp-label { transition-property: color, opacity !important; }
  .itp-toggle span { animation: none; }
}`;

const STATUS_TEXT = { pending: "Not started: ", active: "In progress: ", done: "Done: " };

/** True when the text around the list is light (dark mode), so the check mark can be dark. */
function useLightText(ref) {
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
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
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
function Row({ task, lightText, style }) {
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
          <circle
            className="itp-dots"
            cx="9"
            cy="9"
            r={R}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeDasharray={`0 ${(C / 8).toFixed(4)}`}
          />
          <circle
            className="itp-arc"
            cx="9"
            cy="9"
            r={R}
            strokeWidth="1.7"
            strokeLinecap="round"
            transform="rotate(-90 9 9)"
          />
        </svg>
        <svg className="itp-done" viewBox="0 0 18 18" fill="none">
          <circle className="itp-disc" cx="9" cy="9" r="8" />
          <path
            className="itp-check"
            d="M5.6 9.3L7.9 11.5L12.4 6.7"
            stroke={lightText ? "#0a0a0a" : "#ffffff"}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
}) {
  const rootRef = useRef(null);
  const lightText = useLightText(rootRef);
  const [open, setOpen] = useState(defaultExpanded);
  const moreId = useId();

  const list = Array.isArray(tasks) ? tasks : [];
  const shown = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 5;
  const first = list.slice(0, shown);
  const rest = list.slice(shown);
  const key = (t, i) => t.id ?? i;

  return (
    <div
      ref={rootRef}
      className={`itp${className ? ` ${className}` : ""}`}
      style={{ ...(activeColor ? { "--itp-arc": activeColor } : null), ...style }}
    >
      <style>{CSS}</style>
      {list.length === 0 ? (
        <p className="itp-empty" style={{ margin: 0 }}>
          {emptyLabel}
        </p>
      ) : (
        <ul aria-label={ariaLabel}>
          {first.map((t, i) => (
            <Row key={key(t, i)} task={t} lightText={lightText} />
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <>
          <div className="itp-more" data-open={open} id={moreId} inert={!open}>
            <ul aria-label={ariaLabel}>
              {rest.map((t, i) => (
                <Row
                  key={key(t, i + shown)}
                  task={t}
                  lightText={lightText}
                  style={{ transitionDelay: open ? `${60 + i * STAGGER}ms` : "0ms" }}
                />
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="itp-toggle"
            aria-expanded={open}
            aria-controls={moreId}
            onClick={() => setOpen((o) => !o)}
          >
            <span key={open ? "less" : "more"}>{open ? lessLabel : moreLabel(rest.length)}</span>
          </button>
        </>
      )}
    </div>
  );
}
