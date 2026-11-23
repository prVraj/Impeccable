"use client";

import { useEffect, useRef } from "react";

const DEFAULT_DURATION = 4000;

// The story at the default 4 seconds, in ms. A longer or shorter duration
// stretches every step by the same amount.
const CRACK = 320; // the cracks run out from the click, then the page lets go
const CRACK_FADE = 90; // each crack line fades in this fast
const FALL = 880; // the highest piece's fall, from letting go to the heap
const BREAK = 0.55; // pieces come loose within the first 55% of their fall
const HOP = 200; // the bounce after landing...
const HOP2 = 110; // ...and a smaller second one
const TURN = 380; // a piece takes at least this long to turn to how it lies
const PAUSE = 420; // the pieces lie on the floor
const LIFT_SPREAD = 560; // the last piece lifts off this much after the first
const FLIGHT = 900; // each piece's flight home
const EDGE_OUT = 170; // the edge line fades once a piece is home
const MAX_WAIT = 10000; // the longest the pieces wait for your refresh (ms)

const TAB = 0.1; // tab size, as a share of a piece's shorter side (tabs reach 3x this)
const JITTER = 0.04; // how much each tab wanders, so no two pieces match
const STACK = 0.08; // how much of its height each landed piece adds to the heap (they overlap a lot)
const LOUDNESS = 0.7; // 0 to 1, all the sounds

const running = new WeakMap();

/** True while the puzzle plays on this root (default: the whole page). */
export function isPuzzleRunning(root) {
  if (typeof document === "undefined") return false;
  return running.has(root ?? document.documentElement);
}

/**
 * Breaks the page into puzzle pieces and refreshes it (a full reload, or your
 * own `refresh`). Calling it again while it plays returns the same run.
 */
export function puzzleRefresh(options = {}) {
  if (typeof window === "undefined") return Promise.resolve();
  const root =
    !options.root || options.root === document.body ? document.documentElement : options.root;
  const busy = running.get(root);
  if (busy) return busy;
  // Sound may only start inside the click or key press itself.
  if (options.sound !== false) unlockAudio();
  const run = play(root, options)
    .catch(() => {
      if (root === document.documentElement && !options.refresh) window.location.reload();
    })
    .finally(() => running.delete(root));
  running.set(root, run);
  return run;
}

/**
 * Put it once in your root layout. It catches F5, Ctrl+R and Cmd+R and plays
 * the puzzle before the page reloads. Pressing again while it plays reloads
 * straight away. Renders nothing.
 */
