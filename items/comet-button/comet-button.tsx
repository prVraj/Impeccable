"use client";

/**
 * Comet button, from Impeccable.
 *
 * A dark pill with a soft glow resting on its edge: a bright streak along the
 * top and a dimmer one along the bottom. While it loads, both streaks wake up
 * and race around the border like comets, with a sharp head and a long tail,
 * and the label makes way for three hopping dots. When loading ends, the
 * streaks slow down and settle back into place in 330ms (gliding home when
 * home is close, or fading out as the resting glow lights up when it isn't),
 * and the label returns.
 *
 * When it worked, the success state plays: the whole border lights up, a
 * soft glow spreads behind the button and the label says "Ah yeah!" for a
 * moment, then everything eases back to how it started.
 *
 * Give it `loading`, or let `onClick` return a promise: the button loads until
 * the promise settles (a promise that rejects skips the success state). While it loads, clicks are ignored so nothing is sent
 * twice.
 *
 * No packages: one canvas around the button, and one requestAnimationFrame
 * loop that only runs while the glow moves.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
} from "react";

export type CometButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  /** Shows the loading state: the glow runs round the border and the label becomes three dots. */
  loading?: boolean;
  /** Runs on click. Return a promise and the button loads until it settles (when `loading` is not set). */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
  /** The fill of the pill. Any CSS color, including var(--…). Default: near-black. */
  color?: string;
  /** The label color. Default: black or white, whichever reads best on the fill. */
  textColor?: string;
  /** The color of the glow and the dots. Any CSS color. Default: a soft violet. */
  glowColor?: string;
  /** Seconds the glow takes to run once round the border while loading, 0.8 to 4. */
  speed?: number;
  /** What screen readers hear while it loads. */
  loadingText?: string;
  /** Plays the success state when loading ends. Set it to false when the work failed. A rejected promise never plays it. */
  success?: boolean;
  /** The label shown in the success state. */
  successText?: string;
};

/* ---------- tuning (the design: keep as written) ---------- */

const OVER = 18; // px of room around the button for the soft bloom
const SETTLE_MS = 330; // the running glow eases back to rest
const WAKE_MS = 180; // how quickly the glow picks up speed when loading starts
const RISE_MS = 120; // how quickly the glow brightens when loading starts
const LEN_REST = 0.2; // streak length at rest, as a share of the border
const LEN_RUN = 0.3; // streak length while running (most of it is tail)
const LOW = 0.34; // how bright the bottom streak is at rest, next to the top one
const LINE = 1.5; // px, the bright line on the edge
const BLOOM = 9; // px, how far the soft light spreads from the edge
const BLOOM_ALPHA = 0.1; // how strong the soft light is
const CORE = 0.85; // how white the brightest part of a streak gets
const SUCCESS_IN_MS = 330; // success: the light spreads round the whole border
const SUCCESS_HOLD_MS = 1100; // success: how long the whole border stays lit
const SUCCESS_OUT_MS = 600; // success: everything eases back to how it started
const RING = 0.9; // how bright the whole border gets on success
const GLIDE_MAX = 0.28; // laps: a rest spot this close ahead is glided to; further away, the glow slows, fades and the rest glow lights up instead

