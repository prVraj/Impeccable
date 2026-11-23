"use client";

/**
 * Rolling clock, from Impeccable.
 *
 * The visitor's own time (HH : MM : SS) where every digit rolls when it
 * changes: the bigger number rises from below and the old one leaves upward.
 * They don't move in a straight line. Each pair of digits rolls on a curve,
 * like two wheels turning side by side: the left digit swings out to the left
 * as it moves, the right digit swings out to the right, and both shrink and
 * fade as they leave the front. When several digits change at once
 * (12:59:59 to 13:00:00) they roll one after another, right to left.
 *
 * It first shows 00:00:00. When it comes into view, every digit spins up from
 * 0 to the real time and eases out to a stop, so the visitor sees how it rolls.
 *
 * No packages. It takes its font, size and color from the text around it.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export type RollingClockProps = {
  /** 12 hour time with a small AM or PM after the seconds. Off = 24 hour time. */
  hour12?: boolean;
  /** Name for screen readers. The time itself is read out from hidden text. */
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const ROLL_MS = 620; // one digit rolling to the next
const STAGGER_MS = 70; // between digits that change together, right to left
const STEP = 0.92; // how far a number travels up or down to leave the front, in em
const BEND = 0.3; // how far it swings out sideways on the curve by then, in em
const TILT = 14; // how far it leans along the curve by then, in degrees
const SIDE = 0.56; // its size once it has left the front (1 = same size)
const ROLL = [0.5, 0, 0.12, 1] as const; // cubic-bezier: eases in, then a long soft landing
const INTRO_MS = 1500; // the first spin from 00:00:00 to the real time
const INTRO = [0.16, 1, 0.3, 1] as const; // cubic-bezier: fast start, long ease out
const INTRO_WAIT = 300; // 00:00:00 holds this long once in view, so it is seen before it spins

const CSS = `
.rclk{display:inline-flex;align-items:center;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:middle}
.rclk-reel{position:relative;display:inline-grid;height:1em;width:1ch}
.rclk-reel[data-word]{width:auto;margin-left:.35em;font-size:.42em;letter-spacing:.06em}
.rclk-size{visibility:hidden;grid-area:1/1}
.rclk-cell{position:absolute;left:0;right:0;top:0;height:1em;display:flex;align-items:center;justify-content:center;will-change:transform,opacity}
.rclk-sep{display:inline-block;margin:0 .5em;transform:translateY(-.04em)}
.rclk-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ---------- time ---------- */

/** What the clock shows: six digits, plus AM or PM in 12 hour time. */
function read(date: Date, hour12: boolean) {
  let h = date.getHours();
  let word = "";
  if (hour12) {
    word = h < 12 ? "AM" : "PM";
    h = h % 12 || 12;
  }
  const two = (n: number) => String(n).padStart(2, "0").split("");
  return { digits: [...two(h), ...two(date.getMinutes()), ...two(date.getSeconds())], word };
}

/* ---------- easing ---------- */

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
const ease = bezier(...ROLL);
const easeIntro = bezier(...INTRO);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/* ---------- one reel ---------- */

type ReelProps = {
  value: string;
  /** -1 = the left digit of a pair (curves out to the left), 1 = the right one (curves out to the right). */
  side: -1 | 1;
  delay: number;
  reduced: boolean;
  /** The first real time: spin up to it from the first number on the reel ("0", or empty for AM/PM). */
  intro: boolean;
  word?: boolean;
};

function Reel({ value, side, delay, reduced, intro, word }: ReelProps) {
  // Slots on the reel, one number each. `at` is the slot in front once it lands; new numbers go below it.
  // AM/PM arrives with the first real time, so it starts empty and spins in like the digits.
  const [slots, setSlots] = useState<Record<number, string>>(() => ({ 0: word ? "" : value }));
  const [at, setAt] = useState(0);
  const cells = useRef(new Map<number, HTMLSpanElement>());
  // pos: where the reel is now, in slots. It eases from `from` to `to` in `dur` ms.
  const live = useRef({ pos: 0, from: 0, to: 0, old: 0, start: 0, fade: 1, dur: ROLL_MS, curve: ease });
  const raf = useRef(0);
  const last = useRef(word ? "" : value);

  useLayoutEffect(() => {
    if (value === last.current) return;
    last.current = value;
    const l = live.current;
    if (intro) {
      // The first real time: lay every number from the first one up to it on the reel, then spin there.
      const run = word ? ["", value] : Array.from({ length: Number(value) + 1 }, (_, n) => String(n));
      const end = run.length - 1;
      setSlots(Object.fromEntries(run.map((v, n) => [n, v])));
      setAt(end);
      l.start = performance.now() + delay;
      l.pos = l.from = 0;
      l.to = end;
      l.dur = INTRO_MS;
      l.curve = easeIntro;
      if (reduced) {
        l.pos = l.from = end;
        l.old = 0;
        l.fade = 0;
      }
      return;
    }
    // A new number: put it on the slot below and roll there. Keep the old one so it can leave.
    const next = at + 1;
    setSlots((s) => {
      const n: Record<number, string> = {};
      for (let k = next - 2; k < next; k++) if (s[k] !== undefined) n[k] = s[k];
      n[next] = value;
      return n;
    });
    setAt(next);
    l.start = performance.now() + delay;
    l.dur = ROLL_MS;
    l.curve = ease;
    if (reduced) {
      l.old = l.to;
      l.pos = l.from = l.to = next;
      l.fade = 0;
    } else {
      l.from = l.pos;
      l.to = next;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, intro]);

  // Paint once before the browser shows the change, then every frame until it lands.
  useLayoutEffect(() => {
    const l = live.current;
    const paint = (now: number) => {
      const p = clamp((now - l.start) / l.dur);
      if (reduced) l.fade = clamp((now - l.start) / 160);
      else l.pos = l.from + (l.to - l.from) * l.curve(p);
      cells.current.forEach((el, k) => {
        const o = k - l.pos; // 0 = in front, -1 = gone above, 1 = waiting below
        const d = Math.min(Math.abs(o), 1.2);
        // Reduced motion: no movement, the old number fades out as the new one fades in.
        const alpha = reduced
          ? l.old === l.to
            ? Number(k === l.to)
            : k === l.to
              ? l.fade
              : k === l.old
                ? 1 - l.fade
                : 0
          : clamp(1 - Math.abs(o));
        // The curve: the further from the front, the further out to its side and the more it leans.
        const x = side * BEND * d * d;
        const turn = -side * o * TILT * Math.min(1, d);
        const scale = 1 - (1 - SIDE) * d;
        el.style.opacity = alpha.toFixed(3);
        el.style.transform = `translate(${x.toFixed(4)}em, ${(o * STEP).toFixed(4)}em) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      });
      raf.current = p >= 1 && (!reduced || l.fade >= 1) ? 0 : requestAnimationFrame(paint);
    };
    cancelAnimationFrame(raf.current);
    paint(performance.now());
    return () => cancelAnimationFrame(raf.current);
  }, [slots, at, reduced, side]);

  const keys = Object.keys(slots)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <span className="rclk-reel" data-word={word ? "" : undefined} aria-hidden="true">
      <span className="rclk-size">{word ? "AM" : "0"}</span>
      {keys.map((k) => (
        <span
          key={k}
          className="rclk-cell"
          ref={(el) => {
            if (el) cells.current.set(k, el);
            else cells.current.delete(k);
          }}
        >
          {slots[k]}
        </span>
      ))}
    </span>
  );
}

