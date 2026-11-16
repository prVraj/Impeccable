"use client";

/**
 * Tug of Work loader, from Impeccable.
 *
 * A see-through progress bar where the fill is a heavy slab of stone and a
 * tiny person drags it. They lean back on a rope tied to the stone's chipped
 * front and walk backwards, and the stone grinds along behind them in small
 * lurches, kicking up dust. When the bar waits, they keep heaving and the
 * stone budges a hair. At 100% the stone shoves them out of the end of the
 * bar and they tumble off and fall. Until then, everything stays inside the
 * bar's border.
 *
 * Give it a `value` from 0 to 100 and the person pulls the fill to it. Leave
 * `value` out and it loops on its own, with pulls and pauses like real work.
 *
 * No packages: the bar is plain CSS, and the stone and the person are drawn
 * on one canvas inside it, by one requestAnimationFrame loop that rests when
 * nothing moves.
 */

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

export type TugOfWorkLoaderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Progress from 0 to 100. The person pulls the fill to it. Leave it out to loop on its own. */
  value?: number;
  /** The support text under the bar. Pass null to hide it. */
  label?: ReactNode;
  /** Show the percentage at the right, under the bar. */
  showValue?: boolean;
  /** The person, the rope, the border and the stone's tint. Any CSS color, including var(--…). Default: the text color around it. */
  color?: string;
  /** How tall the bar is in px, 28 to 64. The person grows with it. */
  height?: number;
  /** When looping (no value): how long one pull from 0 to 100 takes, in ms, 3000 to 30000. */
  duration?: number;
  /** Called each time the fill reaches 100. */
  onComplete?: () => void;
};

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
const STUMBLE_MS = 280; // at 100% the stone shoves them backwards out of the end of the bar
const DROP_MS = 760; // then they tumble and fall, fading out
const DROP = 3; // how far they fall, in bar heights
const HOLD_MS = 1500; // looping: how long the finished bar stays before it starts over
const FADE_MS = 320; // looping: fade out, reset, fade in
const STONE = 0.18; // how strong the stone's tint is (it stays see-through)
const LAG = 1.4; // px the stone drags behind on each step before it lurches forward
const BUDGE = 0.9; // px the stone budges on each heave while the bar waits
const DUST = 0.35; // specks of dust kicked up per px the stone moves

/** The looping run: [share of the duration, progress]. Pulls, then pauses where they strain. */
const RUN: [number, number][] = [
  [0, 0], [0.11, 0.14], [0.17, 0.15], [0.3, 0.34], [0.42, 0.36], [0.53, 0.53],
  [0.59, 0.55], [0.71, 0.74], [0.79, 0.76], [0.9, 0.93], [0.95, 0.94], [1, 1],
];

/** Styles that can't be inline: the bar, the canvas and the label row. */
const CSS = `
.twl { display: block; width: 100%; min-width: 0; --twl-c: currentColor; }
.twl-track { position: relative; box-sizing: border-box; height: var(--twl-h, 40px); padding: ${PAD}px; border: 1px solid color-mix(in srgb, var(--twl-c) 26%, transparent); border-radius: 999px; background: transparent; }
.twl-inner { position: relative; height: 100%; }
.twl-canvas { position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; color: var(--twl-c); }
.twl-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 10px; font-size: 13px; line-height: 1.45; }
.twl-label { min-width: 0; overflow-wrap: anywhere; color: color-mix(in srgb, currentColor 64%, transparent); }
.twl-value { flex-shrink: 0; font-variant-numeric: tabular-nums; font-weight: 500; }`;

/* ---------- small helpers ---------- */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
/** A fixed random number from 0 to 1 for each n, so the stone's grain and chips stay the same as it moves. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Moves `from` toward `to`, the same amount per second at any frame rate. */
const ease = (from: number, to: number, dt: number, ms: number) => to + (from - to) * Math.exp(-dt / ms);

