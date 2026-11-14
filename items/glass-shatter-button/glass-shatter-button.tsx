"use client";

/**
 * Glass-Shatter-button, from Impeccable.
 *
 * A solid pill wrapped in a thin ring of glass. Only the ring is glass: the
 * middle stays a plain button with a sharp label. As the pointer comes near,
 * the part of the ring closest to it catches the light, and the closer the
 * pointer gets the brighter and wider that light grows. Click it and the ring
 * cracks from the exact spot you pressed, bursts into shards that scatter
 * outward, hangs for a breath, then pulls back together and seals with a soft
 * line of light running around it. The button works the whole time: the click
 * goes through straight away.
 *
 * Phones have no hover, so pressing lights the ring under your finger and the
 * tap shatters it. The keyboard shatters it from the top centre.
 *
 * No packages: one canvas around the button, and one requestAnimationFrame
 * loop that only runs while something changes.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, type ButtonHTMLAttributes, type CSSProperties } from "react";

export type GlassShatterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The fill of the solid middle. Any CSS color, including var(--…). Default: near-black. */
  color?: string;
  /** The label color. Default: black or white, whichever reads best on the fill. */
  textColor?: string;
  /** The glass tint and its edges. Default: the text color around the button, so it suits light and dark pages. */
  glassColor?: string;
  /** The light the glass catches near the pointer. Default: a soft violet that reads in light and dark mode. */
  glowColor?: string;
  /** How far in px from the button the glass starts to glow, 40 to 240. */
  range?: number;
  /** How thick the glass ring is in px, 4 to 12. */
  ring?: number;
};

/* ---------- tuning (the design: keep as written) ---------- */

const OVER = 88; // px of room around the button where shards may fly
const TINT = 0.1; // how strong the glass tint is
const EDGE = 0.24; // how strong the glass's outer edge line is
const SHINE = 0.55; // the white shine along the glass's top edge
const GLOW_IN_MS = 90; // how fast the glow rises as the pointer comes closer
const GLOW_OUT_MS = 280; // how fast it fades as the pointer goes away
const GLOW_CURVE = 1.8; // > 1: the glow grows faster the closer the pointer gets
const CRACK_MS = 90; // cracks run out from the impact before the glass bursts
const BURST_MS = 520; // shards fly out, fast then slowing like in air
const HANG_MS = 80; // shards hang, drifting, before they come back
const RETURN_MS = 540; // shards pull back into place
const RIPPLE = 0.22; // ms per px of ring: shards near the impact go first and come back last
const SEAL_MS = 320; // light runs around the ring as the glass seals
const FLY = 52; // px the farthest shard flies
const SPIN = 2.2; // radians the fastest shard turns
const DROP = 10; // px shards sink while in the air
const CUT_MIN = 5; // px between cracks at the impact (small shards)
const CUT_MAX = 22; // px between cracks far from it (bigger shards)

/** Styles that can't be inline: sizing, press, focus, disabled and reduced motion. */
const CSS = `
.gsb { position: relative; display: inline-flex; min-width: 0; max-width: 100%; padding: var(--gsb-ring, 6px); border: 0; border-radius: var(--gsb-radius, 999px); background: transparent; color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; isolation: isolate; }
.gsb-glass { position: absolute; left: 0; top: -${OVER}px; width: 100%; height: calc(100% + ${OVER * 2}px); pointer-events: none; color: var(--gsb-glass, currentColor); }
.gsb-glow { position: absolute; width: 0; height: 0; color: var(--gsb-glow, color-mix(in oklab, rgb(150 120 255) 82%, currentColor)); }
.gsb-face { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; min-width: 0; height: 44px; padding: 0 22px; border-radius: max(0px, calc(var(--gsb-radius, 999px) - var(--gsb-ring, 6px))); background: var(--gsb-fill, rgb(12 12 14)); box-shadow: inset 0 1px 0 rgb(255 255 255 / .1), 0 1px 2px rgb(0 0 0 / .18); transition: scale .18s cubic-bezier(.23,1,.32,1); }
.gsb-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--gsb-text, var(--gsb-auto-text, rgb(255 255 255))); }
.gsb:active:not(:disabled) .gsb-face { scale: .97; }
.gsb:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.gsb:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .gsb-face { transition: none; } .gsb:active:not(:disabled) .gsb-face { scale: 1; } }`;

