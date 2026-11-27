"use client";

/**
 * Particle Wake, from Impeccable.
 *
 * Your SVG (or a word) drawn as thousands of tiny dots. Move the pointer
 * through it and the dots get swept along in its wake, then drift back home
 * one by one until the shape is whole again. A click or a tap pushes them
 * out in a soft ring.
 *
 *   <ParticleWake svg={mySvgMarkup} />          the SVG markup as a string
 *   <ParticleWake svg="/logo.svg" />            or a link to an .svg (any image works)
 *   <ParticleWake text="Impeccable" />          or a word, in the font around it
 *
 * The dots take the text color around them (currentColor) unless you pass a
 * color, so they follow light and dark mode. Give the wrapper a size with
 * className or style; by default it is full width and 2:1.
 *
 * Light on purpose: one canvas, and one animation frame loop that runs only
 * while dots are moving and the shape is on screen. Phones: no hover; drag a
 * finger sideways through it (vertical swipes still scroll the page) or tap.
 * Reduced motion: the shape stands still and nothing moves.
 *
 * No packages.
 */

import { useEffect, useRef } from "react";

/* ---------- the design: keep as written ---------- */

const STEP_MS = 1000 / 60; // physics runs in fixed 60 fps steps, so it feels the same on 120 Hz screens
const SPRING = 0.0055; // pull back home per step (each dot gets 0.7x to 1.3x, so they return one by one)
const FRICTION = 0.9; // velocity kept per step
const CARRY = 0.3; // share of the pointer's speed handed to a dot right under it
const PUSH = 0.9; // outward nudge at the pointer while it moves, so it parts the dots
const TAP_PUSH = 5; // outward kick of a click or tap
const TAP_REACH = 1.6; // a click reaches this many times the radius
const MAX_SPEED = 26; // px per step, so a flick never throws dots off screen
const SETTLE = 0.05; // px; below this everywhere, the loop stops
const INTRO_SPREAD = 0.35; // dots start this share of the box away from home
const INTRO_FADE_MS = 700;
const FULL_SIZE_AT = 640; // px wide; narrower boxes (a phone) shrink the gap, dots and radius with them
const MIN_SCALE = 0.45; // never smaller than this share
const FIT = 0.84; // the shape fills this share of the box
const MAX_DOTS = 14000; // bigger boxes get a wider gap so it stays smooth
const ALPHAS = [0.32, 0.55, 0.78, 1]; // four brightness levels give the dust its depth

/** How much a box this wide shrinks the gap, dots and radius: 1 at 640px and up. */
const fit = (w) => Math.min(1, Math.max(MIN_SCALE, w / FULL_SIZE_AT));

