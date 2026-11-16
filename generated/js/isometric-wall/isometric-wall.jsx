"use client";

/**
 * Isometric Wall, from Impeccable.
 *
 * A calm background of picture cards lying on a tilted floor, seen from above
 * at an angle, like prints spread on a table. The cards stand in diagonal
 * columns that fill the whole box, and every column slides slowly along itself,
 * up and to the left, forever. Hover a card and it lifts a
 * little off the floor while its shadow grows wider and softer; move away and
 * it settles back. The drift never stops for it.
 *
 * The pictures are faded (45% in light mode, 18% in dark) so the wall stays
 * quiet behind your headline. The edges fade out through a mask, so it blends
 * into any page color. It sits behind whatever you put inside it, never catches
 * a click, and is hidden from screen readers.
 *
 * No packages. The floor is one flat layer turned in 3D, and the drift is one
 * compositor animation, so the page's own work never makes it stutter. Pictures
 * load only when the wall comes near the screen; it pauses off screen.
 */

import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const TILT = 56; // deg: how far the floor tips back (0 = flat to you, 90 = edge on)
const TURN = 45; // deg: how far the floor turns
const ASPECT = 1.5; // card width / height (3:2)
const GAP = 0.1; // space between cards, as a share of a card's width
const LOOP_ROWS = 4; // the drift repeats every this many cards along a column (pictures follow a 4 x 4 pattern)
const LIFT_MS = 320; // a card rises over this long
const DROP_MS = 480; // and settles back over this long, gentler
const LIFT_EASE = "cubic-bezier(.22,1,.36,1)"; // quick start, long soft finish
const DROP_EASE = "cubic-bezier(.33,1,.68,1)"; // a softer landing
const ENTER_MS = 900; // each card fades and settles onto the floor over this long
const ENTER_SPREAD_MS = 600; // cards far from the middle arrive this much later
const ENTER_EASE = "cubic-bezier(.16,1,.3,1)";
const READY_WAIT_MS = 1500; // the cards come in when the pictures are ready, or after this long at most
const FADE = 0.12; // the edge fade, as a share of the box's short side
const FADE_MIN = 28; // px: never a thinner fade than this

/** Which picture each card gets: a fixed shuffle of a 4 x 4 pattern, so no two neighbours ever match. */
const PATTERN = [9, 2, 14, 5, 12, 7, 0, 11, 3, 15, 8, 1, 6, 10, 4, 13];

/**
 * The edge fade: one even fade along every side, measured from the nearest edge, so the
 * corners fade exactly as much as the sides and never twice. Nine mask pieces that don't
 * overlap: the solid middle, four side strips, four round corners. --iiw-f is its width.
 */
const F = "var(--iiw-f)";
const RAMP = "#000, rgba(0,0,0,.6) 45%, transparent";
const EDGE_MASK = [
  `linear-gradient(#000,#000) calc(${F} - 1px) calc(${F} - 1px) / calc(100% - 2 * ${F} + 2px) calc(100% - 2 * ${F} + 2px) no-repeat`,
  `linear-gradient(to top, ${RAMP}) ${F} 0 / calc(100% - 2 * ${F}) ${F} no-repeat`,
  `linear-gradient(to bottom, ${RAMP}) ${F} 100% / calc(100% - 2 * ${F}) ${F} no-repeat`,
  `linear-gradient(to left, ${RAMP}) 0 ${F} / ${F} calc(100% - 2 * ${F}) no-repeat`,
  `linear-gradient(to right, ${RAMP}) 100% ${F} / ${F} calc(100% - 2 * ${F}) no-repeat`,
  `radial-gradient(circle ${F} at 100% 100%, ${RAMP}) 0 0 / ${F} ${F} no-repeat`,
  `radial-gradient(circle ${F} at 0 100%, ${RAMP}) 100% 0 / ${F} ${F} no-repeat`,
  `radial-gradient(circle ${F} at 100% 0, ${RAMP}) 0 100% / ${F} ${F} no-repeat`,
  `radial-gradient(circle ${F} at 0 0, ${RAMP}) 100% 100% / ${F} ${F} no-repeat`,
].join(", ");

