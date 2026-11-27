"use client";

/**
 * Velvet Grain, from Impeccable.
 *
 * A fine, still grain background that you brush like velvet. Move the pointer
 * and a heavy, soft brush follows it a beat behind, sweeping a smooth track
 * through the grain. The grain piles up a little at the edges of the track, the
 * way sand does, and the track slowly fills back in once the brush moves on.
 *
 * The brush has weight: it trails the pointer on a spring, swings a little past
 * a sharp turn, and spreads wider when you move fast.
 *
 * It sits behind whatever you put inside it. It is never selectable, never
 * catches a click, and is hidden from screen readers. Phones have no hover, so
 * there it stays still until a finger drags across it (scrolling counts).
 *
 * No packages. One WebGL canvas. The grain is drawn by the graphics card; the
 * brush track lives on a small grid. At rest, and off screen, nothing runs.
 */

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

export type VelvetGrainProps = Omit<HTMLAttributes<HTMLDivElement>, "color"> & {
  /** Color of the grain. Any CSS color, including var(--…). Default: the text color. */
  color?: string;
  /** How much grain, from 0 (almost none) to 1 (dense). */
  density?: number;
  /** Size of the brush, in px (its radius at rest). */
  radius?: number;
  /** How long the track takes to fill back in, in ms. */
  fade?: number;
  /** How heavy the brush feels. 1 is the design; 2 trails further behind, 0.5 follows closely. */
  mass?: number;
  /** The brush draws slow loops on its own whenever nobody is pointing at it. For screens and previews. */
  autoBrush?: boolean;
  /** Your content. It sits above the grain and works as normal. */
  children?: ReactNode;
};

/* ---------- tuning (the design: keep as written) ---------- */

const GRAIN_PX = 1; // px: size of one speck of grain
const INK = 0.36; // how strong the brightest speck is (share of the color)
const SPARSE = 0.04; // share of specks lit where the grain is thinnest
const DENSE = 0.5; // and where it gathers most (toward the bottom, and in soft clouds)
const HAZE = 0.075; // the brushed track turns into an even haze: lighter than thin grain, darker than thick grain
const HAZE_KEEP = 0.3; // how much of the grain's own tone the haze keeps
const SMOOTH_FINE = 0.06; // how much grain still shows inside the track
const RIM = 0.9; // how much grain piles up along the edges of the track
const FREQ = 2.3; // Hz: how quickly the brush catches up with the pointer (at mass 1)
const DAMP = 0.68; // below 1, so it swings a little past a sharp turn and settles
const SPREAD = 0.32; // the brush grows this much wider when it moves fast
const FAST = 1600; // px per second that counts as fast
const STAMP_A = 0.3; // how much one dab of the brush smooths
const STAMP_STEP = 0.18; // dabs land this far apart, as a share of the brush radius
const CELL = 6; // px: the track is kept on a grid this fine, then smoothed by the graphics card
const MAX_CELLS = 90_000; // a very large box keeps a coarser track grid
const REST = 0.004; // below this the track counts as filled back in
const REDUCED_FADE = 600; // ms: with reduced motion the track fills back in sooner
const AUTO_LOOP = 7000; // ms: one figure eight of the auto brush
const AUTO_IDLE = 1200; // ms: a pointer that stops this long hands the brush back to the auto loop
const MAX_PIXELS = 8_000_000; // canvas size budget; a very large box draws a little softer instead

const CSS = `
:where(.ivg) { position: relative; isolation: isolate; }
.ivg-layer { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.ivg-layer canvas { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; pointer-events: none; }`;