/* ---------- small helpers ---------- */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
const outCubic = (t: number) => 1 - (1 - t) ** 3;
/** Starts slow, pulls in, and settles with a small overshoot, like glass snapping back into its frame. */
const snapBack = (t: number) => {
  const c = 1.37;
  return t < 0.5
    ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
    : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
};

/** A rounded rectangle path, drawn by hand so older Safari works too. */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** True when a color reads as light, worked out by painting it, so any CSS color format works. */
let probe: CanvasRenderingContext2D | null = null;
function isLight(color: string) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return false;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
}

/** The same color with no opacity, so gradients fade out in that color and not through gray. */
const clearCache = new Map<string, string>();
function clearOf(color: string) {
  let c = clearCache.get(color);
  if (c) return c;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return "transparent";
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  c = `rgb(${r} ${g} ${b} / 0)`;
  if (clearCache.size > 32) clearCache.clear();
  clearCache.set(color, c);
  return c;
}

/** A steady random number from 0 to 1. */
function rand(i: number, k: number) {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** One point on the middle line of the ring: where it is and which way is out. */
type RingPt = { x: number; y: number; nx: number; ny: number };
type Pose = { x: number; y: number; r: number };
type Shard = {
  pts: number[]; // the shard's corners, relative to its centre
  cx: number; cy: number; // its centre when whole
  ny: number; // which way it faced when whole (up = negative), for its shine
  seed: number;
  delay: number; // ms after the impact before it moves (ripple)
  from: Pose; to: Pose; // where it bursts from and to
};
type Crack = { x1: number; y1: number; x2: number; y2: number; at: number };

/* ---------- the button ---------- */

export const GlassShatterButton = forwardRef<HTMLButtonElement, GlassShatterButtonProps>(function GlassShatterButton(
  { color, textColor, glassColor, glowColor, range = 120, ring = 6, type = "button", className, style, children, ...rest },
  ref,
) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => btnRef.current!, []);

  const ringPx = Math.round(num(ring, 6, 4, 12));

  // Props the running loop reads without restarting it.
  const opts = useRef({ range: 120, ring: 6, disabled: false });
  opts.current = { range: num(range, 120, 40, 240), ring: ringPx, disabled: !!rest.disabled };
  // Draws the glass again when a prop changes while it is on screen.
  const redrawRef = useRef<() => void>(() => {});
  useEffect(() => redrawRef.current(), [ringPx, range, rest.disabled, color, glassColor, glowColor]);

  // The label picks black or white on the fill, and checks again when the theme changes.
  useEffect(() => {
    const face = faceRef.current;
    if (!face) return;
    const apply = () =>
      face.style.setProperty("--gsb-auto-text", isLight(getComputedStyle(face).backgroundColor) ? "rgb(10 10 10)" : "rgb(255 255 255)");
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, [color]);

  useEffect(() => {
    const btn = btnRef.current, face = faceRef.current, canvas = canvasRef.current, glowEl = glowRef.current;
    if (!btn || !face || !canvas || !glowEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;

    let cw = 0, ch = 0, dpr = 1, rad = 0, rw = 0; // button size, radius and ring width the path was built for
    let padL = -1, padR = -1; // how far the canvas reaches past the button on the left and right
    let line: RingPt[] = []; // the ring's middle line, one point per px
    let raf = 0, last = 0;
    let glow = 0; // 0 to 1, eased
    let near = false; // pointer is on screen and not a finger
    let pressed = false; // a finger is down on it
    const P = { x: -1e4, y: -1e4 }; // the pointer, in the button's own px (client, so it is fresh on scroll)
    let client = { x: -1e4, y: -1e4 };

    // The shatter. `t0` is when the impact happened; null when the glass is whole.
    let t0: number | null = null;
    let shards: Shard[] = [];
    let cracks: Crack[] = [];
    let impact = { x: 0, y: 0, s: 0 };
    let span = 0; // ms from impact until the last shard is back
    let maxDelay = 0; // ms the ripple takes to reach the far side
    let hitAt = 0; // when the last click landed, for its flash

    const size = () => {
      const w = btn.offsetWidth, h = btn.offsetHeight;
      const r = Math.min(parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0, w / 2, h / 2);
      const k = opts.current.ring;
      if (w === cw && h === ch && r === rad && k === rw && line.length) return;
      cw = w; ch = h; rad = r; rw = k;
      // Walk the ring's middle line (inset by half the ring) and keep one point per px.
      const ins = k / 2, x0 = ins, y0 = ins, W = w - k, H = h - k, R = Math.max(0, r - ins);
      const segs: ((t: number) => RingPt)[] = [];
      const lens: number[] = [];
      const straight = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) => {
        segs.push((t) => ({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t, nx, ny }));
        lens.push(Math.hypot(bx - ax, by - ay));
      };
      const corner = (cx: number, cy: number, a0: number) => {
        segs.push((t) => {
          const a = a0 + (Math.PI / 2) * t;
          return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, nx: Math.cos(a), ny: Math.sin(a) };
        });
        lens.push((Math.PI / 2) * R);
      };
      straight(x0 + R, y0, x0 + W - R, y0, 0, -1);
      corner(x0 + W - R, y0 + R, -Math.PI / 2);
      straight(x0 + W, y0 + R, x0 + W, y0 + H - R, 1, 0);
      corner(x0 + W - R, y0 + H - R, 0);
      straight(x0 + W - R, y0 + H, x0 + R, y0 + H, 0, 1);
      corner(x0 + R, y0 + H - R, Math.PI / 2);
      straight(x0, y0 + H - R, x0, y0 + R, -1, 0);
      corner(x0 + R, y0 + R, Math.PI);
      const total = lens.reduce((a, b) => a + b, 0);
      const n = Math.max(8, Math.round(total));
      line = [];
      let si = 0, acc = 0;
      for (let i = 0; i < n; i++) {
        const d = (i / n) * total;
        while (si < lens.length - 1 && d > acc + lens[si]) acc += lens[si++];
        line.push(segs[si](lens[si] ? (d - acc) / lens[si] : 0));
      }
    };
    /** The point on the ring's middle line at arc position `s`, wrapping round. */
    const at = (s: number) => line[((Math.round(s) % line.length) + line.length) % line.length];
    /** The arc position on the ring nearest to a point. */
    const nearestS = (x: number, y: number) => {
      let best = 0, bd = Infinity;
      for (let i = 0; i < line.length; i += 2) {
        const d = (line[i].x - x) ** 2 + (line[i].y - y) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    };

    const local = (cx: number, cy: number) => {
      const r = btn.getBoundingClientRect();
      const sx = btn.offsetWidth ? r.width / btn.offsetWidth || 1 : 1;
      const sy = btn.offsetHeight ? r.height / btn.offsetHeight || 1 : 1;
      return { x: (cx - r.left) / sx, y: (cy - r.top) / sy };
    };

    /** How close the pointer is, 0 (out of range) to 1 (on the button), and the spot on the ring nearest to it. */
    const sense = () => {
      if (opts.current.disabled || (!near && !pressed)) return { p: 0, s: 0 };
      // Distance from the pointer to the button's rounded outline (0 inside).
      const R = rad, qx = clamp(P.x, R, cw - R), qy = clamp(P.y, R, ch - R);
      const out = Math.max(0, Math.hypot(P.x - qx, P.y - qy) - R);
      const p = pressed ? 1 : clamp(1 - out / opts.current.range, 0, 1) ** GLOW_CURVE;
      return { p, s: p > 0 ? nearestS(P.x, P.y) : 0 };
    };

    /** Break the ring into shards around the impact. */
    const shatter = (x: number, y: number, now: number) => {
      size();
      const L = line.length, k = rw, half = L / 2;
      const s0 = nearestS(x, y);
      // Still in pieces from the last click? Blast the shards again from where they are, with no new cracks.
      const whole = t0 === null || now - t0 >= span || reduced;
      const poses = whole ? null : shards.map((sh) => pose(sh, now));
      impact = { x, y, s: s0 };
      hitAt = now;
      t0 = whole ? now : now - CRACK_MS;
      if (reduced) {
        maxDelay = 0;
        span = 0;
        cracks = [];
      }
      if (whole) {
        // Cut positions along the ring: close together at the impact, further apart away from it.
        const cuts: number[] = [];
        let d = 0, i = 0;
        while (d < half) {
          cuts.push(d);
          const f = d / half;
          d += CUT_MIN + (CUT_MAX - CUT_MIN) * f * f * (3 - 2 * f) + rand(i++, 3) * 4;
        }
        const arc = [...cuts.slice(1).map((c) => -c).reverse(), ...cuts.filter((c) => c < half - CUT_MIN)];
        // Every cut is slanted a little, differently on the outer and inner edge, so the glass looks broken, not sliced.
        const cutAt = arc.map((c, j) => ({ c, a: (rand(j, 7) - 0.5) * 6, b: (rand(j, 11) - 0.5) * 6 }));
        shards = [];
        cracks = [];
        const edge = (s: number, side: 1 | -1) => {
          const q = at(s0 + s);
          return [q.x + q.nx * (k / 2 + 0.5) * side, q.y + q.ny * (k / 2 + 0.5) * side];
        };
        const crack = (x1: number, y1: number, x2: number, y2: number, s: number) =>
          cracks.push({ x1, y1, x2, y2, at: Math.abs(s) * RIPPLE * 0.4 });
        const make = (poly: number[], ny: number, j: number) => {
          let cx = 0, cy = 0;
          for (let m = 0; m < poly.length; m += 2) { cx += poly[m]; cy += poly[m + 1]; }
          cx /= poly.length / 2;
          cy /= poly.length / 2;
          const pts = poly.map((v, m) => v - (m % 2 ? cy : cx));
          shards.push({ pts, cx, cy, ny, seed: rand(j, 19), delay: 0, from: { x: 0, y: 0, r: 0 }, to: { x: 0, y: 0, r: 0 } });
        };
        for (let j = 0; j < cutAt.length; j++) {
          const A = cutAt[j], B = cutAt[(j + 1) % cutAt.length];
          const sa = A.c;
          const sb = j === cutAt.length - 1 ? cutAt[0].c + L : B.c; // the last piece closes the ring
          const oa = sa + A.a, ob = sb + B.a, ia = sa + A.b, ib = sb + B.b;
          const outer: number[] = [], inner: number[] = [];
          const nO = Math.max(1, Math.ceil(Math.abs(ob - oa) / 3)), nI = Math.max(1, Math.ceil(Math.abs(ib - ia) / 3));
          for (let m = 0; m <= nO; m++) outer.push(...edge(oa + ((ob - oa) * m) / nO, 1));
          for (let m = nI; m >= 0; m--) inner.push(...edge(ia + ((ib - ia) * m) / nI, -1));
          // outer runs a to b, inner runs b back to a.
          const [oax, oay] = outer, [obx, oby] = outer.slice(-2), [ibx, iby] = inner, [iax, iay] = inner.slice(-2);
          const mid = at(s0 + (sa + sb) / 2);
          crack(oax, oay, iax, iay, sa);
          // Longer pieces split along a diagonal into two triangles, like real broken glass.
          if (sb - sa > 9 && rand(j, 23) > 0.25) {
            if (rand(j, 29) > 0.5) {
              make([...outer, ibx, iby], mid.ny, j * 2);
              make([...inner, oax, oay], mid.ny, j * 2 + 1);
              crack(oax, oay, ibx, iby, sa);
            } else {
              make([...outer, iax, iay], mid.ny, j * 2);
              make([obx, oby, ...inner], mid.ny, j * 2 + 1);
              crack(obx, oby, iax, iay, sa);
            }
          } else make([...outer, ...inner], mid.ny, j * 2);
        }
      }
      if (reduced) return wake();
      // Where each shard flies: away from the impact and out from the button. Shards near the impact fly further and spin more.
      maxDelay = 0;
      shards.forEach((sh, j) => {
        const si = nearestS(sh.cx, sh.cy);
        const q = at(si);
        const dl = Math.hypot(sh.cx - x, sh.cy - y) || 1;
        const dx = ((sh.cx - x) / dl) * 0.5 + q.nx * 0.5, dy = ((sh.cy - y) / dl) * 0.5 + q.ny * 0.5;
        const n = Math.hypot(dx, dy) || 1;
        const sDist = Math.min(Math.abs(si - s0), L - Math.abs(si - s0));
        const close = 1 - sDist / half;
        const fly = FLY * (0.35 + 0.65 * close) * (0.6 + 0.4 * rand(j, 31));
        sh.delay = whole ? sDist * RIPPLE : 0;
        maxDelay = Math.max(maxDelay, sh.delay);
        sh.from = poses ? poses[j] : { x: 0, y: 0, r: 0 };
        // Hit again while in the air: still never further than the room around the button.
        let tx = sh.from.x + (dx / n) * fly, ty = sh.from.y + (dy / n) * fly;
        const far = Math.hypot(tx, ty), cap = FLY * 1.25;
        if (far > cap) { tx *= cap / far; ty *= cap / far; }
        sh.to = { x: tx, y: ty, r: sh.from.r + (rand(j, 37) - 0.5) * 2 * SPIN * (0.4 + 0.6 * close) };
      });
      span = CRACK_MS + BURST_MS + HANG_MS + maxDelay * 2 + RETURN_MS;
      // The middle takes a small knock, so the hit is felt.
      face.animate?.([{ transform: "scale(1)" }, { transform: "scale(.965)", offset: 0.22 }, { transform: "scale(1)" }], {
        duration: 420,
        easing: "cubic-bezier(.23,1,.32,1)",
      });
      wake();
    };

    /** Where a shard is at `now`: bursting out, hanging, or coming back (far ones first, the impact last). */
    function pose(sh: Shard, now: number): Pose {
      if (t0 === null) return { x: 0, y: 0, r: 0 };
      const t = now - t0 - CRACK_MS;
      const backAt = BURST_MS + HANG_MS + maxDelay * 2 - sh.delay;
      const air = Math.min(t, backAt) - sh.delay; // time in the air, frozen once it starts back
      const out = clamp(air / BURST_MS, 0, 1);
      // Out fast then slowing like in air, drifting a little further while it hangs, sinking slightly.
      const k = outCubic(out) + 0.05 * clamp((air - BURST_MS) / (HANG_MS + maxDelay * 2), 0, 1);
      const hx = sh.from.x + (sh.to.x - sh.from.x) * k;
      const hy = sh.from.y + (sh.to.y - sh.from.y) * k + DROP * out * out;
      const hr = sh.from.r + (sh.to.r - sh.from.r) * k;
      const b = 1 - snapBack(clamp((t - backAt) / RETURN_MS, 0, 1));
      return { x: hx * b, y: hy * b, r: hr * b };
    }

    const draw = (now: number, g: number, gs: number) => {
      // Left the page mid-shatter, or hidden: nothing to draw on.
      if (!btn.isConnected || !btn.offsetWidth) return;
      // Colors are read from the page on every frame, so they follow light and dark mode.
      const glass = getComputedStyle(canvas).color;
      const light = getComputedStyle(glowEl).color;
      if (!glass || !light) return;
      size();
      const nd = Math.min(2, devicePixelRatio || 1);
      // Room for shards on the left and right, but never past the screen's edge, so the page can't scroll sideways.
      const box = btn.getBoundingClientRect();
      const sc = box.width / cw || 1;
      const vw = document.documentElement.clientWidth;
      const oL = Math.round(clamp(box.left / sc, 0, OVER)), oR = Math.round(clamp((vw - box.right) / sc, 0, OVER));
      if (oL !== padL || oR !== padR || canvas.style.width !== `${cw + oL + oR}px`) {
        padL = oL;
        padR = oR;
        canvas.style.left = `${-oL}px`;
        canvas.style.width = `${cw + oL + oR}px`;
      }
      const W = cw + oL + oR, H = ch + OVER * 2;
      if (canvas.width !== Math.round(W * nd) || canvas.height !== Math.round(H * nd) || nd !== dpr) {
        dpr = nd;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.translate(oL, OVER);

      const lightClear = clearOf(light);
      const k = rw, R = rad;
      const age = t0 === null ? Infinity : now - t0;
      const broken = !reduced && age >= CRACK_MS && age < span; // shards are out (the first moments show cracks on the whole ring)
      const crackA = t0 === null ? 0 : reduced
        ? (age < 120 ? age / 120 : clamp(1 - (age - 420) / 300, 0, 1))
        : age < span ? clamp(age / CRACK_MS, 0, 1) : clamp(1 - (age - span) / SEAL_MS, 0, 1);

      const ringPath = () => {
        ctx.beginPath();
        rr(ctx, 0, 0, cw, ch, R);
        rr(ctx, k, k, cw - 2 * k, ch - 2 * k, Math.max(0, R - k));
      };
      const gp = at(gs);
      const glowFill = (alpha: number, radius: number) => {
        const grd = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, radius);
        grd.addColorStop(0, light);
        grd.addColorStop(1, lightClear);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grd;
      };

      if (!broken) {
        // 1. The whole ring: a faint tint, a top shine, edge lines.
        ringPath();
        ctx.fillStyle = glass;
        ctx.globalAlpha = TINT;
        ctx.fill("evenodd");
        const shine = ctx.createLinearGradient(0, 0, 0, ch);
        shine.addColorStop(0, "rgb(255 255 255 / .55)");
        shine.addColorStop(0.45, "rgb(255 255 255 / 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = shine;
        ctx.fill("evenodd");
        ctx.lineWidth = 1;
        ctx.globalAlpha = EDGE;
        ctx.strokeStyle = glass;
        ctx.beginPath();
        rr(ctx, 0.5, 0.5, cw - 1, ch - 1, R - 0.5);
        ctx.stroke();
        ctx.globalAlpha = EDGE * 0.6;
        ctx.beginPath();
        rr(ctx, k - 0.5, k - 0.5, cw - 2 * k + 1, ch - 2 * k + 1, Math.max(0, R - k + 0.5));
        ctx.stroke();
        // A glint along the top left, where the light lands.
        const glint = ctx.createLinearGradient(R * 0.4, 0, R + cw * 0.3, 0);
        glint.addColorStop(0, "rgb(255 255 255 / 0)");
        glint.addColorStop(0.35, `rgb(255 255 255 / ${SHINE})`);
        glint.addColorStop(1, "rgb(255 255 255 / 0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = glint;
        ctx.beginPath();
        rr(ctx, 1.5, 1.5, cw - 3, ch - 3, R - 1.5);
        ctx.stroke();

        // 2. The glow: the glass nearest the pointer catches the light, more as it comes closer.
        if (g > 0.002) {
          const radius = 16 + 52 * g;
          ctx.save();
          ringPath();
          ctx.clip("evenodd");
          glowFill(0.8 * g, radius);
          ctx.fillRect(-OVER, -OVER, cw + OVER * 2, ch + OVER * 2);
          ctx.restore();
          // Edges light up brightest, like light running along cut glass.
          ctx.save();
          glowFill(Math.min(1, 1.2 * g), radius * 1.1);
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          rr(ctx, 0.6, 0.6, cw - 1.2, ch - 1.2, R - 0.6);
          ctx.stroke();
          ctx.beginPath();
          rr(ctx, k - 0.6, k - 0.6, cw - 2 * k + 1.2, ch - 2 * k + 1.2, Math.max(0, R - k + 0.6));
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // 3. The shards: same glass, each with its own shine that flickers as it turns.
        ctx.lineJoin = "round";
        for (const sh of shards) {
          const ps = pose(sh, now);
          const x = sh.cx + ps.x, y = sh.cy + ps.y;
          const c = Math.cos(ps.r), s = Math.sin(ps.r);
          ctx.beginPath();
          for (let m = 0; m < sh.pts.length; m += 2) {
            const px = x + sh.pts[m] * c - sh.pts[m + 1] * s, py = y + sh.pts[m] * s + sh.pts[m + 1] * c;
            if (m) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = glass;
          ctx.globalAlpha = TINT * 1.6;
          ctx.fill();
          ctx.fillStyle = "rgb(255 255 255)";
          ctx.globalAlpha = 0.22 * clamp(-sh.ny, 0, 1) + 0.04;
          ctx.fill();
          const flick = Math.max(0, Math.sin(ps.r * 2.4 + sh.seed * 6.28)) ** 3;
          const lit = g > 0 ? Math.max(0, 1 - Math.hypot(x - P.x, y - P.y) / (40 + 60 * g)) * g : 0;
          if (flick + lit > 0.02) {
            ctx.fillStyle = light;
            ctx.globalAlpha = clamp(0.4 * flick + 0.6 * lit, 0, 0.8);
            ctx.fill();
          }
          ctx.strokeStyle = glass;
          ctx.globalAlpha = EDGE * 1.4;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // 4. Cracks: they run out from the impact, and fade as the glass seals.
      if (!broken && crackA > 0.01 && cracks.length) {
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = glass;
        const grown = reduced ? Infinity : age;
        ctx.beginPath();
        for (const c of cracks) if (c.at <= grown) { ctx.moveTo(c.x1, c.y1); ctx.lineTo(c.x2, c.y2); }
        ctx.globalAlpha = 0.5 * crackA;
        ctx.stroke();
      }

      // 5. The impact flash and the seal: light at the impact, then running both ways round the ring.
      if (t0 !== null) {
        const flash = clamp(1 - (now - hitAt) / 260, 0, 1);
        if (flash > 0) {
          // The flash stays inside the glass too: nothing glows outside the border.
          ctx.save();
          ringPath();
          ctx.clip("evenodd");
          const grd = ctx.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, 26 + 30 * (1 - flash));
          grd.addColorStop(0, light);
          grd.addColorStop(1, lightClear);
          ctx.globalAlpha = 0.7 * flash * flash;
          ctx.fillStyle = grd;
          ctx.fillRect(impact.x - 60, impact.y - 60, 120, 120);
          ctx.restore();
        }
        const sealT = reduced ? -1 : (age - span) / SEAL_MS;
        if (sealT >= 0 && sealT <= 1) {
          ctx.save();
          ringPath();
          ctx.clip("evenodd");
          const L = line.length;
          for (const dir of [1, -1]) {
            const q = at(impact.s + dir * (L / 2) * outCubic(sealT));
            const grd = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 22);
            grd.addColorStop(0, light);
            grd.addColorStop(1, lightClear);
            ctx.globalAlpha = 0.9 * (1 - sealT);
            ctx.fillStyle = grd;
            ctx.fillRect(q.x - 24, q.y - 24, 48, 48);
          }
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    let lastG = -1, lastS = -1;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      if (near) Object.assign(P, local(client.x, client.y));
      const { p, s } = sense();
      glow += (p - glow) * (1 - Math.exp(-dt / (p > glow ? GLOW_IN_MS : GLOW_OUT_MS)));
      if (Math.abs(p - glow) < 0.004) glow = p;
      const gs = p > 0 ? s : lastS < 0 ? s : lastS; // the light fades where it was
      const age = t0 === null ? Infinity : now - t0;
      const animating = age < (reduced ? 720 : span + SEAL_MS);
      if (!animating && t0 !== null) { t0 = null; shards = []; cracks = []; }
      // Draw only when something on screen changed.
      if (animating || Math.abs(glow - lastG) > 0.001 || gs !== lastS || lastG < 0) {
        draw(now, glow, gs);
        lastG = glow;
        lastS = gs;
      }
      if (animating || glow !== p) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const redraw = () => {
      lastG = -1;
      wake();
    };

    // The pointer is watched on the whole page, so the glass can feel it coming. Only while the button is on screen.
    let onScreen = false;
    const onPageMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      near = true;
      client = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onPageLeave = () => {
      near = false;
      wake();
    };
    const onScroll = () => near && wake();
    const listen = (on: boolean) => {
      if (on === onScreen) return;
      onScreen = on;
      if (on) {
        window.addEventListener("pointermove", onPageMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPageLeave);
        window.addEventListener("blur", onPageLeave);
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
      } else {
        window.removeEventListener("pointermove", onPageMove);
        document.documentElement.removeEventListener("pointerleave", onPageLeave);
        window.removeEventListener("blur", onPageLeave);
        window.removeEventListener("scroll", onScroll, { capture: true });
        near = false;
      }
    };
    const io = new IntersectionObserver(([en]) => listen(en.isIntersecting), { rootMargin: "240px" });
    io.observe(btn);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || opts.current.disabled) return;
      const pt = local(e.clientX, e.clientY);
      if (e.pointerType === "touch") {
        pressed = true;
        Object.assign(P, pt);
      }
      shatter(pt.x, pt.y, performance.now());
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        pressed = false;
        wake();
      }
    };
    // Enter or Space on the keyboard: the glass breaks from the top centre.
    const onClick = (e: MouseEvent) => {
      if (e.detail === 0 && !opts.current.disabled) shatter(btn.offsetWidth / 2, 0, performance.now());
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else redraw();
    };
    const onReduce = () => {
      reduced = reduceMq.matches;
      redraw();
    };
    // Theme or size changes: draw the glass again.
    const ro = new ResizeObserver(redraw);
    ro.observe(btn);
    window.addEventListener("resize", redraw);
    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });

    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("pointercancel", onUp);
    btn.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVis);
    reduceMq.addEventListener("change", onReduce);
    redrawRef.current = redraw;
    redraw();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      redrawRef.current = () => {};
      listen(false);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", redraw);
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("pointercancel", onUp);
      btn.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVis);
      reduceMq.removeEventListener("change", onReduce);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `gsb ${className}` : "gsb"}
        style={
          {
            "--gsb-ring": `${ringPx}px`,
            ...(color ? { "--gsb-fill": color } : null),
            ...(textColor ? { "--gsb-text": textColor } : null),
            ...(glassColor ? { "--gsb-glass": glassColor } : null),
            ...(glowColor ? { "--gsb-glow": glowColor } : null),
            ...style,
          } as CSSProperties
        }
        {...rest}
      >
        <canvas ref={canvasRef} className="gsb-glass" width={0} height={0} aria-hidden="true" />
        <span ref={glowRef} className="gsb-glow" aria-hidden="true" />
        <span ref={faceRef} className="gsb-face">
          <span className="gsb-label">{children}</span>
        </span>
      </button>
    </>
  );
});
