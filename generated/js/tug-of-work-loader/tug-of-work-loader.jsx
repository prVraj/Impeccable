"use client";

/**
 * Tug-of-Work-loader, from Impeccable.
 *
 * A see-through progress bar with a tiny person inside it. The person leans
 * back on a rope tied to the front of the fill and walks backwards, hauling
 * the fill along until it reaches 100%. When the bar waits, they keep
 * straining on the rope; at 100% they throw their arms up. The person, the
 * rope and everything they do stay inside the bar's border.
 *
 * Give it a `value` from 0 to 100 and the person pulls the fill to it. Leave
 * `value` out and it loops on its own, with pulls and pauses like real work.
 *
 * No packages: the bar is plain CSS and the person is drawn on one canvas
 * inside it, by one requestAnimationFrame loop that stops when nothing moves.
 */

import { useEffect, useRef } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const PAD = 3; // px between the border and the fill
const BODY = 0.76; // the person's height, as a share of the space inside the bar
const GROUND = 0.88; // where their feet stand, from the top of that space
const LEAN = 0.5; // radians they lean back on the rope
const REACH = 0.62; // rope between the fill and their hands, in body heights
const PULL_SPEED = 0.3; // the fastest the fill moves when following a value, share of the bar per second
const CATCH_MS = 220; // how softly the fill settles on a new value
const STRIDE = 0.6; // body heights travelled per pair of steps
const MAX_STEPS = 2.8; // pairs of steps per second at most (faster pulls slide the feet a little)
const HEAVE_MS = 1100; // one heave on the rope while the bar waits
const SWEAT_MS = 1600; // a drop of sweat flies off this often while they strain
const CHEER_MS = 260; // arms go up at 100%
const HOP_MS = 700; // two small hops at 100%
const HOLD_MS = 1500; // looping: how long the finished bar stays before it starts over
const FADE_MS = 320; // looping: fade out, reset, fade in

/** The looping run: [share of the duration, progress]. Pulls, then pauses where they strain. */
const RUN = [
  [0, 0],
  [0.11, 0.14],
  [0.17, 0.15],
  [0.3, 0.34],
  [0.42, 0.36],
  [0.53, 0.53],
  [0.59, 0.55],
  [0.71, 0.74],
  [0.79, 0.76],
  [0.9, 0.93],
  [0.95, 0.94],
  [1, 1],
];

/** Styles that can't be inline: the bar, its fill, the label row and reduced motion. */
const CSS = `
.twl { display: block; width: 100%; min-width: 0; --twl-c: currentColor; }
.twl-track { position: relative; box-sizing: border-box; height: var(--twl-h, 40px); padding: ${PAD}px; border: 1px solid color-mix(in srgb, var(--twl-c) 26%, transparent); border-radius: 999px; background: transparent; }
.twl-inner { position: relative; height: 100%; border-radius: 999px; overflow: hidden; container-type: inline-size; }
.twl-fill { position: absolute; top: 0; bottom: 0; right: 100%; width: calc(100% + 64px); border-radius: 999px; background: repeating-linear-gradient(115deg, color-mix(in srgb, var(--twl-c) 15%, transparent) 0 1.5px, transparent 1.5px 7px), color-mix(in srgb, var(--twl-c) 9%, transparent); box-shadow: inset -1.5px 0 0 color-mix(in srgb, var(--twl-c) 45%, transparent); will-change: transform; }
.twl-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; color: var(--twl-c); }
.twl-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 10px; font-size: 13px; line-height: 1.45; }
.twl-label { min-width: 0; overflow-wrap: anywhere; color: color-mix(in srgb, currentColor 64%, transparent); }
.twl-value { flex-shrink: 0; font-variant-numeric: tabular-nums; font-weight: 500; }`;

/* ---------- small helpers ---------- */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, fallback, lo, hi) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const smooth = (t) => t * t * (3 - 2 * t);
/** Moves `from` toward `to`, the same amount per second at any frame rate. */
const ease = (from, to, dt, ms) => to + (from - to) * Math.exp(-dt / ms);

