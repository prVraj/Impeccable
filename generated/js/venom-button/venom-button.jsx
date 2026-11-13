"use client";

/**
 * Venom-button, from Impeccable.
 *
 * A glossy ink button that is alive. Bring the pointer close and the surface bulges
 * toward it while a few feelers rise and taste the air; the closer you get, the more
 * of them. Within reach, a thick liquid neck pours out of the button and splits into
 * fine tentacles, webbed together, that grab the tip of the pointer. Keep coming and
 * more tentacles join, up to nine. While they hold on, the pointer feels heavy: it
 * moves about 18% slower (a little more with every tentacle), as if the button were
 * pulling it back. Pull away and they peel off one by one; each break flings a drop
 * home, and when the last one snaps the button wobbles back to rest.
 *
 * Browsers can't slow the real mouse, so while the tentacles hold on (and only outside
 * the button) the system pointer is hidden and a drawn arrow takes its place, trailing
 * the real one. Clicks always land where the real pointer is.
 *
 * Phones: press the button and drag your finger out. The tentacles follow the finger,
 * peel off as it goes, and let go when you lift it. No pointer is drawn on touch.
 *
 * No packages: one full-screen canvas that only exists while something moves, and one
 * requestAnimationFrame loop that stops when everything is still.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const SENSE = 90; // px past reach where the feelers start to rise
const FIRST = 3; // tentacles that grab together at reach; the rest join closer in
const ROOTS = 0.5; // share of the button's height the roots spread across, each side of the middle
const ROOT_GAP = 7; // px between neighbouring roots, until they fill that spread
const NECK_LEN = 0.14; // share of the way to the pointer the gooey base reaches before the tentacles part
const FILLET = 7; // extra width where the base leaves the surface, so it melts in
const ROOT_W = 3.4; // tentacle thickness where it leaves the base, px
const TIP_W = 1.1; // tentacle thickness at the pointer, px
const FAN = 0.09; // how far apart the tentacles bow in the middle, as a share of their length
const FAN_MAX = 20; // px: the most a tentacle bows out
const BRAID = 2.4; // px they twist around each other
const WRITHE = 2.4; // how fast they twist, radians per second
const WEB = 0.16; // opacity of the thin film between neighbouring tentacles
const WEB_LEN = 0.45; // share of their length the film reaches, from the button
const GLOB = 3; // px: the glob holding the pointer tip, plus GLOB_PER per tentacle
const GLOB_PER = 0.45;
const GRIP_R = 3; // px: the tentacle tips hold the pointer tip side by side, this far out each way
const LATCH_K = 900; // spring stiffness of the whip toward the pointer
const RETRACT_K = 420; // spring stiffness of a tentacle snapping home (wobbly on purpose)
const POINTER_W = 26; // how quickly the drawn pointer follows (lower is heavier)
const STRETCH = 0.035; // how far the button stretches toward the pull at full tension
const LEAN = 3; // px the button leans toward the pull at full tension
const STAGGER_MS = 40; // between tentacles letting go all at once
const COOLDOWN_MS = 450; // after the last one snaps, before it can grab again
const REJOIN_MS = 350; // after one tentacle snaps, before it can grab again
const FADE_MS = 160; // reduced motion: tentacles fade instead of snapping

/** Styles that can't be inline: press, focus, hidden pointer and reduced motion. */
const CSS = `
.ivn { position: relative; display: inline-flex; align-items: center; justify-content: center; max-width: 100%; height: 44px; padding: 0 22px; border: 0; border-radius: 999px; background: none; color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; touch-action: none; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; isolation: isolate; }
.ivn-skin, .ivn-label { transform: var(--ivn-t, none); }
.ivn-skin { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background-color: var(--ivn-ink, currentColor);
  background-image: radial-gradient(120% 100% at 28% 0%, rgb(255 255 255 / .2), rgb(255 255 255 / 0) 55%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .2), inset 0 -3px 6px rgb(0 0 0 / .22), 0 8px 18px -10px rgb(0 0 0 / .45);
  transition: scale .18s cubic-bezier(.23,1,.32,1); }
.ivn-label { position: relative; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ivn-text, var(--ivn-auto-text, Canvas)); }
.ivn:active:not(:disabled) .ivn-skin { scale: .97; }
.ivn:focus-visible { outline: 2px solid var(--ivn-ink, currentColor); outline-offset: 3px; }
.ivn:disabled { opacity: .5; cursor: not-allowed; }
html[data-venom-hold], html[data-venom-hold] * { cursor: none !important; }
@media (prefers-reduced-motion: reduce) { .ivn-skin { transition: none; } .ivn:active:not(:disabled) .ivn-skin { scale: 1; } }`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Closest point on a rounded rectangle, its outward normal and the signed distance (negative inside). */
function edgeOf(px, py, cx, cy, hw, hh, rad) {
  const rr = Math.min(rad, hw, hh);
  const ix = hw - rr,
    iy = hh - rr;
  const lx = px - cx,
    ly = py - cy;
  const kx = clamp(lx, -ix, ix),
    ky = clamp(ly, -iy, iy);
  const dx = lx - kx,
    dy = ly - ky;
  const len = Math.hypot(dx, dy);
  if (len > 1e-4) {
    const nx = dx / len,
      ny = dy / len;
    return { x: cx + kx + nx * rr, y: cy + ky + ny * rr, nx, ny, d: len - rr };
  }
  const mx = ix - Math.abs(lx),
    my = iy - Math.abs(ly);
  if (mx < my) {
    const nx = lx < 0 ? -1 : 1;
    return { x: cx + nx * hw, y: py, nx, ny: 0, d: -(mx + rr) };
  }
  const ny = ly < 0 ? -1 : 1;
  return { x: px, y: cy + ny * hh, nx: 0, ny, d: -(my + rr) };
}