export function PuzzleRefresh({ duration, pieces, colors, sound, refresh, keys = true }) {
  const options = useRef({});
  options.current = { duration, pieces, colors, sound, refresh };

  useEffect(() => {
    if (!keys) return;
    const onKey = (e) => {
      const reload =
        e.key === "F5" ||
        ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "r");
      if (!reload || e.defaultPrevented) return;
      if (isPuzzleRunning()) {
        // A held key repeats; only a fresh second press skips to the reload.
        if (e.repeat) e.preventDefault();
        return;
      }
      e.preventDefault();
      void puzzleRefresh(options.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys]);

  return null;
}

async function play(root, options) {
  const page = root === document.documentElement || root === document.body;
  const source = page ? document.body : root;
  const custom = typeof options.refresh === "function";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scale = clampNumber(options.duration, 2500, 8000, DEFAULT_DURATION) / DEFAULT_DURATION;
  const sound = options.sound !== false && !reduced;

  const area = measureArea(root, page);

  // The refresh starts right away, so it loads while the pieces fall.
  let ready = !custom;
  if (custom) {
    const timer = window.setTimeout(() => (ready = true), MAX_WAIT);
    Promise.resolve()
      .then(options.refresh)
      .catch(() => {})
      .finally(() => {
        ready = true;
        window.clearTimeout(timer);
      });
  } else {
    warmUp();
  }

  const scope = page ? document.body : root;
  const bg = toRGB(options.colors?.background ?? "", scope, pageColor(page ? document.body : root));
  const dark = (bg[0] * 299 + bg[1] * 587 + bg[2] * 114) / 1000 < 128;
  const edgeColor = options.colors?.edge ?? (dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.2)");
  const shadowColor = dark ? "rgba(0,0,0,0.62)" : "rgba(0,0,0,0.26)";

  const stage = makeStage(root, page, area);
  const unblock = page ? blockScroll() : () => {};

  // The pieces are cut for this screen size. If it changes (a phone turned
  // sideways, a window resized) or the person goes back a page, stop at once.
  let stop = null;
  const halt = (why) => {
    if (stop) return;
    stop = why;
    for (const a of stage.el.getAnimations({ subtree: true })) a.finish();
  };
  const onResize = () => {
    const now = measureArea(root, page);
    if (now.w !== area.w || Math.abs(now.h - area.h) > 150) halt("resize");
  };
  const onLeave = () => halt("left");
  window.addEventListener("resize", onResize);
  window.addEventListener("popstate", onLeave);

  try {
    if (reduced) {
      // A short fade to the page's colour, the refresh, then back.
      stage.floor.style.background = rgb(bg);
      await stage.floor.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 320,
        easing: "ease-out",
        fill: "forwards",
      }).finished;
      await waitUntil(() => ready || !!stop || !root.isConnected);
      if (!custom && stop !== "left") return window.location.reload();
      await stage.floor.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 360,
        easing: "ease-in",
        fill: "forwards",
      }).finished;
      return;
    }

    // 1. Cut the screen into pieces and give each a copy of it.
    const origin = toPoint(options.origin, area);
    const count = Math.round(
      clampNumber(options.pieces, 6, 100, area.w >= 1024 ? 56 : area.w >= 640 ? 46 : 28),
    );
    const cut = cutPieces(area, count, origin, scale);
    let shot = snapshot(source, area, page, stage.el);
    const pieces = cut.map((c) => makePiece(c, stage.el, area, edgeColor, shadowColor));
    fill(pieces, shot);
    stage.floor.style.background = rgb(bg);

    // 2. Where each piece will lie, and how it gets there.
    plan(pieces, area, scale);

    // 3. Crack, fall, bounce (all on the GPU from here on).
    const t0 = performance.now();
    const fallEnd = Math.max(...pieces.map((p) => p.fallEnd));
    const crackEnd = CRACK * scale;
    stage.floor.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1,
      delay: crackEnd,
      fill: "both",
    });
    const falls = pieces.map((p) =>
      p.el.animate(fallFrames(p, fallEnd, scale), {
        duration: fallEnd,
        fill: "both",
      }),
    );
    for (const p of pieces) {
      p.edge.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: CRACK_FADE * scale,
        delay: p.crackAt,
        fill: "both",
        easing: "ease-out",
      });
      p.shadow.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 160 * scale,
        delay: crackEnd + p.loose,
        fill: "both",
      });
    }
    const audioAt = sound ? clock(t0) : null;
    if (audioAt) {
      playCrack(audioAt(0));
      let last = -1;
      for (const p of [...pieces].sort((a, b) => a.crackAt - b.crackAt)) {
        if (p.crackAt - last < 26) continue;
        last = p.crackAt;
        playTick(audioAt(p.crackAt), 0.22 + Math.random() * 0.18);
      }
      const lands = pieces.map((p) => ({ at: crackEnd + p.land, p })).sort((a, b) => a.at - b.at);
      let prev = -1;
      for (const { at, p } of lands) {
        if (at - prev < 18) continue;
        prev = at;
        const strength = Math.min(1, 0.35 + p.drop / (area.h * 0.7));
        playClack(audioAt(at), 0.55 * strength);
        if (p.hop > 3) playClack(audioAt(at + HOP * scale), 0.16 * strength);
      }
    }

    // 4. Lie on the floor; wait for the refresh if it is still loading.
    // (Every wait follows the animations' own clock, so nothing runs ahead.)
    await settled(falls[0]);
    if (!stop) await settled(stage.floor.animate([], { duration: PAUSE * scale }));
    await waitUntil(() => ready || !!stop || !root.isConnected);
    if (!root.isConnected) return;
    if (stop) return finishEarly();

    // With your own refresh, the fresh page is what flies back (and the
    // colours are read again, in case the theme changed meanwhile).
    if (custom) {
      await nextFrame();
      if (!root.isConnected) return;
      if (stop) return finishEarly();
      shot = snapshot(source, area, page, stage.el);
      fill(pieces, shot);
      if (!options.colors?.background)
        stage.floor.style.background = rgb(pageColor(page ? document.body : root));
    }

    // 5. Lift off in random order, fly home and click into place.
    const order = shuffle(pieces.map((_, i) => i));
    const t1 = performance.now();
    const audio2 = sound ? clock(t1) : null;
    let end = 0;
    order.forEach((index, rank) => {
      const p = pieces[index];
      const lift =
        (rank / Math.max(order.length - 1, 1)) * LIFT_SPREAD * scale +
        (Math.random() - 0.5) * 40 * scale;
      const at = Math.max(0, lift);
      const flight = FLIGHT * scale * (0.94 + Math.random() * 0.12);
      const home = at + flight;
      end = Math.max(end, home + EDGE_OUT * scale);
      p.el.getAnimations().forEach((a) => a.cancel());
      p.el.animate(flightFrames(p), {
        duration: flight,
        delay: at,
        fill: "both",
      });
      p.shadow.animate([{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], {
        duration: flight,
        delay: at,
        fill: "forwards",
      });
      p.edge.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: EDGE_OUT * scale,
        delay: home,
        fill: "forwards",
        easing: "ease-in",
      });
      // The flying piece goes over the heap, and lies flat once home.
      const total = at + flight + EDGE_OUT * scale;
      const up = String(1000 + rank);
      p.el.animate(
        [
          { zIndex: String(p.z) },
          { zIndex: String(p.z), offset: at / total },
          { zIndex: up, offset: at / total },
          { zIndex: up, offset: home / total },
          { zIndex: "0", offset: home / total },
          { zIndex: "0" },
        ],
        { duration: total, fill: "forwards" },
      );
      if (audio2) playClick(audio2(home), 0.42 + Math.random() * 0.2);
    });
    await settled(stage.floor.animate([], { duration: end + 30 }));
    if (!root.isConnected) return;
    if (stop) return finishEarly();

    // 6. Whole again.
    if (!custom) {
      window.location.reload();
      return;
    }
  } finally {
    unblock();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("popstate", onLeave);
    // A full reload keeps the whole page on screen until the fresh one arrives.
    if (custom || stop === "left" || !root.isConnected) stage.remove();
  }

  /** Stopped early: the page under the pieces is the real one, so show it (or reload, as asked). */
  function finishEarly() {
    if (!custom && stop === "resize") window.location.reload();
  }
}