/** Where the looping run is at a share t (0 to 1) of the duration. */
function runAt(t) {
  for (let i = 1; i < RUN.length; i++) {
    const [t1, p1] = RUN[i];
    if (t <= t1) {
      const [t0, p0] = RUN[i - 1];
      return lerp(p0, p1, inOut((t - t0) / (t1 - t0)));
    }
  }
  return 1;
}
const pt = (x, y) => ({ x, y });
const mix = (a, b, t) => pt(lerp(a.x, b.x, t), lerp(a.y, b.y, t));

/** The middle joint (knee or elbow) of a two-part limb, bent toward `side` (+1 or -1). */
function joint(a, b, len, side) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let d = Math.hypot(dx, dy) || 0.001;
  if (d > len * 2) {
    // Too far to reach: stretch the limb straight toward the target.
    b = pt(a.x + (dx / d) * len * 2, a.y + (dy / d) * len * 2);
    dx = b.x - a.x;
    dy = b.y - a.y;
    d = len * 2;
  }
  const h = Math.sqrt(Math.max(0, len * len - (d / 2) ** 2));
  const m = pt(a.x + dx / 2, a.y + dy / 2);
  return [pt(m.x + (-dy / d) * h * side, m.y + (dx / d) * h * side), b];
}

/* ---------- the component ---------- */

