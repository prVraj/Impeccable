"use client";

/**
 * Settle counter, from Impeccable.
 *
 * A number where every digit that changes settles into place. The old digit
 * shrinks and fades away while the new one arrives bigger and faint (1.6x,
 * 30% see-through) and settles down to the size of the digits around it.
 * A digit that changes counts there: from 1 to 6 it shows 2, 3, 4 and 5 on the
 * way, quick at first and slowing into the last one, which settles as above.
 * Digits that stay the same don't move. Commas between thousands come and go
 * the same way.
 *
 * When the number gets longer, its frame first widens to make room, then the
 * new digit settles into the gap. When it gets shorter, the digit leaves first,
 * then the frame closes.
 *
 * No packages. It takes its font, size and color from the text around it.
 */

import { useCallback, useLayoutEffect, useEffect, useRef, useState } from "react";

/* ---------- the design: keep as written ---------- */

const IN_MS = 620; // a new digit, from big and faint to settled
const IN_EASE = "cubic-bezier(.22,1,.36,1)"; // leaves quickly, then a long soft landing
const GROW = 1.6; // how big a new digit starts (1 = the size of the others)
const FAINT = 0.3; // how visible a new digit starts (0.3 = 30%)
const OUT_MS = 380; // the old digit shrinking and fading away
const OUT_EASE = "cubic-bezier(.33,1,.68,1)"; // gone early, no tail
const SHRINK = 0.5; // the old digit's size by the time it is gone
const WIDEN_MS = 420; // the frame opening or closing by one digit
const WIDEN_EASE = "cubic-bezier(.65,0,.35,1)"; // starts and ends gently, so it never jolts
const LAND_AT = 300; // when the digits start settling while the frame widens (ms)
const CLOSE_AT = 160; // when the frame starts closing after a digit starts leaving (ms)
const STAGGER_MS = 45; // between digits that change together, left to right
const FADE_MS = 180; // reduced motion: a plain crossfade
// Counting: a digit that changes steps through every number in between (1, 2, 3, 4, 5, 6), up or down.
const STEP_GAP = 70; // time per in-between number, before the cap
const RUN_MAX = 560; // the longest the in-between numbers may take, so 0 to 9 never drags
const RUN_CURVE = 1.35; // above 1: quick at first, then slowing into the last number
const STEP_IN_MS = 240; // an in-between number arriving
const STEP_GROW = 1.3; // how big an in-between number starts (the last one starts at GROW)
const STEP_OUT_MS = 180; // an in-between number leaving

