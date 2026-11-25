"use client";

/**
 * Liquid Orbit loader, from Impeccable.
 *
 * A drop of liquid floats inside a ring of the same liquid. Neither sits
 * still: the drop drifts around on its own and jiggles as it goes, the ring
 * bobs on a different beat and little bulges of liquid flow round it. Now
 * and then the ring turns over in 3D round the drop, passing behind it and
 * in front of it, then pulls apart into two shrinking streams, and the drop
 * fades away with it. Then the ring pours itself back in from the bottom,
 * a pool gathers there, and a new drop rises out of it on a stretchy neck,
 * lets go with a wobble and floats off again.
 *
 * No packages: one small SVG, moved by one requestAnimationFrame loop that
 * stops when the loader is off screen or the tab is hidden.
 */

import { useEffect, useId, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

export type LiquidOrbitLoaderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** How big it is, in px, 24 to 200. Default: 64. */
  size?: number;
  /** The text under it. Pass null to hide it. Default: "Loading". */
  label?: ReactNode;
  /** The liquid where the light hits it. Any CSS color, including var(--…). Default: the lightest violet. */
  color?: string;
  /** The liquid's deeper shade, its edges and the soft glow round the ring. Any CSS color. Default: a light violet. */
  glow?: string;
  /** 1 is the designed pace. 0.5 is half as fast, 2 twice as fast. Default: 1. */
  speed?: number;
};

/* ---------- the design: keep as written ---------- */

const R = 34; // the ring's radius, in a 100 x 100 box
const BAND = 4.2; // the ring's thickness, before its bulges
const BULGES = [
  [3, 0.26, 0.0021],
  [5, 0.14, -0.0033],
] as const; // liquid flowing round the ring: [how many bulges, how big, how fast]
const DROP_R = 13.5; // the drop's radius
const JIGGLE = [
  [2, 0.035, 0.0031],
  [3, 0.025, -0.0047],
] as const; // the drop's wobble at rest: [lobes, how big, how fast]
const SPLASH = 0.09; // the extra wobble just after the drop lets go
const DRIFT = [4.2, 3.4, 2300, 1700] as const; // the drop floats: [x reach, y reach, x period ms, y period ms]
const BOB = [1.3, 1.7, 2900, 2100] as const; // the ring bobs on its own beat
const HALO = [
  [10, 0.07],
  [6, 0.14],
] as const; // the soft glow round the ring: [width, opacity]
const HOLD_MS = 420; // the ring rests, face on
const TURN_MS = 1500; // the ring turns over round the drop, then pulls apart
const GAP_MS = 140; // a breath of nothing
const DRAW_MS = 480; // the ring pours back in from the bottom
const RISE_AT = 300; // the drop starts to rise this long into the pour
const RISE_MS = 1000; // the drop rises out of the pool and lets go
const TILT = 240; // how far the ring turns over, in degrees
const AXIS_FROM = -62; // the axis it turns on starts near upright...
const AXIS_TO = 0; // ...and lies flat by the time it pulls apart
const APART_AT = 0.45; // how far into the turn the ring starts to pull apart
const SLIDE = 1.4; // how far the two streams slide round as they shrink, in radians
const SNAP_AT = 0.55; // how far into the rise the neck lets go
const POOL = 2.6; // how much liquid gathers at the ring's bottom before the drop rises
const DEFAULT_COLOR = "#f3f0fe"; // the lightest shade of Impeccable's violet
const DEFAULT_GLOW = "#ad98f7"; // a light shade of the same violet