const CSS = `
:where(.iiw) { position: relative; isolation: isolate; overflow: hidden;
  --iiw-floor: var(--background, var(--bg, Canvas));
  --iiw-o: var(--iiw-o-light); --iiw-ink: 24 22 40; --iiw-rest-a: .16; --iiw-up-a: .2; --iiw-ring: rgb(0 0 0 / .05); }
:is(.dark, [data-theme="dark"]) .iiw { --iiw-o: var(--iiw-o-dark); --iiw-ink: 0 0 0; --iiw-rest-a: .5; --iiw-up-a: .45; --iiw-ring: rgb(255 255 255 / .07); }
.iiw-layer { position: absolute; left: 0; top: 0; width: var(--iiw-lw, 100%); height: var(--iiw-lh, 100%); z-index: -1; overflow: hidden; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  -webkit-mask: ${EDGE_MASK}; mask: ${EDGE_MASK}; }
.iiw-plane { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform: rotateX(${TILT}deg) rotateZ(-${TURN}deg); }
.iiw-track { position: absolute; left: 0; top: 0; width: 0; height: 0; will-change: transform; }
.iiw-at { position: absolute; left: 0; top: 0; }
.iiw-sh, .iiw-card { position: absolute; left: 0; top: 0; width: var(--iiw-w); height: var(--iiw-h); }
.iiw-sh::before, .iiw-sh::after { content: ""; position: absolute; inset: var(--iiw-k); border-radius: var(--iiw-rk);
  transition: opacity ${DROP_MS}ms ${DROP_EASE}; }
.iiw-sh::before { box-shadow: var(--iiw-rest-x) var(--iiw-rest-y) 10px calc(var(--iiw-k) - 2px) rgb(var(--iiw-ink) / var(--iiw-rest-a)); }
.iiw-sh::after { opacity: 0; box-shadow: var(--iiw-up-x) var(--iiw-up-y) 30px calc(var(--iiw-k) - 5px) rgb(var(--iiw-ink) / var(--iiw-up-a)); }
.iiw-sh[data-up]::before { opacity: 0; transition: opacity ${LIFT_MS}ms ${LIFT_EASE}; }
.iiw-sh[data-up]::after { opacity: 1; transition: opacity ${LIFT_MS}ms ${LIFT_EASE}; }
.iiw-card { transition: transform ${DROP_MS}ms ${DROP_EASE}; }
.iiw-card[data-up] { transform: translate(var(--iiw-lift-x), var(--iiw-lift-y)); transition: transform ${LIFT_MS}ms ${LIFT_EASE}; }
.iiw-face { width: 100%; height: 100%; overflow: hidden; border-radius: var(--iiw-r); background: var(--iiw-floor); box-shadow: inset 0 0 0 1px var(--iiw-ring); }
.iiw-face img { display: block; width: 100%; height: 100%; max-width: none; object-fit: cover; opacity: var(--iiw-o); pointer-events: none;
  user-select: none; -webkit-user-select: none; -webkit-user-drag: none; -webkit-touch-callout: none; }
.iiw-in { opacity: 0; transform: translate(var(--iiw-drop-x), var(--iiw-drop-y));
  transition: opacity ${ENTER_MS}ms ${ENTER_EASE} var(--iiw-d), transform ${ENTER_MS}ms ${ENTER_EASE} var(--iiw-d); }
.iiw-in-sh { opacity: 0; transition: opacity ${ENTER_MS}ms ${ENTER_EASE} var(--iiw-d); }
.iiw[data-in] .iiw-in, .iiw[data-in] .iiw-in-sh { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .iiw-card[data-up] { transform: none; }
  .iiw-in { transform: none; transition-duration: 400ms; transition-delay: 0ms; }
}`;

/* ---------- geometry ---------- */

const rad = (d) => (d * Math.PI) / 180;
const COS_T = Math.cos(rad(TURN));
const SIN_T = Math.sin(rad(TURN));
const COS_A = Math.cos(rad(TILT));

const num = (v, fallback, min, max) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const mod = (a, n) => ((a % n) + n) % n;

