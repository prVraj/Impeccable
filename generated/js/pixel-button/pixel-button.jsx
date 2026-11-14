"use client";

/**
 * Pixel-button, from Impeccable.
 *
 * A pill that is white in light mode and dark in dark mode, with a light that
 * keeps travelling around its edge. Behind the label sit tiny pixels, scattered
 * a little off the grid, each with its own brightness, breathing at its own pace.
 * Hover lights them up outward from where the pointer came in. Two types:
 *
 *   - "hover":  the pixels only show while the pointer is on the button.
 *   - "always": the pixels always show, dimly, and glow when the pointer is on it.
 *
 * Click it and a wave of bright pixels rolls out from the exact spot you
 * clicked. Phones have no hover, so pressing lights it up and the tap sends the
 * wave from your finger. The keyboard sends it from the centre.
 *
 * No packages: one canvas behind the label, and one requestAnimationFrame loop
 * that pauses when the button is off screen or the tab is hidden.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const DOT = 2; // px: one pixel
const PITCH = 4; // px from one pixel to the next, before each one is nudged
const NUDGE = 1; // px each pixel is moved off the grid at random, so the spacing is never exact
const GAPS = 0.2; // the share of spots left empty, so the pixels feel scattered, not printed
const REST = 0.42; // how bright the pixels are at rest in "always" (0 to 1)
const LIT = 0.9; // how bright they are on hover
const EDGE = 0.7; // how much brighter the pixels are toward the edge than in the middle, so the label wins
const TWINKLE = 0.0016; // how fast the pixels gently breathe, radians per ms (each pixel a bit faster or slower)
const BREATHE = 0.2; // how much each pixel breathes: a calm rise and fall, never off
const SPARKLE = 0.0011; // how often the few sparkling pixels light up, radians per ms
const SPARKLES = 0.2; // the share of pixels that now and then light up brighter
const SPARK = 0.45; // how much brighter a sparkling pixel gets at its peak
const SPOT = 56; // px: the pointer lights up the pixels this close to it a little more
const HOVER_IN_MS = 140; // how fast the glow rises when the pointer arrives
const HOVER_OUT_MS = 380; // how fast it sinks when the pointer leaves: the pixels go out one by one, at random
const SPREAD = 0.4; // px per ms the pixels light up outward from where the pointer came in
const RAGGED = 18; // px: how uneven that spreading edge is, so it lights up pixel by pixel, not as a circle
const SPEED = 0.2; // px per ms the click wave rolls out
const WIDTH = 12; // px: how wide the wave's band is
const WAVE = 0.72; // how much brighter the wave makes the pixels it passes
const MAX_WAVES = 3; // clicks in quick succession overlap, up to this many
const TRAIL_MS = 4200; // ms for the edge light to go once around
const TRAIL = 0.3; // how long the edge light's tail is, as a share of the edge
const TRAIL_ALPHA = 0.95; // how bright the edge light is at its head: clearly visible, with a soft fading tail
const TRAIL_W = 1.5; // px: how thick the edge light is
const TRAIL_BLUR = 6; // px: the soft halo around the edge light's head
const RIM = 0.6; // how bright the whole edge gets on hover
const GLOW = 0.17; // how strong the soft light coming in from every side is on hover
const GLOW_DEPTH = 0.4; // how far in it reaches, as a share of the button's height

/** Styles that can't be inline: sizing, press, focus, disabled and reduced motion. */
const CSS = `
.ipx { --ipx-theme-fill: rgb(255 255 255); --ipx-theme-text: rgb(10 10 10); --ipx-theme-edge: rgb(0 0 0 / .1); --ipx-theme-glow: color-mix(in oklab, rgb(72 29 232) 70%, white); }
:is(.dark, [data-theme="dark"]) .ipx { --ipx-theme-fill: rgb(12 12 14); --ipx-theme-text: rgb(255 255 255); --ipx-theme-edge: rgb(255 255 255 / .1); --ipx-theme-glow: color-mix(in oklab, rgb(72 29 232) 42%, white); }
.ipx { position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 24px; border: 0; border-radius: 999px; overflow: hidden; background: var(--ipx-fill, var(--ipx-theme-fill)); box-shadow: inset 0 0 0 1px var(--ipx-auto-edge, var(--ipx-theme-edge)), 0 1px 2px rgb(0 0 0 / .1), 0 2px 8px rgb(0 0 0 / .06); color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; isolation: isolate; touch-action: manipulation; transition: scale .18s cubic-bezier(.23,1,.32,1); }
.ipx-field { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; pointer-events: none; color: var(--ipx-glow, var(--ipx-auto-glow, var(--ipx-theme-glow))); }
.ipx-label { position: relative; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ipx-text, var(--ipx-auto-text, var(--ipx-theme-text))); }
.ipx:active:not(:disabled) { scale: .97; }
.ipx:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.ipx:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .ipx { transition: none; } .ipx:active:not(:disabled) { scale: 1; } }`;

