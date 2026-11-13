"use client";

/**
 * Pixel-Tremor-button, from Impeccable.
 *
 * A plain white button that turns to pixels where you touch it. At rest it is
 * one clean, solid pill. Bring the pointer onto it and a small, ragged chunk
 * right under the pointer breaks into square blocks that follow it around,
 * while the rest of the button stays solid. Click it and a
 * wave of pixels runs out from the exact spot you clicked: the button breaks
 * into blocks as the wave passes, they lift, then they melt back into one
 * solid surface. The label is normal text and stays sharp the whole time.
 *
 * Phones have no hover, so pressing pixelates the part under your finger and
 * the tap sends the wave from it. The keyboard sends the wave from the centre.
 *
 * No packages: one canvas inside the button, and one requestAnimationFrame
 * loop that only runs while something moves.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const PAD = 10; // px of room around the button for the shadow and for blocks the wave lifts
const GAP = 1; // px between blocks once fully pixelated
const RAGGED = 0.8; // how uneven the edge of the pixel chunk is (0 = a perfect circle of blocks)
const SHADE = 0.14; // how much darker some blocks are than others, so they read as separate blocks
const SEAM = 0.55; // how dark the seams between broken blocks get, so the blocks show on a white page too
const IN_MS = 70; // how fast a block breaks out of the surface
const OUT_MS = 240; // how fast it melts back in
const HOVER_IN_MS = 140; // how fast the chunk appears when the pointer arrives
const HOVER_OUT_MS = 220; // how fast it fades when the pointer leaves
const SPEED = 0.22; // px per ms the click wave travels
const WIDTH = 10; // px: how wide the wave's band of pixels is
const LIFT = 2; // px the wave lifts a block as it passes
const GROW = 0.15; // how much bigger a block gets on the wave
const FADE = 0.5; // how much of its strength the wave loses by the far edge
const MAX_WAVES = 4; // clicks in quick succession overlap, up to this many
const SHADOW = "rgb(0 0 0 / 0.16)"; // soft drop shadow under the solid button
const EDGE = "rgb(0 0 0 / 0.08)"; // hairline edge, so a white button still shows on a white page

/** Styles that can't be inline: sizing, press, focus, disabled and reduced motion. */
const CSS = `
.ipx { position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 24px; border: 0; border-radius: 999px; background: none; color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; isolation: isolate; touch-action: manipulation; transition: scale .18s cubic-bezier(.23,1,.32,1); }
.ipx:not([data-ready]) { background-color: var(--ipx-ink, rgb(255 255 255)); box-shadow: 0 0 0 1px ${EDGE}, 0 2px 6px ${SHADOW}; }
.ipx-grid { position: absolute; left: -${PAD}px; top: -${PAD}px; z-index: -1; pointer-events: none; color: var(--ipx-ink, rgb(255 255 255)); }
.ipx-label { position: relative; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ipx-text, var(--ipx-auto-text, rgb(10 10 10))); }
.ipx:active:not(:disabled) { scale: .97; }
.ipx:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.ipx:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .ipx { transition: none; } .ipx:active:not(:disabled) { scale: 1; } }`;

/* ---------- small helpers ---------- */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, fallback, lo, hi) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;

/** Signed distance from a point to a rounded rectangle (negative inside). */
function distTo(px, py, w, h, r) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

