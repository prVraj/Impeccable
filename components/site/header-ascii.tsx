"use client";

import { useEffect, useRef } from "react";

// Site chrome, not a library item: a quiet mosaic of small gray tiles that fills the empty
// space above a page title on the docs pages and /components.
//
// - One dense, even grid: every cell holds a tile, so it reads as one surface, never as
//   scattered pieces. Each tile steps between a few soft shades as slow noise drifts by.
// - Neutral gray only, never the brand colour: a very light gray 300 in light, between gray
//   700 and 800 in dark, so it fills the gap without pulling the eye from the title.
// - It starts right at the sheet's top and left edges (no empty margin), is strongest at the
//   top and fades out by the end of the header (title and description). It never runs past it.
// - Light on purpose: one small canvas, one fill per shade, about 12 frames a second, paused
//   when it is off screen or the tab is hidden. Reduced motion gets one still frame.

const CELL = 6; // px, tile + gap
const GAP = 1; // px between tiles
const FPS = 12;
const SHADES = [0.16, 0.26, 0.38, 0.55]; // tile strength, light to dense
const STEPS = 20; // how finely the fade is split into batches

// Smooth 2D value noise (0..1) from a fixed table, so the field looks the same on every load.
const P = new Uint8Array(512);
{
  let seed = 7;
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
}
const ease = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = ease(x - xi);
  const yf = ease(y - yi);
  const X = xi & 255;
  const Y = yi & 255;
  const a = P[P[X] + Y] / 255;
  const b = P[P[X + 1] + Y] / 255;
  const c = P[P[X] + Y + 1] / 255;
  const d = P[P[X + 1] + Y + 1] / 255;
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

const CSS = `
/* Light is kept extra soft (--ascii-strength); dark keeps full strength. */
.header-ascii { --ascii-tile: var(--gray-300); --ascii-strength: 0.6; color: var(--ascii-tile); }
.dark .header-ascii { --ascii-tile: color-mix(in srgb, var(--gray-700) 60%, var(--gray-800)); --ascii-strength: 1; }
/* The sheet's rounded top edge (in the tab) only has to hide text that scrolls under it.
   At the very top there is nothing under it, so it fades in with the first 16px of scroll
   and the field can start right at the sheet's top edge. */
@media (min-width: 64rem) { .sheet-cover { opacity: var(--sheet-cover, 1); } }
`;

export function HeaderAscii() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const sheet = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !sheet || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cols = 0;
    let rows = 0;
    let fade = new Float32Array(0); // per cell: top to bottom fade x side fade
    let grain = new Float32Array(0); // per cell: a fixed nudge so neighbours differ a little
    let color = "";
    let strength = 1;
    let raf = 0;
    let last = 0;
    let visible = true;

    const readColor = () => {
      // Read through `color` so the browser turns the token (and its color-mix) into plain rgb.
      const st = getComputedStyle(canvas);
      color = st.color || "#d5d7da";
      strength = parseFloat(st.getPropertyValue("--ascii-strength")) || 1;
    };

    // The field ends at the bottom of the header (the title and the line under it).
    const measure = () => {
      const title = sheet.querySelector<HTMLElement>(".docs-main h1");
      const lede = title?.nextElementSibling instanceof HTMLParagraphElement ? title.nextElementSibling : null;
      const end = lede ?? title;
      const top = canvas.getBoundingClientRect().top;
      const bottom = end ? end.getBoundingClientRect().bottom : top + 120;
      const w = sheet.clientWidth;
      const h = Math.max(0, Math.round(bottom - top));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      fade = new Float32Array(cols * rows);
      grain = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        // Full at the top, eases out to nothing at the end of the header.
        const y = rows > 1 ? r / (rows - 1) : 0;
        const v = 1 - ease(y);
        for (let c = 0; c < cols; c++) {
          fade[r * cols + c] = v;
          grain[r * cols + c] = (P[(c * 7 + r * 13) & 511] / 255 - 0.5) * 0.35;
        }
      }
      readColor();
      draw(last || 0);
    };

    const paths: Path2D[] = [];
    const draw = (t: number) => {
      ctx.clearRect(0, 0, cols * CELL, rows * CELL);
      for (let i = 0; i <= STEPS; i++) paths[i] = new Path2D();
      const size = CELL - GAP;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = r * cols + c;
          const f = fade[k] * strength;
          if (f < 0.02) continue;
          // Two layers of soft noise drifting in different directions, plus each tile's own
          // grain, then snapped to a few shades so tiles step, never blur.
          const x = c * CELL;
          const y = r * CELL;
          const n =
            noise(x * 0.014 + t * 0.00006, y * 0.014 - t * 0.00002) * 0.6 +
            noise(x * 0.05 - t * 0.0001, y * 0.05 + t * 0.00005 + 40) * 0.4 +
            grain[k];
          const s = SHADES[Math.max(0, Math.min(SHADES.length - 1, Math.floor(n * SHADES.length)))];
          const b = Math.round(s * f * STEPS);
          if (b > 0) paths[b].rect(x, y, size, size);
        }
      }
      ctx.fillStyle = color;
      for (let i = 1; i <= STEPS; i++) {
        ctx.globalAlpha = i / STEPS;
        ctx.fill(paths[i]);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (reduce.matches || !visible || document.hidden) {
        draw(last || 0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(sheet);
    const main = sheet.querySelector(".docs-main");
    if (main) ro.observe(main);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);

    // Theme switch: pick up the new gray straight away.
    const mo = new MutationObserver(() => {
      readColor();
      draw(last || 0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const root = document.documentElement;
    const onScroll = () => root.style.setProperty("--sheet-cover", String(Math.min(1, window.scrollY / 16)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.addEventListener("visibilitychange", start);
    reduce.addEventListener("change", start);
    // The fonts can land after the first measure and change the header's height.
    document.fonts?.ready.then(measure);

    measure();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.style.removeProperty("--sheet-cover");
      document.removeEventListener("visibilitychange", start);
      reduce.removeEventListener("change", start);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <canvas
        ref={ref}
        aria-hidden="true"
        className="header-ascii pointer-events-none absolute top-0 left-0 h-0 select-none lg:rounded-tl-[15px]"
      />
    </>
  );
}