/** Styles that can't be inline: sizing, the label and dots swap, press, focus, disabled and reduced motion. */
const CSS = `
.cmb { --cmb-g: var(--cmb-glow, rgb(160 132 255)); position: relative; display: inline-grid; place-items: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 24px; border: 0; border-radius: 999px; background: var(--cmb-fill, rgb(12 12 14)); box-shadow: inset 0 1px 0 rgb(255 255 255 / .08), 0 1px 2px rgb(0 0 0 / .2), 0 6px 16px -8px rgb(0 0 0 / .35); color: var(--cmb-text, var(--cmb-auto-text, rgb(255 255 255))); font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; isolation: isolate; transition: scale .18s cubic-bezier(.23,1,.32,1), box-shadow ${SUCCESS_OUT_MS}ms cubic-bezier(.45,0,.55,1); }
.cmb[data-success] { box-shadow: inset 0 1px 0 rgb(255 255 255 / .08), 0 1px 2px rgb(0 0 0 / .2), 0 0 22px -4px var(--cmb-g), 0 10px 32px -10px var(--cmb-g); box-shadow: inset 0 1px 0 rgb(255 255 255 / .08), 0 1px 2px rgb(0 0 0 / .2), 0 0 22px -4px color-mix(in srgb, var(--cmb-g) 55%, transparent), 0 10px 32px -10px color-mix(in srgb, var(--cmb-g) 70%, transparent); transition: scale .18s cubic-bezier(.23,1,.32,1), box-shadow ${SUCCESS_IN_MS}ms cubic-bezier(.22,1,.36,1); }
.cmb-glow { position: absolute; top: -${OVER}px; left: 0; width: 100%; height: calc(100% + ${OVER * 2}px); pointer-events: none; }
.cmb-tint { position: absolute; width: 0; height: 0; color: var(--cmb-glow, rgb(160 132 255)); }
.cmb-label, .cmb-dots, .cmb-win { grid-area: 1 / 1; position: relative; z-index: 1; transition: opacity ${SETTLE_MS}ms cubic-bezier(.22,1,.36,1), translate ${SETTLE_MS}ms cubic-bezier(.22,1,.36,1), filter ${SETTLE_MS}ms cubic-bezier(.22,1,.36,1); }
.cmb-label, .cmb-win { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cmb-dots { display: flex; gap: 5px; opacity: 0; translate: 0 6px; }
.cmb-dots i { display: block; width: 5px; height: 5px; border-radius: 50%; background: var(--cmb-glow, rgb(160 132 255)); background: color-mix(in srgb, var(--cmb-glow, rgb(160 132 255)) 78%, white); box-shadow: 0 0 6px color-mix(in srgb, var(--cmb-glow, rgb(160 132 255)) 70%, transparent); }
.cmb-win { opacity: 0; translate: 0 6px; filter: blur(2px); transition-duration: 200ms; transition-timing-function: cubic-bezier(.4,0,1,1); }
.cmb[data-back] .cmb-label { transition-duration: 420ms; transition-delay: 160ms; }
.cmb[data-success] .cmb-label { opacity: 0; translate: 0 -6px; filter: blur(2px); transition-duration: 200ms; }
.cmb[data-success] .cmb-win { opacity: 1; translate: 0 0; filter: none; transition-duration: ${SUCCESS_IN_MS}ms; transition-timing-function: cubic-bezier(.22,1,.36,1); }
.cmb[data-loading] { cursor: progress; }
.cmb[data-loading] .cmb-label { opacity: 0; translate: 0 -6px; filter: blur(2px); transition-duration: 200ms; }
.cmb[data-loading] .cmb-dots { opacity: 1; translate: 0 0; transition-duration: 240ms; transition-delay: 60ms; }
.cmb[data-loading] .cmb-dots i { animation: cmb-hop 1s cubic-bezier(.45,0,.55,1) infinite; }
.cmb[data-loading] .cmb-dots i:nth-child(2) { animation-delay: .14s; }
.cmb[data-loading] .cmb-dots i:nth-child(3) { animation-delay: .28s; }
@keyframes cmb-hop { 0%, 64%, 100% { translate: 0 2px; } 32% { translate: 0 -3px; } }
.cmb-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.cmb:active:not(:disabled):not([data-loading]) { scale: .97; }
.cmb:focus-visible { outline: 2px solid var(--cmb-glow, rgb(160 132 255)); outline-offset: 3px; }
.cmb:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) {
  .cmb { transition: none; }
  .cmb:active:not(:disabled):not([data-loading]) { scale: 1; }
  .cmb-label, .cmb-dots, .cmb-win, .cmb[data-loading] .cmb-label, .cmb[data-success] .cmb-label { translate: 0 0; filter: none; }
  .cmb[data-loading] .cmb-dots i { animation-name: cmb-blink; }
}
@keyframes cmb-blink { 0%, 64%, 100% { opacity: .35; translate: 0 0; } 32% { opacity: 1; translate: 0 0; } }`;

/* ---------- small helpers ---------- */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Any CSS color as [r, g, b], worked out by painting it, so every color format works. */
let probe: CanvasRenderingContext2D | null = null;
function rgbOf(color: string): [number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [160, 132, 255];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}
const isLight = ([r, g, b]: [number, number, number]) => {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
};

/* ---------- the button ---------- */

