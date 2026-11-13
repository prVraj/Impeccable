"use client";

/**
 * Peter-Tingle-button, from Impeccable.
 *
 * A button with a sixth sense. When the pointer comes near, the button feels it
 * coming: short wavy sense lines start to pulse out of its edge, longest and
 * brightest on the side the pointer is coming from, and the button shivers a
 * little. The closer (and the faster) the pointer comes, the stronger the tingle.
 * The moment the pointer lands on it, the lines flash outward once and everything
 * goes calm, so clicking is always steady.
 *
 * Phones have no pointer to sense, so a tap sets off one short tingle all around.
 * Keyboard focus sets off a softer one.
 *
 * No packages: one small canvas that hugs the button and only draws while it
 * tingles, and one requestAnimationFrame loop that stops when it is calm.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const PAD = 44; // px of room around the button for the lines (the canvas overhang)
const GAP = 4; // px between the edge and where a line starts
const TRAVEL = 9; // px a line drifts outward during one pulse
const PULSE_MS = 560; // one pulse: a line fades in, drifts out and fades away
const LEN_MIN = 4; // px: a line's length when the tingle is faint
const LEN_MAX = 18; // px: a line's length at full tingle
const AMP = 1.6; // px: how far a line waves from side to side
const WAVE = 5.5; // px: the length of one wave
const WIGGLE = 0.018; // how fast the waves crawl along a line, radians per ms
const LINE_W = 1.6; // px: line thickness
const SPACING = 24; // px of edge per line when `lines` is not set
const BACK = 0.4; // how strong the lines are on the side facing away from the pointer
const SHIVER = 1.1; // px the button shivers at full tingle
const TILT = 0.5; // degrees the button tilts at full tingle
const RISE_MS = 90; // how fast the tingle builds
const FALL_MS = 240; // how fast it calms down
const RUSH = 0.35; // extra tingle for a pointer that comes in fast
const RUSH_SPEED = 1600; // px per second that counts as fast
const BURST_MS = 320; // the flash outward when the pointer lands on the button
const BURST_PUSH = 14; // px the lines fly out in that flash
const FLINCH = 0.03; // how much the button shrinks in that flash
const TAP_MS = 650; // the tingle a tap sets off on a touch screen
const FOCUS_MS = 900; // the softer tingle keyboard focus sets off
const FOCUS_AMT = 0.6;

/** Styles that can't be inline: press, focus, disabled and reduced motion. */
const CSS = `
.ipt { position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 22px; border: 0; border-radius: 999px; background: none; color: inherit; font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; isolation: isolate; }
.ipt-skin, .ipt-label { transform: var(--ipt-t, none); }
.ipt-skin { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background-color: var(--ipt-ink, currentColor);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .16), 0 1px 2px rgb(0 0 0 / .18), 0 6px 14px -8px rgb(0 0 0 / .4);
  transition: scale .18s cubic-bezier(.23,1,.32,1); }
.ipt-label { position: relative; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ipt-text, var(--ipt-auto-text, Canvas)); }
.ipt-sense { position: absolute; left: -${PAD}px; top: -${PAD}px; z-index: -2; pointer-events: none; color: var(--ipt-sense, var(--ipt-ink, currentColor)); }
.ipt:active:not(:disabled) .ipt-skin { scale: .97; }
.ipt:focus-visible { outline: 2px solid var(--ipt-ink, currentColor); outline-offset: 3px; }
.ipt:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) { .ipt-skin { transition: none; } .ipt:active:not(:disabled) .ipt-skin { scale: 1; } }`;