/** Same random numbers every time, so the dots don't reshuffle on resize. */
function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Gives SVG markup a width and height (from its viewBox) so it draws at a real size. */
function sizedSvg(markup) {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const el = doc.documentElement;
  if (!el || el.nodeName.toLowerCase() !== "svg") return null;
  if (!el.getAttribute("xmlns")) el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const vb = (el.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  const w = parseFloat(el.getAttribute("width") || "") || vb[2] || 300;
  const h = parseFloat(el.getAttribute("height") || "") || vb[3] || 150;
  el.setAttribute("width", String(w));
  el.setAttribute("height", String(h));
  return { text: new XMLSerializer().serializeToString(el), w, h };
}

async function loadImage(svg) {
  const img = new Image();
  let url = "";
  let w = 0;
  let h = 0;
  if (svg.trim().startsWith("<")) {
    const sized = sizedSvg(svg.trim());
    if (!sized) throw new Error("ParticleWake: svg is not valid SVG markup.");
    url = URL.createObjectURL(new Blob([sized.text], { type: "image/svg+xml" }));
    w = sized.w;
    h = sized.h;
    img.src = url;
  } else {
    img.crossOrigin = "anonymous";
    img.src = svg;
  }
  try {
    await img.decode();
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
  return { img, w: img.naturalWidth || w || 300, h: img.naturalHeight || h || 150 };
}

/** Draws the shape in black on a hidden canvas the size of the box and returns its pixels. */
async function rasterize(host, w, h, svg, text) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const bw = w * FIT;
  const bh = h * FIT;
  if (svg) {
    const { img, w: iw, h: ih } = await loadImage(svg);
    const s = Math.min(bw / iw, bh / ih);
    ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
  } else if (text) {
    await document.fonts?.ready;
    const cs = getComputedStyle(host);
    const font = (px) => `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
    ctx.font = font(100);
    if ("letterSpacing" in ctx)
      ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    const m = ctx.measureText(text);
    const tw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight || m.width;
    const th = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 72;
    const px = 100 * Math.min(bw / tw, bh / th);
    ctx.font = font(px);
    const mm = ctx.measureText(text);
    const x =
      (w - (mm.actualBoundingBoxRight - mm.actualBoundingBoxLeft)) / 2 + mm.actualBoundingBoxLeft;
    const y =
      (h - (mm.actualBoundingBoxAscent + mm.actualBoundingBoxDescent)) / 2 +
      mm.actualBoundingBoxAscent;
    ctx.fillText(text, x, y);
  } else return null;
  return ctx.getImageData(0, 0, w, h);
}

/** Turns the filled pixels into dots on a loose, jittered grid. */
function makeDots(px, gap, dot) {
  const { width: w, height: h, data } = px;
  let g = gap;
  for (let tries = 0; tries < 4; tries++) {
    const rand = seeded(7919);
    const list = [[], [], [], []];
    for (let y = g / 2; y < h; y += g) {
      for (let x = g / 2; x < w; x += g) {
        const jx = x + (rand() - 0.5) * g * 0.9;
        const jy = y + (rand() - 0.5) * g * 0.9;
        const r = rand();
        const lv = rand();
        const kk = rand();
        const ix = Math.min(w - 1, Math.max(0, Math.round(jx)));
        const iy = Math.min(h - 1, Math.max(0, Math.round(jy)));
        if (data[(iy * w + ix) * 4 + 3] < 110) continue;
        const level = lv < 0.18 ? 0 : lv < 0.45 ? 1 : lv < 0.78 ? 2 : 3;
        list[level].push(jx, jy, (dot / 2) * (0.6 + r * 0.7), SPRING * (0.7 + kk * 0.6));
      }
    }
    const n = list.reduce((s, l) => s + l.length / 4, 0);
    if (n > MAX_DOTS && tries < 3) {
      g *= Math.sqrt(n / MAX_DOTS) * 1.02;
      continue;
    }
    const d = {
      n,
      x: new Float32Array(n),
      y: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      hx: new Float32Array(n),
      hy: new Float32Array(n),
      r: new Float32Array(n),
      k: new Float32Array(n),
      start: [],
    };
    let i = 0;
    for (const l of list) {
      d.start.push(i);
      for (let j = 0; j < l.length; j += 4, i++) {
        d.x[i] = d.hx[i] = l[j];
        d.y[i] = d.hy[i] = l[j + 1];
        d.r[i] = l[j + 2];
        d.k[i] = l[j + 3];
      }
    }
    d.start.push(n);
    return d;
  }
  throw new Error("unreachable");
}

export function ParticleWake({
  svg,
  text,
  color = "currentColor",
  gap = 4,
  dot = 1.8,
  radius = 64,
  strength = 1,
  intro = true,
  label,
  className,
  style,
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  // The live tuning, read by the running loop without restarting it.
  const tune = useRef({ radius, strength });
  tune.current = { radius, strength };

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dots = null;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let paint = "#000";
    let raf = 0;
    let last = 0;
    let acc = 0;
    let seen = false;
    let introAt = -1; // when the intro started; -1 = not yet
    let introDone = !intro;
    let alive = true;
    let build = 0;
    // The pointer, in px inside the box.
    const p = { x: 0, y: 0, lx: 0, ly: 0, vx: 0, vy: 0, on: false, fresh: true };
    let taps = [];

    const readColor = () => {
      canvas.style.color = color;
      paint = getComputedStyle(canvas).color || "#000";
    };

    const draw = (now) => {
      if (!dots) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = paint;
      const fade = introDone ? 1 : introAt < 0 ? 0 : Math.min(1, (now - introAt) / INTRO_FADE_MS);
      for (let lv = 0; lv < 4; lv++) {
        ctx.globalAlpha = ALPHAS[lv] * fade;
        ctx.beginPath();
        for (let i = dots.start[lv]; i < dots.start[lv + 1]; i++) {
          const x = dots.x[i];
          const y = dots.y[i];
          const r = dots.r[i];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    /** One fixed physics step. Returns how far the farthest dot is from settled. */
    const step = () => {
      const d = dots;
      // Small boxes (a phone) shrink the reach with them, so one swipe doesn't scatter the whole shape.
      const R = Math.max(8, tune.current.radius * fit(w));
      const s = Math.max(0, tune.current.strength);
      // Pointer speed this step, smoothed a little so a jittery mouse still sweeps evenly.
      if (p.on) {
        if (p.fresh) {
          p.lx = p.x;
          p.ly = p.y;
          p.fresh = false;
        }
        p.vx = p.vx * 0.5 + (p.x - p.lx) * 0.5;
        p.vy = p.vy * 0.5 + (p.y - p.ly) * 0.5;
        p.lx = p.x;
        p.ly = p.y;
      } else {
        p.vx = p.vy = 0;
      }
      const speed = Math.hypot(p.vx, p.vy);
      const moving = p.on && speed > 0.05;
      const pushF = Math.min(1, speed / 6) * PUSH * s;
      const R2 = R * R;
      const TR = R * TAP_REACH;
      const TR2 = TR * TR;
      let most = 0;
      for (let i = 0; i < d.n; i++) {
        let x = d.x[i];
        let y = d.y[i];
        let vx = d.vx[i];
        let vy = d.vy[i];
        if (moving) {
          const dx = x - p.x;
          const dy = y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const dist = Math.sqrt(d2) || 1;
            let f = 1 - dist / R;
            f *= f;
            vx += p.vx * CARRY * f * s + (dx / dist) * pushF * f;
            vy += p.vy * CARRY * f * s + (dy / dist) * pushF * f;
          }
        }
        for (const t of taps) {
          const dx = x - t.x;
          const dy = y - t.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < TR2) {
            const dist = Math.sqrt(d2) || 1;
            const f = 1 - dist / TR;
            vx += (dx / dist) * TAP_PUSH * s * f * f;
            vy += (dy / dist) * TAP_PUSH * s * f * f;
          }
        }
        const k = d.k[i];
        vx = (vx + (d.hx[i] - x) * k) * FRICTION;
        vy = (vy + (d.hy[i] - y) * k) * FRICTION;
        const v = Math.hypot(vx, vy);
        if (v > MAX_SPEED) {
          vx *= MAX_SPEED / v;
          vy *= MAX_SPEED / v;
        }
        x += vx;
        y += vy;
        d.x[i] = x;
        d.y[i] = y;
        d.vx[i] = vx;
        d.vy[i] = vy;
        const off = Math.abs(d.hx[i] - x) + Math.abs(d.hy[i] - y) + Math.abs(vx) + Math.abs(vy);
        if (off > most) most = off;
      }
      taps = [];
      return most;
    };

    const frame = (now) => {
      raf = 0;
      if (!alive || !dots) return;
      acc += Math.min(100, now - (last || now));
      last = now;
      let most = 0;
      let ran = 0;
      while (acc >= STEP_MS && ran < 5) {
        most = Math.max(most, step());
        acc -= STEP_MS;
        ran++;
      }
      if (ran === 5) acc = 0;
      if (!introDone && introAt >= 0 && now - introAt > INTRO_FADE_MS && most < 1) introDone = true;
      draw(now);
      const sweeping = p.on && Math.abs(p.vx) + Math.abs(p.vy) > 0.01; // a resting pointer lets the loop sleep
      const busy = sweeping || !introDone || ran === 0 || most > SETTLE;
      if (busy && seen) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && seen && dots && !still.matches) {
        last = 0;
        acc = STEP_MS; // move on the very first frame
        raf = requestAnimationFrame(frame);
      }
    };

    const startIntro = () => {
      if (introDone || introAt >= 0 || !dots || !seen) return;
      if (still.matches) {
        introDone = true;
        draw(performance.now());
        return;
      }
      const d = dots;
      const rand = seeded(104729);
      const spread = Math.max(w, h) * INTRO_SPREAD;
      for (let i = 0; i < d.n; i++) {
        const a = rand() * Math.PI * 2;
        const r = spread * (0.3 + rand() * 0.7);
        d.x[i] = d.hx[i] + Math.cos(a) * r;
        d.y[i] = d.hy[i] + Math.sin(a) * r;
        d.vx[i] = d.vy[i] = 0;
      }
      introAt = performance.now();
      wake();
    };

    const rebuild = async () => {
      const mine = ++build;
      // Layout size, not on-screen size, so a scaled parent (transform: scale) still draws sharp.
      const nw = host.clientWidth;
      const nh = host.clientHeight;
      if (nw < 2 || nh < 2) return;
      try {
        if (!svg && !text) {
          console.warn("ParticleWake: pass your SVG as svg, or a word as text, to draw a shape.");
          return;
        }
        const px = await rasterize(host, nw, nh, svg, svg ? undefined : text);
        if (!alive || mine !== build || !px) return;
        w = nw;
        h = nh;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        // A smaller box packs the dots closer and makes them a little smaller, so the shape stays as full as on a desktop.
        const k = fit(w);
        dots = makeDots(px, Math.max(1, gap * k), Math.max(0.5, dot * Math.max(0.65, k)));
        readColor();
        if (!introDone) startIntro();
        draw(performance.now());
      } catch (err) {
        // A broken SVG or an image from another site that blocks reading its pixels.
        console.warn("ParticleWake: could not read the shape.", err);
      }
    };

    // Pointer: mouse and pen sweep on hover; a finger sweeps while dragging sideways (vertical swipes scroll).
    const at = (e) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (w / (r.width || 1)),
        y: (e.clientY - r.top) * (h / (r.height || 1)),
      };
    };
    const onMove = (e) => {
      if (still.matches) return;
      if (e.pointerType === "touch" && !p.on) return;
      const q = at(e);
      p.x = q.x;
      p.y = q.y;
      if (!p.on) {
        p.on = true;
        p.fresh = true;
      }
      wake();
    };
    const onDown = (e) => {
      if (still.matches || e.button > 0) return;
      const q = at(e);
      taps.push(q);
      if (e.pointerType === "touch") {
        p.x = q.x;
        p.y = q.y;
        p.on = true;
        p.fresh = true;
      }
      wake();
    };
    const onLeave = (e) => {
      if (e.type === "pointerleave" && e.pointerType === "touch") return;
      p.on = false;
      wake();
    };
    const onTouchEnd = (e) => {
      if (e.pointerType === "touch") onLeave(e);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerup", onTouchEnd);
    host.addEventListener("pointercancel", onLeave);

    // Only works while on screen.
    const io = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      if (seen) {
        startIntro();
        wake();
      }
    });
    io.observe(host);

    // Rebuild when the box changes size (a short wait, so dragging a window edge doesn't redo it every frame).
    let timer = 0;
    let firstSize = true;
    const ro = new ResizeObserver(() => {
      if (firstSize) {
        firstSize = false;
        rebuild();
        return;
      }
      clearTimeout(timer);
      timer = window.setTimeout(rebuild, 120);
    });
    ro.observe(host);

    // Follow theme changes: the color is read again and the dots repainted.
    const recolor = () => {
      readColor();
      if (!raf) draw(performance.now());
    };
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", recolor);
    const onStill = () => {
      if (!still.matches || !dots) return;
      // Reduced motion turned on mid-way: put every dot home.
      dots.x.set(dots.hx);
      dots.y.set(dots.hy);
      dots.vx.fill(0);
      dots.vy.fill(0);
      introDone = true;
      draw(performance.now());
    };
    still.addEventListener("change", onStill);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      dark.removeEventListener("change", recolor);
      still.removeEventListener("change", onStill);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerup", onTouchEnd);
      host.removeEventListener("pointercancel", onLeave);
    };
  }, [svg, text, color, gap, dot, intro]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label ?? text ?? "Particle shape"}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "2 / 1",
        touchAction: "pan-y",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export default ParticleWake;
