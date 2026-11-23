"use client";

/**
 * Click Pop, from Impeccable.
 *
 * A small pop of lines or dots at the pointer every time someone clicks.
 * Five types:
 *   burst      four short lines shoot out above the pointer tip, shrink to dots and fade
 *   ring       a thin ring opens around the click and fades
 *   particles  eight dots scatter all around, drift down a little and fade
 *   crosshair  four ticks swing in from a turned cross and lock onto the click
 *   wavy       four lines wriggle out from the tip, straighten, then shrink away
 *
 * Put <ClickPop /> once in your layout for the whole page, or wrap a part of
 * the page in it so only clicks inside that part pop. You can also fire one
 * from code with clickPop(x, y).
 *
 * Light on purpose: nothing is on the page until the first click. Each pop is
 * one tiny SVG in a fixed layer that never catches the pointer, so clicks,
 * drags and text selection pass straight through, and it removes itself when
 * it ends. One animation frame loop runs only while a pop is on screen.
 * Reduced motion gets no pops.
 *
 * No packages.
 */

import { useEffect, useRef } from "react";

/* ---------- the design: keep as written ---------- */

const DEFAULT_COLOR = "#8b74f6"; // soft violet, reads on light and dark
const BOX = 160; // px, the square each pop draws in, centred on the pointer tip
const MAX_LIVE = 12; // fast clicking never piles up more than this

// Burst: four rays above the tip (degrees from straight up, minus = left).
const BURST = {
  MS: 420,
  RAYS: [-58, -24, 14, 48],
  LENGTH: 11,
  FROM: 18,
  TO: 40,
  WIDTH: 2,
  HOLD: 0.55,
};
// Ring: opens around the click.
const RING = { MS: 520, FROM: 3, TO: 26, WIDTH: 2, HOLD: 0.35 };
// Particles: dots all around, a little gravity.
const PARTICLES = {
  MS: 620,
  COUNT: 8,
  JITTER: 14,
  NEAR: 22,
  FAR: 40,
  DOT: 1.6,
  DOT_JITTER: 0.8,
  FALL: 8,
  HOLD: 0.45,
};
// Crosshair: ticks swing in from 45 degrees and close on the click.
const CROSSHAIR = { MS: 480, TURN: 45, FROM: 20, TO: 9, LENGTH: 7, WIDTH: 2, DOT: 1.4, HOLD: 0.6 };
// Wavy: rays wriggle out, straighten, then shrink toward their outer end.
const WAVY = {
  MS: 400,
  RAYS: [-90, -42, 5, 51],
  OUT: 0.42,
  START: 14,
  REACH: 56,
  SHORT: 6,
  LONG: 20,
  WIDTH: 1.75,
  WAVE: 2.6,
  WAVELENGTH: 17,
  CALM: 0.48,
  HOLD: 0.8,
};

/* ---------- easing ---------- */

/** The CSS cubic-bezier() curve as a function of time 0..1. */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx;
  const cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t;
  const Y = (t) => ((ay * t + by) * t + cy) * t;
  const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t = Math.min(1, Math.max(0, t - (X(t) - x) / d));
    }
    return Y(t);
  };
}

const BURST_EASE = bezier(0.25, 0.5, 0.4, 1); // quick out, soft stop
const RING_EASE = bezier(0.2, 0.7, 0.3, 1);
const PARTICLE_EASE = bezier(0.15, 0.8, 0.3, 1); // pops fast, then drifts
const LOCK_EASE = bezier(0.2, 0.8, 0.2, 1);
const OUT_EASE = bezier(0.2, 0.7, 0.3, 1);
const IN_OUT_EASE = bezier(0.45, 0, 0.55, 1);

/** Holds at 1 until `hold`, then fades to 0 at the end. */
const fade = (t, hold) => (t < hold ? 1 : Math.max(0, 1 - (t - hold) / (1 - hold)));

/* ---------- drawing ---------- */

const NS = "http://www.w3.org/2000/svg";

function el(g, tag) {
  const e = document.createElementNS(NS, tag);
  if (tag === "path") {
    e.setAttribute("fill", "none");
    e.setAttribute("stroke", "currentColor");
    e.setAttribute("stroke-linecap", "round");
    e.setAttribute("stroke-linejoin", "round");
  } else {
    e.setAttribute("fill", "currentColor");
  }
  g.appendChild(e);
  return e;
}

/** Direction of an angle given in degrees from straight up. */
const dir = (deg) => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a), -Math.cos(a)];
};