/** Moves x toward target with a spring (k stiffness, z damping ratio). Returns the new [x, v]. */
function spring(x, v, target, k, z, dt) {
  const a = k * (target - x) - 2 * Math.sqrt(k) * z * v;
  v += a * dt;
  return [x + v * dt, v];
}

let probe = null;
/** Any CSS color as [r, g, b], read by painting one pixel, so oklch, hsl and named colors all work. */
function rgbOf(css) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}
const isLight = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;

/* Only one button may hold the mouse at a time, so two never draw two pointers. */
let holder = null;
let hidden = 0;
const hidePointer = (on) => {
  hidden = Math.max(0, hidden + (on ? 1 : -1));
  document.documentElement.toggleAttribute("data-venom-hold", hidden > 0);
};

/** The arrow drawn in place of the hidden system pointer (tip at 0,0). */
const ARROW = [
  [0, 0],
  [0, 16.5],
  [4.2, 12.6],
  [7, 19.2],
  [9.8, 18],
  [7.1, 11.6],
  [12.6, 11.6],
];

/** A cubic from a root on the surface (leaving along its normal) to a tip, with a sideways offset `off(t)`. */
function curve(rx, ry, nx, ny, tx, ty, sag, n, out, off) {
  const dx = tx - rx,
    dy = ty - ry;
  const len = Math.hypot(dx, dy);
  const k1 = Math.min(len * 0.36, 50) * clamp(len / 50, 0.35, 1); // short ones stay straight, never loop
  const p0x = rx - nx * 1.5,
    p0y = ry - ny * 1.5; // starts just inside the edge, so it melts in
  const p1x = rx + nx * k1,
    p1y = ry + ny * k1;
  const p2x = tx - dx * 0.3,
    p2y = ty - dy * 0.3 + sag;
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      u = 1 - t;
    const bx = u * u * u * p0x + 3 * u * u * t * p1x + 3 * u * t * t * p2x + t * t * t * tx;
    const by = u * u * u * p0y + 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t * ty;
    const ddx = 3 * u * u * (p1x - p0x) + 6 * u * t * (p2x - p1x) + 3 * t * t * (tx - p2x);
    const ddy = 3 * u * u * (p1y - p0y) + 6 * u * t * (p2y - p1y) + 3 * t * t * (ty - p2y);
    const dl = Math.hypot(ddx, ddy) || 1;
    const o = off(t);
    out[i] = { x: bx - (ddy / dl) * o, y: by + (ddx / dl) * o };
  }
  out.length = n + 1;
  return len;
}

/** Fills a tapered ribbon along points a..b of a centre line; width(t) in px, t from 0 to 1 along the whole line. */
function ribbon(c, line, a, b, width, foot) {
  const n = line.length - 1;
  if (b - a < 2) return;
  const L = [],
    R = [];
  for (let i = a; i <= b; i++) {
    const p = line[i],
      q = line[Math.min(n, i + 1)],
      o = line[Math.max(0, i - 1)];
    const tx = q.x - o.x,
      ty = q.y - o.y,
      tl = Math.hypot(tx, ty) || 1;
    const h = width(i / n) / 2;
    let l = { x: p.x - (ty / tl) * h, y: p.y + (tx / tl) * h },
      r = { x: p.x + (ty / tl) * h, y: p.y - (tx / tl) * h };
    const k = i - a;
    if (foot && k < 4) {
      // the first few points hug the button's curved surface, so the base never sticks out like a horn
      const w = 1 - k / 4,
        fl = foot(l),
        fr = foot(r);
      l = { x: l.x + (fl.x - l.x) * w, y: l.y + (fl.y - l.y) * w };
      r = { x: r.x + (fr.x - r.x) * w, y: r.y + (fr.y - r.y) * w };
    }
    L.push(l);
    R.push(r);
  }
  R.reverse();
  c.beginPath();
  const side = (pts, first) => {
    if (first) c.moveTo(pts[0].x, pts[0].y);
    else c.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++)
      c.quadraticCurveTo(
        pts[i].x,
        pts[i].y,
        (pts[i].x + pts[i + 1].x) / 2,
        (pts[i].y + pts[i + 1].y) / 2,
      );
    c.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  };
  side(L, true);
  side(R, false);
  c.closePath();
  c.fill();
  // a round end
  c.beginPath();
  c.arc(line[b].x, line[b].y, width(b / n) / 2, 0, Math.PI * 2);
  c.fill();
}

function drawArrow(c, x, y) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  ARROW.forEach(([ax, ay], i) => (i ? c.lineTo(ax, ay) : c.moveTo(ax, ay)));
  c.closePath();
  c.shadowColor = "rgba(0,0,0,0.28)";
  c.shadowBlur = 3;
  c.shadowOffsetY = 1;
  c.fillStyle = "white";
  c.fill();
  c.shadowColor = "transparent";
  c.lineWidth = 1;
  c.lineJoin = "round";
  c.strokeStyle = "black";
  c.stroke();
  c.restore();
}

/* ---------- the button ---------- */