/** A fresh jigsaw cut over the whole area: random tabs, every time. */
function cutPieces(area, count, origin, scale) {
  const { w: W, h: H } = area;
  const cols = Math.max(2, Math.round(Math.sqrt((count * W) / H)));
  const rows = Math.max(2, Math.round(count / cols));
  const cw = W / cols;
  const ch = H / rows;
  const S = Math.min(cw, ch);
  const pad = Math.ceil(S * (3 * TAB + 3 * JITTER) + 2);

  // Every inner edge once, shared by the two pieces on either side of it.
  const across = []; // [row line 1..rows-1][col]
  for (let r = 1; r < rows; r++) {
    across[r] = [];
    for (let c = 0; c < cols; c++)
      across[r][c] = tabEdge([c * cw, r * ch], [(c + 1) * cw, r * ch], S);
  }
  const down = []; // [col line 1..cols-1][row]
  for (let c = 1; c < cols; c++) {
    down[c] = [];
    for (let r = 0; r < rows; r++)
      down[c][r] = tabEdge([c * cw, r * ch], [c * cw, (r + 1) * ch], S);
  }

  const far = Math.max(
    Math.hypot(origin[0], origin[1]),
    Math.hypot(W - origin[0], origin[1]),
    Math.hypot(origin[0], H - origin[1]),
    Math.hypot(W - origin[0], H - origin[1]),
    1,
  );

  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * cw;
      const y0 = r * ch;
      const x1 = x0 + cw;
      const y1 = y0 + ch;
      const top = r > 0 ? across[r][c] : line([x0, y0], [x1, y0]);
      const right = c < cols - 1 ? down[c + 1][r] : line([x1, y0], [x1, y1]);
      const bottom = r < rows - 1 ? reverse(across[r + 1][c]) : line([x1, y1], [x0, y1]);
      const left = c > 0 ? reverse(down[c][r]) : line([x0, y1], [x0, y0]);
      const left0 = x0 - pad;
      const top0 = y0 - pad;
      const cx = x0 + cw / 2;
      const cy = y0 + ch / 2;
      const d = Math.hypot(cx - origin[0], cy - origin[1]) / far;
      out.push({
        cx,
        cy,
        cw,
        ch,
        row: r,
        left: left0,
        top: top0,
        bw: cw + pad * 2,
        bh: ch + pad * 2,
        path: toPath([top, right, bottom, left], left0, top0),
        crackAt: Math.max(0, (d * 0.72 + Math.random() * 0.08) * CRACK * scale),
      });
    }
  }
  return out;
}

/**
 * One edge from a to b with a jigsaw tab in the middle, on a random side.
 * Points: start, then three cubic curves (control, control, end).
 */
function tabEdge(a, b, S) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const side = Math.random() < 0.5 ? 1 : -1;
  const nx = -uy * side;
  const ny = ux * side;
  const j = () => (Math.random() * 2 - 1) * JITTER;
  const [ea, eb, ec, ed, ee] = [j(), j(), j(), j(), j()];
  const t = TAB;
  const mid = len / 2 + eb * S;
  const at = (along, out) => [a[0] + ux * along + nx * out * S, a[1] + uy * along + ny * out * S];
  return [
    at(0, 0),
    at(len * 0.2, ea),
    at(mid + ed * S, -t + ec),
    at(mid - t * S, t + ec),
    at(mid - (2 * t + ed) * S, 3 * t + ec),
    at(mid + (2 * t - ed) * S, 3 * t + ec),
    at(mid + t * S, t + ec),
    at(mid + ee * S, -t + ec),
    at(len * 0.8, ee),
    at(len, 0),
  ];
}

function line(a, b) {
  return [a, a, b, b];
}

function reverse(points) {
  return [...points].reverse();
}

function toPath(edges, dx, dy) {
  const f = (p) => `${n1(p[0] - dx)} ${n1(p[1] - dy)}`;
  let d = `M ${f(edges[0][0])}`;
  for (const e of edges) {
    for (let i = 1; i + 2 < e.length; i += 3) d += ` C ${f(e[i])} ${f(e[i + 1])} ${f(e[i + 2])}`;
  }
  return d + " Z";
}

/* ------------------------------------------------------------------------- */
/* The fall and the flight home                                               */
/* ------------------------------------------------------------------------- */

/**
 * Where each piece lies on the heap and how it falls there. The page drops as
 * one sheet; each piece comes loose at its own moment, turns, drifts and lands
 * on whatever already lies below it. Lower pieces land first, so later ones
 * lie on top.
 */
