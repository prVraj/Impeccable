"use client";

import { useEffect, useRef } from "react";

const DEFAULT_COLORS = { hole: "#000000", glow: "#ffffff" };
const DEFAULT_DURATION = 5200;

// The story, as fractions of the duration (5.2s by default).
const OPEN = 0.08; // the hole appears and starts to spin
const FEED_FROM = 0.04; // the nearest things start to fall
const FEED_SPREAD = 0.34; // the farthest start this much later
const FALL = 0.26; // each thing's fall: one smooth spiral, stretching all the way in
const SWIRL = 1.15; // how tightly they spiral: radians turned per e-fold of distance
const STRETCH = 9; // a thread ends up to 10x longer than the thing was
const FADE_FROM = 0.12; // large painted areas (page panels) lose their paint
const NIGHT = [0.46, 0.68]; // the dark floods the screen
const COLLAPSE = [0.66, 0.72]; // the full hole implodes to a point
const STAR = [0.72, 0.765]; // a neutron star spins up
const BLAST = [0.765, 0.93]; // shockwave, sparks and jets; the dark is pushed away
const FLASH = [0.765, 0.86]; // one bright flash
const RETURN_FROM = 0.775; // the blast throws the pieces back out...
const RETURN_SPREAD = 0.06; // ...the farthest a little later...
const RETURN_LEN = 0.15; // ...each landing in its place over this long
const DIR = 1; // spin direction (clockwise on screen)
const HOLD = 0.64; // if your refresh is still loading, the story waits here, the hole still spinning
const MAX_WAIT = 10000; // but never longer than this (ms)

const running = new WeakMap();

/** True while a black hole is playing on this root (default: the whole page). */
export function isBlackHoleRunning(root) {
  if (typeof document === "undefined") return false;
  return running.has(root ?? document.documentElement);
}

/**
 * Plays the black hole and refreshes the page (a full reload, or your own `refresh`).
 * Calling it again while it plays returns the same run.
 */
export function blackHoleRefresh(options = {}) {
  if (typeof window === "undefined") return Promise.resolve();
  const root =
    !options.root || options.root === document.body ? document.documentElement : options.root;
  const busy = running.get(root);
  if (busy) return busy;
  const run = play(root, options).finally(() => running.delete(root));
  running.set(root, run);
  return run;
}

/**
 * Put it once in your root layout. It catches F5, Ctrl+R and Cmd+R and plays
 * the black hole before the page reloads. Pressing again while it plays
 * reloads straight away. Renders nothing.
 */