export const VenomButton = forwardRef(function VenomButton(
  {
    color,
    textColor,
    strands = 9,
    reach = 64,
    snapAt = 220,
    weight = 0.18,
    className,
    style,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const btnRef = useRef(null);
  const skinRef = useRef(null);
  useImperativeHandle(ref, () => btnRef.current);

  // Latest props for the loop, without restarting it.
  const opts = useRef({ strands, reach, snapAt, weight });
  opts.current = { strands, reach, snapAt, weight };

  // Label color: black or white, whichever reads on the ink. Follows theme changes.
  useEffect(() => {
    const btn = btnRef.current,
      skin = skinRef.current;
    if (!btn || !skin || textColor) return;
    const apply = () =>
      btn.style.setProperty(
        "--ivn-auto-text",
        isLight(rgbOf(getComputedStyle(skin).backgroundColor))
          ? "rgb(10 10 10)"
          : "rgb(255 255 255)",
      );
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, [textColor, color]);

  // The living part.
  useEffect(() => {
    const btn = btnRef.current,
      skin = skinRef.current;
    if (!btn || !skin) return;
    const me = {};
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");

    let canvas = null;
    let ctx = null;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let visible = true;
    let ink = "";
    let inkLight = false;

    const P = { x: 0, y: 0, has: false, touch: false, id: -1, forceSnap: false };
    let mode = "idle";
    let coolUntil = 0;
    let fade = 1; // reduced motion: everything fades out on release
    let sense = 0,
      senseV = 0; // how close the pointer is before the grab, 0..1
    const C = { x: 0, y: 0, vx: 0, vy: 0 }; // the drawn (heavy) pointer
    let pointerHidden = false;
    let releaseUntil = 0;
    let drawPointer = false;
    const J = { st: 0, sv: 0, lean: 0, lv: 0, th: 0 }; // jelly: stretch along the pull, and lean toward it
    // The gooey base: a root on the surface, a tip, how far it's out, how wide the roots spread, and how far along it is drawn.
    const N = {
      rx: 0,
      ry: 0,
      rnx: 1,
      rny: 0,
      rvx: 0,
      rvy: 0,
      tx: 0,
      ty: 0,
      vx: 0,
      vy: 0,
      out: 0,
      ov: 0,
      w: 0,
      wv: 0,
      reach: 1,
    };
    let glob = 0,
      globV = 0;
    let slots = [];
    let drops = [];

    /* geometry, with the button's own wobble taken into account */
    let rect = btn.getBoundingClientRect();
    let rad = 22;
    const centre = () => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    const mat = () => {
      const c = Math.cos(J.th),
        s = Math.sin(J.th);
      const a = 1 + J.st,
        b = 1 - J.st * 0.7;
      // R(th) * diag(a, b) * R(-th)
      return { m11: c * c * a + s * s * b, m12: c * s * (a - b), m22: s * s * a + c * c * b };
    };
    const edge = (px, py) => {
      const o = centre();
      const lx = Math.cos(J.th) * J.lean,
        ly = Math.sin(J.th) * J.lean;
      const { m11, m12, m22 } = mat();
      const det = m11 * m22 - m12 * m12 || 1;
      const qx = px - o.x - lx,
        qy = py - o.y - ly; // into the button's unwobbled frame
      const ux = (m22 * qx - m12 * qy) / det,
        uy = (-m12 * qx + m11 * qy) / det;
      const e = edgeOf(ux, uy, 0, 0, rect.width / 2, rect.height / 2, rad);
      const nx = (m22 * e.nx - m12 * e.ny) / det,
        ny = (-m12 * e.nx + m11 * e.ny) / det; // and back out
      const nl = Math.hypot(nx, ny) || 1;
      return {
        x: o.x + lx + m11 * e.x + m12 * e.y,
        y: o.y + ly + m12 * e.x + m22 * e.y,
        nx: nx / nl,
        ny: ny / nl,
        d: e.d,
      };
    };
    const readShape = () => {
      rect = btn.getBoundingClientRect();
      const raw = getComputedStyle(btn).borderTopLeftRadius;
      const n = parseFloat(raw) || 0;
      rad = raw.endsWith("%") ? (n / 100) * Math.min(rect.width, rect.height) : n;
    };

    /* canvas: only exists while something moves */
    const sizeCanvas = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    };
    const ensureCanvas = () => {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000";
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      sizeCanvas();
      addEventListener("resize", sizeCanvas);
    };
    const dropCanvas = () => {
      if (!canvas) return;
      removeEventListener("resize", sizeCanvas);
      canvas.remove();
      canvas = null;
      ctx = null;
    };

    const setHidden = (on) => {
      if (on === pointerHidden) return;
      pointerHidden = on;
      hidePointer(on);
    };
    const setTransform = (t) => btn.style.setProperty("--ivn-t", t);

    /** Builds the tentacles. The first three grab at reach and snap last; the rest join closer in and snap sooner. */
    const makeSlots = (max, reach, snapAt) => {
      const e = edge(P.x, P.y);
      const half = Math.ceil((max - 1) / 2) || 1;
      slots = Array.from({ length: max }, (_, j) => {
        const late = j < FIRST ? 0 : (j - FIRST + 1) / (max - FIRST + 1); // 0 for the first ones, up to ~1
        const grabAt = j < FIRST ? reach : reach * (1 - late) * 0.9;
        const breakAt =
          j < 2
            ? snapAt
            : Math.max(grabAt + 40, snapAt - (snapAt - reach - 30) * ((j - 1) / (max - 1)));
        return {
          side: j === 0 ? 0 : (Math.ceil(j / 2) / half) * (j % 2 ? 1 : -1),
          u: 0,
          uv: 0,
          grabAt,
          breakAt,
          state: "home",
          feel: 0,
          rx: e.x,
          ry: e.y,
          rnx: e.nx,
          rny: e.ny,
          rvx: 0,
          rvy: 0,
          tx: e.x,
          ty: e.y,
          vx: 0,
          vy: 0,
          phase: j * 2.399,
          pinned: false,
          pending: 0,
          cool: 0,
          pts: [],
        };
      });
      N.rx = N.tx = e.x;
      N.ry = N.ty = e.y;
      N.rnx = e.nx;
      N.rny = e.ny;
      N.vx = N.vy = N.rvx = N.rvy = N.out = N.ov = 0;
    };

    /** Full stop: nothing drawn, pointer back, button at rest. */
    const reset = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      mode = "idle";
      slots = [];
      drops = [];
      sense = senseV = glob = globV = 0;
      J.st = J.sv = J.lean = J.lv = 0;
      setTransform("none");
      setHidden(false);
      drawPointer = false;
      if (holder === me) holder = null;
      dropCanvas();
    };

    /** The pointer is gone: every tentacle lets go, 40ms apart, the last to join first. */
    const releaseAll = (now) => {
      mode = "release";
      coolUntil = now + COOLDOWN_MS;
      if (holder === me) holder = null;
      releaseUntil = now + 240;
      fade = 1;
      let k = 0;
      for (let j = slots.length - 1; j >= 0; j--) {
        const s = slots[j];
        if (s.state === "held" && !s.pending) s.pending = now + k++ * STAGGER_MS;
        else if (s.state === "feel") s.state = "home";
      }
      if (drawPointer && !reduceMq.matches) {
        // a little residue drips off the pointer
        for (let i = 0; i < 2; i++)
          drops.push({
            x: C.x + 3 + i * 2,
            y: C.y + 4,
            vx: (Math.random() - 0.5) * 60,
            vy: -40 - Math.random() * 40,
            r: 1.3 + Math.random() * 0.6,
            age: 0,
            life: 0.45,
            fall: true,
            sink: 0,
          });
      }
    };

    const tmp = [];
    const neckLine = [];

    /* ---------- the loop ---------- */

    const frame = (now) => {
      raf = 0;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30) || 1 / 60;
      last = now;
      readShape();
      if (!btn.isConnected || rect.width === 0) return reset();

      const o = opts.current;
      const reach = clamp(o.reach || 0, 8, 400);
      const snapAt = Math.max(o.snapAt || 0, reach + 60);
      const max = clamp(Math.round(o.strands) || 9, FIRST, 12);
      const still = reduceMq.matches;
      const heavyOn = !still && !P.touch && (o.weight || 0) > 0;
      const w8 = clamp(o.weight || 0, 0, 0.3);
      const has = P.has && !btn.disabled;
      const e = edge(P.x, P.y);
      const d = has ? e.d : Infinity;
      if (
        slots.length !== max ||
        (mode === "idle" && (slots[0].grabAt !== reach || slots[0].breakAt !== snapAt))
      )
        makeSlots(max, reach, snapAt);

      // what's happening
      if (mode === "held") {
        if (!has || P.forceSnap) releaseAll(now);
      } else if (has && d < reach && now > coolUntil && (holder === null || holder === me)) {
        mode = "held";
        holder = me;
        fade = 1;
        C.x = P.x;
        C.y = P.y;
        C.vx = C.vy = 0;
        drawPointer = heavyOn;
      } else if (
        has &&
        !P.touch &&
        !still &&
        d < reach + SENSE &&
        !slots.some((s) => s.pending || s.state === "loose")
      ) {
        mode = "sense";
      } else if (mode === "sense") {
        mode = "release";
      }
      P.forceSnap = false;
      let held = mode === "held";

      // the heavy pointer: pulled back toward the button by `weight`, a little more per tentacle, and a little behind
      const heldCount = slots.filter((s) => s.state === "held" && !s.pending).length;
      if (held && heavyOn) {
        const tn = clamp(d / snapAt, 0, 1);
        const pull = d > 0 && heldCount ? w8 * (0.7 + 0.25 * tn + 0.35 * (heldCount / max)) : 0;
        const tx = P.x + (e.x - P.x) * pull,
          ty = P.y + (e.y - P.y) * pull;
        for (let k = 0; k < 2; k++) {
          [C.x, C.vx] = spring(C.x, C.vx, tx, POINTER_W * POINTER_W, 1, dt / 2);
          [C.y, C.vy] = spring(C.y, C.vy, ty, POINTER_W * POINTER_W, 1, dt / 2);
        }
        setHidden(d > 0 && heldCount > 0);
      } else if (drawPointer && !held) {
        // let go: the drawn pointer catches up with the real one, then the real one comes back
        for (let k = 0; k < 2; k++) {
          [C.x, C.vx] = spring(C.x, C.vx, P.x, 900, 1, dt / 2);
          [C.y, C.vy] = spring(C.y, C.vy, P.y, 900, 1, dt / 2);
        }
        if (Math.hypot(C.x - P.x, C.y - P.y) < 0.8 || now > releaseUntil) {
          drawPointer = false;
          setHidden(false);
        }
      } else {
        C.x = P.x;
        C.y = P.y;
        setHidden(false);
      }
      const grab = drawPointer ? C : P;
      const ge = held ? edge(grab.x, grab.y) : e;
      const gd = held ? ge.d : d;
      const outside = held && ge.d > 0;

      // tentacles join as the pointer comes closer, and snap one by one as it pulls away
      if (held) {
        for (const s of slots) {
          if (s.state !== "held" && !s.pending && d <= s.grabAt && now > s.cool) {
            s.state = "held";
            s.pinned = false;
          }
          if (s.state === "held" && !s.pending && d > s.breakAt) s.pending = now; // measured from the real pointer
        }
        if (!slots.some((s) => s.state === "held" && !s.pending) && d > reach) {
          releaseAll(now); // the last one let go
          held = false;
        }
      }

      // feelers: before the grab, 1 to 4 rise as the pointer gets closer; while held, the next ones reach ahead
      const senseT = mode === "sense" ? Math.pow(clamp(1 - (d - reach) / SENSE, 0, 1), 1.3) : 0;
      [sense, senseV] = spring(sense, senseV, senseT, 120, 0.9, dt);
      const feelCount = mode === "sense" ? 1 + Math.floor(sense * 3.99) : 0;
      slots.forEach((s, j) => {
        if (s.state === "held" || s.state === "loose" || s.pending) return;
        let f = 0;
        if (still) f = 0;
        else if (mode === "sense" && j < feelCount) f = sense * (1 - 0.12 * j);
        else if (held && outside && now > s.cool) f = clamp(1 - (gd - s.grabAt) / 40, 0, 1) * 0.8;
        s.feel = f;
        s.state = f > 0.02 ? "feel" : "home";
      });

      const tension = held ? clamp(gd / snapAt, 0, 1) : 0;
      const tgx = -ge.ny,
        tgy = ge.nx;

      // lanes: the tentacles out share the spread evenly, each with room of its own, and shuffle over as more join
      const outCount = slots.reduce(
        (a, s) => a + (s.state === "held" ? (outside ? 1 : 0) : s.state === "feel" ? s.feel : 0),
        0,
      );
      const lanes = slots
        .filter((s) => s.state === "held" || s.state === "feel" || s.pending > 0)
        .sort((a, b) => a.side - b.side);
      const nL = lanes.length;
      const halfT = nL
        ? Math.min(rect.height * ROOTS, ((nL - 1) * ROOT_GAP) / 2 + 3) * (1 - 0.3 * tension)
        : 0;
      [N.w, N.wv] = spring(N.w, N.wv, halfT, 300, 0.9, dt);
      for (const s of slots) {
        const i = lanes.indexOf(s);
        const uT = i < 0 ? s.u : nL > 1 ? (i / (nL - 1)) * 2 - 1 : 0;
        if (still) s.u = uT;
        else [s.u, s.uv] = spring(s.u, s.uv, uT, 260, 0.9, dt);
      }
      const feelLen = Math.min(Math.max(gd, 0) * 0.45, 50);
      let nOut = 0,
        ntx = ge.x,
        nty = ge.y;
      if (outside && heldCount) {
        nOut = 1;
        ntx = grab.x;
        nty = grab.y;
        N.reach = NECK_LEN;
      } else if (outCount > 0.02 && gd > 0) {
        // before the grab: a low bulge toward the pointer, under the feelers
        nOut = Math.min(1, outCount / 3) * 0.75;
        const ax = grab.x - ge.x,
          ay = grab.y - ge.y,
          al = Math.hypot(ax, ay) || 1;
        ntx = ge.x + (ax / al) * feelLen * 0.55;
        nty = ge.y + (ay / al) * feelLen * 0.55;
        N.reach = 1;
      }
      if (still) nOut = outside && heldCount ? 1 : 0;
      [N.out, N.ov] = spring(N.out, N.ov, nOut, still ? 900 : 260, still ? 1 : 0.7, dt);
      [N.rx, N.rvx] = spring(N.rx, N.rvx, ge.x, 300, 1, dt);
      [N.ry, N.rvy] = spring(N.ry, N.rvy, ge.y, 300, 1, dt);
      const ne = edge(N.rx, N.ry);
      N.rx = ne.x;
      N.ry = ne.y;
      N.rnx = ne.nx;
      N.rny = ne.ny;
      for (let k = 0; k < 2; k++) {
        [N.tx, N.vx] = spring(N.tx, N.vx, ntx, nOut === 1 ? LATCH_K : 300, 0.8, dt / 2);
        [N.ty, N.vy] = spring(N.ty, N.vy, nty, nOut === 1 ? LATCH_K : 300, 0.8, dt / 2);
      }
      [glob, globV] = spring(
        glob,
        globV,
        outside && heldCount ? GLOB + GLOB_PER * heldCount : 0,
        500,
        0.6,
        dt,
      );

      // each tentacle
      const spread = Math.max(N.w, 0);
      for (let j = 0; j < slots.length; j++) {
        const s = slots[j];
        // the root slides along the surface to its own lane
        if (s.state !== "loose") {
          const re = edge(
            ge.x + tgx * s.u * spread - ge.nx * 4,
            ge.y + tgy * s.u * spread - ge.ny * 4,
          );
          [s.rx, s.rvx] = spring(s.rx, s.rvx, re.x, 240, 1, dt);
          [s.ry, s.rvy] = spring(s.ry, s.rvy, re.y, 240, 1, dt);
        }
        const pe = edge(s.rx, s.ry);
        s.rx = pe.x;
        s.ry = pe.y;
        s.rnx = pe.nx;
        s.rny = pe.ny;

        // snapping: it breaks part way, and the outer piece becomes a drop flung home
        if (s.pending && now >= s.pending) {
          s.pending = 0;
          s.state = "loose";
          s.pinned = false;
          s.cool = now + REJOIN_MS;
          const len = curve(s.rx, s.ry, s.rnx, s.rny, s.tx, s.ty, 0, 24, tmp, () => 0);
          if (still || len < 8) {
            s.tx = s.rx;
            s.ty = s.ry;
            s.vx = s.vy = 0;
          } else {
            const tb = 0.48 + Math.random() * 0.2;
            const bp = tmp[Math.round(tb * 24)],
              mp = tmp[Math.round(((tb + 1) / 2) * 24)];
            const hx = s.rx - mp.x,
              hy = s.ry - mp.y,
              hl = Math.hypot(hx, hy) || 1;
            const sp = clamp(len * 4.5, 420, 1100) * (0.85 + Math.random() * 0.3);
            drops.push({
              x: mp.x,
              y: mp.y,
              vx: (hx / hl) * sp + (Math.random() - 0.5) * 120,
              vy: (hy / hl) * sp + (Math.random() - 0.5) * 120,
              r: 1.4 + Math.random() * 1.1,
              age: 0,
              life: 0.8,
              fall: false,
              sink: 0,
            });
            s.tx = bp.x;
            s.ty = bp.y;
            const bl = Math.hypot(s.rx - bp.x, s.ry - bp.y) || 1;
            s.vx = ((s.rx - bp.x) / bl) * 500;
            s.vy = ((s.ry - bp.y) / bl) * 500;
            J.sv -= 0.004; // a small shudder through the button
          }
        }

        // reduced motion: on release everything stays put and fades out
        if (still && mode === "release") continue;

        // where the tip wants to be
        let tx = s.rx,
          ty = s.ry,
          k = RETRACT_K,
          z = 0.42;
        const waiting = s.pending > 0; // let go, but this one hasn't snapped yet
        if (waiting || (s.state === "held" && outside)) {
          // the tips hold the pointer side by side in their own lanes, so no two cross
          const gx = grab.x - ge.x,
            gy = grab.y - ge.y,
            gl = Math.hypot(gx, gy) || 1;
          const off = s.u * GRIP_R + Math.sin(now / 420 + s.phase) * 0.6;
          tx = grab.x - (gy / gl) * off;
          ty = grab.y + (gx / gl) * off;
          k = LATCH_K * (1 - 0.03 * j);
          z = 0.72;
        } else if (s.state === "feel") {
          // a feeler sways toward the pointer, as if tasting the air
          const ax = grab.x - s.rx,
            ay = grab.y - s.ry,
            al = Math.hypot(ax, ay) || 1;
          const sway = Math.sin(now / 380 + s.phase * 1.7) * 0.4;
          const cs = Math.cos(sway),
            sn = Math.sin(sway);
          const ux = (ax / al) * cs - (ay / al) * sn,
            uy = (ax / al) * sn + (ay / al) * cs;
          const L = s.feel * feelLen * (1 - 0.1 * Math.abs(s.side));
          tx = s.rx + ux * L;
          ty = s.ry + uy * L;
          k = 140;
          z = 0.9;
        } else if (s.state === "held") s.pinned = false; // inside the button: they sink back in
        if (still) {
          k = 900;
          z = 1;
        }
        if (s.pinned && s.state === "held" && outside && !waiting) {
          s.vx = (tx - s.tx) / dt;
          s.vy = (ty - s.ty) / dt;
          s.tx = tx;
          s.ty = ty;
        } else {
          for (let st = 0; st < 2; st++) {
            [s.tx, s.vx] = spring(s.tx, s.vx, tx, k, z, dt / 2);
            [s.ty, s.vy] = spring(s.ty, s.vy, ty, k, z, dt / 2);
          }
          if (s.state === "held" && outside && Math.hypot(tx - s.tx, ty - s.ty) < 3)
            s.pinned = true;
        }
        if (
          s.state === "loose" &&
          Math.hypot(s.tx - s.rx, s.ty - s.ry) < 0.6 &&
          Math.hypot(s.vx, s.vy) < 4
        )
          s.state = "home";
      }

      // drops: flung back into the button, or dripping off the pointer
      for (const p of drops) {
        p.age += dt;
        if (p.fall) p.vy += 1400 * dt;
        else {
          const f = Math.exp(-2.2 * dt);
          p.vx *= f;
          p.vy *= f;
          if (!p.sink && edge(p.x, p.y).d < 0.5) p.sink = 0.0001;
        }
        if (p.sink) {
          p.sink += dt;
          p.vx *= 0.6;
          p.vy *= 0.6;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      drops = drops.filter((p) => p.age < p.life && p.sink < 0.12);

      // jelly: the button stretches and leans toward the pull, then wobbles when let go
      const o2 = centre();
      const pulling = held && outside && heldCount > 0 && !still;
      if (pulling) J.th = Math.atan2(grab.y - o2.y, grab.x - o2.x);
      const jz = held ? 0.9 : 0.28;
      [J.st, J.sv] = spring(J.st, J.sv, pulling ? STRETCH * tension : 0, 240, jz, dt);
      [J.lean, J.lv] = spring(J.lean, J.lv, pulling ? LEAN * tension : 0, 240, jz, dt);
      const jellyOn =
        Math.abs(J.st) > 6e-4 ||
        Math.abs(J.sv) > 6e-3 ||
        Math.abs(J.lean) > 0.05 ||
        Math.abs(J.lv) > 0.3;
      if (jellyOn && !still) {
        const th = J.th;
        setTransform(
          `translate(${(Math.cos(th) * J.lean).toFixed(2)}px, ${(Math.sin(th) * J.lean).toFixed(2)}px) rotate(${th.toFixed(4)}rad) scale(${(1 + J.st).toFixed(4)}, ${(1 - J.st * 0.7).toFixed(4)}) rotate(${(-th).toFixed(4)}rad)`,
        );
      } else {
        J.st = J.sv = J.lean = J.lv = 0;
        setTransform("none");
      }

      if (still && mode === "release") fade = Math.max(0, fade - (dt * 1000) / FADE_MS);

      // is anything still out?
      const anyOut =
        slots.some(
          (s) => s.state !== "home" || s.pending || Math.hypot(s.tx - s.rx, s.ty - s.ry) > 0.6,
        ) ||
        N.out > 0.01 ||
        glob > 0.2;
      if (mode === "release" && (!anyOut || (still && fade === 0))) {
        mode = "idle";
        for (const s of slots) {
          s.tx = s.rx;
          s.ty = s.ry;
          s.vx = s.vy = 0;
          s.pending = 0;
          s.state = "home";
        }
        N.out = N.ov = glob = globV = 0;
      }
      const busy =
        mode !== "idle" || drops.length > 0 || (jellyOn && !still) || drawPointer || sense > 0.01;

      // draw
      if (busy && (anyOut || drops.length || drawPointer)) ensureCanvas();
      if (canvas && ctx) {
        const c = ctx;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        const inkNow = getComputedStyle(skin).backgroundColor;
        if (inkNow !== ink) {
          ink = inkNow;
          inkLight = isLight(rgbOf(ink));
        }
        c.fillStyle = ink;
        const base = still && mode === "release" ? fade : 1;
        const t0 = now / 1000;

        // the gooey base: a low cone of ink over the roots, which parts into separate tentacles
        const nLen = Math.hypot(N.tx - N.rx, N.ty - N.ry);
        const W = (N.w * 1.7 + 5) * N.out;
        const neckOn = W > 1.2 && nLen > 2;
        const width = (t) => {
          const u = clamp(t / N.reach, 0, 1);
          return (
            2 + W * Math.pow(1 - u, 2.2) + FILLET * N.out * (u < 0.3 ? Math.pow(1 - u / 0.3, 2) : 0)
          );
        };
        if (neckOn) curve(N.rx, N.ry, N.rnx, N.rny, N.tx, N.ty, 0, 28, neckLine, () => 0);

        // centre lines
        for (const s of slots) {
          s.pts.length = 0;
          const len = Math.hypot(s.tx - s.rx, s.ty - s.ry);
          if (len < 1.5) continue;
          // where it starts: its own root on the surface, heading out between its own normal and the base's
          const ax = s.rx,
            ay = s.ry;
          let anx = s.rnx + N.rnx * 2.2,
            any = s.rny + N.rny * 2.2;
          const nl = Math.hypot(anx, any) || 1;
          anx /= nl;
          any /= nl;
          const sl = Math.hypot(s.tx - ax, s.ty - ay);
          if (sl < 1.5) continue;
          const tj =
            s.state === "held"
              ? clamp((gd - s.grabAt) / Math.max(s.breakAt - s.grabAt, 1), 0, 1)
              : 0;
          const slack = still ? 0 : 1 - 0.8 * Math.max(tension, tj);
          // each one bows out to its own side, so there's air between them all the way to the pointer
          const fan = still
            ? 0
            : s.u *
              (1 + 0.3 * Math.sin(s.phase * 5.1)) *
              Math.min(sl * FAN, FAN_MAX) *
              clamp(N.w / (rect.height * ROOTS), 0.3, 1) *
              (1 - 0.5 * Math.max(tension, tj)) *
              clamp(sl / 50, 0, 1) *
              (s.state === "held" || s.pending ? 1 : 0.3);
          const amp = still ? 0 : BRAID * slack * Math.min(1, sl / 40);
          const shiver = still || tj < 0.8 ? 0 : ((tj - 0.8) / 0.2) * 1.4;
          curve(ax, ay, anx, any, s.tx, s.ty, still ? 0 : slack * sl * 0.08, 26, s.pts, (t) => {
            const bell = Math.sin(Math.PI * t);
            return (
              fan * Math.sin(Math.PI * Math.pow(t, 0.7)) +
              bell *
                (amp * Math.sin(Math.PI * 2 * 1.2 * t + s.phase + t0 * WRITHE) +
                  shiver * Math.sin(t0 * 70 + t * 25 + s.phase * 3))
            );
          });
        }

        // the web: a thin film between neighbouring tentacles that hold on
        const web = slots
          .filter((s) => (s.state === "held" || s.pending) && s.pts.length)
          .sort((a, b) => a.u - b.u);
        c.globalAlpha = base * WEB * (1 - 0.6 * tension);
        for (let i = 0; i + 1 < web.length; i++) {
          // only the half near the button: further out the tentacles part with clear air between them
          // and it pinches shut to a point, like a film of ink stretched thin
          const a = web[i].pts,
            b = web[i + 1].pts,
            m = Math.round(Math.min(a.length, b.length) * WEB_LEN);
          const at = (p, o, q) => {
            const f = clamp((m - q) / (m * 0.5), 0, 1);
            const mx = (p.x + o.x) / 2,
              my = (p.y + o.y) / 2;
            return { x: mx + (p.x - mx) * f, y: my + (p.y - my) * f };
          };
          c.beginPath();
          c.moveTo(a[0].x, a[0].y);
          for (let q = 1; q <= m; q++) {
            const v = at(a[q], b[q], q);
            c.lineTo(v.x, v.y);
          }
          for (let q = m; q >= 0; q--) {
            const v = at(b[q], a[q], q);
            c.lineTo(v.x, v.y);
          }
          c.closePath();
          c.fill();
        }

        // tentacles
        c.globalAlpha = base;
        for (const s of slots) {
          if (!s.pts.length) continue;
          const len = Math.hypot(s.tx - s.rx, s.ty - s.ry);
          const thin = clamp(Math.sqrt(120 / Math.max(len, 1)), 0.6, 1);
          const grip = s.pinned ? 0.6 : 0;
          const own = 0.6 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase * 3.7)); // no two the same: some thick, some thin
          ribbon(
            c,
            s.pts,
            0,
            s.pts.length - 1,
            (t) =>
              TIP_W +
              grip * t +
              (ROOT_W * thin * own - TIP_W) * Math.pow(1 - t, 1.3) +
              (t < 0.12 ? 2.5 * Math.pow(1 - t / 0.12, 2) : 0),
          );
        }

        // the gooey base: a low cone over the roots, melting into the tentacles
        if (neckOn) {
          const end = Math.max(3, Math.round(28 * N.reach));
          ribbon(c, neckLine, 0, end, width, (q) => {
            const f = edge(q.x, q.y);
            return { x: f.x - f.nx * 1.5, y: f.y - f.ny * 1.5 };
          });
          // a soft shine along its top, like the button's
          if (!inkLight && N.out > 0.5 && !still && end > 6) {
            c.save();
            c.globalAlpha = base * 0.3 * (N.out - 0.5) * 2;
            c.strokeStyle = "white";
            c.lineWidth = 1;
            c.lineCap = "round";
            const m = neckLine[Math.round(end / 2)],
              m2 = neckLine[Math.round(end / 2) + 1];
            const sgn = m2.x - m.x < 0 ? -1 : 1; // the side that faces up
            c.beginPath();
            for (let i = 1; i <= Math.round(end * 0.6); i++) {
              const p = neckLine[i],
                q = neckLine[i + 1];
              const tx = q.x - p.x,
                ty = q.y - p.y,
                tl = Math.hypot(tx, ty) || 1;
              const off = (width(i / 28) / 2) * 0.55 * sgn;
              const x = p.x + (ty / tl) * off,
                y = p.y - (tx / tl) * off;
              if (i === 1) c.moveTo(x, y);
              else c.lineTo(x, y);
            }
            c.stroke();
            c.restore();
          }
        }

        // the glob that holds the pointer tip
        if (glob > 0.3) {
          c.beginPath();
          c.arc(grab.x + 1, grab.y + 1.5, glob, 0, Math.PI * 2);
          c.fill();
        }

        // flying drops
        for (const p of drops) {
          const a = p.fall ? 1 - p.age / p.life : 1;
          const r = p.r * (p.sink ? 1 - p.sink / 0.12 : 1);
          const sp = Math.hypot(p.vx, p.vy);
          c.globalAlpha = Math.max(0, a) * base;
          c.beginPath();
          c.ellipse(
            p.x,
            p.y,
            r * (1 + Math.min(sp / 1500, 0.8)),
            r,
            Math.atan2(p.vy, p.vx),
            0,
            Math.PI * 2,
          );
          c.fill();
        }
        c.globalAlpha = 1;
        if (drawPointer && pointerHidden) drawArrow(c, C.x, C.y);
      }

      if (busy) raf = requestAnimationFrame(frame);
      else {
        last = 0;
        dropCanvas();
        if (holder === me) holder = null;
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    /* ---------- input ---------- */

    const onMove = (ev) => {
      if (ev.pointerType === "touch") {
        if (!P.touch || ev.pointerId !== P.id) return;
      } else if (P.touch && P.has) return;
      else {
        P.touch = false;
        P.has = true;
      }
      P.x = ev.clientX;
      P.y = ev.clientY;
      if (mode === "idle" && !raf) {
        if (!visible) return;
        // cheap check before waking the loop
        readShape();
        if (edge(P.x, P.y).d > clamp(opts.current.reach || 0, 8, 400) + SENSE) return;
      }
      wake();
    };
    const onDown = (ev) => {
      if (ev.pointerType === "mouse") {
        if (mode === "held" && !btn.contains(ev.target)) {
          P.forceSnap = true;
          wake();
        }
        return;
      }
      if (ev.target instanceof Node && btn.contains(ev.target) && !btn.disabled) {
        // a finger (or pen) on the button: the tentacles follow it until it lifts
        try {
          btn.releasePointerCapture(ev.pointerId);
        } catch {}
        P.touch = ev.pointerType === "touch";
        P.has = true;
        P.id = ev.pointerId;
        P.x = ev.clientX;
        P.y = ev.clientY;
        wake();
      }
    };
    const onUp = (ev) => {
      if (P.touch && ev.pointerId === P.id) {
        P.has = false;
        P.touch = false;
        P.id = -1;
        wake();
      }
    };
    const onOut = (ev) => {
      if (ev.pointerType === "mouse" && !ev.relatedTarget) {
        P.has = false;
        wake();
      }
    };
    const onBlur = () => {
      P.has = false;
      P.touch = false;
      wake();
    };
    const onVis = () => {
      if (document.hidden) {
        P.has = false;
        P.touch = false;
        reset();
      }
    };

    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), {
      rootMargin: "320px",
    });
    io.observe(btn);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { capture: true, passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown, { capture: true });
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerout", onOut);
      removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
      reset();
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `ivn ${className}` : "ivn"}
        style={{
          ...(color ? { "--ivn-ink": color } : null),
          ...(textColor ? { "--ivn-text": textColor } : null),
          ...style,
        }}
        {...rest}
      >
        <span ref={skinRef} className="ivn-skin" aria-hidden="true" />
        <span className="ivn-label">{children}</span>
      </button>
    </>
  );
});