/* ---------- the graphics card part ---------- */

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uField;  // r: the brushed track, a: how dense the grain is there
uniform vec2 uSize;        // canvas size, device px
uniform vec2 uFit;         // the field grid is a little larger than the box
uniform float uGrain;      // device px per speck
uniform vec4 uColor;
uniform vec2 uSeed;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  uv.y = 1.0 - uv.y;
  vec4 f = texture2D(uField, uv * uFit);
  float t = f.r;
  float rim = smoothstep(0.04, 0.3, t) * (1.0 - smoothstep(0.3, 0.72, t));
  float d = f.a * (1.0 + ${RIM.toFixed(3)} * rim);
  vec2 cell = floor(gl_FragCoord.xy / uGrain) + uSeed;
  float speck = step(hash(cell), d) * (0.35 + 0.65 * hash(cell.yx + 71.3)) * ${INK.toFixed(3)};
  float even = d * 0.675 * ${INK.toFixed(3)};
  float smoothed = mix(mix(${HAZE.toFixed(3)}, even, ${HAZE_KEEP.toFixed(3)}), speck, ${SMOOTH_FINE.toFixed(3)});
  float a = mix(speck, smoothed, smoothstep(0.0, 1.0, t)) * uColor.a;
  gl_FragColor = vec4(uColor.rgb * a, a);
}`;

/* ---------- small helpers ---------- */

const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

type RGBA = [number, number, number, number];

/** Any CSS color as [r, g, b, a] (0 to 1), worked out by painting it, so every color format works. */
let probe: CanvasRenderingContext2D | null = null;
function toRgba(color: string): RGBA {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0.5, 0.5, 0.5, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#808080";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
}

/** Soft value noise for where the grain gathers. Same seed, same clouds. */
function noise(seed: number) {
  const h = (x: number, y: number) => {
    let n = (x * 374761393 + y * 668265263 + seed * 2147483) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  return (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- the background ---------- */

export function VelvetGrain({
  color,
  density = 0.5,
  radius = 90,
  fade = 1800,
  mass = 1,
  autoBrush = false,
  className,
  children,
  ...rest
}: VelvetGrainProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const refresh = useRef<() => void>(() => {});
  const nudge = useRef<() => void>(() => {});

  // Props the running code reads without starting over.
  const opts = useRef({ color, density, radius, fade, mass, autoBrush });
  opts.current = {
    color,
    density: num(density, 0.5, 0, 1),
    radius: num(radius, 90, 12, 600),
    fade: num(fade, 1800, 100, 20_000),
    mass: num(mass, 1, 0.25, 4),
    autoBrush: !!autoBrush,
  };

  useEffect(() => {
    refresh.current();
  }, [color, density]);
  useEffect(() => {
    nudge.current();
  }, [autoBrush]);

  useEffect(() => {
    const root = rootRef.current, layer = layerRef.current;
    if (!root || !layer) return;
    // A fresh canvas for every mount, so its graphics context can be handed back the moment it unmounts.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 0;
    layer.appendChild(canvas);

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let still = reduceMq.matches; // reduced motion: the brush sits right under the pointer, no weight, no spread

    const seed = Math.floor(Math.random() * 1e6);
    const cloud = noise(seed);

    // Size of the box (px), the canvas (device px) and the track grid.
    let w = 0, h = 0, dpr = 1, cell = CELL, gw = 1, gh = 1;
    let track = new Float32Array(1); // 0 = grain untouched, 1 = brushed smooth
    let dense = new Float32Array(1); // how much grain gathers in each cell
    let bytes = new Uint8Array(2);
    let ink: RGBA = [0.5, 0.5, 0.5, 1];
    let alive = false; // some track is still filling back in

    // The brush: where it is, how fast it moves, how far since its last dab.
    const B = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, on: false, carry: 0 };
    // The pointer, in screen pixels.
    const P = { cx: 0, cy: 0, has: false, fresh: false, moved: 0 };
    let raf = 0, last = 0, visible = false, ready = false, autoT = 0;

    /* WebGL */
    let gl: WebGLRenderingContext | null = null;
    let tex: WebGLTexture | null = null;
    let U: Record<string, WebGLUniformLocation | null> = {};
    let texW = 0, texH = 0;

    const initGL = () => {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) return false;
      const shader = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.bindAttribLocation(prog, 0, "p");
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl = null;
        return false;
      }
      gl.useProgram(prog);
      // One triangle that covers the whole canvas.
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      U = {};
      for (const n of ["uField", "uSize", "uFit", "uGrain", "uColor", "uSeed"]) U[n] = gl.getUniformLocation(prog, n);
      gl.uniform1i(U.uField, 0);
      gl.uniform2f(U.uSeed, (seed % 997) + 13.7, (seed % 613) + 7.1);
      texW = texH = 0;
      return true;
    };

    const readColor = () => {
      layer.style.color = opts.current.color ?? "";
      ink = toRgba(getComputedStyle(layer).color);
      layer.style.color = "";
    };

    // Where the grain gathers: thinner at the top, denser toward the bottom, in big soft clouds.
    const fillDensity = () => {
      const k = opts.current.density * 2;
      const aspect = w / Math.max(1, h);
      for (let j = 0; j < gh; j++) {
        const v = Math.min(1, (j * cell) / Math.max(1, h));
        for (let i = 0; i < gw; i++) {
          const u = (i * cell) / Math.max(1, w);
          const c = cloud(u * aspect * 1.7, v * 1.7) * 0.6 + cloud(u * aspect * 3.9 + 31, v * 3.9 + 17) * 0.4;
          const f = Math.min(1, Math.max(0, 0.6 * smooth(0.15, 1, v) + 0.6 * c - 0.25));
          dense[j * gw + i] = Math.min(1, (SPARSE + (DENSE - SPARSE) * f) * k);
        }
      }
    };

    const layout = () => {
      w = root.offsetWidth;
      h = root.offsetHeight;
      const want = Math.min(window.devicePixelRatio || 1, 2);
      dpr = w * h * want * want > MAX_PIXELS ? Math.max(0.5, Math.sqrt(MAX_PIXELS / Math.max(1, w * h))) : want;
      const cw = Math.max(1, Math.round(w * dpr)), ch = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      cell = Math.max(CELL, Math.sqrt((w * h) / MAX_CELLS));
      const nw = Math.max(2, Math.ceil(w / cell) + 1), nh = Math.max(2, Math.ceil(h / cell) + 1);
      if (nw !== gw || nh !== gh) {
        gw = nw;
        gh = nh;
        track = new Float32Array(gw * gh);
        dense = new Float32Array(gw * gh);
        bytes = new Uint8Array(gw * gh * 2);
        alive = false;
      }
      fillDensity();
    };

    // Hand the track and the density to the graphics card, then draw.
    const render = () => {
      if (!gl || gl.isContextLost()) return;
      for (let k = 0, b = 0; k < track.length; k++, b += 2) {
        bytes[b] = (track[k] * 255 + 0.5) | 0;
        bytes[b + 1] = (dense[k] * 255 + 0.5) | 0;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (texW !== gw || texH !== gh) {
        texW = gw;
        texH = gh;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, gw, gh, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, bytes);
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gw, gh, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, bytes);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uSize, canvas.width, canvas.height);
      gl.uniform2f(U.uFit, w / (cell * gw), h / (cell * gh));
      gl.uniform1f(U.uGrain, Math.max(1, GRAIN_PX * dpr));
      gl.uniform4f(U.uColor, ink[0], ink[1], ink[2], ink[3]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const paintAll = () => {
      if (!ready) return;
      layout();
      readColor();
      render();
    };

    // One soft dab of the brush, at (x, y) in box pixels.
    const dab = (x: number, y: number, r: number) => {
      const i0 = Math.max(0, Math.floor((x - r) / cell)), i1 = Math.min(gw - 1, Math.ceil((x + r) / cell));
      const j0 = Math.max(0, Math.floor((y - r) / cell)), j1 = Math.min(gh - 1, Math.ceil((y + r) / cell));
      const r2 = r * r;
      for (let j = j0; j <= j1; j++) {
        const dy = j * cell - y;
        for (let i = i0; i <= i1; i++) {
          const dx = i * cell - x, d2 = dx * dx + dy * dy;
          if (d2 >= r2) continue;
          const u = 1 - d2 / r2, k = j * gw + i;
          track[k] += (1 - track[k]) * STAMP_A * u * u;
        }
      }
      alive = true;
    };

    // Move the brush to (x, y), leaving evenly spaced dabs along the way.
    const sweep = (x: number, y: number, r: number) => {
      const dx = x - B.x, dy = y - B.y, len = Math.hypot(dx, dy);
      const step = Math.max(2, r * STAMP_STEP);
      let t = step - B.carry;
      while (t <= len) {
        dab(B.x + (dx * t) / len, B.y + (dy * t) / len, r);
        t += step;
      }
      B.carry = len - (t - step);
      B.x = x;
      B.y = y;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(64, last ? now - last : 16);
      last = now;
      const o = opts.current;

      // Where the brush is headed: the pointer (in the box's own pixels), or the auto loop.
      const r = root.getBoundingClientRect();
      const sx = w ? r.width / w || 1 : 1, sy = h ? r.height / h || 1 : 1;
      const lx = (P.cx - r.left) / sx, ly = (P.cy - r.top) / sy;
      const reach = o.radius * 2;
      const near = P.has && visible && lx > -reach && ly > -reach && lx < w + reach && ly < h + reach;
      const pointing = near && (!o.autoBrush || now - P.moved < AUTO_IDLE);
      const auto = !pointing && o.autoBrush && visible && !still;
      let tx = lx, ty = ly;
      if (auto) {
        autoT += dt;
        const a = (autoT / AUTO_LOOP) * Math.PI * 2;
        tx = w / 2 + Math.sin(a) * w * 0.3;
        ty = h / 2 + Math.sin(a * 2) * h * 0.22;
      }
      const moving = pointing || auto;

      if (moving && (!B.on || P.fresh)) {
        // It lands where the pointer is, never slides in from where it was.
        B.on = true;
        P.fresh = false;
        B.x = tx;
        B.y = ty;
        B.vx = B.vy = B.speed = 0;
        B.carry = 0;
        dab(tx, ty, o.radius);
      } else if (!moving) {
        B.on = false;
      }

      let brushSettled = true;
      if (B.on) {
        if (still) {
          sweep(tx, ty, o.radius);
        } else {
          // A spring with weight: it lags, swings a little past a turn, and settles.
          const wn = (2 * Math.PI * FREQ) / Math.sqrt(o.mass);
          const n = Math.ceil(dt / 8), hs = dt / n / 1000;
          for (let s = 0; s < n; s++) {
            B.vx += (wn * wn * (tx - B.x) - 2 * DAMP * wn * B.vx) * hs;
            B.vy += (wn * wn * (ty - B.y) - 2 * DAMP * wn * B.vy) * hs;
            const v = Math.hypot(B.vx, B.vy);
            B.speed += (v - B.speed) * (1 - Math.exp(-(hs * 1000) / 120));
            const rad = o.radius * (1 - SPREAD / 2 + SPREAD * Math.min(1, B.speed / FAST));
            sweep(B.x + B.vx * hs, B.y + B.vy * hs, rad);
          }
          brushSettled = Math.hypot(tx - B.x, ty - B.y) < 0.3 && Math.hypot(B.vx, B.vy) < 2;
        }
      }

      // The track fills back in.
      if (alive) {
        // Evenly, not by halves: a fresh track holds its shape for a while, then melts away.
        const drop = dt / (still ? Math.min(o.fade, REDUCED_FADE) : o.fade);
        let any = false;
        for (let k = 0; k < track.length; k++) {
          const v = track[k];
          if (v === 0) continue;
          const nv = v - drop;
          if (nv < REST) track[k] = 0;
          else {
            track[k] = nv;
            any = true;
          }
        }
        alive = any;
        render();
      }

      if (alive || auto || !brushSettled) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && ready && gl) raf = requestAnimationFrame(frame);
    };
    nudge.current = wake;

    /* Pointer: listened to on the whole window, so content on top never blocks it and nothing here blocks a click. */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // fingers are handled by the touch events below
      P.cx = e.clientX;
      P.cy = e.clientY;
      P.has = true;
      P.moved = performance.now();
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget || e.pointerType === "touch") return; // a mouse leaving the window
      P.has = false;
      wake();
    };
    // Phones have no hover: the brush only follows a finger that is down, and it keeps up while the page scrolls.
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (e.type === "touchstart") P.fresh = true;
      P.cx = t.clientX;
      P.cy = t.clientY;
      P.has = true;
      P.moved = performance.now();
      wake();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length) return;
      P.has = false;
      wake();
    };
    const onBlur = () => {
      P.has = false;
      wake();
    };
    const onScroll = () => {
      if (P.has) wake();
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
      wake();
    };
    // The graphics card can drop the canvas (a driver reset, too many canvases); it comes back on its own.
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      if (initGL()) paintAll();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    reduceMq.addEventListener("change", onReduce);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    // Starts drawing once it comes near the screen; ignores the pointer while away.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !ready) {
          ready = true;
          if (initGL()) paintAll();
        }
        if (!visible && alive) {
          track.fill(0);
          alive = false;
          B.on = false;
          render();
        }
        wake();
      },
      { rootMargin: "200px" },
    );
    io.observe(root);

    let lastW = -1, lastH = -1;
    const ro = new ResizeObserver(() => {
      if (root.offsetWidth === lastW && root.offsetHeight === lastH) return;
      lastW = root.offsetWidth;
      lastH = root.offsetHeight;
      paintAll();
    });
    ro.observe(root);

    // The color follows the theme: a class or data-theme change on the page, or the system switching.
    const recolor = () => {
      if (!ready) return;
      readColor();
      render();
    };
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const darkMq = matchMedia("(prefers-color-scheme: dark)");
    darkMq.addEventListener("change", recolor);

    refresh.current = paintAll;

    return () => {
      refresh.current = () => {};
      nudge.current = () => {};
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      reduceMq.removeEventListener("change", onReduce);
      darkMq.removeEventListener("change", recolor);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      // Hand the graphics card its canvas back right away, so many on one page never run out.
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      canvas.remove();
    };
  }, []);

  return (
    <div ref={rootRef} className={className ? `ivg ${className}` : "ivg"} {...rest}>
      <style>{CSS}</style>
      <div ref={layerRef} className="ivg-layer" aria-hidden="true" />
      {children}
    </div>
  );
}

export default VelvetGrain;