/** Where the looping run is at a share t (0 to 1) of the duration. */
function runAt(t: number) {
  for (let i = 1; i < RUN.length; i++) {
    const [t1, p1] = RUN[i];
    if (t <= t1) {
      const [t0, p0] = RUN[i - 1];
      return lerp(p0, p1, inOut((t - t0) / (t1 - t0)));
    }
  }
  return 1;
}

type Pt = { x: number; y: number };
const pt = (x: number, y: number): Pt => ({ x, y });
const mix = (a: Pt, b: Pt, t: number) => pt(lerp(a.x, b.x, t), lerp(a.y, b.y, t));

/** The middle joint (knee or elbow) of a two-part limb, bent toward `side` (+1 or -1). */
function joint(a: Pt, b: Pt, len: number, side: number): [Pt, Pt] {
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
}: TugOfWorkLoaderProps) {
  const looping = !(typeof value === "number" && Number.isFinite(value));
  const target = looping ? 0 : clamp(value, 0, 100) / 100;
  const h = num(height, 44, 28, 64);

  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const kick = useRef<() => void>(() => {});

  // The latest props, read by the running loop without restarting it.
  const live = useRef({ looping, target, duration: num(duration, 8000, 3000, 30000), onComplete });
  live.current = { looping, target, duration: num(duration, 8000, 3000, 30000), onComplete };

  useEffect(() => {
    kick.current();
  }, [looping, target]);

  useEffect(() => {
    const inner = innerRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!inner || !canvas || !root) return;
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
    let cheer = 0; // reduced motion only: 1 = arms up at 100%
    let fallMs = -1; // ms since the stone shoved them off the end, or -1
    let fromX = 0; // where they stood when it did
    let appear = 1; // fades them back in after a fall
    let doneMs = -1; // ms since the fill reached 100, or -1
    let fade = 1; // looping reset
    let shown = -1; // last percentage written
    let pulled = p < 0.999; // onComplete only fires after a pull, not when it mounts already full
    let drops: { x: number; y: number; vx: number; vy: number; age: number }[] = [];
    let dust: { x: number; y: number; vx: number; vy: number; r: number; age: number; life: number }[] = [];
    let dustAcc = 0;
    let lastLurch = 0;
    let lastHeave = 0;

    // The canvas reaches past the bar's right end and below it, for the fall. To the right only
    // as far as the screen allows, so a full-width bar never makes the page scroll sideways.
    let CW = 0;
    let CH = 0;
    const size = () => {
      const r = inner.getBoundingClientRect();
      W = inner.clientWidth || r.width;
      H = inner.clientHeight || r.height;
      const room = document.documentElement.clientWidth - r.right - 1;
      CW = W + clamp(room, 0, H * BODY * 2.4 + PAD + 2);
      CH = H * (1 + DROP);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${CW}px`;
      canvas.style.height = `${CH}px`;
      canvas.width = Math.max(1, Math.round(CW * dpr));
      canvas.height = Math.max(1, Math.round(CH * dpr));
      kick.current();
    };

    const draw = (t: number, dt: number) => {
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
          fade = after < 0 ? 1 : after < FADE_MS ? 1 - after / FADE_MS : after < FADE_MS * 2 ? (after - FADE_MS) / FADE_MS : 1;
          if (after >= FADE_MS && runT > 0) {
            // Out of sight: start over from 0, with the person back at the start.
            runT = 0;
            p = 0;
            personX = -1;
            drops = [];
            dust = [];
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
          dust = [];
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
      // At 100 the stone shoves them off the end (with reduced motion they just raise their arms).
      if (isDone && !reduce) {
        if (fallMs < 0) {
          fallMs = 0;
          fromX = personX;
        } else fallMs += dt;
      } else if (fallMs >= 0) {
        fallMs = -1;
        personX = -1;
        appear = 0;
      }
      cheer = reduce && isDone ? 1 : 0;
      appear = Math.min(1, appear + dt / 250);
      const shove = fallMs < 0 ? 0 : Math.min(1, fallMs / STUMBLE_MS);
      const drop = fallMs < 0 ? 0 : Math.max(0, fallMs - STUMBLE_MS);

      /* 3. The number. */
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
      let want = clamp(nose + handsBack + body * REACH, body * 0.3, maxX);
      // Shoved: they stumble backwards until their feet are past the end of the bar.
      if (fallMs >= 0) want = lerp(fromX, W + PAD + 2 + body * 0.15, 1 - (1 - shove) ** 3);
      if (personX < 0) personX = want;
      const moved = want - personX;
      personX = want;
      const pinned = fallMs < 0 && want >= maxX - 0.01;
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
      const heave = reduce || !waiting ? 0 : Math.max(0, Math.sin((t / HEAVE_MS) * Math.PI * 2)) ** 2;
      if (!reduce) {
        if (pinned && Math.abs(fillMoved) > 0.01) pullPhase += Math.abs(fillMoved) / (body * 0.35);
        else if (waiting) pullPhase += dt / HEAVE_MS;
      }
      pullAmt = reduce ? 0 : ease(pullAmt, isDone ? 0 : pinned && !waiting ? 1 : waiting ? 0.45 : 0.15, dt, 120);

      // The stone is heavy: it drags a little behind on each step and lurches forward, rumbles as it
      // grinds, and budges a hair on each heave while the bar waits.
      const moving = reduce ? 0 : clamp(Math.abs(fillMoved) / Math.max(dt, 1) / 0.02, 0, 1);
      const lurch = ((((pinned ? pullPhase : stepPhase) * 2) % 1) + 1) % 1;
      const stone = nose - LAG * lurch * moving + BUDGE * heave;
      const rumble = reduce ? 0 : Math.sin(t * 0.07) * 0.3 * moving + Math.sin(t * 0.13) * 0.25 * heave;
      if (!reduce && fade > 0.5) {
        dustAcc += Math.abs(fillMoved) * DUST;
        if (lurch < lastLurch - 0.5 && moving > 0.3) dustAcc += 2;
        if (heave > 0.85 && lastHeave <= 0.85) dustAcc += 3;
        const u = H * 0.0006;
        while (dustAcc >= 1 && dust.length < 40) {
          dustAcc -= 1;
          const life = 400 + Math.random() * 350;
          dust.push({
            x: stone - Math.random() * H * 0.25,
            y: H * (0.9 + Math.random() * 0.08),
            vx: (Math.random() * 0.9 - 0.6) * u,
            vy: -(0.3 + Math.random() * 0.7) * u,
            r: (0.45 + Math.random() * 0.65) * (H / 38),
            age: 0,
            life,
          });
        }
        dustAcc = Math.min(dustAcc, 4);
      }
      lastLurch = lurch;
      lastHeave = heave;

      /* 5. The pose. Facing left, toward the fill, leaning back on the rope. */
      const tremble = !reduce && strainMs > 300 ? Math.sin(t * 0.09) * 0.35 * Math.min(1, strainMs / 900) : 0;
      const lean = lerp(lerp(LEAN - walk * 0.06 + heave * 0.12, 0.02, cheer), 0.95, shove);
      const x = personX + tremble;
      const sn = Math.sin(lean);
      const cs = Math.cos(lean);
      const bob = -Math.abs(Math.sin(stepPhase * Math.PI * 2)) * body * 0.025 * walk;
      const hip = pt(x + sn * body * 0.12, ground - body * lerp(0.44, 0.5, cheer) + bob);
      const up = (d: number) => pt(hip.x + sn * d * body, hip.y - cs * d * body);
      const shoulder = up(0.27);
      const neck = up(0.31);
      const head = up(0.42);
      const headR = body * 0.1;

      // Feet: a braced stance, blended with a backwards walk.
      const thigh = body * 0.28;
      const feet: Pt[] = [0, 1].map((i) => {
        const brace = i === 0 ? -0.36 : -0.1;
        const cheerFoot = i === 0 ? -0.06 : 0.06;
        let off = brace;
        let lift = 0;
        if (walk > 0.001) {
          const ph = (((stepPhase + i / 2) % 1) + 1) % 1;
          const s = 0.12;
          let w: number;
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
        return pt(x + off * body, ground - lift * body);
      });

      // Hands: on the rope in front of the chest, or up in the air at 100%.
      const grip = pt(shoulder.x - body * 0.28, shoulder.y + body * 0.11);
      const hands: Pt[] = [0, 1].map((i) => {
        const swing = Math.sin((pullPhase + i / 2) * Math.PI * 2);
        const pulled = pt(grip.x - body * 0.07 * (0.5 + 0.5 * swing) * pullAmt + i * body * 0.06, grip.y - body * 0.02 * swing * pullAmt);
        const raised = pt(shoulder.x + (i === 0 ? -0.17 : 0.17) * body, shoulder.y - body * 0.27);
        // Shoved off: arms windmill.
        const spin = (fallMs < 0 ? 0 : fallMs) * 0.022 + i * Math.PI;
        const flail = pt(shoulder.x + Math.cos(spin) * body * 0.3, shoulder.y + Math.sin(spin) * body * 0.3);
        return mix(mix(pulled, raised, cheer), flail, fallMs < 0 ? 0 : Math.min(1, fallMs / 120));
      });

      /* 6. Draw. Everything is clipped to the inside of the bar, so nothing ever leaves its border. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
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

      // The stone: a heavy slab with a chipped front, grit, pits and cracks that travel with it.
      if (stone > -H * 0.5) {
        const r2 = H / 2;
        const edge: Pt[] = [];
        for (let j = 0; j <= 8; j++) {
          const y = (j / 8) * H;
          const round = r2 - Math.sqrt(Math.max(0, r2 * r2 - (y - r2) ** 2));
          const chip = j === 4 ? 0 : hash(j * 7.13) * H * 0.1; // the middle stays clean: the rope is tied there
          edge.push(pt(stone - round * 0.8 - chip, y + rumble));
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-H, edge[0].y);
        for (const e of edge) ctx.lineTo(e.x, e.y);
        ctx.lineTo(-H, edge[8].y);
        ctx.closePath();
        ctx.globalAlpha = fade * STONE;
        ctx.fill();
        ctx.clip();
        // Its weight: a darker underside.
        for (let band = 0; band < 14; band++) {
          ctx.globalAlpha = fade * 0.009;
          ctx.fillRect(-H, H * (0.5 + band * 0.036) + rumble, stone + H, H);
        }
        // Grain, pits and cracks, laid out in fixed tiles counted back from the front, so they move with it.
        const tile = H * 0.85;
        const k = H / 38;
        ctx.lineWidth = Math.max(0.8, H / 40);
        for (let n = 0; n * tile < stone + H; n++) {
          for (let g = 0; g < 4; g++) {
            const gx = stone - (n + hash(n * 13 + g)) * tile;
            const gy = (0.15 + hash(n * 29 + g * 3) * 0.7) * H + rumble;
            ctx.globalAlpha = fade * (0.2 + hash(n * 37 + g) * 0.2);
            ctx.beginPath();
            ctx.arc(gx, gy, (0.5 + hash(n * 31 + g) * 0.8) * k, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = fade * 0.1;
          ctx.beginPath();
          ctx.ellipse(stone - (n + hash(n * 41)) * tile, (0.3 + hash(n * 43) * 0.4) * H + rumble, (1.8 + hash(n * 47) * 1.4) * k, (1.1 + hash(n * 53) * 0.8) * k, 0, 0, Math.PI * 2);
          ctx.fill();
          if (hash(n * 17) < 0.55) {
            const fromTop = hash(n * 23) < 0.5;
            let cx = stone - (n + hash(n * 19)) * tile;
            let cy = (fromTop ? 0 : H) + rumble;
            ctx.globalAlpha = fade * 0.32;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            for (let c = 0; c < 3; c++) {
              cx += (hash(n * 59 + c) - 0.5) * H * 0.28;
              cy += (fromTop ? 1 : -1) * H * (0.12 + hash(n * 61 + c) * 0.1);
              ctx.lineTo(cx, cy);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
        // The chipped front edge.
        ctx.globalAlpha = fade * 0.6;
        ctx.lineWidth = Math.max(1.1, H / 30);
        ctx.beginPath();
        edge.forEach((e, i) => (i ? ctx.lineTo(e.x, e.y) : ctx.moveTo(e.x, e.y)));
        ctx.stroke();
        ctx.globalAlpha = fade;
      }

      // Dust kicked up where the stone grinds along the bottom.
      dust = dust.filter((d) => d.age < d.life);
      for (const d of dust) {
        d.age += dt;
        d.vy += H * 0.0000012 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        ctx.globalAlpha = fade * 0.4 * (1 - d.age / d.life);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = fade;

      // The rope: taut from the front of the stone to the front hand, then a short tail behind.
      if (cheer < 0.98 && shove < 1) {
        const front = hands[0].x < hands[1].x ? hands[0] : hands[1];
        const rear = front === hands[0] ? hands[1] : hands[0];
        ctx.globalAlpha = fade * appear * (1 - cheer) * (1 - shove);
        ctx.lineWidth = lw * 0.75;
        ctx.beginPath();
        const ropeY = H / 2 + rumble;
        if (stone < front.x - 0.5) {
          ctx.moveTo(stone, ropeY);
          const sag = waiting ? 0 : body * 0.015;
          ctx.quadraticCurveTo((stone + front.x) / 2, (ropeY + front.y) / 2 + sag + tremble * 0.4, front.x, front.y);
        } else ctx.moveTo(front.x, front.y);
        ctx.lineTo(rear.x, rear.y);
        ctx.quadraticCurveTo(rear.x + body * 0.1, rear.y + body * 0.02, rear.x + body * 0.14, rear.y + body * 0.12);
        ctx.stroke();
        ctx.globalAlpha = fade;
      }

      // Once shoved, they leave the bar: drawn without the clip, tumbling backwards as they fall.
      ctx.globalAlpha = fade * appear;
      if (fallMs >= 0) {
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const k = drop / DROP_MS;
        ctx.globalAlpha = fade * (k < 0.55 ? 1 : Math.max(0, 1 - (k - 0.55) / 0.45));
        ctx.translate(drop * 0.03 * (H / 38), DROP * H * Math.min(1, k) ** 2);
        ctx.translate(hip.x, hip.y);
        ctx.rotate(1.7 * Math.min(1, k) ** 1.2);
        ctx.translate(-hip.x, -hip.y);
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
        const [elbow, reach] = joint(shoulder, hand, body * 0.165, cheer > 0.5 ? (hand.x < shoulder.x ? -1 : 1) : -1);
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
        drops.push({ x: head.x + headR * 0.9, y: head.y - headR * 0.5, vx: body * 0.0014, vy: -body * 0.0016, age: 0 });
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
      const busy = L.looping || !settled || drops.length > 0 || dust.length > 0 || (fallMs >= 0 && fallMs < STUMBLE_MS + DROP_MS) || appear < 1 || (!isDone && !reduce) || walk > 0.01;
      return busy;
    };

    const frame = (t: number) => {
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
    window.addEventListener("resize", size);
    motion.addEventListener?.("change", onVis);
    // A theme switch changes the colors: redraw even when the loop is resting.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener?.("change", onVis);
    const mo = new MutationObserver(onVis);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    size();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      kick.current = () => {};
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", size);
      motion.removeEventListener?.("change", onVis);
      scheme.removeEventListener?.("change", onVis);
      mo.disconnect();
    };
  }, []);

  const start = looping ? 0 : target;
  const ariaLabel = typeof label === "string" && label ? label : "Loading";
  const rootStyle = { ...style, "--twl-h": `${h}px`, ...(color ? { "--twl-c": color } : null) } as CSSProperties;

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