/* ---------- small helpers ---------- */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Signed distance from a point to a rounded rectangle (negative inside). */
function distTo(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

/** The point `s` px along a rounded rectangle's edge (clockwise from the top-left), with its outward normal. */
function edgeAt(s, w, h, r) {
  const sw = w - 2 * r,
    sh = h - 2 * r,
    arc = (Math.PI / 2) * r;
  const legs = [
    [sw, (t) => [r + t, 0, 0, -1]],
    [arc, (t) => corner(w - r, r, -Math.PI / 2 + t / Math.max(r, 1e-6))],
    [sh, (t) => [w, r + t, 1, 0]],
    [arc, (t) => corner(w - r, h - r, t / Math.max(r, 1e-6))],
    [sw, (t) => [w - r - t, h, 0, 1]],
    [arc, (t) => corner(r, h - r, Math.PI / 2 + t / Math.max(r, 1e-6))],
    [sh, (t) => [0, h - r - t, -1, 0]],
    [arc, (t) => corner(r, r, Math.PI + t / Math.max(r, 1e-6))],
  ];
  for (const [len, at] of legs) {
    if (s <= len) return at(s);
    s -= len;
  }
  return legs[0][1](0);
  function corner(cx, cy, a) {
    const nx = Math.cos(a),
      ny = Math.sin(a);
    return [cx + nx * r, cy + ny * r, nx, ny];
  }
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

export const PeterTingleButton = forwardRef(function PeterTingleButton(
  {
    color,
    textColor,
    senseColor,
    range = 120,
    lines,
    type = "button",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const btnRef = useRef(null);
  const skinRef = useRef(null);
  const canvasRef = useRef(null);
  useImperativeHandle(ref, () => btnRef.current, []);

  // Props the running loop reads without restarting it.
  const opts = useRef({ range, lines, disabled: !!rest.disabled });
  opts.current = {
    range: Number.isFinite(range) ? Math.max(16, range) : 120,
    lines: Number.isFinite(lines) ? lines : undefined,
    disabled: !!rest.disabled,
  };

  // The label picks black or white on the fill, and checks again when the theme changes.
  useEffect(() => {
    const btn = btnRef.current,
      skin = skinRef.current;
    if (!btn || !skin) return;
    const apply = () =>
      btn.style.setProperty(
        "--ipt-auto-text",
        isLight(getComputedStyle(skin).backgroundColor) ? "rgb(10 10 10)" : "rgb(255 255 255)",
      );
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
      canvas = canvasRef.current,
      skin = skinRef.current;
    if (!btn || !canvas || !skin) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceMq.matches;
    const onReduce = () => (reduced = reduceMq.matches);
    reduceMq.addEventListener("change", onReduce);

    const P = { x: 0, y: 0, has: false };
    let raf = 0,
      last = 0,
      level = 0,
      prevD = Infinity,
      speed = 0,
      wasInside = false;
    let burstAt = -1e9; // when the pointer last landed on the button
    let kick = { at: -1e9, amt: 0, dur: 1 }; // a tingle set off by a tap or focus
    let visible = true,
      cw = 0,
      ch = 0,
      dpr = 1;

    // The button's own size (offsetWidth ignores scaling), and where the pointer is in
    // the button's own pixels, so it also works inside a scaled-down preview.
    const shape = () => {
      const r = btn.getBoundingClientRect();
      const w = btn.offsetWidth,
        h = btn.offsetHeight;
      const sx = w ? r.width / w || 1 : 1,
        sy = h ? r.height / h || 1 : 1;
      const rad = parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0;
      return {
        w,
        h,
        rad: Math.min(rad, w / 2, h / 2),
        px: (P.x - r.left) / sx,
        py: (P.y - r.top) / sy,
      };
    };

    const calm = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      level = 0;
      speed = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      btn.style.removeProperty("--ipt-t");
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      const { w, h, rad, px, py } = shape();
      if (opts.current.disabled || !w || !h) return calm();

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

      // 1. How strong the tingle should be: closer and faster means stronger.
      const R = opts.current.range;
      let target = 0,
        inside = false;
      if (P.has) {
        const d = distTo(px, py, w / 2, h / 2, w / 2, h / 2, rad);
        inside = d <= 0;
        const v = Number.isFinite(prevD) ? ((prevD - d) / dt) * 1000 : 0;
        speed += (Math.max(0, v) - speed) * 0.25;
        prevD = d;
        if (!inside && d < R) {
          const near = 1 - d / R;
          target = near ** 1.2 + RUSH * clamp(speed / RUSH_SPEED, 0, 1) * near;
        }
        if (inside && !wasInside && level > 0.12) burstAt = now; // landed on it: one flash out
      } else {
        prevD = Infinity;
        speed = 0;
      }
      wasInside = inside;
      const k = kick.amt * (1 - (now - kick.at) / kick.dur);
      target = clamp(Math.max(target, k), 0, 1);
      level +=
        (target - level) *
        (1 - Math.exp(-dt / (target > level ? RISE_MS : inside ? RISE_MS : FALL_MS))); // calms fast once on it
      const bp = clamp((now - burstAt) / BURST_MS, 0, 1);
      const bursting = bp < 1;

      // 2. The sense lines.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.strokeStyle = getComputedStyle(canvas).color;
      ctx.lineWidth = LINE_W;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const perim = 2 * (w - 2 * rad) + 2 * (h - 2 * rad) + 2 * Math.PI * rad;
      const n = clamp(Math.round(opts.current.lines ?? perim / SPACING), 4, 64);
      const aim = P.has && !inside; // lines lean toward the pointer only while it is outside
      const ease = 1 - (1 - bp) ** 3;
      for (let i = 0; i < n; i++) {
        const [ex, ey, nx, ny] = edgeAt(((i + 0.5) / n) * perim, w, h, rad);
        const seed = (i * 0.618034) % 1;
        let face = 0.7;
        if (aim) {
          const dx = px - ex,
            dy = py - ey;
          face = Math.max(0, (nx * dx + ny * dy) / (Math.hypot(dx, dy) || 1));
        }
        const wgt = level * (BACK + (1 - BACK) * face);
        const ph = reduced ? 0.5 : (now / PULSE_MS + seed) % 1;
        // The steady pulse, and the one-off flash when the pointer lands.
        const strokes = []; // [offset, length, alpha]
        if (wgt > 0.01)
          strokes.push([
            GAP + (reduced ? 2 : TRAVEL * ph),
            LEN_MIN + (LEN_MAX - LEN_MIN) * wgt,
            Math.min(1, wgt * 2) * (reduced ? 1 : Math.sqrt(Math.sin(Math.PI * ph))),
          ]);
        if (bursting)
          strokes.push([
            GAP + (reduced ? 2 : BURST_PUSH * ease),
            LEN_MAX * (1 - 0.5 * bp),
            (1 - bp) ** 2 * 0.9,
          ]);
        for (const [off, len, alpha] of strokes) {
          if (alpha < 0.01) continue;
          const tx = -ny,
            ty = nx;
          const wig = reduced ? 0 : now * WIGGLE + seed * 6.283;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          for (let u = 0; u <= len; u += 1) {
            const a = AMP * Math.sin(Math.PI * (u / len)) * Math.sin((u / WAVE) * 6.283 - wig);
            const x = PAD + ex + nx * (off + u) + tx * a;
            const y = PAD + ey + ny * (off + u) + ty * a;
            if (u === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // 3. The shiver (and the flinch when the pointer lands).
      if (!reduced) {
        const a = level * level;
        const sx = SHIVER * a * (0.6 * Math.sin(now * 0.071) + 0.4 * Math.sin(now * 0.113 + 1.3));
        const sy =
          SHIVER * a * (0.6 * Math.sin(now * 0.083 + 2.1) + 0.4 * Math.sin(now * 0.127 + 0.4));
        const rot = TILT * a * Math.sin(now * 0.089 + 0.7);
        const sc = bursting ? 1 - FLINCH * Math.sin(Math.PI * bp) : 1;
        btn.style.setProperty(
          "--ipt-t",
          `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`,
        );
      }

      // 4. Keep going while anything moves; stop when calm.
      if (level > 0.003 || target > 0 || bursting) raf = requestAnimationFrame(frame);
      else calm();
    };

    const wake = () => {
      if (!raf && visible && !opts.current.disabled) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      P.x = e.clientX;
      P.y = e.clientY;
      P.has = true;
      if (raf || !visible || opts.current.disabled) return;
      const { w, h, rad, px, py } = shape();
      const d = distTo(px, py, w / 2, h / 2, w / 2, h / 2, rad);
      if (d < opts.current.range && d > 0) {
        prevD = Infinity;
        wasInside = false;
        wake();
      } else wasInside = d <= 0;
    };
    const onOut = (e) => {
      if (!e.relatedTarget) {
        P.has = false;
        if (raf) wake();
      }
    };
    const onLeave = () => {
      P.has = false;
    };
    const tingle = (amt, dur) => {
      kick = { at: performance.now(), amt, dur };
      wake();
    };
    const onDown = (e) => {
      if (e.pointerType === "touch") {
        P.has = false;
        tingle(1, TAP_MS);
      }
    };
    const onFocus = () => {
      if (btn.matches(":focus-visible")) tingle(FOCUS_AMT, FOCUS_MS);
    };
    const onVis = () => document.hidden && calm();

    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting;
        if (!visible) calm();
      },
      { rootMargin: `${PAD + 120}px` },
    );
    io.observe(btn);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    addEventListener("blur", onLeave);
    btn.addEventListener("pointerdown", onDown, { passive: true });
    btn.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      reduceMq.removeEventListener("change", onReduce);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      removeEventListener("blur", onLeave);
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      calm();
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `ipt ${className}` : "ipt"}
        style={{
          ...(color ? { "--ipt-ink": color } : null),
          ...(textColor ? { "--ipt-text": textColor } : null),
          ...(senseColor ? { "--ipt-sense": senseColor } : null),
          ...style,
        }}
        {...rest}
      >
        <canvas ref={canvasRef} className="ipt-sense" width={0} height={0} aria-hidden="true" />
        <span ref={skinRef} className="ipt-skin" aria-hidden="true" />
        <span className="ipt-label">{children}</span>
      </button>
    </>
  );
});