const CSS = `
.stlc{display:inline-flex;align-items:center;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:middle}
.stlc-slot{position:relative;display:inline-block;height:1em}
.stlc-size{display:inline-block;visibility:hidden}
.stlc-glyph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;white-space:pre}
.stlc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ---------- text ---------- */

function show(value, separator) {
  if (typeof value !== "number") return String(value);
  if (!Number.isFinite(value)) return String(value);
  const [int, dec] = Math.abs(value).toString().split(".");
  const grouped = separator ? int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : int;
  return (value < 0 ? "-" : "") + grouped + (dec ? "." + dec : "");
}

const px = (el) => parseFloat(getComputedStyle(el).width) || 0;

/**
 * The places of a number, from the left. Digits are counted from the left, so a digit
 * added at the end is the only one that moves (8329 to 83295). A comma or any other mark
 * is a place of its own, named by how many digits come before it, so when the number grows
 * from 8,329 to 83,295 the digits stay put and only the comma moves to its new spot.
 */
function places(text) {
  let digits = 0;
  let marks = 0;
  return [...text].map((char) => {
    if (char >= "0" && char <= "9") {
      marks = 0;
      return { key: `d${digits}`, rank: digits++ * 100 + 99, char };
    }
    return { key: `s${digits}.${marks}`, rank: digits * 100 + marks++, char };
  });
}

/** The digits between two digits, in counting order: "1" to "6" gives 2, 3, 4, 5; "6" to "1" gives 5, 4, 3, 2. */
function between(from, to) {
  const a = Number(from);
  const b = Number(to);
  if (!/^[0-9]$/.test(from) || !/^[0-9]$/.test(to)) return [];
  const dir = b > a ? 1 : -1;
  const out = [];
  for (let d = a + dir; d !== b; d += dir) out.push(String(d));
  return out;
}

function Glyph({ g, reduced, onGone }) {
  const ref = useRef(null);
  const anim = useRef(null);

  // Arrive: big and faint, then settle to the size and color of the others.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !g.enter) return;
    if (typeof el.animate !== "function") {
      el.style.opacity = "1";
      return;
    }
    anim.current = el.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: FAINT, transform: `scale(${g.quick ? STEP_GROW : GROW})` },
            { opacity: 1, transform: "scale(1)" },
          ],
      {
        duration: reduced ? FADE_MS : g.quick ? STEP_IN_MS : IN_MS,
        easing: reduced ? "linear" : IN_EASE,
        delay: g.delay,
        fill: "forwards",
      },
    );
    // Settled: keep it visible on its own and let the animation go.
    const a = anim.current;
    a.onfinish = () => {
      el.style.opacity = "1";
      a.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leave: shrink and fade from wherever it is now (even halfway through arriving).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !g.out) return;
    if (typeof el.animate !== "function") return onGone(g.id);
    const now = getComputedStyle(el);
    const from = {
      opacity: now.opacity,
      transform: now.transform === "none" ? "scale(1)" : now.transform,
    };
    anim.current?.cancel();
    const a = el.animate(
      reduced
        ? [{ opacity: from.opacity }, { opacity: 0 }]
        : [from, { opacity: 0, transform: `scale(${SHRINK})` }],
      {
        duration: reduced ? FADE_MS : g.quick ? STEP_OUT_MS : OUT_MS,
        easing: reduced ? "linear" : OUT_EASE,
        delay: g.delay,
        fill: "both",
      },
    );
    anim.current = a;
    a.onfinish = () => onGone(g.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.out]);

  useEffect(() => () => anim.current?.cancel(), []);

  return (
    // A new digit stays hidden while it waits for its turn (the frame opening); its animation then holds it in place.
    <span ref={ref} className="stlc-glyph" style={g.enter ? { opacity: 0 } : undefined}>
      {g.char}
    </span>
  );
}

function Slot({ s, reduced, onGone }) {
  const box = useRef(null);
  const size = useRef(null);
  const width = useRef(null);
  const ids = useRef(1);
  const [glyphs, setGlyphs] = useState(() => [
    { id: 0, char: s.char, enter: s.gen > 0, out: false, delay: s.delay },
  ]);
  const handled = useRef(-1); // the last change this place has acted on (so a second run in React's strict mode does nothing)
  const was = useRef(0); // the frame's width after the last change
  const timers = useRef([]); // the counting steps still to come
  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Show the next number in this place: the ones on screen leave as it arrives.
  const show = (char, delay, quick) =>
    setGlyphs((gs) => {
      const kept = gs.map((g) => (g.out ? g : { ...g, out: true, delay }));
      // Never more than three leaving at once: drop the oldest if numbers change faster than they settle.
      const leaving = kept.filter((g) => g.out);
      const drop = new Set(leaving.slice(0, Math.max(0, leaving.length - 3)).map((g) => g.id));
      return [
        ...kept.filter((g) => !drop.has(g.id)),
        { id: ids.current++, char, enter: true, out: false, delay, quick },
      ];
    });

  // The frame: open from `from` to the digit's width, or close to 0 and then tell the number it is gone.
  const frame = (from, to, delay, closing) => {
    const b = box.current;
    width.current?.cancel();
    width.current = null;
    if (!b || typeof b.animate !== "function" || Math.abs(from - to) < 0.5) {
      if (closing) onGone(s.key, s.gen);
      return;
    }
    const a = b.animate([{ width: `${from}px` }, { width: `${to}px` }], {
      duration: reduced ? 0 : WIDEN_MS,
      easing: WIDEN_EASE,
      delay: reduced ? 0 : delay,
      fill: closing ? "both" : "backwards",
    });
    width.current = a;
    a.onfinish = () => {
      if (closing) onGone(s.key, s.gen);
      else if (width.current === a) width.current = null;
    };
  };

  useLayoutEffect(() => {
    const b = box.current;
    const sz = size.current;
    if (!b || !sz) return;
    if (handled.current === s.gen) return;
    const firstRun = handled.current === -1;
    handled.current = s.gen;
    const to = px(sz);
    if (firstRun) {
      was.current = to;
      if (s.gen > 0 && s.fresh) frame(0, to, 0, false);
      return;
    }
    stop();
    const now = width.current ? px(b) : null;
    if (s.leaving) {
      // The digit leaves first, then the frame closes behind it.
      setGlyphs((gs) => gs.map((g) => (g.out ? g : { ...g, out: true, delay: s.delay })));
      frame(now ?? was.current, 0, s.delay + (reduced ? 0 : CLOSE_AT), true);
      was.current = 0;
      return;
    }
    // A new digit (or the same place coming back): open or resize the frame, then the new digit settles in.
    frame(now ?? (s.fresh ? 0 : was.current), to, 0, false);
    was.current = to;
    const run = reduced || s.fresh ? [] : s.steps;
    if (!run.length) {
      show(s.char, s.delay, false);
      return;
    }
    // Count: every number in between gets its turn, the gaps growing so it slows into the last one.
    const m = run.length;
    const span = Math.min(RUN_MAX, m * STEP_GAP);
    [...run, s.char].forEach((char, k) => {
      const at = s.delay + span * (k / m) ** RUN_CURVE;
      const go = () => show(char, 0, k < m);
      if (at < 1) go();
      else timers.current.push(window.setTimeout(go, at));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.gen]);

  useEffect(() => stop, []);

  const gone = useCallback((id) => setGlyphs((gs) => gs.filter((g) => g.id !== id)), []);

  return (
    <span ref={box} className="stlc-slot">
      <span ref={size} className="stlc-size">
        {s.char}
      </span>
      {glyphs.map((g) => (
        <Glyph key={g.id} g={g} reduced={reduced} onGone={gone} />
      ))}
    </span>
  );
}

/* ---------- the number ---------- */

export function SettleCounter({
  value,
  separator = ",",
  "aria-label": ariaLabel,
  className,
  style,
}) {
  const text = show(value, separator);
  const [slots, setSlots] = useState(() =>
    places(text).map((p) => ({ ...p, steps: [], leaving: false, fresh: false, delay: 0, gen: 0 })),
  );
  const [reduced, setReduced] = useState(false);
  const last = useRef(text);
  const gen = useRef(0);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  // A new number: compare it with what is on screen, place by place.
  useLayoutEffect(() => {
    if (text === last.current) return;
    last.current = text;
    const next = places(text);
    setSlots((prev) => {
      const was = new Map(prev.map((p) => [p.key, p]));
      const now = new Set(next.map((n) => n.key));
      // When a place is added, every change waits for the frame to open, so they all land together.
      const grows = next.some((n) => !was.get(n.key) || was.get(n.key).leaving);
      const base = !reduced && grows ? LAND_AT : 0;
      const step = reduced ? 0 : STAGGER_MS;
      // The new places plus the ones on their way out, in line order.
      const all = [
        ...next.map((n) => ({ n, p: was.get(n.key), rank: n.rank })),
        ...prev.filter((p) => !now.has(p.key)).map((p) => ({ n: null, p, rank: p.rank })),
      ].sort((x, y) => x.rank - y.rank);
      let order = 0;
      const out = [];
      for (const { n, p } of all) {
        if (n && (!p || p.leaving))
          out.push({
            ...n,
            steps: [],
            leaving: false,
            fresh: true,
            delay: base + order++ * step,
            gen: ++gen.current,
          });
        else if (n && p && p.char !== n.char)
          out.push({
            ...p,
            char: n.char,
            steps: between(p.char, n.char),
            fresh: false,
            delay: base + order++ * step,
            gen: ++gen.current,
          });
        else if (n && p) out.push(p);
        else if (p)
          out.push(
            p.leaving
              ? p
              : { ...p, leaving: true, fresh: false, delay: order++ * step, gen: ++gen.current },
          );
      }
      return out;
    });
  }, [text, reduced]);

  // A place that has finished leaving is taken away.
  const gone = useCallback(
    (key, g) => setSlots((ss) => ss.filter((x) => !(x.key === key && x.leaving && x.gen === g))),
    [],
  );

  return (
    <span className={["stlc", className].filter(Boolean).join(" ")} style={style}>
      <style>{CSS}</style>
      <span className="stlc-sr">{ariaLabel ? `${ariaLabel} ${text}` : text}</span>
      <span aria-hidden="true" style={{ display: "contents" }}>
        {slots.map((s) => (
          <Slot key={s.key} s={s} reduced={reduced} onGone={gone} />
        ))}
      </span>
    </span>
  );
}

export default SettleCounter;
