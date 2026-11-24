"use client";

/**
 * Peek List, from Impeccable.
 *
 * A list of rows, one for each product, service or feature. Point at a row and
 * its picture appears just above the pointer and follows it, but only inside
 * that row, while the other rows soften to 70%: leave the row and the picture
 * fades away, enter another row and that row's picture takes over. Click a row and it grows in place like a pop up,
 * pushing the rows below it down, while the picture glides from the pointer to
 * the left of the story: the heading, a short description and one button. The
 * + turns into an X in the top right corner of the open row. Close it with
 * the X, Esc or a click anywhere outside, and the row folds back.
 *
 * Phones have no hover, so they never show a floating picture: one tap opens
 * the row straight away, with the picture above the words.
 * Reduced motion: nothing glides or grows, things only fade.
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
const TEXT_DELAY = 380; // the story starts to drop in as the row opens up
const TEXT_MS = 650; // each line drops from above and comes into focus
const TEXT_DROP = 16; // px each line falls
const TEXT_BLUR = 4; // px of soft blur it loses as it lands
const TEXT_STAGGER = 110; // line by line, top to bottom
const TEXT_OUT_MS = 220; // on close the story lifts away first, then the row folds
const X_SIZE = 36; // the close button
const X_INSET = 16; // px from the open row's top and right edges
const STACK_AT = 560; // px: narrower than this, the picture sits above the words

const CSS = `
.pkl { --pkl-fg: var(--foreground, var(--fg, CanvasText)); --pkl-bg: var(--background, var(--bg, Canvas));
  --pkl-surface: color-mix(in oklab, var(--pkl-fg) 5%, var(--pkl-bg));
  position: relative; display: grid; gap: 8px; width: 100%; margin: 0; padding: 0; list-style: none; box-sizing: border-box; color: var(--pkl-fg); }
.pkl *, .pkl *::before, .pkl *::after { box-sizing: border-box; }
.pkl-row { position: relative; margin: 0; padding: 0; transition: opacity ${PEEK_IN_MS}ms ${PEEK_EASE}; }
.pkl-row[data-peek="true"], .pkl-row[data-expanded="true"] { z-index: 2; }
/* Pointing at a row softens the others; opening one dims them further, at the pace of the row growing. */
.pkl[data-hovering="true"] .pkl-row:not([data-lit="true"]) { opacity: ${HOVER_DIM}; }
.pkl[data-active="true"] .pkl-row:not([data-expanded="true"]) { opacity: ${DIM}; transition: opacity ${OPEN_MS}ms ${GLIDE_EASE}; }
.pkl-panel { position: relative; overflow: hidden; border-radius: 16px; background: var(--pkl-surface); transition: background-color ${PEEK_IN_MS}ms ${PEEK_EASE}; }
.pkl-body { display: grid; grid-template-columns: minmax(0, 1fr); padding: 26px 64px 26px 24px; }
.pkl-row[data-expanded="true"] .pkl-body { grid-template-columns: minmax(0, 42fr) minmax(0, 58fr); align-items: start; gap: 32px; padding: 28px; }
.pkl-row[data-expanded="true"] .pkl-text { padding-right: ${X_SIZE + X_INSET - 28 + 12}px; }
.pkl[data-stack="true"] .pkl-body { padding: 20px 56px 20px 20px; }
.pkl[data-stack="true"] .pkl-row[data-expanded="true"] .pkl-body { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 16px 16px 20px; }
.pkl[data-stack="true"] .pkl-row[data-expanded="true"] .pkl-text { padding-right: 0; }
.pkl-slot { position: relative; width: 100%; aspect-ratio: var(--pkl-ratio); border-radius: 10px; }
.pkl-text { min-width: 0; }
.pkl-title { margin: 0; font-size: 22px; font-weight: 500; line-height: 1.25; letter-spacing: -0.015em; overflow-wrap: anywhere; }
.pkl[data-stack="true"] .pkl-title { font-size: 19px; }
.pkl-hit { display: inline; margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; letter-spacing: inherit; text-align: start;
  cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
.pkl-hit::after { content: ""; position: absolute; inset: 0; border-radius: 16px; z-index: 1; }
.pkl-row[data-expanded="true"] .pkl-hit { cursor: default; }
.pkl-row[data-expanded="true"] .pkl-hit::after { display: none; }
.pkl-hit:focus-visible::after { box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--pkl-fg) 55%, transparent); }
.pkl-desc { margin: 12px 0 0; font-size: 16px; line-height: 1.55; color: color-mix(in oklab, var(--pkl-fg) 70%, transparent); overflow-wrap: anywhere; }
.pkl[data-stack="true"] .pkl-desc { font-size: 15px; }
.pkl-cta { display: inline-flex; align-items: center; height: 36px; margin-top: 20px; padding: 0 14px; border-radius: 8px; font: inherit; font-size: 14px; font-weight: 500;
  color: var(--pkl-fg); text-decoration: none; cursor: pointer; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  background: var(--pkl-bg); border: 1px solid color-mix(in oklab, var(--pkl-fg) 14%, transparent);
  box-shadow: 0 1px 2px color-mix(in oklab, var(--pkl-fg) 8%, transparent);
  transition: background-color 150ms ease, transform 150ms ease; outline: none; -webkit-tap-highlight-color: transparent; }