/** A straight stroke along a ray from `inner` to `outer`; a dot once it is shorter than its width. */
function ray(p, dx, dy, inner, outer, width) {
  const cap = width / 2; // round caps add half a width at each end
  const a = Math.min(inner + cap, (inner + outer) / 2);
  const b = Math.max(outer - cap, a);
  p.setAttribute(
    "d",
    `M${(dx * a).toFixed(2)} ${(dy * a).toFixed(2)}L${(dx * b).toFixed(2)} ${(dy * b).toFixed(2)}`,
  );
}

const MAKERS = {
  burst: {
    ms: BURST.MS,
    make(g) {
      const rays = BURST.RAYS.map((deg) => ({ d: dir(deg), p: el(g, "path") }));
      rays.forEach((r) => r.p.setAttribute("stroke-width", String(BURST.WIDTH)));
      return (t) => {
        const e = BURST_EASE(t);
        const inner = BURST.FROM + (BURST.TO - BURST.FROM) * e;
        const len = BURST.LENGTH * (1 - 0.85 * e);
        const o = String(fade(e, BURST.HOLD));
        for (const r of rays) {
          ray(r.p, r.d[0], r.d[1], inner, inner + len, BURST.WIDTH);
          r.p.setAttribute("opacity", o);
        }
      };
    },
  },
  ring: {
    ms: RING.MS,
    make(g) {
      const c = el(g, "circle");
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", "currentColor");
      return (t) => {
        const e = RING_EASE(t);
        c.setAttribute("r", (RING.FROM + (RING.TO - RING.FROM) * e).toFixed(2));
        c.setAttribute("stroke-width", (RING.WIDTH * (1 - e) + 0.6).toFixed(2));
        c.setAttribute("opacity", String(fade(e, RING.HOLD)));
      };
    },
  },
  particles: {
    ms: PARTICLES.MS,
    make(g) {
      const turn = Math.random() * 360;
      const dots = Array.from({ length: PARTICLES.COUNT }, (_, i) => {
        const deg = turn + (360 / PARTICLES.COUNT) * i + (Math.random() * 2 - 1) * PARTICLES.JITTER;
        return {
          d: dir(deg),
          far: PARTICLES.NEAR + Math.random() * (PARTICLES.FAR - PARTICLES.NEAR),
          r: PARTICLES.DOT + Math.random() * PARTICLES.DOT_JITTER,
          c: el(g, "circle"),
        };
      });
      return (t) => {
        const e = PARTICLE_EASE(t);
        const o = String(fade(t, PARTICLES.HOLD));
        const fall = PARTICLES.FALL * t * t;
        for (const p of dots) {
          p.c.setAttribute("cx", (p.d[0] * p.far * e).toFixed(2));
          p.c.setAttribute("cy", (p.d[1] * p.far * e + fall).toFixed(2));
          p.c.setAttribute("r", (p.r * (1 - 0.6 * t)).toFixed(2));
          p.c.setAttribute("opacity", o);
        }
      };
    },
  },
  crosshair: {
    ms: CROSSHAIR.MS,
    make(g) {
      const ticks = [0, 90, 180, 270].map((deg) => {
        const p = el(g, "path");
        p.setAttribute("stroke-width", String(CROSSHAIR.WIDTH));
        return { deg, p };
      });
      const dot = el(g, "circle");
      return (t) => {
        const e = LOCK_EASE(t);
        const turn = CROSSHAIR.TURN * (1 - e);
        const inner = CROSSHAIR.FROM + (CROSSHAIR.TO - CROSSHAIR.FROM) * e;
        const len = CROSSHAIR.LENGTH * (1 - 0.3 * e);
        const o = String(fade(t, CROSSHAIR.HOLD));
        for (const k of ticks) {
          const d = dir(k.deg + turn);
          ray(k.p, d[0], d[1], inner, inner + len, CROSSHAIR.WIDTH);
          k.p.setAttribute("opacity", o);
        }
        dot.setAttribute("r", (CROSSHAIR.DOT * e).toFixed(2));
        dot.setAttribute("opacity", o);
      };
    },
  },
  wavy: {
    ms: WAVY.MS,
    make(g) {
      const rays = WAVY.RAYS.map((deg, i) => {
        const p = el(g, "path");
        p.setAttribute("stroke-width", String(WAVY.WIDTH));
        return { d: dir(deg), p, phase: i * 1.9 };
      });
      const STEPS = 14;
      return (t) => {
        let inner, outer;
        if (t < WAVY.OUT) {
          // Shooting out: the line grows as it travels.
          const e = OUT_EASE(t / WAVY.OUT);
          outer = WAVY.START + (WAVY.REACH - WAVY.START) * e;
          inner = outer - (WAVY.SHORT + (WAVY.LONG - WAVY.SHORT) * e);
        } else {
          // Settled: the outer end stays, the inner end catches up until it is a dot.
          const e = IN_OUT_EASE((t - WAVY.OUT) / (1 - WAVY.OUT));
          outer = WAVY.REACH;
          inner = WAVY.REACH - WAVY.LONG * (1 - e);
        }
        // The wriggle swells, then calms to a straight line before the shrink.
        const wave = t < WAVY.CALM ? WAVY.WAVE * Math.sin((Math.PI * t) / WAVY.CALM) : 0;
        const o = String(fade(t, WAVY.HOLD));
        for (const r of rays) {
          const [dx, dy] = r.d;
          const len = outer - inner;
          if (wave === 0 || len < WAVY.WIDTH * 2) {
            ray(r.p, dx, dy, inner, outer, WAVY.WIDTH);
          } else {
            let d = "";
            for (let s = 0; s <= STEPS; s++) {
              const f = s / STEPS;
              const along = inner + len * f;
              // One wiggle every WAVELENGTH px, softer while the line is still short.
              const side =
                wave *
                Math.min(1, len / 14) *
                Math.sin((2 * Math.PI * (len * f)) / WAVY.WAVELENGTH + r.phase - t * 18);
              // perpendicular to the ray is (-dy, dx)
              const x = dx * along - dy * side;
              const y = dy * along + dx * side;
              d += `${s ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            r.p.setAttribute("d", d);
          }
          r.p.setAttribute("opacity", o);
        }
      };
    },
  },
};
const live = [];
let layer = null;
let frame = 0;

function tick(now) {
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i];
    const t = (now - p.start) / p.ms;
    if (t >= 1) {
      p.node.remove();
      live.splice(i, 1);
    } else {
      p.draw(Math.max(0, t));
    }
  }
  if (live.length) {
    frame = requestAnimationFrame(tick);
  } else {
    frame = 0;
    layer?.remove(); // nothing stays on the page between pops
    layer = null;
  }
}

/**
 * Fire one pop at a point on the screen (clientX / clientY), from code.
 * Does nothing on the server or with reduced motion.
 */
export function clickPop(x, y, options = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const maker = MAKERS[options.type ?? "burst"] ?? MAKERS.burst;
  const size = Math.max(0.2, options.size ?? 1) * BOX;

  if (!layer) {
    layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;contain:strict";
    document.body.appendChild(layer);
  }
  while (live.length >= MAX_LIVE) live.shift()?.node.remove();

  const node = document.createElementNS(NS, "svg");
  node.setAttribute("viewBox", `${-BOX / 2} ${-BOX / 2} ${BOX} ${BOX}`);
  node.setAttribute("width", String(size));
  node.setAttribute("height", String(size));
  node.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;overflow:visible;color:${options.color ?? DEFAULT_COLOR}`;
  const g = document.createElementNS(NS, "g");
  node.appendChild(g);
  const draw = maker.make(g);
  draw(0); // visible on the very frame of the click
  layer.appendChild(node);
  live.push({ node, start: performance.now(), ms: maker.ms, draw });
  if (!frame) frame = requestAnimationFrame(tick);
}

/* ---------- the component ---------- */

export function ClickPop({
  type = "burst",
  color,
  size,
  touch = true,
  children,
  className,
  style,
}) {
  const wrap = useRef(null);
  const opts = useRef({ type, color, size, touch });
  opts.current = { type, color, size, touch };
  const scoped = children !== undefined && children !== null;

  useEffect(() => {
    const host = scoped ? wrap.current : window;
    if (!host) return;
    const onDown = (e) => {
      const p = e;
      const o = opts.current;
      if (p.button !== 0) return; // main button only
      if (p.pointerType === "touch" && !o.touch) return;
      clickPop(p.clientX, p.clientY, { type: o.type, color: o.color, size: o.size });
    };
    host.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => host.removeEventListener("pointerdown", onDown, { capture: true });
  }, [scoped]);

  if (!scoped) return null;
  return (
    <div ref={wrap} data-click-pop="" className={className} style={style}>
      {children}
    </div>
  );
}

export default ClickPop;