/* ---------- small helpers ---------- */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** A steady random number from 0 to 1 for each pixel. */
function hash(i, j, k = 0) {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** True when a color reads as light, worked out by painting it, so any CSS color format works. */
let probe = null;
function isLight(color) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return false;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
}

/* ---------- the button ---------- */

export const PixelButton = forwardRef(function PixelButton(
  {
    mode = "hover",
    color,
    textColor,
    glowColor,
    type = "button",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const wakeRef = useRef(() => {});
  useImperativeHandle(ref, () => btnRef.current, []);

  // Props the running loop reads without restarting it.
  const opts = useRef({ always: false, disabled: false });
  opts.current = { always: mode === "always", disabled: !!rest.disabled };

  // Redraw once when a prop changes (the loop may be resting with reduced motion).
  useEffect(() => wakeRef.current(), [mode, rest.disabled, color, glowColor]);

  // The label picks black or white on the fill, and checks again when the theme changes.
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    // A light fill gets a dark label, a hairline dark edge and a deeper violet; a dark fill the opposite.
    const apply = () => {
      const light = isLight(getComputedStyle(btn).backgroundColor);
      btn.style.setProperty("--ipx-auto-text", light ? "rgb(10 10 10)" : "rgb(255 255 255)");
      btn.style.setProperty("--ipx-auto-edge", light ? "rgb(0 0 0 / .1)" : "rgb(255 255 255 / .1)");
      btn.style.setProperty(
        "--ipx-auto-glow",
        light
          ? "color-mix(in oklab, rgb(72 29 232) 70%, white)"
          : "color-mix(in oklab, rgb(72 29 232) 42%, white)",
      );
      wakeRef.current();
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, [color]);

  useEffect(() => {
    const btn = btnRef.current,
      canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;

    let cw = 0,
      ch = 0,
      dpr = 1;
    let raf = 0,
      last = 0,
      level = 0,
      onScreen = true;
    let hover = false,
      pressed = false;
    let enterAt = -1e9; // when the pointer came in
    const E = { x: 0, y: 0 }; // where it came in: the pixels light up outward from here
    let ink = "",
      inkAt = -1e9,
      radius = 0;
    const P = { x: 0, y: 0 }; // where the pointer is, in the button's own px
    let waves = [];

    const local = (e) => {
      const r = btn.getBoundingClientRect();
      const sx = btn.offsetWidth ? r.width / btn.offsetWidth || 1 : 1;
      const sy = btn.offsetHeight ? r.height / btn.offsetHeight || 1 : 1;
      return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy };
    };

    /** The rounded outline of the button, so custom border-radius works too. */
    const outline = (w, h, r, inset) => {
      const x0 = inset,
        y0 = inset,
        x1 = w - inset,
        y1 = h - inset,
        rr = Math.max(0, r - inset);
      ctx.beginPath();
      ctx.moveTo(x0 + rr, y0);
      ctx.lineTo(x1 - rr, y0);
      ctx.arc(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0);
      ctx.lineTo(x1, y1 - rr);
      ctx.arc(x1 - rr, y1 - rr, rr, 0, Math.PI / 2);
      ctx.lineTo(x0 + rr, y1);
      ctx.arc(x0 + rr, y1 - rr, rr, Math.PI / 2, Math.PI);
      ctx.lineTo(x0, y0 + rr);
      ctx.arc(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5);
      ctx.closePath();
    };

    /** A point at distance s along the edge, clockwise from the top-left end of the top side. */
    const along = (s, w, h, r, inset) => {
      const x0 = inset,
        y0 = inset,
        x1 = w - inset,
        y1 = h - inset,
        rr = Math.max(0, r - inset);
      const sx = x1 - x0 - 2 * rr,
        sy = y1 - y0 - 2 * rr,
        q = (Math.PI / 2) * rr;
      const per = 2 * sx + 2 * sy + 4 * q;
      s = ((s % per) + per) % per;
      const arc = (cx, cy, a0, d) => {
        const a = a0 + d / (rr || 1);
        return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
      };
      if (s < sx) return { x: x0 + rr + s, y: y0 };
      s -= sx;
      if (s < q) return arc(x1 - rr, y0 + rr, -Math.PI / 2, s);
      s -= q;
      if (s < sy) return { x: x1, y: y0 + rr + s };
      s -= sy;
      if (s < q) return arc(x1 - rr, y1 - rr, 0, s);
      s -= q;
      if (s < sx) return { x: x1 - rr - s, y: y1 };
      s -= sx;
      if (s < q) return arc(x0 + rr, y1 - rr, Math.PI / 2, s);
      s -= q;
      if (s < sy) return { x: x0, y: y1 - rr - s };
      s -= sy;
      return arc(x0 + rr, y0 + rr, Math.PI, s);
    };

    const draw = (now) => {
      // The button's own size (offsetWidth ignores scaling), so it also works inside a scaled-down preview.
      const w = btn.offsetWidth,
        h = btn.offsetHeight;
      if (!w || !h) return;
      const nd = Math.min(2, devicePixelRatio || 1);
      if (w !== cw || h !== ch || nd !== dpr) {
        cw = w;
        ch = h;
        dpr = nd;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      if (opts.current.disabled) return;

      // The color is read from the page a few times a second, so theme colors follow light and dark mode.
      if (now - inkAt > 250) {
        ink = getComputedStyle(canvas).color;
        radius = parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0;
        inkAt = now;
      }
      const r = clamp(radius, 0, Math.min(w, h) / 2);
      const always = opts.current.always;
      const t = reduced ? 0 : now;

      // 1. The click waves: a soft band rolling out from each click.
      const waveAt = (x, y) => {
        let v = 0;
        for (const wv of waves) {
          const age = now - wv.at;
          const d = Math.hypot(x - wv.x, y - wv.y) - SPEED * age;
          if (d > WIDTH * 2.5 || d < -WIDTH * 2.5) continue;
          v = Math.max(
            v,
            Math.exp(-(d * d) / (2 * WIDTH * WIDTH)) * (1 - 0.45 * clamp(age / wv.life, 0, 1)),
          );
        }
        return v;
      };

      // 2. The glow: on hover, light comes in evenly from every side and fades toward the middle,
      //    drawn as thin rings, each a little further in and fainter, so no side is stronger than another.
      if (level > 0.01) {
        const depth = Math.min(h * GLOW_DEPTH, h / 2 - 2, w / 2 - 2);
        // The glow comes up as the pixels spread across the button.
        const spread = reduced ? 1 : clamp((SPREAD * (now - enterAt)) / (w * 0.6), 0, 1);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        for (let d = 0.6; d < depth; d += 0.7) {
          ctx.globalAlpha = GLOW * level * spread * (1 - d / depth) ** 1.6;
          outline(w, h, r, d);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // 3. The pixels. Brighter toward the edge, twinkling, a little brighter near the pointer.
      if (level > 0.003 || always || waves.length) {
        ctx.fillStyle = ink;
        const cols = Math.floor((w - DOT) / PITCH) + 1,
          rows = Math.floor((h - DOT) / PITCH) + 1;
        const ox = (w - ((cols - 1) * PITCH + DOT)) / 2,
          oy = (h - ((rows - 1) * PITCH + DOT)) / 2;
        const mid = h / 2;
        const spot = hover || pressed;
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            // Each spot is nudged off the grid at random, and some stay empty.
            if (hash(i, j, 8) < GAPS) continue;
            const x = ox + i * PITCH + DOT / 2 + Math.round((hash(i, j, 5) - 0.5) * 2.4) * NUDGE;
            const y = oy + j * PITCH + DOT / 2 + Math.round((hash(i, j, 6) - 0.5) * 2.4) * NUDGE;
            // How far inside the edge this pixel is: 0 on the edge, 1 on the centre line.
            const dx = x - clamp(x, r, w - r),
              dy = y - mid;
            const depth =
              r > 0
                ? clamp(1 - (r - Math.hypot(dx, dy)) / r, 0, 1)
                : 1 - Math.min(y, h - y, x, w - x) / mid;
            if (depth <= 0) continue;
            const n = hash(i, j);
            // Every pixel breathes a little at its own uneven pace; a few now and then light up brighter and fade back.
            const wobble =
              0.6 * Math.sin(t * TWINKLE * (0.5 + hash(i, j, 1) * 1.5) + n * 6.283) +
              0.4 * Math.sin(t * TWINKLE * 2.7 * (0.4 + hash(i, j, 3)) + hash(i, j, 9) * 9);
            let twinkle = 1 - BREATHE + BREATHE * wobble;
            if (hash(i, j, 2) < SPARKLES)
              twinkle +=
                SPARK * Math.max(0, Math.sin(t * SPARKLE * (0.6 + hash(i, j, 3)) + n * 40)) ** 6;
            const dim = 0.25 + 0.75 * hash(i, j, 10) ** 2; // each pixel has its own brightness: most soft, a few bright
            // How lit this pixel is by hover: it lights up once the spreading edge from the pointer reaches it,
            // and on the way out each pixel goes dark at its own random moment.
            const reach = reduced
              ? 1
              : clamp(
                  (SPREAD * (now - enterAt) -
                    Math.hypot(x - E.x, y - E.y) +
                    hash(i, j, 4) * RAGGED) /
                    10,
                  0,
                  1,
                );
            const lit = clamp((level - hash(i, j, 7) * 0.7) / 0.3, 0, 1) * reach;
            const base = always ? REST * (1 - lit) + LIT * lit : LIT * lit;
            let a = base * twinkle * dim * (1 - EDGE + EDGE * depth ** 1.6);
            if (spot && lit > 0)
              a += 0.25 * lit * clamp(1 - Math.hypot(x - P.x, y - P.y) / SPOT, 0, 1) * twinkle;
            const wv = waves.length ? waveAt(x, y) : 0;
            a = clamp(a + wv * WAVE, 0, 1);
            if (a < 0.03) continue;
            ctx.globalAlpha = a;
            const s = DOT + (wv > 0.6 ? 1 : 0); // pixels the wave's middle passes grow by one px
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 4. The whole edge lights up softly on hover.
      if (level > 0.01) {
        ctx.globalAlpha =
          RIM * level * (reduced ? 1 : clamp((SPREAD * (now - enterAt)) / (w * 0.6), 0, 1));
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        outline(w, h, r, 0.5);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 5. The edge light: a bright head with a fading tail going round the edge. Held still with reduced motion.
      if (!reduced) {
        const rr = Math.max(0, r - 0.75),
          q = (Math.PI / 2) * rr;
        const per = 2 * (w - 1.5 - 2 * rr) + 2 * (h - 1.5 - 2 * rr) + 4 * q;
        const head = ((now % TRAIL_MS) / TRAIL_MS) * per;
        const len = per * TRAIL,
          steps = 28;
        ctx.strokeStyle = ink;
        ctx.lineWidth = TRAIL_W;
        ctx.shadowColor = ink;
        ctx.lineCap = "round";
        let prev = along(head - len, w, h, r, 0.75);
        for (let k = 1; k <= steps; k++) {
          const p = along(head - len + (len * k) / steps, w, h, r, 0.75);
          const f = k / steps;
          ctx.globalAlpha = TRAIL_ALPHA * f ** 1.6;
          ctx.shadowBlur = TRAIL_BLUR * f; // only the head glows
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          prev = p;
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      const target = !opts.current.disabled && (hover || pressed) ? 1 : 0;
      level +=
        (target - level) * (1 - Math.exp(-dt / (target > level ? HOVER_IN_MS : HOVER_OUT_MS)));
      if (target ? level > 0.995 : level < 0.01) level = target;
      waves = waves.filter((wv) => now - wv.at < wv.life);
      draw(now);
      // The edge light and the twinkle always move, so the loop runs while the button is on screen.
      // With reduced motion they hold still, and the loop only runs while the glow or a wave changes.
      const moving = !reduced && !opts.current.disabled;
      if (onScreen && !document.hidden && (moving || level !== target || waves.length))
        raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && onScreen && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    wakeRef.current = wake;

    const startWave = (x, y) => {
      if (opts.current.disabled) return;
      const w = btn.offsetWidth,
        h = btn.offsetHeight;
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

    // A fresh arrival lights the pixels up outward from the pointer. Coming back while they are still lit doesn't restart it.
    const enter = (x, y) => {
      if (level > 0.3) return;
      enterAt = performance.now();
      E.x = x;
      E.y = y;
    };
    const onEnter = (e) => {
      if (e.pointerType === "touch") return;
      hover = true;
      Object.assign(P, local(e));
      enter(P.x, P.y);
      wake();
    };
    const onMove = (e) => {
      if (e.pointerType === "touch" && !pressed) return;
      Object.assign(P, local(e));
    };
    const onLeave = () => {
      hover = false;
      pressed = false;
      wake();
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const at = local(e);
      Object.assign(P, at);
      if (e.pointerType === "touch") {
        pressed = true;
        enter(at.x, at.y);
      }
      startWave(at.x, at.y);
    };
    const onUp = (e) => {
      if (e.pointerType === "touch") {
        pressed = false;
        wake();
      }
    };
    // Enter or Space on the keyboard: the wave starts from the centre.
    const onClick = (e) => {
      if (e.detail === 0) startWave(btn.offsetWidth / 2, btn.offsetHeight / 2);
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };
    const onReduce = () => {
      reduced = reduceMq.matches;
      wake();
    };
    // Off screen, nothing is drawn.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(btn);
    // A resize (or a font loading) redraws with reduced motion too.
    const ro = new ResizeObserver(() => wake());
    ro.observe(btn);

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointermove", onMove, { passive: true });
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointercancel", onLeave);
    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVis);
    reduceMq.addEventListener("change", onReduce);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wakeRef.current = () => {};
      io.disconnect();
      ro.disconnect();
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
        className={className ? `ipx ${className}` : "ipx"}
        style={{
          ...(color ? { "--ipx-fill": color } : null),
          ...(textColor ? { "--ipx-text": textColor } : null),
          ...(glowColor ? { "--ipx-glow": glowColor } : null),
          ...style,
        }}
        {...rest}
      >
        <canvas ref={canvasRef} className="ipx-field" width={0} height={0} aria-hidden="true" />
        <span className="ipx-label">{children}</span>
      </button>
    </>
  );
});