function plan(pieces, area, scale) {
  const { w: W, h: H } = area;
  const STEP = 4;
  const heap = new Float32Array(Math.ceil(W / STEP) + 1);
  const span = (x0, x1) => [
    Math.max(0, Math.floor(x0 / STEP)),
    Math.min(heap.length - 1, Math.ceil(x1 / STEP)),
  ];
  const lastRow = Math.max(...pieces.map((p) => p.row));

  const byLanding = [...pieces].sort(
    (a, b) =>
      b.cy + (Math.random() - 0.5) * b.ch * 0.5 - (a.cy + (Math.random() - 0.5) * a.ch * 0.5),
  );
  byLanding.forEach((p, i) => {
    p.z = i + 1;
    const bottomRow = p.row === lastRow;
    const sign = Math.random() < 0.5 ? -1 : 1;
    p.restA = bottomRow
      ? sign * (2 + Math.random() * 9)
      : sign * (8 + Math.random() * Math.random() * 70);
    const rad = (p.restA * Math.PI) / 180;
    const fw = Math.abs(p.cw * Math.cos(rad)) + Math.abs(p.ch * Math.sin(rad));
    const fh = Math.abs(p.cw * Math.sin(rad)) + Math.abs(p.ch * Math.cos(rad));
    const margin = Math.min(fw * 0.42, W / 2);
    const x = clamp(
      p.cx + (Math.random() - 0.5) * p.cw * (bottomRow ? 0.2 : 0.9),
      margin,
      W - margin,
    );
    const [a, b] = span(x - fw * 0.38, x + fw * 0.38);
    let base = 0;
    for (let k = a; k <= b; k++) base = Math.max(base, heap[k]);
    const restY = H - base - fh / 2 + p.ch * 0.06;
    p.restX = x - p.cx;
    p.drop = Math.max(restY - p.cy, p.ch * 0.03);
    const [c, d] = span(x - fw * 0.46, x + fw * 0.46);
    for (let k = c; k <= d; k++) heap[k] = Math.max(heap[k], base + fh * STACK);
  });

  // One gravity for the whole page: the farthest fall takes FALL ms.
  const farthest = Math.max(...pieces.map((p) => p.drop));
  const g = (2 * farthest) / Math.pow(FALL * scale, 2); // px per ms²
  for (const p of pieces) {
    const plain = Math.sqrt((2 * p.drop) / g);
    p.loose = plain * BREAK * (0.15 + 0.85 * Math.random());
    p.extra = -0.06 + Math.random() * 0.28;
    p.land = solveLanding(p, g);
    p.hop = Math.min(p.drop * 0.045 + 1.5, p.ch * 0.1, 20);
    p.fallEnd = CRACK * scale + Math.max(p.land + (HOP + HOP2) * scale, p.loose + TURN * scale);
    p.g = g;
    p.el.style.zIndex = String(p.z);
  }
}

function fallY(p, g, tau) {
  const after = Math.max(0, tau - p.loose);
  return 0.5 * g * tau * tau + 0.5 * g * p.extra * after * after;
}

function solveLanding(p, g) {
  let lo = 0;
  let hi = Math.sqrt((2 * p.drop) / g) * 1.6 + 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (fallY(p, g, m) < p.drop) lo = m;
    else hi = m;
  }
  return hi;
}

/** The piece's pose t ms after the start: [x, y, turn in degrees]. */
function fallPose(p, t, scale) {
  const g = p.g;
  const tau = t - CRACK * scale;
  if (tau <= 0) return [0, 0, 0];
  // Loose: drifts sideways and turns, easing into how it will lie.
  const turnEnd = Math.max(p.land + HOP * scale * 0.7, p.loose + TURN * scale);
  const q = clamp((tau - p.loose) / Math.max(turnEnd - p.loose, 1), 0, 1);
  const qx = clamp((tau - p.loose) / Math.max(p.land - p.loose, 1), 0, 1);
  const x = p.restX * smooth(qx);
  const a = p.restA * easeInOutSine(q);
  let y;
  if (tau < p.land) y = Math.min(fallY(p, g, tau), p.drop);
  else {
    const u = (tau - p.land) / (HOP * scale);
    const u2 = (tau - p.land - HOP * scale) / (HOP2 * scale);
    if (u < 1) y = p.drop - 4 * p.hop * u * (1 - u);
    else if (u2 < 1) y = p.drop - 4 * p.hop * 0.22 * u2 * (1 - u2);
    else y = p.drop;
  }
  return [x, y, a];
}

function fallFrames(p, total, scale) {
  const frames = [];
  const step = 1000 / 60;
  for (let t = 0; t < p.fallEnd; t += step) {
    frames.push({
      offset: t / total,
      transform: pose(...fallPose(p, t, scale), 1),
    });
  }
  frames.push({
    offset: Math.min(p.fallEnd / total, 1),
    transform: pose(p.restX, p.drop, p.restA, 1),
  });
  if (p.fallEnd < total) frames.push({ offset: 1, transform: pose(p.restX, p.drop, p.restA, 1) });
  return frames;
}

/**
 * The flight home: straight up off the heap first, then a curve that comes in
 * from just below its place, unwinding on the way, a little larger mid-air as
 * if lifted towards you, and slowing down so it settles in softly.
 */
function flightFrames(p) {
  const x0 = p.restX;
  const y0 = p.drop;
  const dist = Math.hypot(x0, y0);
  const side = Math.random() < 0.5 ? -1 : 1;
  const c1 = [x0 + side * dist * 0.06, y0 - (dist * 0.28 + p.ch * 0.35)];
  const c2 = [(Math.random() - 0.5) * dist * 0.18, p.ch * 0.22 + dist * 0.12];
  const frames = [];
  const N = 54;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const e = easeInOutCubic(u) * 0.7 + easeInOutSine(u) * 0.3;
    const m = 1 - e;
    const x = m * m * m * x0 + 3 * m * m * e * c1[0] + 3 * m * e * e * c2[0];
    const y = m * m * m * y0 + 3 * m * m * e * c1[1] + 3 * m * e * e * c2[1];
    const a = p.restA * (1 - easeInOutCubic(Math.min(u / 0.86, 1)));
    const s = 1 + 0.035 * Math.sin(Math.PI * e);
    frames.push({ offset: u, transform: pose(x, y, a, s) });
  }
  return frames;
}