export const CometButton = forwardRef<HTMLButtonElement, CometButtonProps>(function CometButton(
  { loading, onClick, color, textColor, glowColor, speed = 1.4, loadingText = "Loading", success = true, successText = "Ah yeah!", type = "button", className, style, children, ...rest },
  ref,
) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tintRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => btnRef.current!, []);

  // Loading from a returned promise, used only when `loading` is not set.
  const [own, setOwn] = useState(false);
  const busy = loading ?? own;
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  // The success state: plays when loading ends, unless `success` is false or the promise rejected.
  // 0 = none, 1 = showing, 2 = easing back to the resting look.
  const [win, setWin] = useState<0 | 1 | 2>(0);
  const won = win === 1;
  const wasBusy = useRef(false);
  const ok = useRef(true); // false when the last promise rejected
  const winTimer = useRef(0);
  useEffect(() => {
    const was = wasBusy.current;
    wasBusy.current = !!busy;
    if (busy) {
      window.clearTimeout(winTimer.current);
      setWin(0);
      return;
    }
    if (was && success && ok.current && !rest.disabled) {
      setWin(1);
      window.clearTimeout(winTimer.current);
      winTimer.current = window.setTimeout(() => {
        setWin(2);
        winTimer.current = window.setTimeout(() => setWin(0), SUCCESS_OUT_MS);
      }, SUCCESS_IN_MS + SUCCESS_HOLD_MS);
    }
    ok.current = true;
  }, [busy, success, rest.disabled]);
  useEffect(() => () => window.clearTimeout(winTimer.current), []);

  // What the running loop reads without restarting it.
  const opts = useRef({ busy: false, won: false, lap: 1.4, disabled: false });
  opts.current = { busy: !!busy && !rest.disabled, won: won && !busy, lap: num(speed, 1.4, 0.8, 4), disabled: !!rest.disabled };
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => wakeRef.current(), [busy, won, rest.disabled, speed, color, glowColor]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // While it loads, a second click does nothing (and doesn't submit a form twice).
    if (busy) {
      e.preventDefault();
      return;
    }
    const out = onClick?.(e);
    if (loading === undefined && out && typeof (out as Promise<unknown>).then === "function") {
      setOwn(true);
      Promise.resolve(out)
        .then(
          () => (ok.current = true),
          () => (ok.current = false),
        )
        .finally(() => {
          if (live.current) setOwn(false);
        });
    }
  };

  useEffect(() => {
    const btn = btnRef.current, canvas = canvasRef.current, tint = tintRef.current;
    if (!btn || !canvas || !tint) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;

    let cw = 0, ch = 0, rad = 0, dpr = 1;
    let padL = -1, padR = -1; // how far the canvas reaches past the button on the left and right
    let line: { x: number; y: number }[] = []; // the border, one point per px, clockwise from the top centre
    let rgb: [number, number, number] = [160, 132, 255];
    let core: [number, number, number] = [240, 236, 255];
    let sprite: HTMLCanvasElement | null = null; // a soft dot of glow, stamped along the streak for the bloom

    // The motion. `pos` is where the top streak is, in laps (0 = top centre, 0.5 = bottom centre).
    let pos = 0, vel = 0, energy = 0;
    let mode: "rest" | "run" | "settle" = "rest";
    let settle = { t0: 0, p0: 0, v0: 0, d: 0, e0: 0, glide: true };
    let fade = 1; // how much of the moving glow is left (below 1 only while fading out)
    let home = 0; // how much of the resting glow has lit up in its place (while fading out)
    // The success light round the whole border, 0 to 1, eased in and out over time.
    let ring = 0, ringFrom = 0, ringTo = 0, ringT0 = 0;
    let raf = 0, last = 0;

    const size = () => {
      const w = btn.offsetWidth, h = btn.offsetHeight;
      const r = Math.min(parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0, w / 2, h / 2);
      // Reach past the button only as far as the screen allows, so the page never scrolls sideways.
      const box = btn.getBoundingClientRect();
      const k = btn.offsetWidth ? box.width / btn.offsetWidth || 1 : 1;
      const vw = document.documentElement.clientWidth;
      const pl = Math.floor(clamp(box.left / k, 0, OVER));
      const pr = Math.floor(clamp((vw - box.right) / k, 0, OVER));
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (w === cw && h === ch && r === rad && pl === padL && pr === padR && d === dpr && line.length) return;
      cw = w; ch = h; rad = r; padL = pl; padR = pr; dpr = d;
      canvas.style.left = `${-pl}px`;
      canvas.style.width = `${w + pl + pr}px`;
      canvas.width = Math.max(1, Math.round((w + pl + pr) * dpr));
      canvas.height = Math.max(1, Math.round((h + OVER * 2) * dpr));
      // Walk the border just inside the edge, clockwise from the top centre, one point per px.
      const ins = LINE / 2, x0 = ins, y0 = ins, W = w - LINE, H = h - LINE, R = Math.max(0, r - ins);
      const segs: ((t: number) => { x: number; y: number })[] = [];
      const lens: number[] = [];
      const straight = (ax: number, ay: number, bx: number, by: number) => {
        segs.push((t) => ({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t }));
        lens.push(Math.hypot(bx - ax, by - ay));
      };
      const corner = (cx: number, cy: number, a0: number) => {
        segs.push((t) => {
          const a = a0 + (Math.PI / 2) * t;
          return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
        });
        lens.push((Math.PI / 2) * R);
      };
      straight(x0 + W / 2, y0, x0 + W - R, y0);
      corner(x0 + W - R, y0 + R, -Math.PI / 2);
      straight(x0 + W, y0 + R, x0 + W, y0 + H - R);
      corner(x0 + W - R, y0 + H - R, 0);
      straight(x0 + W - R, y0 + H, x0 + R, y0 + H);
      corner(x0 + R, y0 + H - R, Math.PI / 2);
      straight(x0, y0 + H - R, x0, y0 + R);
      corner(x0 + R, y0 + R, Math.PI);
      straight(x0 + R, y0, x0 + W / 2, y0);
      const total = lens.reduce((a, b) => a + b, 0);
      const n = Math.max(8, Math.round(total));
      line = [];
      let si = 0, acc = 0;
      for (let i = 0; i < n; i++) {
        const dd = (i / n) * total;
        while (si < lens.length - 1 && dd > acc + lens[si]) acc += lens[si++];
        line.push(segs[si](lens[si] ? (dd - acc) / lens[si] : 0));
      }
      sprite = null;
    };

    /** Reads the glow color (it may be a theme variable) and the fill, so the label picks black or white. */
    const readColors = () => {
      const c = rgbOf(getComputedStyle(tint).color);
      if (c.join() !== rgb.join()) sprite = null;
      rgb = c;
      core = [mix(255, c[0], 1 - CORE), mix(255, c[1], 1 - CORE), mix(255, c[2], 1 - CORE)].map(Math.round) as [number, number, number];
      btn.style.setProperty("--cmb-auto-text", isLight(rgbOf(getComputedStyle(btn).backgroundColor)) ? "rgb(10 10 10)" : "rgb(255 255 255)");
    };

    const makeSprite = () => {
      const s = document.createElement("canvas");
      const px = Math.ceil(BLOOM * 2 * dpr);
      s.width = s.height = px;
      const g = s.getContext("2d");
      if (!g) return null;
      const grd = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
      const [r, gg, b] = rgb;
      grd.addColorStop(0, `rgb(${r} ${gg} ${b} / 1)`);
      grd.addColorStop(0.35, `rgb(${r} ${gg} ${b} / .45)`);
      grd.addColorStop(1, `rgb(${r} ${gg} ${b} / 0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, px, px);
      return s;
    };

    /** The point on the border at `lap` (wraps round). */
    const at = (lap: number) => {
      const L = line.length;
      const f = (((lap % 1) + 1) % 1) * L;
      const i = Math.floor(f), t = f - i;
      const a = line[i % L], b = line[(i + 1) % L];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    /** One streak, centred on `lap`, with `power` from 0 to 1. Its tail trails behind the way it runs. */
    const streak = (lap: number, power: number, e: number) => {
      if (power <= 0.002) return;
      const L = line.length;
      const len = mix(LEN_REST, LEN_RUN, e);
      const tail = reduced ? 0 : e; // with reduced motion nothing runs, so there is no tail
      const ahead = (len / 2) * (1 - 0.6 * tail); // the head gets sharp...
      const behind = (len / 2) * (1 + 0.6 * tail); // ...and the tail gets long while it runs
      const step = 1 / L; // one px
      const ox = padL, oy = OVER;
      const f = (u: number) => (u < 0 ? 0.5 + 0.5 * Math.cos(Math.PI * (-u / behind)) : 0.5 + 0.5 * Math.cos(Math.PI * (u / ahead)));

      // The soft bloom: a dot of glow every 2px, stronger near the head.
      if (!sprite) sprite = makeSprite();
      if (sprite) {
        const half = BLOOM;
        for (let u = -behind; u <= ahead; u += step * 2) {
          const k = f(u) * power;
          if (k < 0.01) continue;
          const p = at(lap + u);
          ctx.globalAlpha = Math.min(1, k * BLOOM_ALPHA * (1 + e * 0.6));
          ctx.drawImage(sprite, ox + p.x - half, oy + p.y - half, half * 2, half * 2);
        }
      }

      // The line on the edge: glow color all along, turning white where it's brightest.
      ctx.lineWidth = LINE;
      ctx.lineCap = "butt";
      let prev = at(lap - behind);
      for (let u = -behind + step; u <= ahead; u += step) {
        const p = at(lap + u);
        const k = f(u - step / 2) * power;
        if (k > 0.01) {
          ctx.globalAlpha = Math.min(1, k);
          ctx.strokeStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
          ctx.beginPath();
          ctx.moveTo(ox + prev.x, oy + prev.y);
          ctx.lineTo(ox + p.x, oy + p.y);
          ctx.stroke();
          const w = k ** (3 + 4 * tail); // white only near the head while running
          if (w > 0.02) {
            ctx.globalAlpha = Math.min(1, w);
            ctx.strokeStyle = `rgb(${core[0]} ${core[1]} ${core[2]})`;
            ctx.stroke();
          }
        }
        prev = p;
      }
    };

    /** Success: the whole border lit evenly, its line and its soft bloom. */
    const lightRing = (power: number) => {
      if (!sprite) sprite = makeSprite();
      if (sprite) {
        ctx.globalAlpha = Math.min(1, power * BLOOM_ALPHA * 0.9);
        for (let i = 0; i < line.length; i += 2) {
          const p = line[i];
          ctx.drawImage(sprite, padL + p.x - BLOOM, OVER + p.y - BLOOM, BLOOM * 2, BLOOM * 2);
        }
      }
      ctx.lineWidth = LINE;
      ctx.beginPath();
      for (let i = 0; i <= line.length; i++) {
        const p = line[i % line.length];
        if (i) ctx.lineTo(padL + p.x, OVER + p.y);
        else ctx.moveTo(padL + p.x, OVER + p.y);
      }
      ctx.globalAlpha = Math.min(1, power);
      ctx.strokeStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
      ctx.stroke();
      ctx.globalAlpha = Math.min(1, power * 0.3);
      ctx.strokeStyle = `rgb(${core[0]} ${core[1]} ${core[2]})`;
      ctx.stroke();
    };

    const draw = () => {
      size();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!line.length) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      const e = opts.current.disabled ? 0 : energy;
      const dim = opts.current.disabled ? 0.5 : 1;
      // A faint line all the way round, so the shape reads even where no streak is.
      ctx.globalAlpha = mix(0.1, 0.16, e) * dim;
      ctx.strokeStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= line.length; i++) {
        const p = line[i % line.length];
        if (i) ctx.lineTo(padL + p.x, OVER + p.y);
        else ctx.moveTo(padL + p.x, OVER + p.y);
      }
      ctx.stroke();
      // Two streaks on opposite sides. At rest the top one is bright and the bottom one dim;
      // while running both shine the same.
      const restPower = (lap: number) => mix(1, LOW, clamp(at(lap).y / Math.max(1, ch), 0, 1));
      for (const lap of [pos, pos + 0.5]) streak(lap, mix(restPower(lap), 1, e) * mix(1.2, 1.25, e) * fade * dim, e);
      if (home > 0) for (const lap of [0, 0.5]) streak(lap, restPower(lap) * 1.2 * home * dim, 0);
      if (ring > 0.002) lightRing(ring * RING * dim);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const { busy, lap } = opts.current;
      const target = 1 / lap;

      if (busy && mode !== "run") {
        // Loading again mid-settle: carry on from the moving glow, or from rest if it had mostly faded.
        if (mode === "settle" && !settle.glide && fade < 0.5) {
          pos = 0;
          vel = 0;
        }
        fade = 1;
        home = 0;
        mode = "run";
      }
      if (!busy && mode === "run") {
        // Settle in SETTLE_MS, never backwards and never much faster than it ran. If a resting
        // spot (a streak on the top centre) is close ahead, glide into it, slowing to a stop. If
        // not, slow down where it is while it fades, and the resting glow lights up in its place.
        const T = SETTLE_MS / 1000;
        const frac = ((pos % 0.5) + 0.5) % 0.5;
        let d = frac ? 0.5 - frac : 0;
        if (d < (vel * T) / 3 + 0.01) d += 0.5;
        const glide = reduced || d <= GLIDE_MAX;
        if (reduced) d = 0;
        settle = { t0: now, p0: pos, v0: vel, d, e0: energy, glide };
        mode = "settle";
      }

      if (mode === "run") {
        if (!reduced) {
          vel = target - (target - vel) * Math.exp((-dt * 1000) / WAKE_MS);
          pos += vel * dt;
        } else vel = 0;
        energy = 1 - (1 - energy) * Math.exp((-dt * 1000) / RISE_MS);
      } else if (mode === "settle") {
        const T = SETTLE_MS / 1000;
        const t = clamp((now - settle.t0) / SETTLE_MS, 0, 1);
        const { p0, v0, d, e0, glide } = settle;
        if (glide) {
          // A curve that starts at the running speed and stops exactly on the resting spot.
          pos = p0 + v0 * T * (t - 2 * t * t + t * t * t) + d * (3 * t * t - 2 * t * t * t);
          vel = (v0 * T * (1 - 4 * t + 3 * t * t) + d * (6 * t - 6 * t * t)) / T;
        } else {
          // Slow from the running speed to a stop, fading, while the resting glow lights up.
          pos = p0 + ((v0 * T) / 3) * (1 - (1 - t) ** 3);
          vel = v0 * (1 - t) ** 2;
          fade = 1 - smooth(t);
          home = smooth(t);
        }
        energy = e0 * (1 - smooth(t));
        if (t >= 1) {
          if (!glide) pos = 0;
          fade = 1;
          home = 0;
          pos = Math.round(pos * 2) / 2;
          pos -= Math.floor(pos);
          vel = 0;
          energy = 0;
          mode = "rest";
        }
      }

      // Success light: spreads in over SUCCESS_IN_MS (fast, then gentle) and eases out over SUCCESS_OUT_MS.
      const want = opts.current.won && !opts.current.disabled ? 1 : 0;
      if (want !== ringTo) {
        ringFrom = ring;
        ringTo = want;
        ringT0 = now;
      }
      if (ring !== ringTo) {
        const t = clamp((now - ringT0) / (ringTo ? SUCCESS_IN_MS : SUCCESS_OUT_MS), 0, 1);
        const k = ringTo ? 1 - (1 - t) ** 3 : t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        ring = t >= 1 ? ringTo : mix(ringFrom, ringTo, k);
      }

      draw();
      if ((mode !== "rest" || ring !== ringTo) && !document.hidden) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const wake = () => {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const redraw = () => {
      readColors();
      if (raf) return; // the loop draws the next frame anyway
      draw();
      if (mode !== "rest" || opts.current.busy || ring !== (opts.current.won ? 1 : 0)) wake();
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
    // Theme or size changes: draw again.
    const ro = new ResizeObserver(redraw);
    ro.observe(btn);
    window.addEventListener("resize", redraw);
    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", redraw);
    document.addEventListener("visibilitychange", onVis);
    reduceMq.addEventListener("change", onReduce);
    wakeRef.current = redraw;
    redraw();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wakeRef.current = () => {};
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", redraw);
      mq.removeEventListener("change", redraw);
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
        className={className ? `cmb ${className}` : "cmb"}
        data-loading={busy ? "" : undefined}
        data-success={won && !busy ? "" : undefined}
        data-back={win === 2 && !busy ? "" : undefined}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        onClick={handleClick}
        style={
          {
            ...(color ? { "--cmb-fill": color } : null),
            ...(textColor ? { "--cmb-text": textColor } : null),
            ...(glowColor ? { "--cmb-glow": glowColor } : null),
            ...style,
          } as CSSProperties
        }
        {...rest}
      >
        <canvas ref={canvasRef} className="cmb-glow" width={0} height={0} aria-hidden="true" />
        <span ref={tintRef} className="cmb-tint" aria-hidden="true" />
        <span className="cmb-label">{children}</span>
        <span className="cmb-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="cmb-win" aria-hidden="true">
          {successText}
        </span>
        <span className="cmb-sr" role="status">
          {busy ? loadingText : won ? successText : ""}
        </span>
      </button>
    </>
  );
});