.pkl-cta:active { transform: scale(.97); }
.pkl-cta:focus-visible, .pkl-x:focus-visible { box-shadow: 0 0 0 2px var(--pkl-bg), 0 0 0 4px color-mix(in oklab, var(--pkl-fg) 55%, transparent); }
/* The + in the row; open, it turns into the X in the top right corner, moving with the row as it grows and folds. */
.pkl-x { position: absolute; top: 0; right: 0; z-index: 3; display: grid; place-items: center; width: ${X_SIZE}px; height: ${X_SIZE}px; margin: 0; padding: 0;
  border-radius: 999px; border: 1px solid transparent; background: transparent; color: var(--pkl-fg); cursor: pointer; outline: none; pointer-events: none;
  transform: translate(-16px, var(--pkl-xy)); -webkit-tap-highlight-color: transparent;
  transition: transform ${CLOSE_MS}ms ${GLIDE_EASE}, background-color ${CLOSE_MS}ms ${GLIDE_EASE}, border-color ${CLOSE_MS}ms ${GLIDE_EASE}; }
.pkl[data-stack="true"] .pkl-x { transform: translate(-12px, var(--pkl-xy)); }
.pkl-x svg { transition: transform ${CLOSE_MS}ms ${GLIDE_EASE}; }
.pkl-row[data-expanded="true"] .pkl-x { transform: translate(-${X_INSET}px, ${X_INSET}px);
  background: var(--pkl-bg); border-color: color-mix(in oklab, var(--pkl-fg) 10%, transparent);
  transition-duration: ${OPEN_MS}ms; }
/* Narrow: the X sits on the picture's top right corner, inside the row. */
.pkl[data-stack="true"] .pkl-row[data-expanded="true"] .pkl-x { transform: translate(-24px, 24px); }
.pkl-row[data-expanded="true"] .pkl-x svg { transform: rotate(45deg); transition-duration: ${OPEN_MS}ms; }
.pkl-row[data-open="true"] .pkl-x { pointer-events: auto; }
/* The picture: floats by the pointer, then glides into the open row. */
.pkl-pic { position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; will-change: transform; }
.pkl-pic-in { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 10px; opacity: 0; transform: scale(${PEEK_SCALE});
  background: color-mix(in oklab, var(--pkl-fg) 6%, var(--pkl-bg));
  box-shadow: 0 22px 44px -26px rgba(0,0,0,.5), 0 2px 6px -2px rgba(0,0,0,.12);
  transition: opacity ${PEEK_OUT_MS}ms ease, transform ${PEEK_OUT_MS}ms ease; }