function pose(x, y, a, s) {
  return `translate(${n1(x)}px, ${n1(y)}px) rotate(${n1(a)}deg) scale(${s.toFixed(4)})`;
}

const DROP_TAGS = new Set(["SCRIPT", "NOSCRIPT", "LINK", "AUDIO"]);
const PRUNABLE = new Set([
  "block",
  "flex",
  "grid",
  "flow-root",
  "list-item",
  "inline-block",
  "inline-flex",
  "inline-grid",
]);

/**
 * Copies the page (or the element), keeping only what is on screen in full:
 * anything entirely off screen becomes an empty box of the same size, so the
 * copy stays light. If that moved anything, it copies again with less trimmed.
 */
function snapshot(source, area, page, stage) {
  const sr = source.getBoundingClientRect();
  const at = page ? area.local(sr) : { l: -source.clientLeft, t: -source.clientTop };
  const probe = document.createElement("div");
  Object.assign(probe.style, screenStyle(area, 0, 0));
  probe.style.visibility = "hidden";
  stage.appendChild(probe);
  const screen = { l: 0, t: 0, r: area.w, b: area.h };

  let shot = null;
  for (const trim of [2, 1, 0]) {
    const pairs = [];
    const stickies = [];
    const info = new Map();
    const master = copyTree(source, area, stage, trim, screen, pairs, stickies, info);
    Object.assign(master.style, {
      position: "absolute",
      left: `${at.l}px`,
      top: `${at.t}px`,
      width: `${source.offsetWidth}px`,
      height: `${source.offsetHeight}px`,
      margin: "0",
      boxSizing: "border-box",
      transform: "none",
      translate: "none",
      scale: "none",
      rotate: "none",
    });
    probe.replaceChildren(master);
    master.scrollTop = source.scrollTop;
    master.scrollLeft = source.scrollLeft;

    // Sticky headers and sidebars: pin each copy where the real one sits now.
    for (const [m, o] of stickies) {
      m.style.setProperty("position", "relative", "important");
      for (const side of ["top", "left", "right", "bottom"])
        m.style.setProperty(side, "auto", "important");
      const mr = m.getBoundingClientRect();
      const or = o.getBoundingClientRect();
      m.style.setProperty("top", `${(or.top - mr.top) / area.k}px`, "important");
      m.style.setProperty("left", `${(or.left - mr.left) / area.k}px`, "important");
    }

    if (trim > 0 && !matches(pairs, probe, area)) continue;
    shot = notes(master, pairs, info, trim);
    break;
  }
  shot.master.remove();
  probe.remove();
  return shot;
}

function copyTree(source, area, stage, trim, screen, pairs, stickies, info) {
  const master = source.cloneNode(false);
  master.removeAttribute("id");
  pairs.push([source, master]);
  // Things moved by script animations: a copy would show them unmoved, so
  // it takes their current look instead.
  const moving = new Set();
  for (const a of document.getAnimations()) {
    if (isCSSAnimation(a) || isCSSTransition(a)) continue;
    const target = a.effect?.target;
    if (target) moving.add(target);
  }
  const walk = (from, to) => {
    for (let node = from.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 3) {
        to.appendChild(node.cloneNode(false));
        continue;
      }
      if (node.nodeType !== 1) continue;
      const el = node;
      if (el === stage || DROP_TAGS.has(el.tagName)) continue;
      const copy = el.cloneNode(false);
      tame(copy);
      if (moving.has(el)) hold(el, copy);
      to.appendChild(copy);
      pairs.push([el, copy]);
      if (el instanceof HTMLElement) {
        const cs = getComputedStyle(el);
        if (cs.display === "none") continue;
        if (cs.position === "sticky") stickies.push([copy, el]);
        const r = area.local(el.getBoundingClientRect());
        // Exact sizes (offsetWidth rounds to whole px, and the rounding adds up
        // down the page), unless the element is itself turned or scaled.
        const plain = cs.transform === "none" && cs.scale === "none" && cs.rotate === "none";
        const w = plain ? r.r - r.l : el.offsetWidth;
        const h = plain ? r.b - r.t : el.offsetHeight;
        const it = {
          ...r,
          w,
          h,
          ok:
            w > 0 &&
            h > 0 &&
            PRUNABLE.has(cs.display) &&
            cs.position !== "fixed" &&
            cs.position !== "sticky",
        };
        info.set(copy, it);
        if (outside(it, screen, trim)) {
          empty(copy, it);
          continue;
        }
      }
      walk(el, copy);
    }
  };
  walk(source, master);
  return master;
}

const HELD = [
  "transform",
  "translate",
  "scale",
  "rotate",
  "opacity",
  "clip-path",
  "filter",
  "visibility",
  "background-color",
  "color",
];

/** Gives the copy the element's current look, mid animation. */
function hold(el, copy) {
  const cs = getComputedStyle(el);
  const style = copy.style;
  if (!style) return;
  for (const prop of HELD) style.setProperty(prop, cs.getPropertyValue(prop), "important");
}

