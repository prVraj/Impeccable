"use client";

/**
 * ASCII-Tide-button, from Impeccable.
 *
 * A plain dark pill until you reach for it. Bring the pointer onto it and a
 * field of tiny ASCII characters ( . : - = + * ) rises behind the label around
 * the pointer, drifting in slow waves like text-mode water. The label stays
 * sharp on top. Tap it and a calm tide of soft, light brand color rolls out
 * from the exact spot you tapped, lifting the characters as it passes, then
 * fades away.
 *
 * Phones have no hover, so pressing shows the field under your finger and the
 * tap sends the tide from it. The keyboard sends the tide from the centre.
 *
 * No packages: one canvas behind the label, and one requestAnimationFrame
 * loop that only runs while something moves.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, type ButtonHTMLAttributes, type CSSProperties } from "react";

export type AsciiTideButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The button's fill. Any CSS color, including var(--…). Default: near-black. */
  color?: string;
  /** The label color. Default: black or white, whichever reads best on the fill. */
  textColor?: string;
  /** The color of the characters at rest. Default: the label color. */
  charColor?: string;
  /** The tide's color on tap. Default: a light, slightly warm violet. */
  tideColor?: string;
  /** How far in px from the pointer the characters show, 24 to 160. */
  reach?: number;
};

/* ---------- tuning (the design: keep as written) ---------- */

const CELL_W = 6; // px per character, across
const CELL_H = 7; // px per character row
const FONT = 7; // px character size
const RAMP = " .:-=+*"; // characters from faint to strong
const FIELD = 0.85; // how strong the characters get around the pointer (0 to 1)
const CHAR_ALPHA = 0.5; // how bright the characters are at full strength, so the label always reads first
const FLOW = 0.0011; // how fast the waves drift, radians per ms
const SOFT = 0.35; // how soft the edge of the field around the pointer is (0 = hard edge)
const HOVER_IN_MS = 160; // how fast the field rises when the pointer arrives
const HOVER_OUT_MS = 320; // how fast it sinks when the pointer leaves
const FOLLOW_MS = 70; // how closely the field follows the pointer
const SPEED = 0.16; // px per ms the tide rolls out: slow on purpose, so it feels calm
const WIDTH = 16; // px: how wide the tide's band is
const TIDE_LIFT = 0.75; // how much stronger the characters get as the tide passes
const FADE = 0.4; // how much of its strength the tide loses by the far edge
const MAX_TIDES = 3; // taps in quick succession overlap, up to this many

/** Styles that can't be inline: sizing, press, focus, disabled and reduced motion. */
const CSS = `
.iat { position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 24px; border: 0; border-radius: 999px; overflow: hidden; background: var(--iat-fill, rgb(12 12 14)); box-shadow: inset 0 0 0 1px rgb(255 255 255 / .1), 0 1px 2px rgb(0 0 0 / .16); color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; isolation: isolate; touch-action: manipulation; transition: scale .18s cubic-bezier(.23,1,.32,1); }
.iat-field { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; pointer-events: none; color: var(--iat-char, var(--iat-text, var(--iat-auto-text, rgb(255 255 255)))); }
.iat-tide { position: absolute; width: 0; height: 0; color: var(--iat-tide, color-mix(in oklab, rgb(178 158 250) 80%, rgb(255 196 168))); }
.iat-label { position: relative; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--iat-text, var(--iat-auto-text, rgb(255 255 255))); }
.iat:active:not(:disabled) { scale: .97; }
.iat:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.iat:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .iat { transition: none; } .iat:active:not(:disabled) { scale: 1; } }`;

/* ---------- small helpers ---------- */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;

/** A steady random number from 0 to 1 for each character cell. */
function hash(i: number, j: number) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
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

type Tide = { x: number; y: number; at: number; life: number };

/* ---------- the button ---------- */