/** Floor point to screen, from the middle of the box (the floor has no perspective, like a real isometric drawing). */
const toScreen = (x, y) => [x * COS_T + y * SIN_T, (-x * SIN_T + y * COS_T) * COS_A];
/** Screen point (from the middle of the box) back to the floor. */
const toFloor = (sx, sy) => {
  const y1 = sy / COS_A;
  return [sx * COS_T - y1 * SIN_T, sx * SIN_T + y1 * COS_T];
};

/** Every other column sits half a card further along, like the cards in a brick wall. */
const colOffset = (c, row) => (mod(c, 2) ? row / 2 : 0);

function layout(boxW, boxH, cols) {
  // The cards stand in columns along the floor's depth, which run diagonally down the screen.
  const pitch = boxW / (cols * COS_T);
  const w = pitch / (1 + GAP);
  const h = w / ASPECT;
  const row = h + (pitch - w);
  const travel = LOOP_ROWS * row; // the floor slides this far along the columns in one loop
  const loop = travel * Math.hypot(SIN_T, COS_T * COS_A);

  // Everything the box can show at any moment of one loop, plus one card all round.
  const pad = w;
  const left = -boxW / 2 - pad,
    right = boxW / 2 + pad,
    top = -boxH / 2 - pad,
    bottom = boxH / 2 + pad;
  const corners = [
    toFloor(left, top),
    toFloor(right, top),
    toFloor(left, bottom),
    toFloor(right, bottom),
  ];
  const xs = corners.map(([x]) => x),
    ys = corners.map(([, y]) => y);
  const c0 = Math.floor(Math.min(...xs) / pitch) - 1,
    c1 = Math.ceil(Math.max(...xs) / pitch) + 1;
  const r0 = Math.floor(Math.min(...ys) / row) - 2,
    r1 = Math.ceil((Math.max(...ys) + travel) / row) + 1;
  const inside = (sx, sy) => sx >= left && sx <= right && sy >= top && sy <= bottom;
  const cells = [];
  const reach = Math.hypot(boxW / 2, boxH / 2) || 1;
  for (let c = c0; c <= c1; c++) {
    for (let r = r0; r <= r1; r++) {
      const x = c * pitch,
        y = r * row + colOffset(c, row);
      let seen = false;
      for (let k = 0; k <= 8 && !seen; k++) {
        const [sx, sy] = toScreen(x + w / 2, y + h / 2 - (travel * k) / 8);
        seen = inside(sx, sy);
      }
      if (!seen) continue;
      // Cards nearest the middle of the box arrive first.
      const [sx, sy] = toScreen(x + w / 2, y + h / 2);
      cells.push({ c, r, x, y, d: Math.min(1, Math.hypot(sx, sy) / reach) });
    }
  }
  return { w, h, pitch, row, loop, cells };
}

/** How far through one loop a drift animation is, from 0 to 1. */
function progressOf(a) {
  if (!a || a.currentTime == null) return 0;
  const d = Number(a.effect?.getTiming().duration) || 1;
  return (Number(a.currentTime) % d) / d;
}

const autoColumns = (boxW) => (boxW < 640 ? 3 : boxW < 1024 ? 5 : 7);

/** "12px" for a CSS custom property, rounded so the style text stays short. */
const px = (n) => `${Math.round(n * 100) / 100}px`;

/* ---------- the component ---------- */