export function BlackHoleRefresh({ duration, colors, refresh, keys = true }) {
  const options = useRef({ duration, colors, refresh });
  options.current = { duration, colors, refresh };

  useEffect(() => {
    if (!keys) return;
    const onKey = (e) => {
      const reload =
        e.key === "F5" ||
        ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "r");
      if (!reload || e.defaultPrevented) return;
      if (isBlackHoleRunning()) {
        // A held key repeats; only a fresh second press skips to the reload.
        if (e.repeat) e.preventDefault();
        return;
      }
      e.preventDefault();
      void blackHoleRefresh(options.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys]);

  return null;
}

async function play(root, options) {
  const page = root === document.documentElement || root === document.body;
  const scope = page ? document.documentElement : root;
  const duration = clampNumber(options.duration, 3000, 12000, DEFAULT_DURATION);
  const custom = typeof options.refresh === "function";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The area to swallow, in screen px: the visible page without the scrollbar,
  // or an element's own box (even when part of it is scrolled away).
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  const rect = scope.getBoundingClientRect();
  const box = page
    ? { left: 0, top: 0, right: vw, bottom: vh }
    : {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
  const bw = Math.max(box.right - box.left, 1);
  const bh = Math.max(box.bottom - box.top, 1);
  const hx = box.left + bw / 2;
  const hy = box.top + bh / 2;
  const diag = Math.hypot(bw, bh);
  // The hole starts small and grows up to 2.4x with what it eats.
  const R0 = clampNumber(Math.min(bw, bh) * 0.032, 8, 26, 18);

  const palette = {
    hole: toRGB(options.colors?.hole ?? DEFAULT_COLORS.hole, scope, [0, 0, 0]),
    glow: toRGB(options.colors?.glow ?? DEFAULT_COLORS.glow, scope, [255, 255, 255]),
  };
  const background = () => pageColor(page ? document.body : root);

  // The refresh starts right away, so it loads while the page is being eaten.
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

  // Find what to swallow before the canvas joins the page.
  let { pieces, panels } = reduced ? { pieces: [], panels: [] } : collect(scope, page, box, hx, hy);

  const stage = makeStage(root, page);
  if (!stage) {
    if (!custom) window.location.reload();
    return;
  }
  const unblock = page ? blockScroll() : () => {};
  const panelAnims = [];

  // What your refresh adds to the page stays hidden until the blast throws it in.
  const hiddenByUs = new Map();
  const watcher =
    custom && !reduced
      ? new MutationObserver((records) => {
          for (const rec of records) {
            for (const node of Array.from(rec.addedNodes)) {
              if (!(node instanceof HTMLElement) || node.dataset.blackHole === "ignore") continue;
              if (!hiddenByUs.has(node)) hiddenByUs.set(node, node.style.visibility);
              node.style.visibility = "hidden";
            }
          }
        })
      : null;
  watcher?.observe(scope === document.documentElement ? document.body : scope, {
    childList: true,
    subtree: true,
  });

  try {
    if (reduced) {
      await fadeTo(stage, background(), 320, root);
      await waitUntil(() => ready || !root.isConnected);
    } else await swallow();
  } finally {
    unblock();
    revealNewcomers();
  }

  if (!root.isConnected) {
    // The area left the page mid-run (a route change, say). Tidy up quietly.
    putBack();
    stage.remove();
    return;
  }
  if (!custom) {
    // Everything is back in its place: reload into the fresh page.
    window.location.reload();
    return;
  }
  putBack();
  if (reduced) await stage.fadeOut(360);
  stage.remove();

  function revealNewcomers() {
    watcher?.disconnect();
    for (const [el, vis] of hiddenByUs) el.style.visibility = vis;
    hiddenByUs.clear();
  }

  function putBack() {
    for (const p of pieces) {
      if (p.style === null) p.el.removeAttribute("style");
      else p.el.setAttribute("style", p.style);
    }
    for (const a of panelAnims) a.cancel();
  }

  function swallow() {
    const ctx = stage.ctx;
    const rings = Array.from({ length: 8 }, () => Array.from({ length: 22 }, () => Math.random()));
    const sparks = Array.from({ length: 84 }, () => ({
      a: Math.random() * Math.PI * 2,
      s: 0.35 + Math.random() * 0.75,
      l: 10 + Math.random() * 34,
    }));
    const grains = [];
    let eaten = 0;
    let fed = 0; // eaten share, eased so the hole grows smoothly
    let spin = 0;
    let last = 0;
    let story = 0; // ms of the story played; it pauses at HOLD while your refresh loads
    let panelsFaded = false;
    let panelsBack = false;

    return new Promise((resolve) => {
      const t0 = performance.now();
      last = t0;
      const frame = (now) => {
        if (!root.isConnected) return resolve();
        const sec = (now - t0) / 1000;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (ready || story < HOLD * duration)
          story = Math.min(story + dt * 1000, ready ? duration : HOLD * duration);
        const t = Math.min(1, story / duration);

        fed +=
          ((pieces.length ? eaten / pieces.length : Math.min(t / 0.64, 1)) - fed) *
          (1 - Math.exp(-dt * 5));
        const c = span(t, COLLAPSE);
        // Spins faster as it eats, fastest as it implodes.
        spin += dt * DIR * (2.4 + 5 * fed + 14 * c * c);
        const open = easeOutBack(Math.min(t / OPEN, 1));
        const R = R0 * open * (1 + 1.4 * smooth(fed)) * (1 - easeInCubic(c));

        if (!panelsFaded && t >= FADE_FROM) {
          panelsFaded = true;
          for (const el of panels) panelAnims.push(fadePaint(el, duration * 0.3));
        }
        if (!panelsBack && t >= RETURN_FROM) {
          panelsBack = true;
          if (custom) {
            // The page has been refreshed under the dark. Measure the fresh page,
            // all in this one frame, and throw that back instead.
            putBack();
            revealNewcomers();
            ({ pieces, panels } = collect(scope, page, box, hx, hy));
            for (const p of pieces) {
              p.gone = true; // already "inside": they only come out
              wake(p);
              homecoming(p, 0);
            }
            for (const el of panels) panelAnims.push(paintIn(el, duration * RETURN_LEN));
          } else {
            // Play the fade backwards, quickly, as the pieces land.
            for (const a of panelAnims) {
              a.playbackRate = -0.3 / RETURN_LEN;
              a.play();
            }
          }
        }

        stage.clear();
        backdrop(t, R);

        // 1. The page's own pieces: spiral in and stretch, or fly back home.
        const holeEdge = Math.max(R * 0.8, 2);
        for (const p of pieces) {
          if (t >= p.back) {
            if (!p.live) wake(p);
            p.el.style.visibility = "";
            homecoming(p, Math.min((t - p.back) / RETURN_LEN, 1));
            continue;
          }
          if (p.gone) continue;
          const u = (t - p.start) / FALL;
          if (u <= 0) continue;
          if (u >= 1) {
            p.el.style.visibility = "hidden";
            p.gone = true;
            eaten++;
            for (let i = 0; i < 3; i++) {
              grains.push({
                a: p.phi0 + DIR * SWIRL * Math.log(p.r0 / holeEdge) + (Math.random() - 0.5) * 0.8,
                r: 1.6 + Math.random() * 1.6,
                life: 0.7 + Math.random() * 0.5,
                born: sec,
                w: 0.6 + Math.random(),
              });
            }
            continue;
          }
          if (!p.live) wake(p);
          fall(p, u, holeEdge);
        }

        // 2. The hole, its spinning disk, the neutron star and the blast.
        hole(t, R, sec);
        blast(t);

        if (t >= 1) resolve();
        else requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });

    function wake(p) {
      p.live = true;
      const s = p.el.style;
      s.transition = "none";
      s.animation = "none";
      s.transformOrigin = "50% 50%";
      s.willChange = "transform, opacity";
    }

    /** Where a piece is on its spiral: falling in, it turns faster the closer it gets. */
    function along(p, u, edge) {
      const end = Math.min(edge, p.r0 * 0.5);
      const r = p.r0 - (p.r0 - end) * Math.pow(u, 1.8);
      const phi = p.phi0 + DIR * SWIRL * Math.log(p.r0 / Math.max(r, 0.5));
      return { r, phi, x: hx + Math.cos(phi) * r, y: hy + Math.sin(phi) * r };
    }

    function fall(p, u, edge) {
      const at = along(p, u, edge);
      const ahead = along(p, Math.min(u + 0.004, 1), edge);
      // The pull runs along the way it is moving. Nothing turns or flips: the
      // piece is only stretched along the pull and squeezed across it.
      const flow = Math.atan2(ahead.y - at.y, ahead.x - at.x);
      const cf = Math.abs(Math.cos(flow));
      const sf = Math.abs(Math.sin(flow));
      const eL = Math.max(cf * p.w + sf * p.h, 1);
      const eW = Math.max(sf * p.w + cf * p.h, 1);
      // How far in it has come: the closer, the stronger the tide.
      const q = Math.min(Math.max((p.r0 - at.r) / Math.max(p.r0 - edge, 1), 0), 1);
      // Longer all the way in (never longer than the way left to go)...
      const length = Math.min(
        eL * (1 + STRETCH * Math.pow(q, 1.4)),
        Math.max(1.6 * at.r, eL * (1 - q)),
      );
      const sL = length / eL;
      // ...and thinner only as much as it gets longer, so it reads as a stretch.
      const width = Math.max(Math.min(eW / Math.pow(Math.max(sL, 1), 0.9), 0.5 * at.r + 1), 1.2);
      place(p, at.x, at.y, flow, sL, Math.min(width / eW, 1), flow);
      p.el.style.opacity = String(1 - smooth(Math.max((q - 0.82) / 0.18, 0)));
      tail(p, u, edge, length, width, q);
    }

    /** After the blast: thrown back out of the centre, unwinding, landing in its place. */
    function homecoming(p, w) {
      const e = easeOutBackSoft(w);
      const r = p.r0 * e;
      const phi = p.phi0 - DIR * 0.9 * Math.pow(1 - Math.min(w * 1.15, 1), 2);
      const blur = Math.pow(1 - w, 3);
      place(
        p,
        hx + Math.cos(phi) * r,
        hy + Math.sin(phi) * r,
        phi,
        1 + 2.4 * blur,
        1 - 0.6 * blur,
        phi,
      );
      p.el.style.opacity = String(Math.min(w * 5, 1));
    }

    /**
     * Moves the piece's centre to (x, y) and stretches it by sL along the angle
     * `theta` and by sW across it (with from = theta, nothing turns).
     */
    function place(p, x, y, theta, sL, sW, from) {
      const ca = Math.cos(from);
      const sa = Math.sin(from);
      const cb = Math.cos(theta);
      const sb = Math.sin(theta);
      // M = Rotate(theta) * Scale(sL, sW) * Rotate(-from)
      const m00 = cb * sL * ca + sb * sW * sa;
      const m01 = cb * sL * sa - sb * sW * ca;
      const m10 = sb * sL * ca - cb * sW * sa;
      const m11 = sb * sL * sa + cb * sW * ca;
      const [la, lb, lc, ld] = p.lin;
      const dx = (x - p.cx) / p.k;
      const dy = (y - p.cy) / p.k;
      p.el.style.transform = `matrix(${n(m00 * la + m01 * lb)},${n(m10 * la + m11 * lb)},${n(m00 * lc + m01 * ld)},${n(m10 * lc + m11 * ld)},${n(p.tx + dx)},${n(p.ty + dy)})`;
    }

    /** The curved tail: the thread still trailing back along the path it came in on. */
    function tail(p, u, edge, length, width, q) {
      if (q < 0.04) return;
      const steps = 14;
      const reach = Math.min(u, 0.42);
      const head = along(p, u, edge);
      let px = 0;
      let py = 0;
      let started = false;
      const strength = smooth(Math.min(q / 0.35, 1)) * (1 - smooth(Math.max((q - 0.85) / 0.15, 0)));
      ctx.lineCap = "round";
      for (let j = 1; j <= steps; j++) {
        const pt = along(p, u - (reach * j) / steps, edge);
        if (!started) {
          if (Math.hypot(pt.x - head.x, pt.y - head.y) < length * 0.42) continue;
          started = true;
          px = pt.x;
          py = pt.y;
          continue;
        }
        const f = j / steps;
        ctx.strokeStyle = rgba(p.color, 0.6 * strength * (1 - f));
        ctx.lineWidth = Math.max(0.4, Math.min(width, 6) * (1 - f));
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        px = pt.x;
        py = pt.y;
      }
    }

    /** The shadow behind the hole, and later the dark that floods the screen. */
    function backdrop(t, R) {
      const { hole } = palette;
      const b = span(t, BLAST);
      // A tight shadow, so the light shows on light pages while the threads stay in view.
      if (R > 0.5) {
        const round = R * 2.4;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, round);
        g.addColorStop(0, rgba(hole, 0.9));
        g.addColorStop(0.5, rgba(hole, 0.85));
        g.addColorStop(1, rgba(hole, 0));
        ctx.fillStyle = g;
        ctx.fillRect(hx - round, hy - round, round * 2, round * 2);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(-0.22);
        ctx.scale(1, 0.5);
        const wide = R * 4.6;
        const e = ctx.createRadialGradient(0, 0, 0, 0, 0, wide);
        e.addColorStop(0, rgba(hole, 0.8));
        e.addColorStop(0.55, rgba(hole, 0.55));
        e.addColorStop(1, rgba(hole, 0));
        ctx.fillStyle = e;
        ctx.fillRect(-wide, -wide, wide * 2, wide * 2);
        ctx.restore();
      }
      // The flood, pushed out by the shockwave: clear inside the ring, dark outside.
      const night = 0.86 * smooth(span(t, NIGHT)) * (1 - smooth(Math.max((b - 0.35) / 0.65, 0)));
      if (night <= 0.005) return;
      const ring = easeOutExpo(b) * diag * 0.62;
      const far = diag;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, far);
      if (b > 0) {
        g.addColorStop(0, rgba(hole, 0));
        g.addColorStop(Math.min(ring / far, 0.98), rgba(hole, 0));
        g.addColorStop(Math.min((ring + diag * 0.08) / far, 0.99), rgba(hole, night));
        g.addColorStop(1, rgba(hole, night));
      } else {
        g.addColorStop(0, rgba(hole, night));
        g.addColorStop(1, rgba(hole, night * 0.82));
      }
      ctx.fillStyle = g;
      stage.fill();
    }

    /** The hole: a tilted disk of light spinning round it, a ring of light and the dark core. */
    function hole(t, R, sec) {
      if (R <= 0.4) return;
      const heat = (0.6 + 0.4 * fed) * Math.min(t / OPEN, 1) * (1 + 0.8 * span(t, COLLAPSE));
      disk(R, heat, sec, true);
      ctx.lineCap = "round";
      // Light bent over the top of the hole: the far side of the disk.
      ctx.strokeStyle = rgba(palette.glow, 0.1 * heat);
      ctx.lineWidth = R * 0.4;
      arc(R * 1.28, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.strokeStyle = rgba(palette.glow, 0.45 * heat);
      ctx.lineWidth = Math.max(0.8, R * 0.1);
      arc(R * 1.28, Math.PI + 0.3, Math.PI * 2 - 0.3);
      // The photon ring, then the core.
      ctx.strokeStyle = rgba(palette.glow, Math.min(0.95 * heat, 1));
      ctx.lineWidth = Math.max(1, R * 0.045);
      arc(R * 1.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.hole, 1);
      ctx.beginPath();
      ctx.arc(hx, hy, R, 0, Math.PI * 2);
      ctx.fill();
      disk(R, heat, sec, false);
    }

    /** Half the disk (the back half goes behind the core): spinning streaks, spiral arms, fed grains. */
    function disk(R, heat, sec, back) {
      const { glow } = palette;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-0.22);
      ctx.scale(1, 0.5);
      ctx.lineCap = "round";
      const inner = R * 1.3;
      const outer = R * 3.8;
      // Rings of streaks; the inner ones turn faster, like real orbits.
      for (let j = 0; j < rings.length; j++) {
        const rr = inner + ((outer - inner) * j) / (rings.length - 1);
        const turn = spin * Math.pow(inner / rr, 1.5);
        ctx.lineWidth = Math.max(0.6, R * 0.09 * (1 - j / 10)) / 0.75;
        const slots = rings[j].length;
        for (let i = 0; i < slots; i++) {
          const a0 = turn + ((i + rings[j][i] * 0.4) / slots) * Math.PI * 2;
          const mid = a0 + Math.PI / slots;
          if (Math.sin(mid) < 0 !== back) continue;
          // The side turning towards us is brighter.
          const beam = 0.5 + 0.5 * Math.cos(mid - Math.PI);
          const alpha = heat * (0.9 - j * 0.09) * (0.4 + 0.6 * rings[j][i]) * (0.3 + 0.7 * beam);
          if (alpha <= 0.01) continue;
          ctx.strokeStyle = rgba(glow, Math.min(alpha, 1));
          ctx.beginPath();
          ctx.arc(0, 0, rr, a0, a0 + ((Math.PI * 2) / slots) * (0.35 + 0.4 * rings[j][i]));
          ctx.stroke();
        }
      }
      // Three spiral arms of light winding in with the spin.
      for (let arm = 0; arm < 3; arm++) {
        const base = spin * 0.7 + (arm * Math.PI * 2) / 3;
        let prev = null;
        for (let s = 0; s <= 26; s++) {
          const f = s / 26;
          const rr = outer * 1.05 * Math.pow((R * 1.15) / (outer * 1.05), f);
          const a = base + DIR * f * Math.PI * 1.5;
          const x = Math.cos(a) * rr;
          const y = Math.sin(a) * rr;
          if (prev && Math.sin((a + prev[2]) / 2) < 0 === back) {
            ctx.strokeStyle = rgba(glow, heat * 0.5 * f);
            ctx.lineWidth = (Math.max(0.6, R * 0.06) * (0.4 + f)) / 0.75;
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          prev = [x, y, a];
        }
      }
      // Bits of what it ate, spiralling in.
      for (const gr of grains) {
        const age = (sec - gr.born) / gr.life;
        if (age >= 1 || age < 0) continue;
        const rr = R * lerp(gr.r, 1, age * age);
        const a = gr.a + DIR * age * 4;
        if (Math.sin(a) < 0 !== back) continue;
        ctx.strokeStyle = rgba(glow, 0.9 * (1 - age));
        ctx.lineWidth = gr.w / 0.75;
        ctx.beginPath();
        ctx.arc(0, 0, rr, a, a + 0.4 * DIR);
        ctx.stroke();
      }
      ctx.restore();
    }

    /** The neutron star, the shockwave, the sparks and one bright flash. */
    function blast(t) {
      const { glow } = palette;
      const star = span(t, STAR);
      const b = span(t, BLAST);
      if (star > 0 && b < 1) {
        const fadeOut = 1 - b;
        const core = R0 * (0.6 + 1.6 * star) + diag * 0.12 * easeOutExpo(b);
        const cg = ctx.createRadialGradient(hx, hy, 0, hx, hy, core);
        cg.addColorStop(0, rgba(glow, fadeOut));
        cg.addColorStop(0.25, rgba(glow, 0.55 * fadeOut));
        cg.addColorStop(1, rgba(glow, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(hx - core, hy - core, core * 2, core * 2);
        // Two beams sweeping round, like a pulsar.
        const beam = diag * (0.3 * Math.sqrt(star) + 0.55 * easeOutCubic(b));
        const turn = -1.15 + DIR * (star * 1.8 + b * 0.6);
        for (const side of [1, -1]) {
          const ex = hx + Math.cos(turn) * beam * side;
          const ey = hy + Math.sin(turn) * beam * side;
          const lg = ctx.createLinearGradient(hx, hy, ex, ey);
          lg.addColorStop(0, rgba(glow, 0.95 * fadeOut));
          lg.addColorStop(1, rgba(glow, 0));
          ctx.strokeStyle = lg;
          ctx.lineCap = "round";
          ctx.lineWidth = Math.max(1.5, R0 * 0.14);
          line(hx, hy, ex, ey);
          ctx.lineWidth = Math.max(5, R0 * 0.6);
          ctx.globalAlpha = 0.18;
          line(hx, hy, ex, ey);
          ctx.globalAlpha = 1;
        }
      }
      if (b > 0 && b < 1) {
        const out = easeOutExpo(b);
        const fade = Math.pow(1 - b, 1.3);
        const ring = out * diag * 0.62;
        ctx.strokeStyle = rgba(glow, 0.22 * fade);
        ctx.lineWidth = Math.max(4, R0 * 4 * (1 - b));
        arc(ring, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(glow, fade);
        ctx.lineWidth = Math.max(1, R0 * 1.2 * (1 - b));
        arc(ring, 0, Math.PI * 2);
        const b2 = Math.max((b - 0.1) / 0.9, 0);
        if (b2 > 0) {
          ctx.strokeStyle = rgba(glow, 0.6 * (1 - b2));
          ctx.lineWidth = Math.max(1, R0 * 0.5 * (1 - b2));
          arc(easeOutExpo(b2) * diag * 0.48, 0, Math.PI * 2);
        }
        ctx.strokeStyle = rgba(glow, fade);
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        const flung = easeOutCubic(b) * diag * 0.6;
        for (const sp of sparks) {
          const r1 = flung * sp.s;
          const r2 = r1 + sp.l * (1 - b) + 2;
          const ca = Math.cos(sp.a);
          const sa = Math.sin(sp.a);
          line(hx + ca * r1, hy + sa * r1, hx + ca * r2, hy + sa * r2);
        }
      }
      const f = span(t, FLASH);
      if (f > 0 && f < 1) {
        const peak = f < 0.15 ? f / 0.15 : Math.pow(1 - (f - 0.15) / 0.85, 2);
        ctx.fillStyle = rgba(glow, 0.72 * peak);
        stage.fill();
      }
    }

    function arc(r, from, to) {
      if (r <= 0) return;
      ctx.beginPath();
      ctx.arc(hx, hy, r, from, to);
      ctx.stroke();
    }

    function line(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

/* ------------------------------------------------------------------------- */

const SKIP = new Set([
  "SCRIPT",
  "STYLE",
  "LINK",
  "META",
  "TEMPLATE",
  "NOSCRIPT",
  "HEAD",
  "TITLE",
  "BR",
  "WBR",
]);
const SOLID = new Set([
  "IMG",
  "SVG",
  "VIDEO",
  "CANVAS",
  "IFRAME",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "PICTURE",
  "OBJECT",
  "EMBED",
  "HR",
  "PRE",
  "PROGRESS",
  "METER",
  "MATH",
]);

/**
 * Splits the area into pieces that fall on their own: each text block, image,
 * button and small card. Big painted areas (page panels) aren't moved; their
 * paint fades instead, and their contents fall piece by piece.
 */
function collect(scope, page, box, hx, hy) {
  const found = [];
  const panels = [];
  const area0 = (box.right - box.left) * (box.bottom - box.top);
  let count = 0;

  const walk = (parent) => {
    for (const el of Array.from(parent.children)) {
      if (++count > 6000) return;
      if (SKIP.has(el.tagName)) continue;
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) continue;
      if (el.dataset?.blackHole === "ignore") continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.opacity === "0") continue;
      if (cs.display === "contents") {
        walk(el);
        continue;
      }
      const r = el.getBoundingClientRect();
      const onScreen =
        r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom;
      const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible";
      if (!onScreen || r.width * r.height < 2) {
        // Off screen or empty, but what's inside may still show.
        if (!clips) walk(el);
        continue;
      }
      if (cs.visibility === "hidden") {
        walk(el);
        continue;
      }
      const area = r.width * r.height;
      const solid = SOLID.has(el.tagName.toUpperCase()) || el instanceof SVGElement;
      if (solid || hasOwnText(el)) found.push(el);
      else if (clips) {
        // A scroll area moves as one piece, unless it is most of the page.
        if (area > area0 * 0.5) walk(el);
        else found.push(el);
      } else if (area > area0 * 0.08 && el.children.length) {
        if (paints(cs) && el !== document.body) panels.push(el);
        walk(el);
      } else if (paints(cs) || allInline(el)) found.push(el);
      else walk(el);
    }
  };
  walk(page ? document.body : scope);

  // Remember each piece's own inline style first, so it can be put back exactly.
  const saved = new Map(found.map((el) => [el, el.getAttribute("style")]));
  // A plain inline element ignores transforms; let it move as a little box.
  for (const el of found) {
    if (getComputedStyle(el).display === "inline" && !(el instanceof SVGElement)) {
      el.style.display = "inline-block";
    }
  }

  const far = Math.hypot(
    Math.max(hx - box.left, box.right - hx),
    Math.max(hy - box.top, box.bottom - hy),
  );
  const pieces = found.map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let r0 = Math.hypot(cx - hx, cy - hy);
    const phi0 = r0 < 0.5 ? -Math.PI / 2 : Math.atan2(cy - hy, cx - hx);
    r0 = Math.max(r0, 1);
    // Closest edge to the hole decides when it starts to fall.
    const gap = Math.hypot(
      Math.max(r.left - hx, 0, hx - r.right),
      Math.max(r.top - hy, 0, hy - r.bottom),
    );
    const start =
      FEED_FROM +
      FEED_SPREAD * Math.pow(Math.min(gap / far, 1), 0.85) +
      (Math.random() - 0.5) * 0.03;
    const back = RETURN_FROM + RETURN_SPREAD * Math.min(r0 / far, 1) + Math.random() * 0.01;
    let tx = 0;
    let ty = 0;
    let lin = [1, 0, 0, 1];
    if (cs.transform && cs.transform !== "none" && typeof DOMMatrixReadOnly !== "undefined") {
      try {
        const m = new DOMMatrixReadOnly(cs.transform);
        lin = [m.a, m.b, m.c, m.d];
        tx = m.e;
        ty = m.f;
      } catch {
        /* keep the plain values */
      }
    }
    const color = !isClear(cs.backgroundColor) ? cs.backgroundColor : cs.color;
    return {
      el,
      style: saved.get(el) ?? null,
      color: parseRGB(color) ?? [128, 128, 128],
      cx,
      cy,
      r0,
      phi0,
      w: Math.max(r.width, 1),
      h: Math.max(r.height, 1),
      k: parentScale(el),
      tx,
      ty,
      lin,
      start: Math.max(start, 0.01),
      back,
      live: false,
      gone: false,
    };
  });
  return { pieces, panels };
}

function hasOwnText(el) {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 3 && node.textContent && node.textContent.trim()) return true;
  }
  return false;
}

function allInline(el) {
  if (!el.children.length) return false;
  for (const child of Array.from(el.children)) {
    if (!getComputedStyle(child).display.startsWith("inline")) return false;
  }
  return true;
}

function paints(cs) {
  if (!isClear(cs.backgroundColor) || cs.backgroundImage !== "none" || cs.boxShadow !== "none")
    return true;
  const border =
    parseFloat(cs.borderTopWidth) +
    parseFloat(cs.borderRightWidth) +
    parseFloat(cs.borderBottomWidth) +
    parseFloat(cs.borderLeftWidth);
  return border > 0 && !isClear(cs.borderTopColor);
}

function isClear(color) {
  return color === "transparent" || /,\s*0(\.0+)?\)$/.test(color) || /\/\s*0(\.0+)?\)$/.test(color);
}