export function TugOfWorkLoader({
  value,
  label = "Developers are working really hard.",
  showValue = true,
  color,
  height,
  duration,
  onComplete,
  className,
  style,
  ...rest
}) {
  const looping = !(typeof value === "number" && Number.isFinite(value));
  const target = looping ? 0 : clamp(value, 0, 100) / 100;
  const h = num(height, 44, 28, 64);

  const innerRef = useRef(null);
  const fillRef = useRef(null);
  const canvasRef = useRef(null);
  const valueRef = useRef(null);
  const rootRef = useRef(null);
  const kick = useRef(() => {});

  // The latest props, read by the running loop without restarting it.
  const live = useRef({ looping, target, duration: num(duration, 8000, 3000, 30000), onComplete });
  live.current = { looping, target, duration: num(duration, 8000, 3000, 30000), onComplete };

  useEffect(() => {
    kick.current();
  }, [looping, target]);

  useEffect(() => {
    const inner = innerRef.current;
    const fill = fillRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!inner || !fill || !canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let visible = true;

    // Everything that moves.
    let p = live.current.looping ? 0 : live.current.target; // where the fill is, 0 to 1
    let runT = 0; // looping: ms into the current run
    let personX = -1; // feet, in px from the left of the space inside the bar
    let walk = 0; // 0 standing, 1 walking
    let stepPhase = 0;
    let pullPhase = 0;
    let pullAmt = 0;
    let strainMs = 0; // how long they have been straining without moving
    let sweatAt = 0;
    let cheer = 0; // 0 pulling, 1 arms up
    let doneMs = -1; // ms since the fill reached 100, or -1
    let fade = 1; // looping reset
    let shown = -1; // last percentage written
    let pulled = p < 0.999; // onComplete only fires after a pull, not when it mounts already full
    let drops = [];

    const size = () => {
      const r = inner.getBoundingClientRect();
      W = inner.clientWidth || r.width;
      H = inner.clientHeight || r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      kick.current();
    };

    const draw = (t, dt) => {
      const reduce = motion.matches;
      const L = live.current;
      const body = H * BODY;
      const ground = H * GROUND;
      const lw = Math.max(1.4, body * 0.075);

      /* 1. Where the fill should be. */
      const before = p;
      let settled = false;
      if (L.looping) {
        if (doneMs < 0) {
          runT += dt;
          p = runAt(clamp(runT / L.duration, 0, 1));
        } else {
          const after = doneMs - HOLD_MS;
          fade =
            after < 0
              ? 1
              : after < FADE_MS
                ? 1 - after / FADE_MS
                : after < FADE_MS * 2
                  ? (after - FADE_MS) / FADE_MS
                  : 1;
          if (after >= FADE_MS && runT > 0) {
            // Out of sight: start over from 0, with the person back at the start.
            runT = 0;
            p = 0;
            personX = -1;
            drops = [];
          }
          if (after >= FADE_MS * 2) doneMs = -1;
        }
      } else {
        fade = 1;
        const d = L.target - p;
        if (Math.abs(d) < 0.0005) p = L.target;
        else if (d < 0) {
          // Progress went back (a new upload, a retry): start over there at once, no walking backwards.
          p = L.target;
          personX = -1;
          drops = [];
        } else {
          const step = Math.sign(d) * Math.min(Math.abs(d), PULL_SPEED * (dt / 1000));
          const soft = d * (1 - Math.exp(-dt / CATCH_MS));
          p += Math.abs(soft) < Math.abs(step) ? soft : step;
        }
        settled = p === L.target;
      }
      if (reduce && L.looping && doneMs < 0) settled = false;

      /* 2. Done? */
      if (p < 0.999) pulled = true;
      if (p >= 0.999 && doneMs < 0 && (L.looping ? runT > 0 : true)) {
        doneMs = 0;
        if (pulled) L.onComplete?.();
        pulled = false;
      } else if (doneMs >= 0) {
        doneMs += dt;
        if (!L.looping && p < 0.999) doneMs = -1;
      }
      const isDone = doneMs >= 0 && p >= 0.999;
      cheer = reduce ? (isDone ? 1 : 0) : ease(cheer, isDone ? 1 : 0, dt, CHEER_MS / 3);

      /* 3. The fill. */
      fill.style.transform = `translateX(calc(${p.toFixed(5)} * 100cqw))`;
      fill.style.opacity = String(fade);
      const pct = Math.round(p * 100);
      if (pct !== shown) {
        shown = pct;
        if (valueRef.current) valueRef.current.textContent = `${pct}%`;
        if (!L.looping) root.setAttribute("aria-valuenow", String(pct));
      }

      /* 4. Where the person stands. */
      const nose = p * W;
      const handsBack = body * 0.35; // hands sit this far in front of the feet
      // Stop where the bar is still full height, before its rounded end, so the head never touches the border.
      const maxX = W - H / 2 - body * 0.12;
      const want = clamp(nose + handsBack + body * REACH, body * 0.3, maxX);
      if (personX < 0) personX = want;
      const moved = want - personX;
      personX = want;
      const pinned = want >= maxX - 0.01;
      const fillMoved = (p - before) * W;

      // Steps follow the distance walked, so feet don't slide (up to MAX_STEPS a second).
      const speed = dt > 0 ? Math.abs(moved) / dt : 0; // px per ms
      const walking = !reduce && speed > 0.004;
      walk = reduce ? 0 : ease(walk, walking ? 1 : 0, dt, 90);
      if (!reduce) {
        const cycles = moved / (STRIDE * body);
        const cap = (MAX_STEPS * dt) / 1000;
        stepPhase += clamp(cycles, -cap, cap);
      }

      // Hand over hand on the rope: while pinned at the end, or heaving while the bar waits.
      const waiting = !isDone && Math.abs(fillMoved) < 0.01 && !(L.looping && doneMs >= 0);
      strainMs = waiting ? strainMs + dt : 0;
      const heave =
        reduce || !waiting ? 0 : Math.max(0, Math.sin((t / HEAVE_MS) * Math.PI * 2)) ** 2;
      if (!reduce) {
        if (pinned && Math.abs(fillMoved) > 0.01) pullPhase += Math.abs(fillMoved) / (body * 0.35);
        else if (waiting) pullPhase += dt / HEAVE_MS;
      }
      pullAmt = reduce
        ? 0
        : ease(pullAmt, isDone ? 0 : pinned && !waiting ? 1 : waiting ? 0.45 : 0.15, dt, 120);

      /* 5. The pose. Facing left, toward the fill, leaning back on the rope. */
      const tremble =
        !reduce && strainMs > 300 ? Math.sin(t * 0.09) * 0.35 * Math.min(1, strainMs / 900) : 0;
      const lean = lerp(LEAN - walk * 0.06 + heave * 0.12, 0.02, cheer);
      const hop =
        reduce || !isDone || doneMs > HOP_MS
          ? 0
          : Math.abs(Math.sin((doneMs / HOP_MS) * Math.PI * 2)) * H * 0.05;
      const x = personX + tremble;
      const sn = Math.sin(lean);
      const cs = Math.cos(lean);
      const bob = -Math.abs(Math.sin(stepPhase * Math.PI * 2)) * body * 0.025 * walk;
      const hip = pt(x + sn * body * 0.12, ground - body * lerp(0.44, 0.5, cheer) + bob - hop);
      const up = (d) => pt(hip.x + sn * d * body, hip.y - cs * d * body);
      const shoulder = up(0.27);
      const neck = up(0.31);
      const head = up(0.42);
      const headR = body * 0.1;

      // Feet: a braced stance, blended with a backwards walk.
      const thigh = body * 0.28;
      const feet = [0, 1].map((i) => {
        const brace = i === 0 ? -0.36 : -0.1;
        const cheerFoot = i === 0 ? -0.06 : 0.06;
        let off = brace;
        let lift = 0;
        if (walk > 0.001) {
          const ph = (((stepPhase + i / 2) % 1) + 1) % 1;
          const s = 0.12;
          let w;
          if (ph < 0.6) w = lerp(s, -s, ph / 0.6);
          else {
            const k = (ph - 0.6) / 0.4;
            w = lerp(-s, s, smooth(k));
            lift = Math.sin(k * Math.PI) * 0.07;
          }
          off = lerp(brace, w - 0.22, walk);
          lift *= walk;
        }
        off = lerp(off, cheerFoot, cheer);
        return pt(x + off * body, ground - lift * body - hop);
      });

      // Hands: on the rope in front of the chest, or up in the air at 100%.
      const grip = pt(shoulder.x - body * 0.28, shoulder.y + body * 0.11);
      const hands = [0, 1].map((i) => {
        const swing = Math.sin((pullPhase + i / 2) * Math.PI * 2);
        const pulled = pt(
          grip.x - body * 0.07 * (0.5 + 0.5 * swing) * pullAmt + i * body * 0.06,
          grip.y - body * 0.02 * swing * pullAmt,
        );
        const raised = pt(shoulder.x + (i === 0 ? -0.17 : 0.17) * body, shoulder.y - body * 0.27);
        return mix(pulled, raised, cheer);
      });

      /* 6. Draw. Everything is clipped to the inside of the bar, so nothing ever leaves its border. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      const r = H / 2;
      ctx.moveTo(r, 0);
      ctx.arcTo(W, 0, W, H, r);
      ctx.arcTo(W, H, 0, H, r);
      ctx.arcTo(0, H, 0, 0, r);
      ctx.arcTo(0, 0, W, 0, r);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = fade;
      const ink = getComputedStyle(canvas).color;
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // The rope: taut from the front of the fill to the front hand, then a short tail behind.
      if (cheer < 0.98) {
        const front = hands[0].x < hands[1].x ? hands[0] : hands[1];
        const rear = front === hands[0] ? hands[1] : hands[0];
        ctx.globalAlpha = fade * (1 - cheer);
        ctx.lineWidth = lw * 0.75;
        ctx.beginPath();
        const ropeY = H / 2;
        if (nose < front.x - 0.5) {
          ctx.moveTo(nose, ropeY);
          const sag = waiting ? 0 : body * 0.015;
          ctx.quadraticCurveTo(
            (nose + front.x) / 2,
            (ropeY + front.y) / 2 + sag + tremble * 0.4,
            front.x,
            front.y,
          );
        } else ctx.moveTo(front.x, front.y);
        ctx.lineTo(rear.x, rear.y);
        ctx.quadraticCurveTo(
          rear.x + body * 0.1,
          rear.y + body * 0.02,
          rear.x + body * 0.14,
          rear.y + body * 0.12,
        );
        ctx.stroke();
        ctx.globalAlpha = fade;
      }

      // Legs and arms.
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (const f of feet) {
        const [knee, foot] = joint(hip, f, thigh, 1); // knees bend toward the fill
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.lineTo(foot.x, foot.y);
      }
      for (const hand of hands) {
        const [elbow, reach] = joint(
          shoulder,
          hand,
          body * 0.165,
          cheer > 0.5 ? (hand.x < shoulder.x ? -1 : 1) : -1,
        );
        ctx.moveTo(shoulder.x, shoulder.y);
        ctx.lineTo(elbow.x, elbow.y);
        ctx.lineTo(reach.x, reach.y);
      }
      // Body.
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(neck.x, neck.y);
      ctx.stroke();
      // Head.
      ctx.beginPath();
      ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
      ctx.fill();

      // Sweat: a drop flies off the back of the head while they strain.
      if (!reduce && strainMs > 900 && t - sweatAt > SWEAT_MS) {
        sweatAt = t;
        drops.push({
          x: head.x + headR * 0.9,
          y: head.y - headR * 0.5,
          vx: body * 0.0014,
          vy: -body * 0.0016,
          age: 0,
        });
      }
      drops = drops.filter((d) => d.age < 650);
      for (const d of drops) {
        d.age += dt;
        d.vy += body * 0.000009 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        ctx.globalAlpha = fade * 0.75 * (1 - d.age / 650);
        ctx.beginPath();
        ctx.arc(d.x, d.y, Math.max(0.9, body * 0.035), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // The loop can rest only when nothing on screen will change.
      const busy =
        L.looping ||
        !settled ||
        drops.length > 0 ||
        (isDone && doneMs < HOP_MS + CHEER_MS) ||
        (!isDone && !reduce) ||
        walk > 0.01;
      return busy;
    };

    const frame = (t) => {
      raf = 0;
      if (!W || !H) return;
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      if (draw(t, dt) && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    kick.current = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(size);
    ro.observe(inner);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick.current();
    });
    io.observe(root);
    const onVis = () => {
      last = 0;
      kick.current();
    };
    document.addEventListener("visibilitychange", onVis);
    motion.addEventListener?.("change", onVis);
    // A theme switch changes the colors: redraw even when the loop is resting.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener?.("change", onVis);
    const mo = new MutationObserver(onVis);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    size();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      kick.current = () => {};
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      motion.removeEventListener?.("change", onVis);
      scheme.removeEventListener?.("change", onVis);
      mo.disconnect();
    };
  }, []);

  const start = looping ? 0 : target;
  const ariaLabel = typeof label === "string" && label ? label : "Loading";
  const rootStyle = { ...style, "--twl-h": `${h}px`, ...(color ? { "--twl-c": color } : null) };

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={looping ? undefined : Math.round(start * 100)}
      aria-busy={looping || start < 1 ? true : undefined}
      className={className ? `twl ${className}` : "twl"}
      style={rootStyle}
      {...rest}
    >
      <style>{CSS}</style>
      <div className="twl-track">
        <div ref={innerRef} className="twl-inner">
          <div
            ref={fillRef}
            className="twl-fill"
            style={{ transform: `translateX(calc(${start} * 100cqw))` }}
          />
          <canvas ref={canvasRef} className="twl-canvas" aria-hidden="true" />
        </div>
      </div>
      {(label != null && label !== false && label !== "") || showValue ? (
        <div className="twl-row" aria-hidden="true">
          <span className="twl-label">{label}</span>
          {showValue ? (
            <span ref={valueRef} className="twl-value">
              {Math.round(start * 100)}%
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