/** A steady random number from 0 to 1 for each block, so the chunk's ragged edge stays put. */
function hash(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** A rounded rectangle path, drawn by hand so it also works where canvas roundRect is missing. */
function rounded(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** True when a color reads as light, worked out by painting it, so any CSS color format works. */
let probe = null;
function isLight(color) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return true;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
}

/* ---------- the button ---------- */

export const PixelTremorButton = forwardRef(function PixelTremorButton(
  { color, textColor, pixel = 6, reach = 34, type = "button", className, style, children, ...rest },
  ref,
) {
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  useImperativeHandle(ref, () => btnRef.current, []);

  // Props the running loop reads without restarting it.
  const opts = useRef({ block: 6, reach: 34, disabled: false });
  opts.current = {
    block: Math.round(num(pixel, 6, 2, 10)),
    reach: num(reach, 34, 12, 80),
    disabled: !!rest.disabled,
  };
  const repaint = useRef(() => {});

  useEffect(() => {
    const btn = btnRef.current,
      canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;

    let cells = [];
    let amount = new Float32Array(0); // how pixelated each block is right now, 0 (solid) to 1
    let gridKey = "";
    let cellW = 5,
      cellH = 5;
    let cw = 0,
      ch = 0,
      dpr = 1;
    let raf = 0,
      last = 0,
      level = 0;
    let hover = false,
      pressed = false;
    const P = { x: 0, y: 0 }; // the pointer, in the button's own px
    let waves = [];
    let ink = "";

    // The button's own size (offsetWidth ignores scaling), so it also works inside a scaled-down preview.
    const shape = () => {
      const w = btn.offsetWidth,
        h = btn.offsetHeight;
      const rad = parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0;
      return { w, h, rad: Math.min(rad, w / 2, h / 2) };
    };
    const local = (e) => {
      const r = btn.getBoundingClientRect();
      const sx = btn.offsetWidth ? r.width / btn.offsetWidth || 1 : 1;
      const sy = btn.offsetHeight ? r.height / btn.offsetHeight || 1 : 1;
      return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy };
    };

    // The block grid covers the whole button (and a little past it), centred. A block only
    // shows where its centre is inside the button's shape, which gives stepped pixel edges.
    const layout = (w, h, rad) => {
      const cell = opts.current.block + GAP;
      const key = `${w}|${h}|${rad}|${cell}`;
      if (key === gridKey) return;
      gridKey = key;
      cells = [];
      // Blocks stretch a hair so a whole number of them fills the button edge to edge.
      const cols = Math.max(1, Math.round(w / cell)),
        rows = Math.max(1, Math.round(h / cell));
      cellW = w / cols;
      cellH = h / rows;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = (i + 0.5) * cellW,
            y = (j + 0.5) * cellH;
          const n = hash(i, j);
          cells.push({
            x,
            y,
            n,
            inside: distTo(x, y, w, h, rad) <= 0,
          });
        }
      }
      amount = new Float32Array(cells.length);
    };

    /** Draws one frame. Returns how far the blocks still are from where they are heading, so the loop knows when to stop. */
    const draw = (now, dt) => {
      const { w, h, rad } = shape();
      if (!w || !h) return 0;
      layout(w, h, rad);

      // Size the canvas to the button plus its overhang, sharp on retina (capped at 2x).
      const nd = Math.min(2, devicePixelRatio || 1);
      const nw = Math.ceil(w + PAD * 2),
        nh = Math.ceil(h + PAD * 2);
      if (nw !== cw || nh !== ch || nd !== dpr) {
        cw = nw;
        ch = nh;
        dpr = nd;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
      }

      // The color is read from the page on every frame, so a theme color follows light and dark mode.
      const c = getComputedStyle(canvas).color;
      if (c !== ink) {
        ink = c;
        btn.style.setProperty("--ipx-auto-text", isLight(c) ? "rgb(10 10 10)" : "rgb(255 255 255)");
      }

      // 1. The solid button: one clean pill with a soft shadow and a hairline edge.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = ink;
      ctx.shadowColor = SHADOW;
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      rounded(ctx, PAD, PAD, w, h, rad);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = EDGE;
      ctx.lineWidth = 1;
      rounded(ctx, PAD + 0.5, PAD + 0.5, w - 1, h - 1, rad - 0.5);
      ctx.stroke();

      // 2. How broken each block should be: the chunk under the pointer, plus any waves.
      const R = opts.current.reach;
      const k = 1 - Math.exp(-dt / IN_MS),
        kOut = 1 - Math.exp(-dt / OUT_MS);
      const w2 = 2 * WIDTH * WIDTH;
      let moving = 0;
      const broken = [];
      for (let idx = 0; idx < cells.length; idx++) {
        const p = cells[idx];
        let target = 0;
        if (level > 0.001) {
          const d = Math.hypot(p.x - P.x, p.y - P.y);
          target = clamp((1 - d / R) * (1 + RAGGED) - p.n * RAGGED, 0, 1) * level;
        }
        const a = amount[idx];
        amount[idx] = a + (target - a) * (target > a ? k : kOut);
        if (amount[idx] < 0.02 && target < amount[idx]) amount[idx] = 0; // too faint to draw: done
        let wv = 0;
        for (const v of waves) {
          const age = now - v.at;
          const x = Math.hypot(p.x - v.x, p.y - v.y) - SPEED * age;
          if (x > WIDTH * 3 || x < -WIDTH * 3) continue;
          wv = Math.max(wv, Math.exp(-(x * x) / w2) * (1 - FADE * clamp(age / v.life, 0, 1)));
        }
        const q = Math.max(amount[idx], wv);
        moving = Math.max(moving, Math.abs(target - amount[idx]));
        if (q > 0.02) broken.push(idx, q, wv);
      }

      // 3. Cut the broken blocks out of the solid surface, then draw them as separate blocks.
      if (broken.length) {
        ctx.globalCompositeOperation = "destination-out";
        for (let b = 0; b < broken.length; b += 3) {
          const p = cells[broken[b]];
          ctx.fillRect(PAD + p.x - cellW / 2, PAD + p.y - cellH / 2, cellW, cellH);
        }
        ctx.globalCompositeOperation = "source-over";
        for (let b = 0; b < broken.length; b += 3) {
          const p = cells[broken[b]];
          if (!p.inside) continue; // outside the shape: stays cut away, which steps the edge
          const q = broken[b + 1],
            wv = broken[b + 2];
          // The seam behind the block darkens as it breaks out, so the transition from solid is smooth.
          const x0 = PAD + p.x - cellW / 2,
            y0 = PAD + p.y - cellH / 2;
          ctx.fillStyle = ink;
          ctx.fillRect(x0, y0, cellW, cellH);
          ctx.fillStyle = `rgb(0 0 0 / ${(SEAM * q).toFixed(3)})`;
          ctx.fillRect(x0, y0, cellW, cellH);
          // The block opens a gap around itself as it breaks out, so it reads as a separate block.
          let bw = cellW - GAP * q,
            bh = cellH - GAP * q;
          let dy = 0;
          if (!reduced) {
            dy = -LIFT * wv;
            bw *= 1 + GROW * wv;
            bh *= 1 + GROW * wv;
          }
          const bx = PAD + p.x - bw / 2,
            by = PAD + p.y + dy - bh / 2;
          ctx.fillStyle = ink;
          ctx.fillRect(bx, by, bw, bh);
          ctx.fillStyle = `rgb(0 0 0 / ${(SHADE * p.n * q).toFixed(3)})`;
          ctx.fillRect(bx, by, bw, bh);
        }
        ctx.globalAlpha = 1;
      }
      if (!btn.dataset.ready) btn.dataset.ready = "";
      return moving;
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      const target = !opts.current.disabled && (hover || pressed) ? 1 : 0;
      level +=
        (target - level) * (1 - Math.exp(-dt / (target > level ? HOVER_IN_MS : HOVER_OUT_MS)));
      if (Math.abs(target - level) < 0.003) level = target;
      waves = waves.filter((v) => now - v.at < v.life);
      const moving = draw(now, dt);
      // Keep going while anything still changes; a still pointer leaves a still chunk and the loop rests.
      if (moving > 0.005 || level !== target || waves.length) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    // A still frame, for when the size, theme or props change while nothing moves.
    const paint = () => {
      if (!raf) draw(performance.now(), 0);
    };
    repaint.current = () => {
      gridKey = "";
      paint();
    };

    const startWave = (x, y) => {
      if (opts.current.disabled) return;
      const { w, h } = shape();
      const far = Math.max(
        Math.hypot(x, y),
        Math.hypot(w - x, y),
        Math.hypot(x, h - y),
        Math.hypot(w - x, h - y),
      );
      waves.push({ x, y, at: performance.now(), life: (far + WIDTH * 3) / SPEED });
      if (waves.length > MAX_WAVES) waves.shift();
      wake();
    };

    const onEnter = (e) => {
      if (e.pointerType === "touch") return;
      hover = true;
      Object.assign(P, local(e));
      wake();
    };
    const onMove = (e) => {
      if (e.pointerType === "touch" && !pressed) return;
      Object.assign(P, local(e));
      if (hover || pressed) wake();
    };
    const onLeave = () => {
      hover = false;
      pressed = false;
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const at = local(e);
      Object.assign(P, at);
      if (e.pointerType === "touch") pressed = true;
      startWave(at.x, at.y);
    };
    const onUp = (e) => {
      if (e.pointerType === "touch") pressed = false;
    };
    // Enter or Space on the keyboard: the wave starts from the centre.
    const onClick = (e) => {
      if (e.detail === 0) startWave(btn.offsetWidth / 2, btn.offsetHeight / 2);
    };
    const onReduce = () => {
      reduced = reduceMq.matches;
      paint();
    };

    const ro = new ResizeObserver(paint);
    ro.observe(btn);
    // A theme color can change without any prop changing.
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const darkMq = matchMedia("(prefers-color-scheme: dark)");
    darkMq.addEventListener("change", paint);
    reduceMq.addEventListener("change", onReduce);
    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointermove", onMove, { passive: true });
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointercancel", onLeave);
    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("click", onClick);
    paint();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      mo.disconnect();
      darkMq.removeEventListener("change", paint);
      reduceMq.removeEventListener("change", onReduce);
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("pointercancel", onLeave);
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("click", onClick);
      repaint.current = () => {};
    };
  }, []);

  // Redraw when a prop that changes the look changes.
  useEffect(() => repaint.current(), [color, pixel, rest.disabled]);

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `ipx ${className}` : "ipx"}
        style={{
          ...(color ? { "--ipx-ink": color } : null),
          ...(textColor ? { "--ipx-text": textColor } : null),
          ...style,
        }}
        {...rest}
      >
        <canvas ref={canvasRef} className="ipx-grid" width={0} height={0} aria-hidden="true" />
        <span className="ipx-label">{children}</span>
      </button>
    </>
  );
});