/* ---------- the clock ---------- */

export function RollingClock({ hour12 = false, "aria-label": ariaLabel = "Time", className, style }: RollingClockProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [reduced, setReduced] = useState(false);
  const prev = useRef<Date | null>(null);
  const box = useRef<HTMLSpanElement>(null);

  // It shows 00:00:00 until it comes into view, then reads the time and ticks on every new second.
  useEffect(() => {
    let timer = 0;
    let started = false;
    let landAt = 0;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    const start = () => {
      if (started) return;
      started = true;
      timer = window.setTimeout(spin, INTRO_WAIT);
    };
    const spin = () => {
      // The first spin takes INTRO_MS, so it aims for the time it will be when it lands,
      // and the next tick waits for the first new second after that.
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const land = Date.now() + (still ? 0 : INTRO_MS);
      landAt = land;
      setNow(new Date(land));
      timer = window.setTimeout(tick, land - Date.now() + 1000 - (land % 1000) + 8);
    };
    const wake = () => {
      if (!landAt || Date.now() < landAt || document.visibilityState !== "visible") return;
      clearTimeout(timer);
      tick();
    };
    let io: IntersectionObserver | undefined;
    if (box.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver((e) => {
        if (e.some((x) => x.isIntersecting)) {
          io?.disconnect();
          start();
        }
      }, { threshold: 0.6 });
      io.observe(box.current);
    } else start();
    document.addEventListener("visibilitychange", wake);
    return () => {
      io?.disconnect();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    prev.current = now;
  });

  // Before the time is known every digit is 0 (the server draws the same), and AM/PM waits.
  const { digits, word } = now ? read(now, hour12) : { digits: ["0", "0", "0", "0", "0", "0"], word: "" };
  const before = prev.current ? read(prev.current, hour12) : null;
  const intro = now !== null && before === null;

  // Digits that change together roll right to left, one after another. The first spin staggers every digit.
  const delays: number[] = [];
  let changed = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    delays[i] = intro || (before && before.digits[i] !== digits[i]) ? changed++ * STAGGER_MS : 0;
  }

  const reel = (i: number) => (
    <Reel key={i} value={digits[i]} side={i % 2 === 0 ? -1 : 1} delay={delays[i]} reduced={reduced} intro={intro} />
  );

  return (
    <span ref={box} className={["rclk", className].filter(Boolean).join(" ")} style={style} role="timer" aria-label={ariaLabel}>
      <style>{CSS}</style>
      <span className="rclk-sr">
        {now ? `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}:${digits[4]}${digits[5]}${word ? ` ${word}` : ""}` : ""}
      </span>
      {reel(0)}
      {reel(1)}
      <span className="rclk-sep" aria-hidden="true">:</span>
      {reel(2)}
      {reel(3)}
      <span className="rclk-sep" aria-hidden="true">:</span>
      {reel(4)}
      {reel(5)}
      {word && <Reel key="word" word value={word} side={1} delay={changed * STAGGER_MS} reduced={reduced} intro={intro} />}
    </span>
  );
}

export default RollingClock;