/** Entirely outside the box, and safe to empty at this trim level? */
function outside(it, box, trim) {
  if (!it.ok || trim === 0) return false;
  if (it.t >= box.b + 2) return true; // below
  if (trim === 1) return false;
  return it.b <= box.t - 2 || it.r <= box.l - 2 || it.l >= box.r + 2;
}

/** An element kept as an empty box of exactly its size. */
function empty(el, it) {
  el.replaceChildren();
  el.style.setProperty("contain", "strict", "important");
  el.style.setProperty("width", `${it.w}px`, "important");
  el.style.setProperty("height", `${it.h}px`, "important");
  el.style.setProperty("min-width", "0", "important");
  el.style.setProperty("min-height", "0", "important");
  el.style.setProperty("box-sizing", "border-box", "important");
}

/** Copies must not load, play or grab focus. */
function tame(el) {
  if (el.tagName === "IFRAME") {
    el.removeAttribute("srcdoc");
    el.setAttribute("src", "about:blank");
  } else if (el.tagName === "VIDEO") {
    el.removeAttribute("autoplay");
    el.setAttribute("preload", "none");
  }
  el.removeAttribute("autofocus");
}

/** Does the copy line up with the page? Checks up to 300 things on screen. */
function matches(pairs, probe, area) {
  // The probe sits at the area's top left, so the copy is measured from there.
  const pr = probe.getBoundingClientRect();
  const shown = pairs.filter(([o]) => {
    if (!(o instanceof HTMLElement) || !o.offsetWidth) return false;
    const r = area.local(o.getBoundingClientRect());
    return r.b > 0 && r.t < area.h && r.r > 0 && r.l < area.w;
  });
  const step = Math.max(1, Math.floor(shown.length / 300));
  let off = 0;
  for (let i = 0; i < shown.length; i += step) {
    const [o, m] = shown[i];
    const a = area.local(o.getBoundingClientRect());
    const b = m.getBoundingClientRect();
    const bx = (b.left - pr.left) / area.k;
    const by = (b.top - pr.top) / area.k;
    if (Math.abs(a.l - bx) > 1 || Math.abs(a.t - by) > 1) off++;
    if (off > 3) return false;
  }
  return true;
}

/** Notes what a copy of the copy would lose: canvas pictures, scrolling, animation times. */
function notes(master, pairs, info, trim) {
  const fromOriginal = new Map();
  const canvases = [];
  const scrolls = [];
  for (const [o, m] of pairs) {
    if (!master.contains(m)) continue;
    fromOriginal.set(o, m);
    if (o instanceof HTMLCanvasElement) canvases.push([m, o]);
    if (o.scrollTop || o.scrollLeft) scrolls.push([m, o.scrollTop, o.scrollLeft]);
  }

  // CSS animations start over in a copy; note where each one is now.
  const anims = new Map();
  for (const a of document.getAnimations()) {
    if (!isCSSAnimation(a)) continue;
    const target = a.effect?.target;
    const m = target ? fromOriginal.get(target) : undefined;
    if (!m) continue;
    const t = a.currentTime;
    if (!anims.has(m)) anims.set(m, new Map());
    anims.get(m).set(a.animationName, typeof t === "number" ? t : null);
  }
  return { master, info, trim, canvases, scrolls, anims };
}

/**
 * Gives every piece its own copy of the screen, holding in full only what
 * shows inside that piece: everything else is an empty box of the same size.
 */
function fill(pieces, shot) {
  const copies = pieces.map((p) => {
    const box = {
      l: p.left,
      t: p.top,
      r: p.left + p.bw,
      b: p.top + p.bh,
    };
    const back = new Map();
    const copy = shot.master.cloneNode(false);
    back.set(copy, shot.master);
    const walk = (from, to) => {
      for (let node = from.firstChild; node; node = node.nextSibling) {
        if (node.nodeType !== 1) {
          to.appendChild(node.cloneNode(false));
          continue;
        }
        const el = node;
        const c = el.cloneNode(false);
        to.appendChild(c);
        back.set(c, el);
        // Only what lies below the piece is emptied: that never moves
        // anything above it, so every piece lines up with the page.
        const it = shot.info.get(el);
        if (it && outside(it, box, shot.trim ? 1 : 0)) {
          empty(c, it);
          continue;
        }
        walk(el, c);
      }
    };
    walk(shot.master, copy);
    p.screen.replaceChildren(copy);
    return { copy, back };
  });

  // Put back what a copy loses (all writes after all copies are in).
  const wanted = new Set([...shot.scrolls.map(([m]) => m), ...shot.canvases.map(([m]) => m)]);
  for (const { copy, back } of copies) {
    if (wanted.size) {
      const mine = new Map();
      for (const [c, m] of back) if (wanted.has(m)) mine.set(m, c);
      for (const [m, top, left] of shot.scrolls) {
        const el = mine.get(m);
        if (el) {
          el.scrollTop = top;
          el.scrollLeft = left;
        }
      }
      for (const [m, from] of shot.canvases) {
        const to = mine.get(m);
        if (!(to instanceof HTMLCanvasElement)) continue;
        try {
          to.width = from.width;
          to.height = from.height;
          to.getContext("2d")?.drawImage(from, 0, 0);
        } catch {
          /* a canvas we can't read stays blank */
        }
      }
    }
    freeze(copy, back, shot.anims);
  }
}

