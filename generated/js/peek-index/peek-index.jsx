"use client";

/**
 * Peek Index, from Impeccable.
 *
 * A numbered index of rows (01, 02, 03...), one for each product, service or
 * feature, split by thin lines. Point at a row and its picture or video appears
 * just above the pointer and follows it, but only inside that row, while the
 * other rows soften to 70%: leave the row and it fades away, enter another row
 * and that row's picture takes over. Click a row and it grows in place, pushing
 * the rows below down, while the picture glides from the pointer to its seat on
 * the left. On the right: a lead paragraph, a short list of points and one
 * underlined link. The + turns into a −. Close it with the −, Esc or a click
 * anywhere outside, and the row folds back.
 *
 * Phones have no hover, so they never show a floating picture: one tap opens
 * the row, with the picture across the full width and the words below it.
 * Reduced motion: nothing glides or grows, things only fade, and videos stay
 * still on their poster.
 *
 * Colors come from your theme: the text from --foreground (else --fg), the page
 * from --background (else --bg), so it follows light and dark mode.
 * One file, React only, no packages.
 */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/* ---------- the design: keep as written ---------- */

const PEEK_IN_MS = 420; // the picture appears by the pointer, growing a little as it fades in
const PEEK_OUT_MS = 300; // and fades away when the pointer leaves the row
const PEEK_SCALE = 0.9; // it grows from 90%
const PEEK_EASE = "cubic-bezier(.22,1,.36,1)"; // gentle start, long soft landing
const PEEK_GAP = 12; // px between the pointer and the bottom of the picture: it floats just above the pointer, never covering it
const FOLLOW = 0.12; // s: the picture trails the pointer softly, never stuck to it
const OPEN_MS = 720; // the row grows and the picture glides to its place
const CLOSE_MS = 600; // and folds back
const GLIDE_EASE = "cubic-bezier(.4,0,.2,1)"; // eases in, travels, settles softly
const HOVER_DIM = 0.7; // pointing at a row softens the others to 70%, in step with the picture fading in
const DIM = 0.4; // the other rows drop to 40% while one is open, in step with the row growing
const TEXT_DELAY = 380; // the words start to drop in as the row opens up
const TEXT_MS = 650; // each line drops from above and comes into focus
const TEXT_DROP = 16; // px each line falls
const TEXT_BLUR = 4; // px of soft blur it loses as it lands
const TEXT_STAGGER = 110; // line by line, top to bottom
const TEXT_STEPS = 4; // after the fourth line the rest land together, so a long list never keeps you waiting
const TEXT_OUT_MS = 220; // on close the words lift away first, then the row folds
const STACK_AT = 480; // px: narrower than this (phones), the picture fills the width and the words sit below it