export function IsometricWall({
  images,
  columns,
  speed = 12,
  lift = 8,
  opacity = 0.45,
  darkOpacity = 0.18,
  radius = 14,
  className,
  style,
  children,
  ...rest
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const [size, setSize] = useState(null);
  const [near, setNear] = useState(false); // close enough to the screen to load pictures
  const [ready, setReady] = useState(false); // pictures ready: the cards come in

  const pics = useMemo(
    () => (Array.isArray(images) ? images.filter((s) => typeof s === "string" && s) : []),
    [images],
  );
  const cols = Math.round(num(columns, size ? autoColumns(size.w) : 7, 1, 24));
  const lay = useMemo(
    () => (size && size.w > 0 && size.h > 0 ? layout(size.w, size.h, cols) : null),
    [size, cols],
  );
  const speedPx = num(speed, 12, 0, 400);
  const liftPx = num(lift, 8, 0, 80);

  // Measure the box, and again whenever it changes size.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Layout size, not the size on screen: a scaled parent (a zoomed-out preview)
    // must not shrink the wall, or it would cover only part of the box.
    const measure = () => {
      const w = el.offsetWidth,
        h = el.offsetHeight;
      setSize((s) => (s && Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load the pictures only once the wall is near the screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || near) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setNear(true), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // When the pictures are decoded (or after a short wait at most), bring the cards in.
  useEffect(() => {
    if (!near || ready) return;
    let done = false;
    const go = () => !done && ((done = true), setReady(true));
    const timer = window.setTimeout(go, READY_WAIT_MS);
    Promise.allSettled(
      pics.map((src) => {
        const img = new Image();
        img.src = src;
        return img.decode();
      }),
    ).then(go);
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, [near, ready, pics]);

  // The drift (one compositor animation) and the hover (worked out from the pointer, so it
  // also follows a card that drifts away under a still mouse).
  useEffect(() => {
    const root = rootRef.current,
      track = trackRef.current;
    if (!root || !track || !lay) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");

    // The drift: every column slides along itself, up and to the left, by LOOP_ROWS cards,
    // then starts again on a picture-for-picture match.
    const dx = 0,
      dy = -LOOP_ROWS * lay.row;
    let anim = null;
    let visible = true;
    const startDrift = () => {
      const progress = progressOf(anim);
      anim?.cancel();
      anim = null;
      if (reduce.matches || speedPx <= 0) return;
      const duration = (lay.loop / speedPx) * 1000;
      anim = track.animate(
        [{ transform: "translate(0px, 0px)" }, { transform: `translate(${dx}px, ${dy}px)` }],
        {
          duration,
          iterations: Infinity,
          easing: "linear",
        },
      );
      anim.currentTime = progress * duration;
      if (!visible) anim.pause();
    };
    startDrift();

    const io = new IntersectionObserver((e) => {
      visible = e.some((x) => x.isIntersecting);
      if (visible) anim?.play();
      else anim?.pause();
    });
    io.observe(root);

    // The hover.
    const cards = new Map();
    const sh = track.querySelectorAll(".iiw-sh");
    track.querySelectorAll(".iiw-card").forEach((el, i) => cards.set(el.dataset.key, [el, sh[i]]));
    let up = null;
    const setUp = (next) => {
      if (next === up) return;
      up?.forEach((el) => el.removeAttribute("data-up"));
      next?.forEach((el) => el.setAttribute("data-up", ""));
      up = next;
    };
    let px0 = 0,
      py0 = 0,
      inside = false,
      raf = 0;
    const find = () => {
      const r = root.getBoundingClientRect();
      // Back to the wall's own pixels, in case a parent scales it.
      const k = root.offsetWidth ? r.width / root.offsetWidth : 1;
      const sx = (px0 - r.left) / k,
        sy = (py0 - r.top) / k;
      const bw = r.width / k,
        bh = r.height / k;
      if (sx < 0 || sy < 0 || sx > bw || sy > bh) {
        inside = false;
        return setUp(null);
      }
      // Where the drift has carried the floor right now.
      const t = progressOf(anim);
      const ox = dx * t,
        oy = dy * t;
      const [fx0, fy0] = toFloor(sx - bw / 2, sy - bh / 2);
      const fx = fx0 - ox,
        fy = fy0 - oy;
      const c = Math.floor(fx / lay.pitch);
      if (fx - c * lay.pitch > lay.w) return setUp(null); // in the gap between columns
      const along = fy - colOffset(c, lay.row);
      const row = Math.floor(along / lay.row);
      if (along - row * lay.row > lay.h) return setUp(null); // in the gap between cards
      setUp(cards.get(`${c},${row}`) ?? null);
    };
    const loop = () => {
      find();
      raf = inside && anim && anim.playState === "running" ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      px0 = e.clientX;
      py0 = e.clientY;
      const r = root.getBoundingClientRect();
      const now = px0 >= r.left && px0 <= r.right && py0 >= r.top && py0 <= r.bottom;
      if (!now) {
        inside = false;
        return setUp(null);
      }
      inside = true;
      find();
      if (!raf && anim && anim.playState === "running") raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      inside = false;
      setUp(null);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    // A page that scrolls under a still mouse moves the cards too.
    const onScroll = () => inside && find();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    reduce.addEventListener("change", startDrift);

    return () => {
      anim?.cancel();
      io.disconnect();
      cancelAnimationFrame(raf);
      setUp(null);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true });
      reduce.removeEventListener("change", startDrift);
    };
  }, [lay, speedPx]);

  // Everything the cards share, as CSS variables on the box.
  const vars = useMemo(() => {
    const v = {
      "--iiw-o-light": String(num(opacity, 0.45, 0, 1)),
      "--iiw-o-dark": String(num(darkOpacity, 0.18, 0, 1)),
    };
    if (!lay || !size) return v;
    const r = Math.min(num(radius, 14, 0, 200), lay.h / 2);
    const k = Math.max(4, Math.min(lay.w, lay.h) * 0.22); // the shadow starts from a smaller box under the card, so a lifted card never shows its edge
    const down = (d) => [(-SIN_T * d) / COS_A, (COS_T * d) / COS_A]; // floor offset that shows as d px straight down the screen
    const [rx, ry] = down(3);
    const [ux, uy] = down(12);
    const [lx, ly] = down(-liftPx);
    const [ex, ey] = down(-Math.max(liftPx, 6) * 1.5);
    Object.assign(v, {
      "--iiw-lw": `${Math.ceil(size.w)}px`,
      "--iiw-lh": `${Math.ceil(size.h)}px`,
      "--iiw-w": px(lay.w),
      "--iiw-h": px(lay.h),
      "--iiw-r": px(r),
      "--iiw-k": px(k),
      "--iiw-rk": px(Math.max(0, r - k)),
      "--iiw-rest-x": px(rx),
      "--iiw-rest-y": px(ry),
      "--iiw-up-x": px(ux),
      "--iiw-up-y": px(uy),
      "--iiw-lift-x": px(lx),
      "--iiw-lift-y": px(ly),
      "--iiw-drop-x": px(ex),
      "--iiw-drop-y": px(ey),
      // Whole pixels, so the nine mask pieces meet exactly and never leave a hairline seam.
      "--iiw-f": `${Math.round(Math.max(FADE_MIN, Math.min(size.w, size.h) * FADE))}px`,
    });
    return v;
  }, [lay, size, opacity, darkOpacity, radius, liftPx]);

  const cells = lay && pics.length ? lay.cells : [];
  const picOf = (c, r) => pics[PATTERN[mod(c, 4) * 4 + mod(r, LOOP_ROWS)] % pics.length];
  const at = (x, y) => ({ transform: `translate(${px(x)}, ${px(y)})` });

  return (
    <div
      ref={rootRef}
      className={["iiw", className].filter(Boolean).join(" ")}
      data-in={ready ? "" : undefined}
      style={{ ...vars, ...style }}
      {...rest}
    >
      <style>{CSS}</style>
      <div className="iiw-layer" aria-hidden="true">
        <div className="iiw-plane">
          <div className="iiw-track" ref={trackRef}>
            {cells.map((cell) => (
              <div key={`s${cell.c},${cell.r}`} className="iiw-at" style={at(cell.x, cell.y)}>
                <div
                  className="iiw-sh iiw-in-sh"
                  style={{ "--iiw-d": `${Math.round(cell.d * ENTER_SPREAD_MS)}ms` }}
                />
              </div>
            ))}
            {cells.map((cell) => (
              <div key={`c${cell.c},${cell.r}`} style={at(cell.x, cell.y)} className="iiw-at">
                <div className="iiw-card" data-key={`${cell.c},${cell.r}`}>
                  <div
                    className="iiw-face iiw-in"
                    style={{ "--iiw-d": `${Math.round(cell.d * ENTER_SPREAD_MS)}ms` }}
                  >
                    {near ? (
                      <img src={picOf(cell.c, cell.r)} alt="" draggable={false} decoding="async" />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default IsometricWall;