/** How much the piece's parents are zoomed (1 on a normal page). */
function parentScale(el) {
  let p = el.parentElement;
  while (p) {
    if (p.offsetWidth > 0) {
      const k = p.getBoundingClientRect().width / p.offsetWidth;
      return k > 0.01 ? k : 1;
    }
    p = p.parentElement;
  }
  return 1;
}

/** Large painted areas lose their paint, so the dark of space shows through them. */
/** The fresh page's panels get their paint back as the pieces land. */
function paintIn(el, ms) {
  const cs = getComputedStyle(el);
  return el.animate(
    [
      {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      },
      {
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      },
    ],
    { duration: ms, easing: "ease-out" },
  );
}

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

function waitUntil(done) {
  return new Promise((resolve) => {
    const check = () => (done() ? resolve() : window.setTimeout(check, 50));
    check();
  });
}

function fadePaint(el, ms) {
  const cs = getComputedStyle(el);
  return el.animate(
    [
      {
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      },
      {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      },
    ],
    { duration: ms, easing: "ease-in", fill: "forwards" },
  );
}

/** One canvas over the area; it also stops clicks while the hole plays. */
function makeStage(root, page) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.blackHole = "ignore";
  Object.assign(canvas.style, {
    position: page ? "fixed" : "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    zIndex: "2147483647",
    pointerEvents: "auto",
    touchAction: "none",
  });
  const host = page ? document.body : root;
  let oldPosition = null;
  if (!page && getComputedStyle(root).position === "static") {
    oldPosition = root.style.position;
    root.style.position = "relative";
  }
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return null;
  }

  let left = 0;
  let top = 0;
  let w = 0;
  let h = 0;
  // Sized to the screen pixels it covers (capped at 2x), and again on resize.
  const measure = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    left = r.left;
    top = r.top;
    w = r.width;
    h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
  };
  measure();
  window.addEventListener("resize", measure);

  return {
    ctx,
    clear: () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    },
    fill: () => ctx.fillRect(left, top, w, h),
    fadeOut: (ms) =>
      new Promise((resolve) => {
        const a = canvas.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: ms,
          easing: "ease-out",
          fill: "forwards",
        });
        a.onfinish = a.oncancel = () => resolve();
      }),
    remove: () => {
      window.removeEventListener("resize", measure);
      canvas.remove();
      if (oldPosition !== null) root.style.position = oldPosition;
    },
  };
}

/** Reduced motion: the page quietly fades to its own colour, then reloads. */
function fadeTo(stage, color, ms, root) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (now) => {
      if (!root.isConnected) return resolve();
      const t = Math.min((now - t0) / ms, 1);
      stage.clear();
      stage.ctx.fillStyle = rgba(color, smooth(t));
      stage.fill();
      if (t >= 1) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/** While the whole page is swallowed, it shouldn't scroll under the hole. */
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

/* ------------------------------------------------------------------------- */

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

/** Any CSS colour (hex, rgb, var(--name), oklch...) as plain red, green, blue. */
function toRGB(value, scope, fallback) {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  (scope === document.documentElement ? document.body : scope).appendChild(probe);
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

function rgba(c, a) {
  return `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

function span(t, [a, b]) {
  return Math.min(Math.max((t - a) / (b - a), 0), 1);
}

function clampNumber(v, min, max, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : fallback;
}

const n = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeInCubic = (t) => t * t * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutBack = (t) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
/** Lands with a small overshoot, like something thrown that settles. */
const easeOutBackSoft = (t) => {
  const c = 0.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