/** Stops the copy's CSS animations where the page's are, or at their end. */
function freeze(copy, back, anims) {
  for (const a of copy.getAnimations({ subtree: true })) {
    const target = a.effect?.target;
    const m = target ? back.get(target) : undefined;
    const t = isCSSAnimation(a) && m ? anims.get(m)?.get(a.animationName) : undefined;
    try {
      if (typeof t === "number") {
        a.currentTime = t;
        a.pause();
      } else a.finish();
    } catch {
      a.pause();
    }
  }
}

function isCSSAnimation(a) {
  return typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation;
}

function isCSSTransition(a) {
  return typeof CSSTransition !== "undefined" && a instanceof CSSTransition;
}

function measureArea(root, page) {
  if (page) {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = window.innerHeight;
    return {
      page,
      w,
      h,
      k: 1,
      local: (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom }),
    };
  }
  const rect = root.getBoundingClientRect();
  const k = root.offsetWidth ? rect.width / root.offsetWidth || 1 : 1;
  const ox = rect.left + root.clientLeft * k;
  const oy = rect.top + root.clientTop * k;
  return {
    page,
    w: root.clientWidth,
    h: root.clientHeight,
    k,
    local: (r) => ({
      l: (r.left - ox) / k,
      t: (r.top - oy) / k,
      r: (r.right - ox) / k,
      b: (r.bottom - oy) / k,
    }),
  };
}

/** One layer over the area. It holds the pieces and stops clicks while they move. */
function makeStage(root, page, area) {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("inert", "");
  el.dataset.puzzleRefresh = "stage";
  Object.assign(el.style, {
    position: page ? "fixed" : "absolute",
    left: page ? "0" : `${root.scrollLeft}px`,
    top: page ? "0" : `${root.scrollTop}px`,
    width: `${area.w}px`,
    height: `${area.h}px`,
    zIndex: "2147483647",
    overflow: "hidden",
    pointerEvents: "auto",
    touchAction: "none",
    contain: "strict",
    isolation: "isolate",
  });
  const floor = document.createElement("div");
  Object.assign(floor.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
  });
  el.appendChild(floor);

  let oldPosition = null;
  if (!page && getComputedStyle(root).position === "static") {
    oldPosition = root.style.position;
    root.style.position = "relative";
  }
  (page ? document.body : root).appendChild(el);
  return {
    el,
    floor,
    remove: () => {
      el.remove();
      if (oldPosition !== null) root.style.position = oldPosition;
    },
  };
}

function screenStyle(area, left, top) {
  return {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    width: `${area.w}px`,
    height: `${area.h}px`,
    overflow: "hidden",
    contain: "strict",
  };
}

const SVG = "http://www.w3.org/2000/svg";

function makePiece(cut, stage, area, edgeColor, shadowColor) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: `${cut.left}px`,
    top: `${cut.top}px`,
    width: `${cut.bw}px`,
    height: `${cut.bh}px`,
    transformOrigin: `${cut.bw / 2}px ${cut.bh / 2}px`,
    willChange: "transform",
  });

  const S = Math.min(cut.cw, cut.ch);
  const shadow = outline(cut, { fill: shadowColor });
  Object.assign(shadow.style, {
    filter: `blur(${clamp(S * 0.035, 2, 9).toFixed(1)}px)`,
    translate: `0 ${clamp(S * 0.03, 1.5, 7).toFixed(1)}px`,
    opacity: "0",
    willChange: "opacity",
  });

  const clip = document.createElement("div");
  Object.assign(clip.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
    clipPath: `path("${cut.path}")`,
  });
  // A screen-sized window onto the copy, placed so this piece shows its own part.
  const screen = document.createElement("div");
  Object.assign(screen.style, screenStyle(area, -cut.left, -cut.top));
  clip.appendChild(screen);

  const edge = outline(cut, {
    fill: "none",
    stroke: edgeColor,
    "stroke-width": "1.25",
    "stroke-linejoin": "round",
  });
  Object.assign(edge.style, { opacity: "0", willChange: "opacity" });

  el.append(shadow, clip, edge);
  stage.appendChild(el);
  return {
    ...cut,
    el,
    screen,
    shadow,
    edge,
    drop: 0,
    loose: 0,
    extra: 0,
    land: 0,
    hop: 0,
    restX: 0,
    restA: 0,
    z: 0,
    fallEnd: 0,
    g: 0,
  };
}

function outline(cut, attrs) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("width", String(cut.bw));
  svg.setAttribute("height", String(cut.bh));
  svg.setAttribute("viewBox", `0 0 ${n1(cut.bw)} ${n1(cut.bh)}`);
  Object.assign(svg.style, {
    position: "absolute",
    inset: "0",
    overflow: "visible",
    pointerEvents: "none",
  });
  const path = document.createElementNS(SVG, "path");
  path.setAttribute("d", cut.path);
  for (const [k, v] of Object.entries(attrs)) {
    // Colours go through style, so var(--name) works too.
    if (k === "fill" || k === "stroke") path.style.setProperty(k, v);
    else path.setAttribute(k, v);
  }
  svg.appendChild(path);
  return svg;
}

/* ------------------------------------------------------------------------- */
/* Sound                                                                      */
/* ------------------------------------------------------------------------- */

let audio = null;
let noise = null;

