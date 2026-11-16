"use client";

/**
 * Loupe Grid, from Impeccable.
 *
 * A quiet grid background that comes alive under the pointer, like a jeweller's
 * loupe passing over it. The marks near the pointer swell, brighten into the hover
 * color, glow softly and spread apart a little, and the lines bend around them.
 * The pointer moves on; the marks settle back. Everything eases in and out.
 *
 * Four types: plus marks, plus marks on lines, dots, or dots on lines.
 *
 * It sits behind whatever you put inside it. It is never selectable, never
 * catches a click, and is hidden from screen readers. Phones get the loupe
 * wherever a finger touches.
 *
 * No packages. One canvas. Only the small square around the pointer is redrawn,
 * and only while something moves; at rest nothing runs at all. It waits until it
 * is near the screen before it draws, and ignores the pointer while off screen.
 */

import { useEffect, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const PLUS_ARM = 4.5; // px: from the middle of a plus to the end of an arm
const PLUS_W = 1.2; // px: thickness of a plus
const DOT_R = 1.5; // px: radius of a dot
const LINE_W = 1; // px: thickness of a line
const MARK_A = 0.3; // how strong a mark is at rest (share of its color)
const LINE_A = 0.1; // how strong a line is at rest
const LINE_HOT_A = 0.4; // how strong a line gets right under the pointer
const PUSH = 0.28; // how far marks spread away from the pointer: the bulge of the loupe
const GLOW = 0.3; // glow strength under the pointer, for a light hover color
const GLOW_DARK = 0.12; // the same for a dark hover color, so it never smudges a light page
const GLOW_R = 10; // px: glow radius around one mark at normal size
const IN_MS = 200; // the loupe eases in over this long
const OUT_MS = 550; // and out over this long, gentler
const FOLLOW_MS = 60; // how closely it trails the pointer
const TOUCH_HOLD_MS = 450; // after a finger lifts, the loupe stays this long, then fades
const STEP = 6; // px: lines bend in pieces this long inside the loupe
const LEVELS = 10; // shades a bent line is drawn in
const MAX_PIXELS = 8_000_000; // canvas size budget; a very large box draws a little softer instead of running out of memory

const TYPES = ["plus", "plus-lines", "dots", "dots-lines"];

const CSS = `
:where(.ilg) { position: relative; isolation: isolate; }
.ilg-layer { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.ilg-layer canvas { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; pointer-events: none; }`;

/* ---------- small helpers ---------- */

const num = (v, fallback, min, max) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Any CSS color as [r, g, b, a], worked out by painting it, so every color format works (rgb, oklch, color()...). */
let probe = null;
function toRgba(color) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [128, 128, 128, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#808080";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

const isLight = ([r, g, b]) => {
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
};

const mix = (a, b, t, aAlpha, bAlpha) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)} ${Math.round(a[1] + (b[1] - a[1]) * t)} ${Math.round(a[2] + (b[2] - a[2]) * t)} / ${(aAlpha + (bAlpha - aAlpha) * t).toFixed(3)})`;

/* ---------- the background ---------- */

export function LoupeGrid({
  type = "plus",
  gap = 56,
  radius = 150,
  magnify = 1.8,
  color,
  hoverColor,
  className,
  children,
  ...rest
}) {
  const rootRef = useRef(null);
  const layerRef = useRef(null);
  const canvasRef = useRef(null);
  const refresh = useRef(() => {});

  // Props the running code reads without starting over.
  const opts = useRef({ type, gap, radius, magnify, color, hoverColor });
  opts.current = {
    type: TYPES.includes(type) ? type : "plus",
    gap: Math.round(num(gap, 56, 12, 400)),
    radius: num(radius, 150, 24, 1200),
    magnify: num(magnify, 1.8, 1, 4),
    color,
    hoverColor,
  };

  useEffect(() => {
    refresh.current();
  }, [type, gap, radius, magnify, color, hoverColor]);

  useEffect(() => {
    const root = rootRef.current,
      layer = layerRef.current,
      canvas = canvasRef.current;
    if (!root || !layer || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let still = reduceMq.matches; // reduced motion: marks light up and glow, but don't grow or move

    // Size, grid and colors.
    let w = 0,
      h = 0,
      dpr = 1,
      ox = 0,
      oy = 0,
      nx = 0,
      ny = 0,
      G = 56,
      R = 150,
      MAG = 1.8;
    let kind = "plus";
    let base = [128, 128, 128, 1],
      hot = [128, 128, 128, 1],
      glowA = GLOW;
    let sprite = null;

    // The loupe: where it is (box pixels), how far it has eased in (p, 0 to 1), how strong that makes it (s), and the box it last drew in.
    const L = { x: 0, y: 0, p: 0, s: 0 };
    let drawn = null;
    // The pointer, in screen pixels.
    const P = { cx: 0, cy: 0, has: false };
    let raf = 0,
      last = 0,
      visible = false,
      ready = false,
      holdTimer = 0;

    const readColors = () => {
      const read = (v) => {
        layer.style.color = v ?? "";
        const c = toRgba(getComputedStyle(layer).color);
        layer.style.color = "";
        return c;
      };
      base = read(opts.current.color);
      hot = read(opts.current.hoverColor);
      glowA = isLight(hot) ? GLOW : GLOW_DARK;
      // One soft round glow, drawn once and stamped under each lit mark.
      sprite ??= document.createElement("canvas");
      sprite.width = sprite.height = 64;
      const s = sprite.getContext("2d");
      if (s) {
        const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, `rgb(${hot[0]} ${hot[1]} ${hot[2]} / ${hot[3]})`);
        g.addColorStop(0.4, `rgb(${hot[0]} ${hot[1]} ${hot[2]} / ${hot[3] * 0.35})`);
        g.addColorStop(1, `rgb(${hot[0]} ${hot[1]} ${hot[2]} / 0)`);
        s.clearRect(0, 0, 64, 64);
        s.fillStyle = g;
        s.fillRect(0, 0, 64, 64);
      }
    };

    // The marks sit on a grid centred in the box; lines run edge to edge through them.
    const layout = () => {
      const o = opts.current;
      kind = o.type;
      G = o.gap;
      R = o.radius;
      MAG = o.magnify;
      w = root.offsetWidth;
      h = root.offsetHeight;
      const want = Math.min(window.devicePixelRatio || 1, 2);
      dpr =
        w * h * want * want > MAX_PIXELS
          ? Math.max(0.5, Math.sqrt(MAX_PIXELS / Math.max(1, w * h)))
          : want;
      const cw = Math.max(1, Math.round(w * dpr)),
        ch = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      nx = Math.max(1, Math.floor(w / G));
      ny = Math.max(1, Math.floor(h / G));
      // Lines that are an odd number of screen pixels thick sit on half pixels, so they stay crisp.
      const half = Math.round(LINE_W * dpr) % 2 ? 0.5 : 0;
      ox = (Math.round(((w - (nx - 1) * G) / 2) * dpr) + half) / dpr;
      oy = (Math.round(((h - (ny - 1) * G) / 2) * dpr) + half) / dpr;
    };

    // Where a point of the grid lands under the loupe, and how lit it is (0 to 1).
    const at = { x: 0, y: 0, t: 0 };
    const warp = (px, py) => {
      at.x = px;
      at.y = py;
      at.t = 0;
      if (L.s <= 0) return;
      const dx = px - L.x,
        dy = py - L.y,
        d2 = dx * dx + dy * dy;
      if (d2 >= R * R) return;
      const u = Math.sqrt(d2) / R,
        k = 1 - u;
      at.t = k * k * (1 + 2 * u) * L.s; // smooth: full at the pointer, nothing at the rim
      if (still) return;
      const push = PUSH * k * k * L.s; // spreads from the middle, never past the rim
      at.x = px + dx * push;
      at.y = py + dy * push;
    };

    const loupeBox = () => {
      const m = GLOW_R * MAG + PLUS_ARM * MAG + 4;
      return { x0: L.x - R - m, y0: L.y - R - m, x1: L.x + R + m, y1: L.y + R + m };
    };

    const linePaths = [];
    const drawLines = (x0, y0, x1, y1) => {
      const rest = new Path2D();
      for (let i = 0; i <= LEVELS; i++) linePaths[i] = new Path2D();
      const lit = L.s > 0;
      // One line, from a to b along it; `vert` says which way it runs.
      const line = (c, a, b, vert) => {
        const pc = vert ? L.x : L.y,
          pa = vert ? L.y : L.x;
        const near = lit && Math.abs(c - pc) < R;
        const la = near ? Math.max(a, pa - R) : b,
          lb = near ? Math.min(b, pa + R) : b;
        const seg = (p, s0, s1) => {
          if (s1 <= s0) return;
          if (vert) {
            p.moveTo(c, s0);
            p.lineTo(c, s1);
          } else {
            p.moveTo(s0, c);
            p.lineTo(s1, c);
          }
        };
        if (!near || lb <= la) return seg(rest, a, b);
        seg(rest, a, la);
        seg(rest, lb, b);
        // Inside the loupe: short pieces that bend with the marks and light up near the pointer.
        let px = 0,
          py = 0,
          pt = 0;
        for (let s = la, first = true; ; s = Math.min(lb, s + STEP)) {
          if (vert) warp(c, s);
          else warp(s, c);
          if (!first) {
            const lvl = Math.round(((pt + at.t) / 2) * LEVELS);
            const p = lvl > 0 ? linePaths[lvl] : rest;
            p.moveTo(px, py);
            p.lineTo(at.x, at.y);
          }
          px = at.x;
          py = at.y;
          pt = at.t;
          first = false;
          if (s >= lb) break;
        }
      };
      const ia = Math.max(0, Math.floor((x0 - ox) / G)),
        ib = Math.min(nx - 1, Math.ceil((x1 - ox) / G));
      for (let i = ia; i <= ib; i++) line(ox + i * G, Math.max(0, y0), Math.min(h, y1), true);
      const ja = Math.max(0, Math.floor((y0 - oy) / G)),
        jb = Math.min(ny - 1, Math.ceil((y1 - oy) / G));
      for (let j = ja; j <= jb; j++) line(oy + j * G, Math.max(0, x0), Math.min(w, x1), false);
      ctx.lineWidth = LINE_W;
      ctx.lineCap = "butt";
      ctx.strokeStyle = mix(base, hot, 0, LINE_A * base[3], 0);
      ctx.stroke(rest);
      for (let i = 1; i <= LEVELS; i++) {
        ctx.strokeStyle = mix(base, hot, i / LEVELS, LINE_A * base[3], LINE_HOT_A * hot[3]);
        ctx.stroke(linePaths[i]);
      }
    };

    const drawMarks = (x0, y0, x1, y1) => {
      const plus = kind === "plus" || kind === "plus-lines";
      const m = GLOW_R * MAG + PLUS_ARM * MAG;
      const ia = Math.max(0, Math.floor((x0 - m - ox) / G)),
        ib = Math.min(nx - 1, Math.ceil((x1 + m - ox) / G));
      const ja = Math.max(0, Math.floor((y0 - m - oy) / G)),
        jb = Math.min(ny - 1, Math.ceil((y1 + m - oy) / G));
      const rest = new Path2D();
      const lit = [];
      for (let j = ja; j <= jb; j++) {
        for (let i = ia; i <= ib; i++) {
          warp(ox + i * G, oy + j * G);
          if (at.t > 0.002) {
            lit.push(at.x, at.y, at.t);
          } else if (plus) {
            rest.moveTo(at.x - PLUS_ARM, at.y);
            rest.lineTo(at.x + PLUS_ARM, at.y);
            rest.moveTo(at.x, at.y - PLUS_ARM);
            rest.lineTo(at.x, at.y + PLUS_ARM);
          } else {
            rest.moveTo(at.x + DOT_R, at.y);
            rest.arc(at.x, at.y, DOT_R, 0, Math.PI * 2);
          }
        }
      }
      const restStyle = mix(base, hot, 0, MARK_A * base[3], 0);
      if (plus) {
        ctx.lineWidth = PLUS_W;
        ctx.lineCap = "butt";
        ctx.strokeStyle = restStyle;
        ctx.stroke(rest);
      } else {
        ctx.fillStyle = restStyle;
        ctx.fill(rest);
      }
      // Lit marks: a soft glow first, then the mark, grown and in the hover color.
      for (let k = 0; k < lit.length; k += 3) {
        const x = lit[k],
          y = lit[k + 1],
          t = lit[k + 2];
        const sc = still ? 1 : 1 + (MAG - 1) * t;
        if (sprite && glowA > 0) {
          const g = GLOW_R * sc;
          ctx.globalAlpha = glowA * t;
          ctx.drawImage(sprite, x - g, y - g, g * 2, g * 2);
          ctx.globalAlpha = 1;
        }
        const style = mix(base, hot, t, MARK_A * base[3], hot[3]);
        ctx.beginPath();
        if (plus) {
          const a = PLUS_ARM * sc;
          ctx.moveTo(x - a, y);
          ctx.lineTo(x + a, y);
          ctx.moveTo(x, y - a);
          ctx.lineTo(x, y + a);
          ctx.lineWidth = PLUS_W * (1 + (sc - 1) * 0.5);
          ctx.strokeStyle = style;
          ctx.stroke();
        } else {
          ctx.arc(x, y, DOT_R * sc, 0, Math.PI * 2);
          ctx.fillStyle = style;
          ctx.fill();
        }
      }
    };

    // Redraw one part of the box (in box pixels), lined up with screen pixels so no seams show.
    const paint = (b) => {
      const X0 = Math.max(0, Math.floor(b.x0 * dpr)),
        Y0 = Math.max(0, Math.floor(b.y0 * dpr));
      const X1 = Math.min(canvas.width, Math.ceil(b.x1 * dpr)),
        Y1 = Math.min(canvas.height, Math.ceil(b.y1 * dpr));
      if (X1 <= X0 || Y1 <= Y0) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath();
      ctx.rect(X0, Y0, X1 - X0, Y1 - Y0);
      ctx.clip();
      ctx.clearRect(X0, Y0, X1 - X0, Y1 - Y0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x0 = X0 / dpr,
        y0 = Y0 / dpr,
        x1 = X1 / dpr,
        y1 = Y1 / dpr;
      if (kind === "plus-lines" || kind === "dots-lines") drawLines(x0, y0, x1, y1);
      drawMarks(x0, y0, x1, y1);
      ctx.restore();
    };

    const paintAll = () => {
      if (!ready) return;
      layout();
      readColors();
      paint({ x0: 0, y0: 0, x1: w, y1: h });
      drawn = L.s > 0 ? loupeBox() : null;
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(64, last ? now - last : 16);
      last = now;
      // The pointer in the box's own pixels (offsetWidth ignores scaling, so this also works inside a scaled preview).
      const r = root.getBoundingClientRect();
      const sx = w ? r.width / w || 1 : 1,
        sy = h ? r.height / h || 1 : 1;
      const lx = (P.cx - r.left) / sx,
        ly = (P.cy - r.top) / sy;
      const inside = P.has && visible && lx >= 0 && ly >= 0 && lx <= w && ly <= h;
      const target = inside ? 1 : 0;
      if (inside && L.s < 0.02) {
        L.x = lx; // it appears where the pointer is, never slides in from where it left
        L.y = ly;
      } else if (inside) {
        const f = 1 - Math.exp(-dt / FOLLOW_MS);
        L.x += (lx - L.x) * f;
        L.y += (ly - L.y) * f;
      }
      // Eases in and out along a smooth S curve over a set time, so it starts and ends softly and always finishes.
      L.p = target > L.p ? Math.min(1, L.p + dt / IN_MS) : Math.max(0, L.p - dt / OUT_MS);
      L.s = L.p * L.p * (3 - 2 * L.p);
      const settled = L.p === target && (!inside || Math.hypot(lx - L.x, ly - L.y) < 0.15);
      const box = L.s > 0 ? loupeBox() : null;
      if (drawn) paint(drawn);
      if (box) paint(box);
      drawn = box;
      if (!settled) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && ready && (visible || L.s > 0)) raf = requestAnimationFrame(frame);
    };

    /* Pointer: listened to on the whole window, so content on top never blocks it and nothing here blocks a click. */
    const onMove = (e) => {
      P.cx = e.clientX;
      P.cy = e.clientY;
      if (e.pointerType !== "touch" || e.buttons) {
        clearTimeout(holdTimer);
        P.has = true;
      }
      wake();
    };
    const onDown = (e) => {
      if (e.pointerType !== "touch") return;
      clearTimeout(holdTimer);
      P.cx = e.clientX;
      P.cy = e.clientY;
      P.has = true;
      wake();
    };
    const onUp = (e) => {
      if (e.pointerType !== "touch") return;
      clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        P.has = false;
        wake();
      }, TOUCH_HOLD_MS);
    };
    const onLeave = (e) => {
      // A mouse leaving the window. (A finger "leaves" on every lift; onUp handles that.)
      if (e.relatedTarget || e.pointerType === "touch") return;
      P.has = false;
      wake();
    };
    const onBlur = () => {
      P.has = false;
      wake();
    };
    const onScroll = () => {
      if (P.has || L.s > 0) wake();
    };
    // Browser zoom changes the pixel ratio without changing the box size.
    let lastDpr = window.devicePixelRatio;
    const onResize = () => {
      if (window.devicePixelRatio !== lastDpr) {
        lastDpr = window.devicePixelRatio;
        paintAll();
      }
    };
    const onReduce = () => {
      still = reduceMq.matches;
      paintAll();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    reduceMq.addEventListener("change", onReduce);

    // Draws only once it comes near the screen; ignores the pointer while away.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !ready) {
          ready = true;
          paintAll();
        }
        if (!visible && L.s > 0) {
          cancelAnimationFrame(raf);
          raf = 0;
          L.p = L.s = 0;
          if (drawn) paint(drawn);
          drawn = null;
        }
        wake();
      },
      { rootMargin: "200px" },
    );
    io.observe(root);

    let lastW = -1,
      lastH = -1;
    const ro = new ResizeObserver(() => {
      if (root.offsetWidth === lastW && root.offsetHeight === lastH) return;
      lastW = root.offsetWidth;
      lastH = root.offsetHeight;
      paintAll();
    });
    ro.observe(root);

    // Colors follow the theme: a class or data-theme change on the page, or the system switching.
    const mo = new MutationObserver(paintAll);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const darkMq = matchMedia("(prefers-color-scheme: dark)");
    darkMq.addEventListener("change", paintAll);

    refresh.current = paintAll;

    return () => {
      refresh.current = () => {};
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      reduceMq.removeEventListener("change", onReduce);
      darkMq.removeEventListener("change", paintAll);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={className ? `ilg ${className}` : "ilg"} {...rest}>
      <style>{CSS}</style>
      <div ref={layerRef} className="ilg-layer" aria-hidden="true">
        <canvas ref={canvasRef} width={0} height={0} />
      </div>
      {children}
    </div>
  );
}

export default LoupeGrid;
