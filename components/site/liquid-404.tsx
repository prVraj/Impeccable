"use client";

import { useEffect, useId, useRef } from "react";

/**
 * The 404 page's big "404": the digits are a glass frame, filled with liquid.
 *
 * - Mouse or pen: the liquid level follows the pointer's height (pointer up =
 *   fuller). Below the digits it drains empty; the faint glass keeps the "404" readable.
 * - Moving sideways tips the surface gently; it eases back to a calm ripple.
 * - Every change eases (no bounce, no sudden jumps), and the surface is drawn
 *   as one smooth curve.
 * - Touch screens (no pointer to follow): a gentle idle wave that slowly
 *   rises and falls around three quarters full.
 * - Reduced motion: still liquid at three quarters, no animation.
 *
 * One SVG, no libraries. Each frame only rewrites two path strings, so React
 * never re-renders while it moves.
 */

// "404" in Geist, weight 800, 400 units, baseline at y 0. Each digit has its own x
// (tight, -0.04em apart) instead of letter-spacing, which older Safari ignores in SVG.
// The ink box was measured in the browser; the viewBox hugs the digits so the level maps to them.
const SIZE = 400;
const DIGIT_X = "0 252 517";
const LEFT = 8;
const RIGHT = 769;
const TOP = -291;
const BOTTOM = 7;
const PAD = 2;
const H = BOTTOM - TOP;
const W = RIGHT - LEFT;
const MID = (LEFT + RIGHT) / 2;

const MIN = -0.1; // below the bottom, so an empty frame stays empty while the surface waves
const MAX = 1.1; // above the top, so a full frame stays full
const REST = 0.74; // touch and reduced motion
const STEPS = 40;

// Calm ripple always on, plus extra that builds up with movement.
const RIPPLE = 4.5;
const SWELL_MAX = 16;

type Shape = { level: number; tilt: number; amp: number; t: number };

/** The liquid's surface across the digits, as a closed path down to the bottom. */
function liquidPath({ level, tilt, amp, t }: Shape, back: boolean) {
  const base = BOTTOM - level * H - (back ? amp * 0.7 + 4 : 0);
  const k1 = (Math.PI * 2) / 520;
  const k2 = (Math.PI * 2) / 300;
  const p1 = back ? 2.1 : 0;
  const p2 = back ? 0.6 : 1.3;
  const s = back ? -1 : 1;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const x = LEFT - PAD + ((W + PAD * 2) * i) / STEPS;
    xs.push(x);
    ys.push(
      base +
        (tilt * (x - MID)) / (W / 2) +
        amp * (0.62 * Math.sin(x * k1 - t * 1.2 * s + p1) + 0.38 * Math.sin(x * k2 + t * 1.7 + p2)),
    );
  }
  // A smooth curve through the points: each sample is a control point and the
  // curve passes through the midpoints between them, so there are no corners.
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(xs[0])} ${f(ys[0])}`;
  for (let i = 1; i < STEPS; i++) {
    d += `Q${f(xs[i])} ${f(ys[i])} ${f((xs[i] + xs[i + 1]) / 2)} ${f((ys[i] + ys[i + 1]) / 2)}`;
  }
  d += `L${f(xs[STEPS])} ${f(ys[STEPS])}`;
  return `${d}L${RIGHT + PAD} ${BOTTOM + PAD}L${LEFT - PAD} ${BOTTOM + PAD}Z`;
}

const START: Shape = { level: REST, tilt: 0, amp: RIPPLE, t: 0 };

export function Liquid404({ className }: { className?: string }) {
  const id = useId().replace(/[^\w-]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    if (!svg || !front || !back) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Follow the pointer only where there is one to follow.
    let follow = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let level = REST;
    let levelV = 0;
    let target = REST;
    let tilt = 0;
    let tiltV = 0;
    let swell = 0;
    let push = 0; // sideways speed of the pointer, fades out
    let lastX: number | null = null;
    let lastT = 0;
    let t = 0;
    let prev = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      follow = true;
      const r = svg.getBoundingClientRect();
      const scale = r.height / (H + PAD * 2);
      const top = r.top + PAD * scale;
      const bottom = r.bottom - PAD * scale;
      const f = (bottom - e.clientY) / (bottom - top);
      target = Math.min(MAX, Math.max(MIN, f));

      const now = e.timeStamp;
      if (lastX !== null && now > lastT) {
        const vx = ((e.clientX - lastX) / (now - lastT)) * 1000; // px per second
        push = Math.max(-1, Math.min(1, push + vx / 9000));
      }
      lastX = e.clientX;
      lastT = now;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1 / 20);
      prev = now;
      t += dt;

      if (!follow) target = REST + 0.07 * Math.sin(t * 0.5);

      // Level: a critically damped spring, so it glides to the pointer's height
      // and settles without bouncing past it.
      levelV += (20 * (target - level) - 8.6 * levelV) * dt;
      level += levelV * dt;

      // Tilt: sideways moves tip the surface a little, then it eases back to flat.
      push *= Math.exp(-dt * 2.5);
      tiltV += (9 * (push * 28 - tilt) - 4.8 * tiltV) * dt;
      tilt += tiltV * dt;

      // Movement builds a swell that eases in and out, never jumping.
      const want = Math.min(SWELL_MAX, Math.abs(levelV) * 28 + Math.abs(tiltV) * 0.18);
      swell += (want - swell) * (1 - Math.exp(-dt * (want > swell ? 3 : 1.2)));

      const shape = { level, tilt, amp: RIPPLE + swell, t };
      front.setAttribute("d", liquidPath(shape, false));
      back.setAttribute("d", liquidPath(shape, true));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const text = (
    <text
      x={DIGIT_X}
      y={0}
      fontSize={SIZE}
      fontWeight={800}
      style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}
    >
      404
    </text>
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`${LEFT - PAD} ${TOP - PAD} ${W + PAD * 2} ${H + PAD * 2}`}
      className={className}
      role="img"
      aria-label="404"
    >
      <defs>
        <clipPath id={`${id}-clip`}>{text}</clipPath>
        <linearGradient id={`${id}-fill`} x1="0" y1={TOP} x2="0" y2={BOTTOM} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--liquid-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--liquid-bottom)" }} />
        </linearGradient>
      </defs>
      {/* The empty glass: a faint 404, so the frame shows above the liquid. */}
      <g style={{ fill: "var(--liquid-glass)" }}>{text}</g>
      <g clipPath={`url(#${id}-clip)`}>
        <path ref={backRef} d={liquidPath(START, true)} style={{ fill: "var(--liquid-back)" }} />
        <path ref={frontRef} d={liquidPath(START, false)} fill={`url(#${id}-fill)`} />
      </g>
    </svg>
  );
}