const CSS = `
.pki { --pki-fg: var(--foreground, var(--fg, CanvasText)); --pki-bg: var(--background, var(--bg, Canvas));
  --pki-muted: color-mix(in oklab, var(--pki-fg) 62%, transparent);
  --pki-size: clamp(24px, 5cqi, 48px);
  position: relative; display: block; width: 100%; margin: 0; padding: 0; list-style: none; box-sizing: border-box; color: var(--pki-fg);
  container-type: inline-size; }
.pki *, .pki *::before, .pki *::after { box-sizing: border-box; }
.pki-row { position: relative; margin: 0; padding: 0; border-bottom: 1px solid color-mix(in oklab, var(--pki-fg) 12%, transparent); }
.pki-row[data-peek="true"], .pki-row[data-expanded="true"] { z-index: 2; }
.pki-panel { position: relative; overflow: hidden; transition: opacity ${PEEK_IN_MS}ms ${PEEK_EASE}; }
/* Pointing at a row softens the others; opening one dims them further, at the pace of the row growing. The lines between rows stay. */
.pki[data-hovering="true"] .pki-row:not([data-lit="true"]) .pki-panel { opacity: ${HOVER_DIM}; }
.pki[data-active="true"] .pki-row:not([data-expanded="true"]) .pki-panel { opacity: ${DIM}; transition: opacity ${OPEN_MS}ms ${GLIDE_EASE}; }
.pki-h { margin: 0; font: inherit; }
.pki-head { display: grid; grid-template-columns: 2.8em minmax(0, 1fr) auto; align-items: start; column-gap: 12px; width: 100%; margin: 0; padding: .5em 0;
  border: 0; border-radius: 6px; background: none; color: inherit; font: inherit; font-size: var(--pki-size); font-weight: 600; line-height: 1.15; letter-spacing: -0.03em;
  text-align: start; cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
.pki[data-stack="true"] .pki-head { grid-template-columns: 2.3em minmax(0, 1fr) auto; }
.pki-head:focus-visible { box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--pki-fg) 55%, transparent); }
.pki-num { font-variant-numeric: tabular-nums; }
.pki-title { min-width: 0; overflow-wrap: anywhere; }
/* The + in the row; open, its upright line turns flat and it reads as a −, at the pace of the row. */
.pki-icon { display: grid; place-items: center; width: max(22px, .72em); height: max(22px, .72em); margin-top: calc((1.15em - max(22px, .72em)) / 2); }
.pki-icon svg { width: 100%; height: 100%; overflow: visible; }
.pki-v { transform-box: fill-box; transform-origin: center; transition: transform ${CLOSE_MS}ms ${GLIDE_EASE}; }
.pki-row[data-expanded="true"] .pki-v { transform: rotate(90deg); transition-duration: ${OPEN_MS}ms; }
.pki-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: stretch; column-gap: clamp(16px, 3cqi, 32px);
  padding: 4px 0 clamp(24px, 4cqi, 40px); }
.pki[data-stack="true"] .pki-body { grid-template-columns: minmax(0, 1fr); row-gap: 20px; padding: 0 0 28px; }
.pki-slot { position: relative; width: 100%; aspect-ratio: var(--pki-ratio); align-self: start; border-radius: 10px; }
.pki-text { display: flex; flex-direction: column; min-width: 0; }
.pki-lead { margin: 0; max-width: 40em; font-size: clamp(15px, 2.4cqi, 18px); font-weight: 500; line-height: 1.5; letter-spacing: -0.01em; overflow-wrap: anywhere; }
.pki-points { display: grid; gap: 6px; margin: 18px 0 0; padding: 0 0 0 1.15em; list-style: disc; font-size: clamp(14px, 2.1cqi, 16px); line-height: 1.5; color: var(--pki-muted); }
.pki-points li { margin: 0; padding: 0; overflow-wrap: anywhere; }
.pki-points li::marker { color: color-mix(in oklab, var(--pki-fg) 45%, transparent); }
.pki-more { margin-top: auto; padding-top: 24px; }
.pki-link { display: inline; max-width: 100%; overflow-wrap: anywhere; margin: 0; padding: 0; border: 0; background: none; font: inherit; font-size: 15px; font-weight: 500;
  color: var(--pki-fg); cursor: pointer; text-align: start; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px;
  text-decoration-color: color-mix(in oklab, var(--pki-fg) 45%, transparent); transition: text-decoration-color 200ms ease; border-radius: 2px;
  outline: none; -webkit-tap-highlight-color: transparent; }
.pki-link svg { display: inline-block; margin-left: 6px; vertical-align: -3px; transition: transform 300ms ${PEEK_EASE}; }
.pki-link:focus-visible { box-shadow: 0 0 0 2px var(--pki-bg), 0 0 0 4px color-mix(in oklab, var(--pki-fg) 55%, transparent); }
/* The picture: floats by the pointer, then glides into the open row. */
.pki-pic { position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; will-change: transform; }
.pki-pic-in { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 10px; opacity: 0; transform: scale(${PEEK_SCALE});
  background: color-mix(in oklab, var(--pki-fg) 6%, var(--pki-bg));
  box-shadow: 0 22px 44px -26px rgba(0,0,0,.5), 0 2px 6px -2px rgba(0,0,0,.12);
  transition: opacity ${PEEK_OUT_MS}ms ease, transform ${PEEK_OUT_MS}ms ease; }
.pki-pic-in::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--pki-fg) 9%, transparent); }
.pki-row[data-peek="true"] .pki-pic-in, .pki-row[data-open="true"] .pki-pic-in { opacity: 1; transform: none;
  transition: opacity ${PEEK_IN_MS}ms ${PEEK_EASE}, transform ${PEEK_IN_MS}ms ${PEEK_EASE}, box-shadow ${OPEN_MS}ms ${GLIDE_EASE}; }
.pki-row[data-open="true"] .pki-pic-in { box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.pki-pic img, .pki-pic video { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
/* The words drop in from above, line by line, coming into focus as they land. */
.pki-line { opacity: 0; transform: translateY(-${TEXT_DROP}px); filter: blur(${TEXT_BLUR}px); }
.pki-row[data-shown="true"] .pki-line { opacity: 1; transform: none; filter: none;
  transition: opacity ${TEXT_MS}ms ${PEEK_EASE}, transform ${TEXT_MS}ms ${PEEK_EASE}, filter ${TEXT_MS}ms ${PEEK_EASE};
  transition-delay: calc(${TEXT_DELAY}ms + var(--i) * ${TEXT_STAGGER}ms); }
.pki-row[data-closing="true"] .pki-line { opacity: 0; transform: translateY(-${TEXT_DROP / 2}px); filter: none;
  transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease; }
.pki-row[data-closing="true"] .pki-pic-in { opacity: 0; transform: scale(.96); transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease; }
@media (hover: hover) {
  .pki[data-active="true"] .pki-row:not([data-expanded="true"]) .pki-panel:hover { opacity: ${HOVER_DIM}; }
  .pki-link:hover { text-decoration-color: currentColor; }
  .pki-link:hover svg { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .pki-panel, .pki-v, .pki-pic-in, .pki-line, .pki-link svg { transition-property: opacity !important; }
  .pki-line, .pki-pic-in { transform: none !important; filter: none !important; }
  .pki-row[data-expanded="true"] .pki-v { transform: rotate(90deg); }
}`;