const RISE_FROM = HOLD_MS + TURN_MS + GAP_MS + RISE_AT;
const CYCLE = RISE_FROM + RISE_MS;
const SEGMENTS = 120; // the ring is drawn in this many short lines per full circle
const BLOB = 48; // the drop's outline points
const TAU = Math.PI * 2;
const DOWN = Math.PI / 2; // straight down, as an angle on screen

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
/** Slow at both ends, quick in the middle. */
const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const out = (t: number) => 1 - (1 - t) ** 3;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Rises past the end a touch, then settles. */
const outBack = (t: number) => {
  const c = 1.3;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
const f = (n: number) => n.toFixed(2);
const RAD = Math.PI / 180;
const wave = (t: number, period: number, phase = 0) => Math.sin((t / period) * TAU + phase);

type Arc = [center: number, halfWidth: number];
type Pt = [number, number];
type Frame = {
  t: number; // time, for the wobbles
  rx: number; // ring centre
  ry: number;
  tilt: number; // radians
  axis: number; // radians
  arcs: Arc[];
  ring: number; // ring opacity
  pool: number; // liquid gathered at the ring's bottom
  drop: number; // drop opacity
  hx: number; // drop centre
  hy: number;
  hr: number; // drop radius
  neck: number; // 1 = full neck, 0 = no neck
  base: number; // half width where the neck meets the ring
  tail: number; // the drop's tail after it lets go
  splash: number; // extra wobble after it lets go, fading
  ripple: number; // 0..1 while the drop fades
};

const FULL: Arc[] = [[DOWN, Math.PI]];

/** Everything about one moment (t in ms). The floating uses the running time, so it never repeats in step with the loop. */
function frameAt(time: number): Frame {
  const t = ((time % CYCLE) + CYCLE) % CYCLE;
  const rx = 50 + BOB[0] * wave(time, BOB[2]);
  const ry = 50 + BOB[1] * wave(time, BOB[3], 2);
  const fx = rx + DRIFT[0] * wave(time, DRIFT[2], 0.6);
  const fy = ry + DRIFT[1] * wave(time, DRIFT[3], 1.9);
  const rest: Frame = {
    t: time,
    rx,
    ry,
    tilt: 0,
    axis: AXIS_FROM * RAD,
    arcs: FULL,
    ring: 1,
    pool: 0,
    drop: 1,
    hx: fx,
    hy: fy,
    hr: DROP_R,
    neck: 0,
    base: 0,
    tail: 0,
    splash: 0,
    ripple: 0,
  };
  if (t < HOLD_MS) return rest;

  // 1. The ring turns over round the drop, then pulls apart. The drop fades with it.
  if (t < HOLD_MS + TURN_MS) {
    const p = (t - HOLD_MS) / TURN_MS;
    const e = inOut(p);
    const k = 1 - smooth(APART_AT, 1, p); // 1 = whole ring, 0 = gone
    const g = smooth(0.08, 0.92, k);
    return {
      ...rest,
      tilt: TILT * RAD * e,
      axis: (AXIS_FROM + (AXIS_TO - AXIS_FROM) * e) * RAD,
      arcs:
        k >= 1
          ? FULL
          : [
              [DOWN + SLIDE * (1 - k), (Math.PI / 2) * k],
              [DOWN + Math.PI + SLIDE * (1 - k), (Math.PI / 2) * k],
            ],
      ring: clamp01(k * 3),
      drop: g,
      hr: DROP_R * (0.55 + 0.45 * g),
      ripple: k < 1 ? 1 - k : 0,
    };
  }

  // 2. Nothing, for a breath.
  if (t < HOLD_MS + TURN_MS + GAP_MS) return { ...rest, axis: 0, arcs: [], ring: 0, drop: 0 };

  // 3. The ring pours back in from the bottom, face on, and liquid gathers there.
  const d = clamp01((t - HOLD_MS - TURN_MS - GAP_MS) / DRAW_MS);
  const ringNow = {
    tilt: 0,
    axis: 0,
    arcs: (d < 1 ? [[DOWN, Math.PI * out(d)]] : FULL) as Arc[],
    ring: clamp01(d * 4),
  };
  if (t < RISE_FROM) return { ...rest, ...ringNow, pool: POOL * smooth(0.2, 1, d), drop: 0 };

  // 4. A drop rises out of the pool on a neck, lets go with a wobble and floats off.
  const q = clamp01((t - RISE_FROM) / RISE_MS);
  const lift = outBack(clamp01(q / 0.82));
  const grow = out(clamp01(q / 0.7));
  const hr = DROP_R * (0.22 + 0.78 * grow);
  const bottom = ry + R - BAND * 0.45;
  const startY = bottom - hr * 0.5;
  const snapped = q >= SNAP_AT;
  const after = clamp01((q - SNAP_AT) / 0.25);
  return {
    ...rest,
    ...ringNow,
    pool: POOL * (1 - smooth(0, SNAP_AT + 0.1, q)),
    drop: smooth(0, 0.45, q),
    hx: rx + (fx - rx) * lift,
    hy: startY + (fy - startY) * lift,
    hr,
    neck: snapped ? 0 : 1 - q / SNAP_AT,
    base: 7.5 * (1 - q * 0.6),
    tail: snapped ? hr * 0.6 * (1 - out(after)) : 0,
    splash: snapped ? SPLASH * Math.exp(-((q - SNAP_AT) / 0.16)) : 0,
  };
}

/** A smooth outline through points (each corner rounded through the midpoints). */
function smoothPath(pts: Pt[], closed: boolean) {
  const n = pts.length;
  if (n < 3) return "";
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${f(m0[0])} ${f(m0[1])}`;
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])}`;
    }
    return `${d}Z`;
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < n - 1; i++) {
    const m = mid(pts[i], pts[i + 1]);
    d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}L${f(pts[n - 1][0])} ${f(pts[n - 1][1])}`;
}

/** The ring as a band of liquid: thicker where the bulges flow, tapering to points where it is open. */
function ringShape(fr: Frame) {
  const ca = Math.cos(fr.axis);
  const sa = Math.sin(fr.axis);
  const ct = Math.cos(fr.tilt);
  let band = "";
  let line = "";
  for (const [c, half] of fr.arcs) {
    if (half <= 0.002) continue;
    const closed = half >= Math.PI - 1e-6;
    const n = Math.max(6, Math.ceil((2 * half * SEGMENTS) / TAU));
    const mid: Pt[] = [];
    const w: number[] = [];
    for (let i = 0; i <= n; i++) {
      if (closed && i === n) break;
      const s = c - half + (2 * half * i) / n;
      const a = R * Math.cos(s);
      const b = R * Math.sin(s) * ct;
      mid.push([fr.rx + a * ca - b * sa, fr.ry + a * sa + b * ca]);
      let width = BAND;
      for (const [k, size, speed] of BULGES) width *= 1 + size * Math.sin(k * s + fr.t * speed);
      // Liquid gathers at the bottom before the drop rises out of it.
      const fromBottom = Math.atan2(Math.sin(s - DOWN), Math.cos(s - DOWN));
      width += fr.pool * Math.exp(-((fromBottom / 0.42) ** 2));
      if (!closed) {
        const toEnd = Math.min(i, n - i) * ((2 * half) / n);
        width *= 0.22 + 0.78 * smooth(0, 0.55, toEnd);
      }
      w.push(width);
    }
    const m = mid.length;
    const outer: Pt[] = [];
    const inner: Pt[] = [];
    for (let i = 0; i < m; i++) {
      const prev = mid[closed ? (i - 1 + m) % m : Math.max(0, i - 1)];
      const next = mid[closed ? (i + 1) % m : Math.min(m - 1, i + 1)];
      let nx = next[1] - prev[1];
      let ny = prev[0] - next[0];
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      const h = w[i] / 2;
      outer.push([mid[i][0] + nx * h, mid[i][1] + ny * h]);
      inner.push([mid[i][0] - nx * h, mid[i][1] - ny * h]);
    }
    if (closed) {
      band += smoothPath(outer, true) + smoothPath(inner.reverse(), true);
      line += smoothPath(mid, true);
    } else {
      band += `${smoothPath([...outer, ...inner.reverse()], true)}`;
      line += smoothPath(mid, false);
    }
  }
  return { band, line };
}

/** Which side of the ring faces you: a big box on that side of the axis, for drawing the front part over the drop. */
function frontBox(fr: Frame) {
  const tilt = Math.tan(fr.tilt);
  const a = fr.axis / RAD;
  if (Math.abs(Math.cos(fr.tilt)) < 0.05 || Math.abs(tilt) < 1e-4) return { y: -200, h: 400, a };
  // The side where the ring comes toward you.
  return tilt > 0 ? { y: 0, h: 200, a } : { y: -200, h: 200, a };
}

/** The core's width: none face on, a full tube edge on. */
const coreWidth = (fr: Frame) => BAND * 0.8 * smooth(0.55, 0.92, Math.abs(Math.sin(fr.tilt)));

/** The drop's outline: a jiggling round drop, a drop with a tail, or a drop still joined to the ring by a neck. */
function dropPath(fr: Frame) {
  const { hx, hy, hr } = fr;
  const amp = 1 + fr.splash / JIGGLE[0][1];
  const radius = (th: number) => {
    let r = hr;
    for (const [k, size, speed] of JIGGLE) r += hr * size * amp * Math.sin(k * th + fr.t * speed);
    return r;
  };
  const at = (th: number): Pt => {
    const r = radius(th);
    return [hx + r * Math.cos(th), hy + r * Math.sin(th)];
  };
  // Only the part of the outline from one side of the bottom, over the top, to the other side.
  const arc = (gap: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= BLOB; i++) pts.push(at(DOWN + gap + ((TAU - 2 * gap) * i) / BLOB));
    return pts;
  };
  const curve = (pts: Pt[]) => smoothPath(pts, false).replace(/^M/, "L");

  if (fr.neck > 0) {
    const bottom = fr.ry + R - BAND * 0.45;
    const bx = fr.rx;
    const pinch = 0.3 + 2.4 * fr.neck ** 1.3; // the neck thins as the drop pulls away
    const gap = Math.asin(Math.min(0.95, (pinch * 1.6) / hr));
    const pts = arc(gap);
    const [lx, ly] = pts[0];
    const [rx, ry] = pts[pts.length - 1];
    const mx = (bx + hx) / 2;
    const my = (bottom + Math.max(ly, ry)) / 2;
    const b = fr.base;
    return (
      `M${f(bx - b)} ${f(bottom + 0.6)}` +
      `C${f(bx - b * 0.3)} ${f(bottom - 0.5)} ${f(mx - pinch)} ${f(my + 2)} ${f(lx)} ${f(ly)}` +
      curve(pts) +
      `C${f(mx + pinch)} ${f(my + 2)} ${f(bx + b * 0.3)} ${f(bottom - 0.5)} ${f(bx + b)} ${f(bottom + 0.6)}Z`
    );
  }
  if (fr.tail > 0.05) {
    // A drop: round on top, easing into a soft point below as its tail pulls back in.
    const gap = 42 * RAD;
    const pts = arc(gap);
    const [lx, ly] = pts[0];
    const [rx, ry] = pts[pts.length - 1];
    const tip = hy + hr + fr.tail;
    const k = fr.tail * 0.55 + hr * 0.12;
    const dx = Math.cos(gap) * k;
    const dy = Math.sin(gap) * k;
    const round = hr * 0.14;
    return (
      `M${f(hx)} ${f(tip)}C${f(hx - round)} ${f(tip)} ${f(lx + dx)} ${f(ly + dy)} ${f(lx)} ${f(ly)}` +
      curve(pts) +
      `C${f(rx - dx)} ${f(ry + dy)} ${f(hx + round)} ${f(tip)} ${f(hx)} ${f(tip)}Z`
    );
  }
  const pts: Pt[] = [];
  for (let i = 0; i < BLOB; i++) pts.push(at((TAU * i) / BLOB));
  return smoothPath(pts, true);
}

/** What reduced motion and the first paint show: the ring and the drop at rest. */
const STILL = frameAt(0);

const CSS = `
.lorb { display: inline-flex; flex-direction: column; align-items: center; gap: 12px; max-width: 100%; --lorb-c: ${DEFAULT_COLOR}; --lorb-g: ${DEFAULT_GLOW}; }
.lorb-svg { display: block; overflow: visible; }
.lorb-halo { stroke: var(--lorb-g); fill: none; stroke-linecap: round; stroke-linejoin: round; }
.lorb-edge { stroke: var(--lorb-g); stroke-opacity: 0; }
.lorb-ripple { fill: none; stroke: var(--lorb-c); }
.lorb-c { stop-color: var(--lorb-c); }
.lorb-g { stop-color: var(--lorb-g); }
.lorb-w { stop-color: #fff; }
.lorb-label { font-size: 13px; line-height: 1.4; letter-spacing: 0.01em; color: color-mix(in srgb, currentColor 58%, transparent); text-align: center; max-width: 100%; overflow-wrap: anywhere; }
/* A light page: the lightest liquid would melt into white, so a thin violet edge holds its shape. */
.lorb[data-ink="dark"] .lorb-edge { stroke-opacity: 0.9; }
.lorb[data-ink="dark"] .lorb-ripple { stroke: var(--lorb-g); }
.lorb[data-ink="dark"] .lorb-halos { opacity: 0.5; }
@media (prefers-reduced-motion: reduce) {
  .lorb-halos { animation: lorb-breathe 2.4s ease-in-out infinite; }
}
@keyframes lorb-breathe { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }`;

/* ---------- the component ---------- */

export function LiquidOrbitLoader({
  size,
  label = "Loading",
  color,
  glow,
  speed,
  className,
  style,
  ...rest
}: LiquidOrbitLoaderProps) {
  const px = num(size, 64, 24, 200);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    drop: `lorb-drop-${uid}`,
    band: `lorb-band-${uid}`,
    shine: `lorb-shine-${uid}`,
    clip: `lorb-clip-${uid}`,
    front: `lorb-front-${uid}`,
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pace = useRef(1);
  pace.current = num(speed, 1, 0.25, 4);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const all = <T extends Element>(sel: string) => Array.from(svg.querySelectorAll<T>(sel));
    const bands = all<SVGPathElement>("[data-l='band']");
    const lines = all<SVGPathElement>("[data-l='line']");
    const cores = all<SVGPathElement>("[data-core]");
    const rings = all<SVGGElement>("[data-l='ring']");
    const drops = all<SVGPathElement>("[data-l='drop']");
    const drop = svg.querySelector<SVGGElement>("[data-l='drop-group']");
    const shine = svg.querySelector<SVGGElement>("[data-l='shine']");
    const ripple = svg.querySelector<SVGCircleElement>("[data-l='ripple']");
    const dropGrad = svg.querySelector<SVGRadialGradientElement>("[data-l='drop-grad']");
    const bandGrad = svg.querySelector<SVGLinearGradientElement>("[data-l='band-grad']");
    const box = svg.querySelector<SVGRectElement>("[data-l='front-box']");
    const over = svg.querySelector<SVGGElement>("[data-l='over']");
    if (!drop || !shine || !ripple || !dropGrad || !bandGrad || !box || !over) return;

    // On a light page the lightest liquid would melt into white, so a thin violet edge holds its shape.
    // Checked now and then from the text color around it, so it follows theme switches.
    let frames = 0;
    const readInk = () => {
      const m = getComputedStyle(root).color.match(/[\d.]+/g);
      if (!m) return;
      const [r, g, b] = m.map(Number);
      const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
      if (root.dataset.ink !== (dark ? "dark" : "light")) root.dataset.ink = dark ? "dark" : "light";
    };

    const draw = (time: number) => {
      if (frames++ % 20 === 0) readInk();
      const fr = frameAt(time);
      const { band, line } = ringShape(fr);
      bands.forEach((el) => el.setAttribute("d", band));
      lines.forEach((el) => el.setAttribute("d", line));
      cores.forEach((el) => el.setAttribute("stroke-width", f(coreWidth(fr))));
      rings.forEach((el) => el.setAttribute("opacity", f(fr.ring)));
      bandGrad.setAttribute("y1", f(fr.ry - R));
      bandGrad.setAttribute("y2", f(fr.ry + R));
      const fb = frontBox(fr);
      box.setAttribute("y", f(fb.y));
      box.setAttribute("height", f(fb.h));
      box.setAttribute("transform", `translate(${f(fr.rx)} ${f(fr.ry)}) rotate(${f(fb.a)})`);
      over.setAttribute("opacity", f(fr.drop));

      const d = dropPath(fr);
      drops.forEach((el) => el.setAttribute("d", d));
      drop.setAttribute("opacity", f(fr.drop));
      dropGrad.setAttribute("cx", f(fr.hx - fr.hr * 0.35));
      dropGrad.setAttribute("cy", f(fr.hy - fr.hr * 0.4));
      dropGrad.setAttribute("r", f(fr.hr * 1.55));
      shine.setAttribute("transform", `translate(${f(fr.hx)} ${f(fr.hy)}) scale(${f(fr.hr / DROP_R)})`);
      // As the drop fades, a faint ring of liquid spreads from its edge and fades.
      ripple.setAttribute("cx", f(fr.hx));
      ripple.setAttribute("cy", f(fr.hy));
      ripple.setAttribute("r", f(DROP_R * (1 + 0.9 * fr.ripple)));
      ripple.setAttribute("stroke-opacity", f(fr.ripple > 0 ? 0.42 * Math.sin(Math.PI * fr.ripple) : 0));
      ripple.setAttribute("stroke-width", f(0.9 * (1 - fr.ripple * 0.6)));
    };

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let t = 0;
    let last = 0;
    let raf = 0;
    let visible = true;

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;
      t += dt * pace.current;
      draw(t);
      if (visible && !document.hidden && !motion.matches) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (motion.matches) {
        // Reduced motion: the ring and the drop rest, and only the glow slowly breathes (in CSS).
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        t = 0;
        draw(0);
        return;
      }
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(root);
    const onVis = () => {
      last = 0;
      kick();
    };
    document.addEventListener("visibilitychange", onVis);
    motion.addEventListener?.("change", onVis);
    readInk();
    kick();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      motion.removeEventListener?.("change", onVis);
    };
  }, []);

  const first = ringShape(STILL);
  const firstDrop = dropPath(STILL);
  const firstBox = frontBox(STILL);
  const hasLabel = label != null && label !== false && label !== "";
  const ariaLabel = typeof label === "string" && label ? label : "Loading";
  const rootStyle = {
    ...style,
    ...(color ? { "--lorb-c": color } : null),
    ...(glow ? { "--lorb-g": glow } : null),
  } as CSSProperties;

  const ring = () => (
    <>
      {/* A rounded core under the band, so the ring stays a full tube while it is seen edge on. */}
      <path
        data-l="line"
        data-core=""
        d={first.line}
        fill="none"
        stroke={`url(#${ids.band})`}
        strokeWidth={f(coreWidth(STILL))}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-l="band"
        className="lorb-edge"
        d={first.band}
        fill={`url(#${ids.band})`}
        fillRule="evenodd"
        strokeWidth="0.6"
      />
    </>
  );

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label={ariaLabel}
      aria-busy="true"
      className={className ? `lorb ${className}` : "lorb"}
      style={rootStyle}
      {...rest}
    >
      <style>{CSS}</style>
      <svg ref={svgRef} className="lorb-svg" width={px} height={px} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          {/* Liquid: lit and light on top, deeper toward the bottom, like it has weight. */}
          <linearGradient
            id={ids.band}
            data-l="band-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={f(STILL.ry - R)}
            y2={f(STILL.ry + R)}
          >
            <stop className="lorb-c" offset="0" />
            <stop className="lorb-c" offset="0.45" />
            <stop className="lorb-g" offset="1" />
          </linearGradient>
          <radialGradient
            id={ids.drop}
            data-l="drop-grad"
            gradientUnits="userSpaceOnUse"
            cx={f(STILL.hx - STILL.hr * 0.35)}
            cy={f(STILL.hy - STILL.hr * 0.4)}
            r={f(STILL.hr * 1.55)}
          >
            <stop className="lorb-c" offset="0" />
            <stop className="lorb-c" offset="0.42" />
            <stop className="lorb-g" offset="1" />
          </radialGradient>
          <radialGradient id={ids.shine} cx="0.5" cy="0.5" r="0.5">
            <stop className="lorb-w" offset="0" stopOpacity="0.95" />
            <stop className="lorb-w" offset="1" stopOpacity="0" />
          </radialGradient>
          <clipPath id={ids.clip}>
            <path data-l="drop" d={firstDrop} />
          </clipPath>
          <clipPath id={ids.front}>
            <rect
              data-l="front-box"
              x="-200"
              y={firstBox.y}
              width="400"
              height={firstBox.h}
              transform={`translate(${f(STILL.rx)} ${f(STILL.ry)}) rotate(${f(firstBox.a)})`}
            />
          </clipPath>
        </defs>

        {/* The ring's soft glow, then the ring. The drop hides the part behind it. */}
        <g data-l="ring">
          <g className="lorb-halos">
            {HALO.map(([w, o], k) => (
              <path key={k} data-l="line" className="lorb-halo" d={first.line} strokeWidth={w} strokeOpacity={o} />
            ))}
          </g>
        </g>
        <g data-l="ring">{ring()}</g>

        {/* The drop. */}
        <circle data-l="ripple" className="lorb-ripple" cx={f(STILL.hx)} cy={f(STILL.hy)} r={DROP_R} strokeOpacity="0" />
        <g data-l="drop-group">
          <path data-l="drop" className="lorb-edge" d={firstDrop} fill={`url(#${ids.drop})`} strokeWidth="0.6" />
          <g data-l="shine" transform={`translate(${f(STILL.hx)} ${f(STILL.hy)})`}>
            {/* A soft window of light on top, a sharp glint, and light bounced up into its bottom. */}
            <ellipse
              cx={f(-DROP_R * 0.32)}
              cy={f(-DROP_R * 0.42)}
              rx={f(DROP_R * 0.42)}
              ry={f(DROP_R * 0.22)}
              transform={`rotate(-34 ${f(-DROP_R * 0.32)} ${f(-DROP_R * 0.42)})`}
              fill={`url(#${ids.shine})`}
            />
            <circle cx={f(-DROP_R * 0.42)} cy={f(-DROP_R * 0.5)} r={f(DROP_R * 0.08)} fill="#fff" fillOpacity="0.95" />
            <path
              d={`M${f(-DROP_R * 0.5)} ${f(DROP_R * 0.62)}Q0 ${f(DROP_R * 0.86)} ${f(DROP_R * 0.5)} ${f(DROP_R * 0.62)}`}
              fill="none"
              stroke="#fff"
              strokeOpacity="0.45"
              strokeWidth={f(DROP_R * 0.07)}
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* The part of the ring in front of the drop, drawn again over it. */}
        <g data-l="over" clipPath={`url(#${ids.clip})`}>
          <g clipPath={`url(#${ids.front})`}>
            <g data-l="ring">{ring()}</g>
          </g>
        </g>
      </svg>
      {hasLabel ? (
        <span className="lorb-label" aria-hidden="true">
          {label}
        </span>
      ) : null}
    </div>
  );
}