.pkl-pic-in::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--pkl-fg) 9%, transparent); }
.pkl-row[data-peek="true"] .pkl-pic-in, .pkl-row[data-open="true"] .pkl-pic-in { opacity: 1; transform: none;
  transition: opacity ${PEEK_IN_MS}ms ${PEEK_EASE}, transform ${PEEK_IN_MS}ms ${PEEK_EASE}, box-shadow ${OPEN_MS}ms ${GLIDE_EASE}; }
.pkl-row[data-open="true"] .pkl-pic-in { box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.pkl-pic img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
/* The story drops in from above, line by line, coming into focus as it lands. */
.pkl-line { opacity: 0; transform: translateY(-${TEXT_DROP}px); filter: blur(${TEXT_BLUR}px); }
.pkl-row[data-shown="true"] .pkl-line { opacity: 1; transform: none; filter: none;
  transition: opacity ${TEXT_MS}ms ${PEEK_EASE}, transform ${TEXT_MS}ms ${PEEK_EASE}, filter ${TEXT_MS}ms ${PEEK_EASE};
  transition-delay: calc(${TEXT_DELAY}ms + var(--i) * ${TEXT_STAGGER}ms); }
.pkl-row[data-closing="true"] .pkl-line { opacity: 0; transform: translateY(-${TEXT_DROP / 2}px); filter: none;
  transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease; }
.pkl-row[data-closing="true"] .pkl-pic-in { opacity: 0; transform: scale(.96); transition: opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease; }
@media (hover: hover) {
  .pkl-row:not([data-expanded="true"]) .pkl-panel:hover { background: color-mix(in oklab, var(--pkl-fg) 6.5%, var(--pkl-bg)); }
  .pkl[data-active="true"] .pkl-row:not([data-expanded="true"]):hover { opacity: ${HOVER_DIM}; }
  .pkl-cta:hover { background: color-mix(in oklab, var(--pkl-fg) 4%, var(--pkl-bg)); }
  .pkl-row[data-open="true"] .pkl-x:hover { background: color-mix(in oklab, var(--pkl-fg) 10%, var(--pkl-bg)); }
}
@media (prefers-reduced-motion: reduce) {
  .pkl-row, .pkl-x, .pkl-x svg, .pkl-pic-in, .pkl-line { transition-property: opacity, background-color !important; }
  .pkl-line, .pkl-pic-in { transform: none !important; filter: none !important; }
}`;

/** A picture that fails to load hides, so the soft box behind it shows instead of a broken icon. */
const hideBroken = (e) => {
  e.currentTarget.style.visibility = "hidden";
};
/** The same check for a picture that failed before the page came alive (its error event is already gone). */
const checkBroken = (img) => {
  if (img?.complete && !img.naturalWidth) img.style.visibility = "hidden";
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

export function PeekList({
  items,
  previewWidth = 240,
  ratio = 1.5,
  className,
  style,
  "aria-label": ariaLabel,
}) {
  const uid = useId();
  const root = useRef(null);
  const rows = useRef([]);
  const panels = useRef([]);
  const titles = useRef([]);
  const hits = useRef([]);
  const pics = useRef([]);
  const slots = useRef([]);
  const xs = useRef([]);

  const [canHover, setCanHover] = useState(false);
  const [still, setStill] = useState(false); // reduced motion
  const [stack, setStack] = useState(false); // a narrow list: picture above the words
  const [peek, setPeek] = useState(null); // the row whose picture floats by the pointer
  const [lit, setLit] = useState(null); // the row the pointer was last in, kept bright while the others soften (null: pointer off the list)
  const [open, setOpen] = useState(null); // the open row
  const [closing, setClosing] = useState(null); // the row whose story is lifting away
  const [shown, setShown] = useState(null); // the open row's lines, a frame after it opens, so they can drop in

  const n = items.length;
  // Odd values fall back to something that still works: a picture 80 to 640px wide, between very tall (1:3) and very wide (4:1).
  const shape = Number.isFinite(ratio) ? clamp(ratio, 1 / 3, 4) : 1.5;
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

  /* ---------- open and close ---------- */

  // Before the layout changes: how tall each row is and where each title sits, so the change can glide.
  const snap = useRef(null);
  const from = useRef(null);
  const anims = useRef(new Map());
  const openedAt = useRef(0);
  const timer = useRef(0);

  const takeSnap = () => {
    snap.current = {
      h: panels.current.map((p) => p?.offsetHeight ?? 0),
      t: titles.current.map((t, i) =>
        t && rows.current[i] ? within(t, rows.current[i]) : { x: 0, y: 0, w: 0, h: 0 },
      ),
    };
  };

  const run = (el, frames, ms) => {
    anims.current.get(el)?.cancel();
    const a = el.animate(frames, { duration: still ? 0 : ms, easing: GLIDE_EASE });
    anims.current.set(el, a);
    a.onfinish = () => anims.current.get(el) === a && anims.current.delete(el);
    return a;
  };

  const doOpen = (i, e) => {
    // Where the picture starts: where it floats now, or at the pointer, or (keyboard, touch) in place.
    let box = null;
    if (peekRef.current === i && pos.current[i]) box = { ...pos.current[i], w, h };
    else if (canHover && e.detail > 0) {
      const g = aim(i, e.clientX, e.clientY);
      if (g) box = { ...g, w, h };
    }
    window.clearTimeout(timer.current);
    if (open !== null && open !== i) startClose(open, false);
    // A row still lifting its story away folds now (or, if it is this row, simply opens again).
    else if (closing !== null) setClosing(null);
    // Only a real keyboard press moves focus to the X, and only a real click may scroll the page.
    from.current = {
      box,
      i,
      keys: e.detail === 0 && e.nativeEvent.isTrusted,
      real: e.nativeEvent.isTrusted,
    };
    openedAt.current = e.timeStamp || performance.now();
    takeSnap();
    peekRef.current = null;
    setPeek(null);
    setOpen(i);
  };

  /* Close: the story lifts away first, then the row folds back. */
  const startClose = (i, refocus) => {
    setOpen((o) => (o === i ? null : o));
    setShown((s) => (s === i ? null : s));
    setClosing(i);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        takeSnap();
        setClosing(null);
        if (refocus) hits.current[i]?.focus({ preventScroll: true });
      },
      still ? 0 : TEXT_OUT_MS,
    );
  };

  /** refocus: focus goes back to the row's title (Esc, the X); a click elsewhere leaves focus where it landed. */
  const close = useCallback(
    (refocus) => {
      if (open !== null) startClose(open, refocus);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, still],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* After the layout changes: rows glide to their new height, titles to their new place, the picture to its seat. */
  useLayoutEffect(() => {
    const s = snap.current;
    if (!s) return;
    snap.current = null;
    const ms = open !== null && closing === null ? OPEN_MS : CLOSE_MS;
    for (let i = 0; i < n; i++) {
      const p = panels.current[i];
      const t = titles.current[i];
      const row = rows.current[i];
      if (!p || !t || !row) continue;
      anims.current.get(p)?.cancel();
      anims.current.get(t)?.cancel();
      const nh = p.offsetHeight;
      if (Math.abs(nh - s.h[i]) > 0.5)
        run(
          p,
          [{ height: `${s.h[i]}px` }, { height: `${nh}px` }],
          nh > s.h[i] ? OPEN_MS : CLOSE_MS,
        );
      const nt = within(t, row);
      const o = s.t[i];
      if (o && (Math.abs(nt.x - o.x) > 0.5 || Math.abs(nt.y - o.y) > 0.5))
        run(
          t,
          [{ transform: `translate(${o.x - nt.x}px, ${o.y - nt.y}px)` }, { transform: "none" }],
          nh > s.h[i] ? OPEN_MS : ms,
        );
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
        // The row's own top margin is still growing; the seat is measured from the row, so it stays put.
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
      }
      // Wait one more frame so the lines are drawn hidden first; then they drop in.
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(i)));
      if (f.keys) xs.current[i]?.focus({ preventScroll: true });
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

  /* Like a pop up: Esc or a click anywhere outside the open row closes it. A click on another row opens that one instead. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === "Escape" && close(true);
    const onClick = (e) => {
      if (e.timeStamp <= openedAt.current) return;
      const t = e.target;
      const row = rows.current[open];
      if (t && row?.contains(t)) return; // inside the open row (the X closes it itself)
      if (t && root.current?.contains(t) && t.closest(".pkl-panel")) return; // another row: it opens itself
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
      className={["pkl", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      data-active={active || undefined}
      data-hovering={(lit !== null && peekable) || undefined}
      onPointerLeave={() => setLit(null)}
      data-stack={stack || undefined}
      style={{ "--pkl-ratio": String(shape), "--pkl-xy": stack ? "14px" : "22px", ...style }}
    >
      <style>{CSS}</style>
      {items.map((it, i) => {
        const isOpen = open === i;
        const isClosing = closing === i;
        const expanded = isOpen || isClosing;
        const bodyId = `${uid}-${i}`;
        return (
          <li
            key={i}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className="pkl-row"
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
              className="pkl-panel"
              onPointerMove={onMove(i)}
              onPointerEnter={onMove(i)}
              onPointerLeave={onLeave(i)}
            >
              <div className="pkl-body" id={bodyId}>
                {expanded && (
                  <div
                    ref={(el) => {
                      slots.current[i] = el;
                    }}
                    className="pkl-slot"
                    role="img"
                    aria-label={it.image.alt}
                  />
                )}
                <div className="pkl-text">
                  <h3
                    ref={(el) => {
                      titles.current[i] = el;
                    }}
                    className="pkl-title"
                  >
                    <button
                      ref={(el) => {
                        hits.current[i] = el;
                      }}
                      type="button"
                      className="pkl-hit"
                      aria-expanded={isOpen}
                      aria-controls={bodyId}
                      onClick={(e) => (isOpen ? close(e.nativeEvent.isTrusted) : doOpen(i, e))}
                    >
                      {it.title}
                    </button>
                  </h3>
                  {expanded && (
                    <>
                      <p className="pkl-desc pkl-line" style={{ "--i": 0 }}>
                        {it.description}
                      </p>
                      {it.cta && (
                        <div className="pkl-line" style={{ "--i": 1 }}>
                          {it.cta.href ? (
                            <a
                              className="pkl-cta"
                              href={it.cta.href}
                              target={it.cta.target}
                              rel={it.cta.target === "_blank" ? "noopener noreferrer" : undefined}
                              onClick={it.cta.onClick}
                            >
                              {it.cta.label}
                            </a>
                          ) : (
                            <button type="button" className="pkl-cta" onClick={it.cta.onClick}>
                              {it.cta.label}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              ref={(el) => {
                xs.current[i] = el;
              }}
              type="button"
              className="pkl-x"
              aria-label={isOpen ? `Close ${it.title}` : undefined}
              aria-hidden={!isOpen || undefined}
              tabIndex={isOpen ? 0 : -1}
              onClick={(e) => close(e.nativeEvent.isTrusted)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 4v16M4 12h16" />
              </svg>
            </button>
            <div
              ref={(el) => {
                pics.current[i] = el;
              }}
              className="pkl-pic"
              aria-hidden="true"
              style={{ width: w, height: h }}
            >
              <div className="pkl-pic-in">
                <img
                  src={it.image.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onError={hideBroken}
                  ref={checkBroken}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PeekList;