export const AsciiTideButton = forwardRef<HTMLButtonElement, AsciiTideButtonProps>(function AsciiTideButton(
  { color, textColor, charColor, tideColor, reach = 64, type = "button", className, style, children, ...rest },
  ref,
) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tideRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => btnRef.current!, []);

  // Props the running loop reads without restarting it.
  const opts = useRef({ reach: 64, disabled: false });
  opts.current = { reach: num(reach, 64, 24, 160), disabled: !!rest.disabled };

  // The label picks black or white on the fill, and checks again when the theme changes.
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const apply = () =>
      btn.style.setProperty("--iat-auto-text", isLight(getComputedStyle(btn).backgroundColor) ? "rgb(10 10 10)" : "rgb(255 255 255)");
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
    const btn = btnRef.current, canvas = canvasRef.current, tideEl = tideRef.current;
    if (!btn || !canvas || !tideEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;
    const onReduce = () => (reduced = reduceMq.matches);
    reduceMq.addEventListener("change", onReduce);

    let cw = 0, ch = 0, dpr = 1;
    let raf = 0, last = 0, level = 0;
    let hover = false, pressed = false;
    const P = { x: 0, y: 0 }; // where the pointer is, in the button's own px
    const F = { x: 0, y: 0 }; // where the field is centred: follows the pointer softly
    let tides: Tide[] = [];

    const local = (e: { clientX: number; clientY: number }) => {
      const r = btn.getBoundingClientRect();
      const sx = btn.offsetWidth ? r.width / btn.offsetWidth || 1 : 1;
      const sy = btn.offsetHeight ? r.height / btn.offsetHeight || 1 : 1;
      return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy };
    };

    const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = (now: number) => {
      // The button's own size (offsetWidth ignores scaling), so it also works inside a scaled-down preview.
      const w = btn.offsetWidth, h = btn.offsetHeight;
      if (!w || !h) return;
      const nd = Math.min(2, devicePixelRatio || 1);
      if (w !== cw || h !== ch || nd !== dpr) {
        cw = w; ch = h; dpr = nd;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // Colors are read from the page on every frame, so they follow light and dark mode.
      const charInk = getComputedStyle(canvas).color;
      const tideInk = getComputedStyle(tideEl).color;

      // 1. How strong the tide is at a point: a soft band rolling out from each tap.
      const reachTide = (x: number, y: number) => {
        let t = 0;
        for (const td of tides) {
          const age = now - td.at;
          const d = Math.hypot(x - td.x, y - td.y) - SPEED * age;
          if (d > WIDTH * 2.5 || d < -WIDTH * 2.5) continue;
          t = Math.max(t, Math.exp(-(d * d) / (2 * WIDTH * WIDTH)) * (1 - FADE * clamp(age / td.life, 0, 1)));
        }
        return t;
      };
      // 2. The characters. Each cell picks a character from how strong the field is there:
      //    the soft circle around the pointer, a slow drifting wave, and any tide passing.
      ctx.font = `${FONT}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const R = opts.current.reach;
      const t = reduced ? 0 : now * FLOW;
      const cols = Math.ceil(w / CELL_W), rows = Math.ceil(h / CELL_H);
      const ox = (w - cols * CELL_W) / 2, oy = (h - rows * CELL_H) / 2;
      const top = RAMP.length - 1;
      for (let j = 0; j < rows; j++) {
        const y = oy + (j + 0.5) * CELL_H;
        for (let i = 0; i < cols; i++) {
          const x = ox + (i + 0.5) * CELL_W;
          const n = hash(i, j);
          let field = 0;
          if (level > 0.001) {
            const d = Math.hypot(x - F.x, y - F.y) / R;
            const edge = clamp((1 - d) / SOFT, 0, 1);
            // Two slow waves crossing, bent by the row, read like text-mode water.
            const wave = 0.5 + 0.5 * Math.sin(x * 0.075 - t * 2 + Math.sin(y * 0.21 + t * 1.3) * 1.6);
            field = level * edge * FIELD * (0.3 + 0.7 * wave) * (0.75 + 0.25 * n);
          }
          const tide = tides.length ? reachTide(x, y) : 0;
          const v = clamp(field + tide * (field + TIDE_LIFT), 0, 1);
          if (v < 0.08) continue;
          const c = RAMP[Math.max(1, Math.min(top, Math.round(v * top)))];
          if (tide > 0.04) {
            ctx.fillStyle = tideInk;
            ctx.globalAlpha = clamp(0.4 + tide * 0.6, 0, 1);
          } else {
            ctx.fillStyle = charInk;
            ctx.globalAlpha = CHAR_ALPHA * clamp(v / FIELD, 0, 1);
          }
          ctx.fillText(c, x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      const target = !opts.current.disabled && (hover || pressed) ? 1 : 0;
      level += (target - level) * (1 - Math.exp(-dt / (target > level ? HOVER_IN_MS : HOVER_OUT_MS)));
      // Snap the last bit: below 5% the characters are too faint to draw anyway.
      if (target ? level > 0.997 : level < 0.05) level = target;
      const f = 1 - Math.exp(-dt / FOLLOW_MS);
      F.x += (P.x - F.x) * f;
      F.y += (P.y - F.y) * f;
      tides = tides.filter((td) => now - td.at < td.life);
      draw(now);
      const settling = level !== target || Math.hypot(P.x - F.x, P.y - F.y) > 0.3;
      // The waves drift while the field shows; with reduced motion they hold still, so the loop rests.
      const flowing = level > 0 && !reduced;
      if (settling || flowing || tides.length) raf = requestAnimationFrame(frame);
      else if (level === 0) clear();
    };

    const wake = () => {
      if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const startTide = (x: number, y: number) => {
      if (opts.current.disabled) return;
      const w = btn.offsetWidth, h = btn.offsetHeight;
      const far = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y));
      tides.push({ x, y, at: performance.now(), life: (far + WIDTH * 3) / SPEED });
      if (tides.length > MAX_TIDES) tides.shift();
      wake();
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hover = true;
      Object.assign(P, local(e));
      if (level === 0) Object.assign(F, P); // the field rises where the pointer comes in
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !pressed) return;
      Object.assign(P, local(e));
      if (hover || pressed) wake();
    };
    const onLeave = () => {
      hover = false;
      pressed = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const at = local(e);
      Object.assign(P, at);
      if (e.pointerType === "touch") {
        pressed = true;
        if (level === 0) Object.assign(F, at);
      }
      startTide(at.x, at.y);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        pressed = false;
        wake();
      }
    };
    // Enter or Space on the keyboard: the tide starts from the centre.
    const onClick = (e: MouseEvent) => {
      if (e.detail === 0) startTide(btn.offsetWidth / 2, btn.offsetHeight / 2);
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (level > 0 || tides.length) wake();
    };

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointermove", onMove, { passive: true });
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointercancel", onLeave);
    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      reduceMq.removeEventListener("change", onReduce);
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("pointercancel", onLeave);
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `iat ${className}` : "iat"}
        style={
          {
            ...(color ? { "--iat-fill": color } : null),
            ...(textColor ? { "--iat-text": textColor } : null),
            ...(charColor ? { "--iat-char": charColor } : null),
            ...(tideColor ? { "--iat-tide": tideColor } : null),
            ...style,
          } as CSSProperties
        }
        {...rest}
      >
        <canvas ref={canvasRef} className="iat-field" width={0} height={0} aria-hidden="true" />
        <span ref={tideRef} className="iat-tide" aria-hidden="true" />
        <span className="iat-label">{children}</span>
      </button>
    </>
  );
});