/** Opens the sound system inside the click itself, because browsers only allow sound that starts from one. */
function unlockAudio() {
  try {
    if (!audio) {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return;
      audio = new AC();
      noise = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.12), audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (audio.state !== "running") audio.resume().catch(() => {});
  } catch {
    audio = null;
  }
}

/** Turns ms after `start` (a performance.now() time) into the sound clock. */
function clock(start) {
  const ac = audio;
  if (!ac || !noise) return null;
  const base = ac.currentTime + (start - performance.now()) / 1000 + 0.01;
  return (ms) => Math.max(ac.currentTime, base + ms / 1000);
}

function burst(t, level, filter, freq, q, decay) {
  const ac = audio;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(level * LOUDNESS, 0.0002), t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(f).connect(g).connect(ac.destination);
  src.start(t, Math.random() * 0.06);
  src.stop(t + decay + 0.02);
}

function tone(t, level, from, to, decay) {
  const ac = audio;
  const o = ac.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + decay);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(level * LOUDNESS, 0.0002), t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + decay + 0.02);
}

/** The first crack: a dry snap with a low knock under it. */
function playCrack(t) {
  try {
    burst(t, 0.7, "highpass", 1800, 0.7, 0.035);
    tone(t, 0.35, 190, 70, 0.11);
  } catch {
    /* no sound: the refresh still works */
  }
}

/** A small crackle as each crack line runs out. */
function playTick(t, level) {
  try {
    burst(t, level, "bandpass", 2600 + Math.random() * 2600, 1.4, 0.012);
  } catch {
    /* no sound */
  }
}

/** A piece landing: a short wooden clack. */
function playClack(t, level) {
  try {
    burst(t, level, "bandpass", 900 + Math.random() * 900, 3.2, 0.05);
    tone(t, level * 0.6, 260 + Math.random() * 120, 120, 0.06);
  } catch {
    /* no sound */
  }
}

/** A piece clicking into place. */
function playClick(t, level) {
  try {
    burst(t, level, "bandpass", 3200 + Math.random() * 1200, 2.2, 0.016);
    tone(t, level * 0.45, 1300 + Math.random() * 300, 900, 0.03);
  } catch {
    /* no sound */
  }
}

/* ------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* ------------------------------------------------------------------------- */

/** A full reload: ask for the fresh page now, so the reload at the end is quick. */
function warmUp() {
  try {
    void fetch(window.location.href, {
      cache: "reload",
      credentials: "same-origin",
    }).catch(() => {});
  } catch {
    /* nothing to warm */
  }
}

function toPoint(origin, area) {
  const mid = [area.w / 2, area.h / 2];
  if (!origin) return mid;
  const fromRect = (el) => {
    const r = area.local(el.getBoundingClientRect());
    return [(r.l + r.r) / 2, (r.t + r.b) / 2];
  };
  if (origin instanceof Element) return fromRect(origin);
  if ("clientX" in origin) {
    // A keyboard "click" has no pointer: use the button itself.
    if (origin.clientX === 0 && origin.clientY === 0 && origin.currentTarget instanceof Element)
      return fromRect(origin.currentTarget);
    const r = area.local(new DOMRect(origin.clientX, origin.clientY, 0, 0));
    return [clamp(r.l, 0, area.w), clamp(r.t, 0, area.h)];
  }
  const r = area.local(new DOMRect(origin.x, origin.y, 0, 0));
  return [clamp(r.l, 0, area.w), clamp(r.t, 0, area.h)];
}

/** Resolves when the animation ends, or is cancelled because the area left the page. */
function settled(a) {
  return a.finished.then(
    () => {},
    () => {},
  );
}

function waitUntil(done) {
  return new Promise((resolve) => {
    const check = () => (done() ? resolve() : window.setTimeout(check, 50));
    check();
  });
}

/** The next frame, or 100ms in a hidden tab (where frames stop). */
function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
    window.setTimeout(resolve, 100);
  });
}

/** While the whole page is in pieces, it shouldn't scroll under them. */
function blockScroll() {
  const stop = (e) => e.preventDefault();
  const keys = (e) => {
    if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key))
      e.preventDefault();
  };
  window.addEventListener("wheel", stop, { passive: false });
  window.addEventListener("touchmove", stop, { passive: false });
  window.addEventListener("keydown", keys);
  return () => {
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchmove", stop);
    window.removeEventListener("keydown", keys);
  };
}

/** The colour behind the area: the first painted background up the tree. */
function pageColor(el) {
  let node = el;
  while (node) {
    const c = getComputedStyle(node).backgroundColor;
    if (!isClear(c)) return parseRGB(c) ?? [255, 255, 255];
    node = node.parentElement;
  }
  return [255, 255, 255];
}

function isClear(color) {
  return color === "transparent" || /,\s*0(\.0+)?\)$/.test(color) || /\/\s*0(\.0+)?\)$/.test(color);
}

/** Any CSS colour (hex, rgb, var(--name), oklch...) as plain red, green, blue. */
function toRGB(value, scope, fallback) {
  if (!value) return fallback;
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  scope.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const direct = parseRGB(computed);
  if (direct) return direct;
  // Colours outside sRGB come back as oklch() or color(); let a canvas convert them.
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return fallback;
    x.fillStyle = computed;
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  } catch {
    return fallback;
  }
}

function parseRGB(c) {
  const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function rgb(c) {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function clampNumber(v, min, max, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback;
}

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const n1 = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