const VIDEO = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const isVideo = (m) => (m.type ? m.type === "video" : VIDEO.test(m.src));

/** A picture or video that fails to load hides, so the soft box behind it shows instead of a broken icon. */
const hideBroken = (e) => {
  e.currentTarget.style.visibility = "hidden";
};
/** The same check for one that failed before the page came alive (its error event is already gone). */
const checkBroken = (el) => {
  if (!el) return;
  if (el instanceof HTMLImageElement ? el.complete && !el.naturalWidth : el.error)
    el.style.visibility = "hidden";
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** How much the row is scaled on screen (1 unless a parent scales it), so screen px turn back into the row's own px. */
const scaleOf = (row) => row.getBoundingClientRect().width / (row.offsetWidth || 1) || 1;

/** Where an element sits inside its row, in the row's own px. */
function within(el, row) {
  const a = el.getBoundingClientRect();
  const b = row.getBoundingClientRect();
  const k = scaleOf(row);
  return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k };
}

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function PeekIndex({
  items,
  previewWidth = 240,
  ratio = 4 / 3,
  className,
  style,
  "aria-label": ariaLabel,
}) {
  const uid = useId();
  const root = useRef(null);
  const rows = useRef([]);
  const panels = useRef([]);
  const heads = useRef([]);
  const pics = useRef([]);
  const slots = useRef([]);
  const vids = useRef([]);

  const [canHover, setCanHover] = useState(false);
  const [still, setStill] = useState(false); // reduced motion
  const [stack, setStack] = useState(false); // a narrow list: the picture fills the width, the words sit below
  const [peek, setPeek] = useState(null); // the row whose picture floats by the pointer
  const [lit, setLit] = useState(null); // the row the pointer was last in, kept bright while the others soften (null: pointer off the list)
  const [open, setOpen] = useState(null); // the open row
  const [closing, setClosing] = useState(null); // the row whose words are lifting away
  const [shown, setShown] = useState(null); // the open row's lines, a frame after it opens, so they can drop in

  const n = items.length;
  // Odd values fall back to something that still works: a picture 80 to 640px wide, between very tall (1:3) and very wide (4:1).
  const shape = Number.isFinite(ratio) ? clamp(ratio, 1 / 3, 4) : 4 / 3;
  const w = Math.round(Number.isFinite(previewWidth) ? clamp(previewWidth, 80, 640) : 240);
  const h = Math.round(w / shape);

  /* Watch hover support, reduced motion and the list's width. */
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const hoverQ = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanHover(hoverQ.matches);
      setStill(motionQ.matches);
    };
    sync();
    const ro = new ResizeObserver(() => setStack(el.clientWidth < STACK_AT));
    ro.observe(el);
    setStack(el.clientWidth < STACK_AT);
    hoverQ.addEventListener("change", sync);
    motionQ.addEventListener("change", sync);
    return () => {
      ro.disconnect();
      hoverQ.removeEventListener("change", sync);
      motionQ.removeEventListener("change", sync);
    };
  }, []);

  /* ---------- the floating picture ---------- */

  // Where each picture is and where it is heading, in px inside its row. Kept in refs so following the pointer never re-renders.
  const pos = useRef([]);
  const goal = useRef([]);
  const raf = useRef(0);
  const last = useRef(0);
  const peekRef = useRef(null);
  peekRef.current = peek;

  const place = (i, x, y) => {
    const p = pics.current[i];
    if (p) p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const loop = useCallback(
    (now) => {
      const i = peekRef.current;
      if (i === null) return (raf.current = 0);
      const dt = Math.min(0.05, (now - (last.current || now)) / 1000);
      last.current = now;
      const p = pos.current[i];
      const g = goal.current[i];
      if (p && g) {
        const k = still ? 1 : 1 - Math.exp(-dt / FOLLOW);
        p.x += (g.x - p.x) * k;
        p.y += (g.y - p.y) * k;
        place(i, p.x, p.y);
      }
      raf.current = requestAnimationFrame(loop);
    },
    [still],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /** The spot for the picture: centered over the pointer, just above its tip, never past the row's sides. */
  const aim = (i, cx, cy) => {
    const row = rows.current[i];
    if (!row) return null;
    const r = row.getBoundingClientRect();
    const k = scaleOf(row);
    return {
      x: clamp((cx - r.left) / k - w / 2, 0, Math.max(0, row.offsetWidth - w)),
      y: (cy - r.top) / k - h - PEEK_GAP,
    };
  };

  const peekable = canHover && open === null && closing === null;

  const onMove = (i) => (e) => {
    if (!peekable || e.pointerType !== "mouse") return;
    setLit(i);
    const g = aim(i, e.clientX, e.clientY);
    if (!g) return;
    goal.current[i] = g;
    if (peekRef.current !== i) {
      // A fresh row: the picture appears right at the pointer, then follows it.
      pos.current[i] = { ...g };
      const p = pics.current[i];
      if (p) {
        p.style.width = `${w}px`;
        p.style.height = `${h}px`;
      }
      place(i, g.x, g.y);
      peekRef.current = i;
      setPeek(i);
    }
    if (!raf.current) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  };

  const onLeave = (i) => () => {
    if (peekRef.current === i) {
      peekRef.current = null;
      setPeek(null);
    }
  };

  /* Videos play only while they show (floating or open), and never with reduced motion: then the poster stays. */
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      const on = !still && (i === peek || i === open || i === closing);
      if (on && v.paused) v.play().catch(() => {});
      else if (!on && !v.paused) v.pause();
    });
  }, [peek, open, closing, still, items]);

  /* ---------- open and close ---------- */

  // Before the layout changes: how tall each row is, so the change can glide.
  const snap = useRef(null);
  const from = useRef(null);
  const anims = useRef(new Map());
  const openedAt = useRef(0);
  const timer = useRef(0);

  const takeSnap = () => {
    snap.current = panels.current.map((p) => p?.offsetHeight ?? 0);
  };

  const run = (el, frames, ms) => {
    anims.current.get(el)?.cancel();
    const a = el.animate(frames, { duration: still ? 0 : ms, easing: GLIDE_EASE });
    anims.current.set(el, a);
    a.onfinish = () => anims.current.get(el) === a && anims.current.delete(el);
    return a;
  };

  const doOpen = (i, e) => {
    // Where the picture starts: where it floats now, or at the pointer, or (keyboard, touch) in its seat.
    let box = null;
    if (peekRef.current === i && pos.current[i]) box = { ...pos.current[i], w, h };
    else if (canHover && e.detail > 0) {
      const g = aim(i, e.clientX, e.clientY);
      if (g) box = { ...g, w, h };
    }
    window.clearTimeout(timer.current);
    if (open !== null && open !== i) startClose(open);
    // A row still lifting its words away folds now (or, if it is this row, simply opens again).
    else if (closing !== null) setClosing(null);
    // Only a real click may scroll the page.
    from.current = { box, i, real: e.nativeEvent.isTrusted };
    openedAt.current = e.timeStamp || performance.now();
    takeSnap();
    peekRef.current = null;
    setPeek(null);
    setOpen(i);
  };

  /* Close: the words lift away first, then the row folds back. */
  const startClose = (i) => {
    setOpen((o) => (o === i ? null : o));
    setShown((s) => (s === i ? null : s));
    setClosing(i);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        takeSnap();
        setClosing(null);
      },
      still ? 0 : TEXT_OUT_MS,
    );
  };

  /** refocus: focus goes back to the row's heading (Esc); a click elsewhere leaves focus where it landed. */
  const close = useCallback(
    (refocus) => {
      if (open === null) return;
      if (refocus) heads.current[open]?.focus({ preventScroll: true });
      startClose(open);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, still],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* After the layout changes: rows glide to their new height, the picture to its seat. */
  useLayoutEffect(() => {
    const s = snap.current;
    if (!s) return;
    snap.current = null;
    for (let i = 0; i < n; i++) {
      const p = panels.current[i];
      if (!p) continue;
      anims.current.get(p)?.cancel();
      const nh = p.offsetHeight;
      if (Math.abs(nh - s[i]) > 0.5)
        run(p, [{ height: `${s[i]}px` }, { height: `${nh}px` }], nh > s[i] ? OPEN_MS : CLOSE_MS);
    }

    // The picture glides from the pointer into its seat on the left.
    const f = from.current;
    from.current = null;
    if (f && f.i === open) {
      const i = f.i;
      const pic = pics.current[i];
      const slot = slots.current[i];
      const row = rows.current[i];
      if (pic && slot && row) {
        const to = within(slot, row);
        pic.style.transform = `translate3d(${to.x}px, ${to.y}px, 0)`;
        pic.style.width = `${to.w}px`;
        pic.style.height = `${to.h}px`;
        if (f.box)
          run(
            pic,
            [
              {
                transform: `translate3d(${f.box.x}px, ${f.box.y}px, 0)`,
                width: `${f.box.w}px`,
                height: `${f.box.h}px`,
              },
              {
                transform: `translate3d(${to.x}px, ${to.y}px, 0)`,
                width: `${to.w}px`,
                height: `${to.h}px`,
              },
            ],
            OPEN_MS,
          );
        // No pointer to start from (keyboard, touch): it unrolls from the top in its seat, in step with the row growing.
        else run(pic, [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], OPEN_MS);
      }
      // Wait one more frame so the lines are drawn hidden first; then they drop in.
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(i)));
      // If the open row runs off the bottom of the screen, bring it into view once it has grown.
      if (f.real)
        window.setTimeout(
          () => {
            const r = row?.getBoundingClientRect();
            if (r && r.bottom > window.innerHeight)
              row.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
          },
          still ? 0 : OPEN_MS,
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closing]);

  /* While open, the picture keeps to its seat if the list changes width. */
  useEffect(() => {
    if (open === null) return;
    const i = open;
    const slot = slots.current[i];
    const row = rows.current[i];
    const pic = pics.current[i];
    if (!slot || !row || !pic) return;
    const ro = new ResizeObserver(() => {
      if (anims.current.get(pic)) return;
      const to = within(slot, row);
      pic.style.transform = `translate3d(${to.x}px, ${to.y}px, 0)`;
      pic.style.width = `${to.w}px`;
      pic.style.height = `${to.h}px`;
    });
    ro.observe(slot);
    return () => ro.disconnect();
  }, [open, stack]);

  /* Esc or a click anywhere outside the open row closes it. A click on another row opens that one instead. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === "Escape" && close(true);
    const onClick = (e) => {
      if (e.timeStamp <= openedAt.current) return;
      const t = e.target;
      const row = rows.current[open];
      if (t && row?.contains(t)) return; // inside the open row (its heading closes it itself)
      if (t && root.current?.contains(t) && t.closest(".pki-panel")) return; // another row: it opens itself
      close(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [open, close]);

  if (!n) return null;

  const active = open !== null || closing !== null;

  return (
    <ul
      ref={root}
      className={["pki", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      data-active={active || undefined}
      data-hovering={(lit !== null && peekable) || undefined}
      onPointerLeave={() => setLit(null)}
      data-stack={stack || undefined}
      style={{ "--pki-ratio": String(shape), ...style }}
    >
      <style>{CSS}</style>
      {items.map((it, i) => {
        const isOpen = open === i;
        const isClosing = closing === i;
        const expanded = isOpen || isClosing;
        const panelId = `${uid}-${i}`;
        const video = isVideo(it.media);
        const points = it.points ?? [];
        return (
          <li
            key={i}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className="pki-row"
            data-peek={(peek === i && peekable) || undefined}
            data-lit={lit === i || undefined}
            data-open={isOpen || undefined}
            data-closing={isClosing || undefined}
            data-expanded={expanded || undefined}
            data-shown={shown === i || undefined}
          >
            <div
              ref={(el) => {
                panels.current[i] = el;
              }}
              id={panelId}
              className="pki-panel"
              onPointerMove={onMove(i)}
              onPointerEnter={onMove(i)}
              onPointerLeave={onLeave(i)}
            >
              <h3 className="pki-h">
                <button
                  ref={(el) => {
                    heads.current[i] = el;
                  }}
                  type="button"
                  className="pki-head"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={(e) => (isOpen ? close(false) : doOpen(i, e))}
                >
                  <span className="pki-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pki-title">{it.title}</span>
                  <span className="pki-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M3 12h18" />
                      <path className="pki-v" d="M12 3v18" />
                    </svg>
                  </span>
                </button>
              </h3>
              {expanded && (
                <div className="pki-body">
                  <div
                    ref={(el) => {
                      slots.current[i] = el;
                    }}
                    className="pki-slot"
                    role="img"
                    aria-label={it.media.alt}
                  />
                  <div className="pki-text">
                    <p className="pki-lead pki-line" style={{ "--i": 0 }}>
                      {it.description}
                    </p>
                    {points.length > 0 && (
                      <ul className="pki-points">
                        {points.map((pt, j) => (
                          <li
                            key={j}
                            className="pki-line"
                            style={{ "--i": Math.min(j + 1, TEXT_STEPS) }}
                          >
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                    {it.link && (
                      <div
                        className="pki-more pki-line"
                        style={{ "--i": Math.min(points.length + 1, TEXT_STEPS) }}
                      >
                        {it.link.href ? (
                          <a
                            className="pki-link"
                            href={it.link.href}
                            target={it.link.target}
                            rel={it.link.target === "_blank" ? "noopener noreferrer" : undefined}
                            onClick={it.link.onClick}
                          >
                            {it.link.label}
                            <Arrow />
                          </a>
                        ) : (
                          <button type="button" className="pki-link" onClick={it.link.onClick}>
                            {it.link.label}
                            <Arrow />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              ref={(el) => {
                pics.current[i] = el;
              }}
              className="pki-pic"
              aria-hidden="true"
              style={{ width: w, height: h }}
            >
              <div className="pki-pic-in">
                {video ? (
                  <video
                    ref={(el) => {
                      vids.current[i] = el;
                      checkBroken(el);
                    }}
                    src={it.media.src}
                    poster={it.media.poster}
                    muted
                    loop
                    playsInline
                    preload={it.media.poster ? "none" : "metadata"}
                    disablePictureInPicture
                    tabIndex={-1}
                    onError={hideBroken}
                  />
                ) : (
                  <img
                    src={it.media.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onError={hideBroken}
                    ref={checkBroken}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PeekIndex;
