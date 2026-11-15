"use client";

/**
 * Infinite-Curl-Gallery, from Impeccable.
 *
 * Your pictures float across an endless canvas that never runs out: it wraps
 * around in every direction. The canvas curls toward you at its edges, like the
 * inside of a bowl, and fades out there through a mask, so it blends into any
 * page and any theme with no colored overlay. It drifts on its own; grab it and
 * throw it in any direction, and it glides on that way.
 *
 * Fast by design: nothing loads until the gallery is near the screen, it moves
 * with transforms only (no layout work while it runs), and it stops when it is
 * off screen or the tab is hidden. Pictures can't be selected or dragged out.
 *
 * No packages.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/** A picture: its address, or its address and alt text. */
export type CurlImage = string | { src: string; alt?: string };

export type InfiniteCurlGalleryProps = {
  /** The pictures, in any order. Each shows several times across the canvas. */
  images: CurlImage[];
  /** How fast it drifts on its own, in pixels a second. 0 keeps it still until it is dragged. */
  speed?: number;
  /** Which way it drifts at first, in degrees: 0 right, 90 down, 180 left, 270 up. A throw changes it. */
  angle?: number;
  /** How much the edges curl toward you, 0 (flat) to 1. */
  curl?: number;
  /** How far in from each side the edges fade out, in percent of the box's shorter side. Every side fades the same, corners included. */
  fade?: number;
  /** Width of the biggest pictures, in pixels. Smaller screens shrink it. */
  tileSize?: number;
  /** Corner radius of the pictures. Any CSS length or var(--…). Default: your `--radius-lg` token. */
  radius?: string;
  /** Shown when there are no pictures. */
  emptyLabel?: ReactNode;
  /** Name of the gallery for screen readers. */
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const SIZES = [0.34, 0.34, 0.42, 0.42, 0.5, 0.5, 0.6, 0.76, 0.92]; // picture widths, as a share of tileSize (many small, few big)
const CELL = 0.95;
const BIG = 0.7; // pictures at least this share count as big // each picture's cell, as a share of tileSize (big pictures may overlap a neighbour a little)
const BEND_DEG = 34; // how far a picture turns at the edge (curl 1)
const BEND_LIFT = 0.32; // how far the edge comes toward you, as a share of the canvas (curl 1)
const GLIDE_S = 0.5; // a throw slows back to the drift in about this long
const MAX_SPEED = 4200; // fastest a throw can go, pixels a second
const HOVER_DRIFT = 0.3; // the drift slows to this share while the mouse is on it
const KEY_PUSH = 700; // an arrow key throws it this fast
const ENTER_MS = 700; // a picture fades and settles in when it has loaded
const ENTER_SPREAD_MS = 520; // pictures far from the middle arrive this much later
const PLACEHOLDER_RATIO = 0.8; // width / height of a picture still loading
const MIN_RATIO = 0.56; // tallest picture shape; beyond it, it is cropped a little
const MAX_RATIO = 1.8; // widest picture shape

/**
 * The edge fade: one even fade along every side, measured from the nearest edge, so the
 * corners fade exactly as much as the sides and never twice (no crossing fades). Nine
 * mask pieces that don't overlap: the solid middle, four side strips, four round corners.
 * --icg-f is the fade's width in pixels.
 */
const F = "var(--icg-f)";
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

/** Picture corners: your design token first, this size only if the token is missing. */
const DEFAULT_RADIUS = "var(--radius-lg, 0.5rem)";

const CSS = `
.icg { overflow: hidden; outline: none; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
.icg[data-drag="true"] { cursor: grabbing; }
.icg:focus-visible { outline: 2px solid color-mix(in oklab, currentColor 55%, transparent); outline-offset: -2px; }
.icg ::selection { background: transparent; }
.icg-view { position: relative; width: 100%; height: 100%; pointer-events: none; -webkit-mask: ${EDGE_MASK}; mask: ${EDGE_MASK}; }
.icg-scene { position: absolute; inset: 0; perspective-origin: 50% 50%; }
.icg-tile { position: absolute; left: 50%; top: 50%; will-change: transform; backface-visibility: hidden; pointer-events: auto; }
.icg-face { width: 100%; height: 100%; border-radius: var(--icg-radius); overflow: hidden; opacity: 0; transform: scale(.9);
  background: color-mix(in oklab, currentColor 7%, transparent);
  box-shadow: 0 0 0 1px color-mix(in oklab, currentColor 7%, transparent), 0 10px 24px -14px rgba(0,0,0,.35);
  transition: opacity ${ENTER_MS}ms cubic-bezier(.23,1,.32,1), transform ${ENTER_MS}ms cubic-bezier(.23,1,.32,1); }
.icg-tile[data-on="true"] .icg-face { opacity: 1; transform: none; }
.icg-face img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; user-select: none; -webkit-user-select: none; -webkit-user-drag: none; -webkit-touch-callout: none; }
@media (hover: hover) {
  .icg:not([data-drag="true"]) .icg-tile[data-on="true"][data-hot="true"] .icg-face { transform: scale(1.06); transition-duration: 300ms; transition-delay: 0ms !important; }
}
.icg-empty { height: 100%; display: grid; place-items: center; padding: 16px; text-align: center; font-size: 14px; color: color-mix(in oklab, currentColor 55%, transparent); }
.icg-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) {
  .icg-face { transform: none; transition: opacity 200ms linear; }
  .icg-tile[data-hot="true"] .icg-face { transform: none !important; }
}
`;

/* ---------- the layout: a grid of cells that repeats forever ---------- */

type Tile = { key: number; image: number; x: number; y: number; w: number; delay: number };
type Layout = { tiles: Tile[]; width: number; height: number };

/** A steady random number in 0..1 for each whole number, so the layout is the same on every visit. */
function rand(i: number) {
  let t = (i * 0x6d2b79f5 + 0x9e3779b9) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function makeLayout(boxW: number, boxH: number, count: number, tileSize: number): Layout {
  const base = Math.max(56, Math.min(tileSize, Math.min(boxW, boxH) * 0.3));
  const cell = base * CELL;
  // The canvas is a bit bigger than the box, so it always wraps out of sight.
  let cols = Math.ceil(boxW / cell) + 2;
  let rows = Math.ceil(boxH / cell) + 2;
  // Every picture gets at least one place.
  while (cols * rows < Math.min(count, 160)) cols * cell / boxW < rows * cell / boxH ? cols++ : rows++;
  const width = cols * cell;
  const height = rows * cell;
  // A steady shuffle of the pictures, then no picture next to itself where it can be helped.
  const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => rand(a + 101) - rand(b + 101));
  const grid: number[] = [];
  const big: boolean[] = [];
  const tiles: Tile[] = [];
  const far = Math.hypot(width / 2, height / 2);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r * cols + c;
      let image = order[k % count];
      for (let tries = 1; tries < count; tries++) {
        const left = c > 0 ? grid[k - 1] : -1;
        const up = r > 0 ? grid[k - cols] : -1;
        if (image !== left && image !== up) break;
        image = order[(k + tries) % count];
      }
      grid[k] = image;
      // Big pictures never sit side by side or on top of each other: the next one is small.
      let share = SIZES[Math.floor(rand(k * 3 + 1) * SIZES.length)];
      if (share >= BIG && ((c > 0 && big[k - 1]) || (r > 0 && big[k - cols]))) share = SIZES[Math.floor(rand(k * 3 + 1) * 4)];
      big[k] = share >= BIG;
      const w = base * share;
      const room = Math.max(0, cell - w);
      const x = (c + 0.5) * cell - width / 2 + (rand(k * 3 + 2) - 0.5) * room * 0.9;
      const y = (r + 0.5) * cell - height / 2 + (rand(k * 3 + 3) - 0.5) * room * 0.9;
      tiles.push({ key: k, image, x, y, w, delay: Math.round((Math.hypot(x, y) / far) * ENTER_SPREAD_MS) });
    }
  }
  return { tiles, width, height };
}

const wrap = (v: number, size: number) => v - size * Math.floor(v / size + 0.5);

/* ---------- the component ---------- */

export function InfiniteCurlGallery({
  images,
  speed = 26,
  angle = 200,
  curl = 0.6,
  fade = 8,
  tileSize = 160,
  radius = DEFAULT_RADIUS,
  emptyLabel = "No pictures yet.",
  "aria-label": ariaLabel = "Picture gallery",
  className,
  style,
}: InfiniteCurlGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const tileEls = useRef<(HTMLDivElement | null)[]>([]);
  const ratios = useRef(new Map<string, number>()); // each picture's own shape, by address
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [near, setNear] = useState(false); // has come near the screen once: pictures load from then on
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set()); // addresses that failed to load

  const list = useMemo(
    () =>
      (images ?? [])
        .map((img) => (typeof img === "string" ? { src: img, alt: "" } : { src: img?.src, alt: img?.alt ?? "" }))
        .filter((img): img is { src: string; alt: string } => typeof img.src === "string" && img.src.length > 0 && !broken.has(img.src)),
    [images, broken],
  );
  const size = Number.isFinite(tileSize) && tileSize > 0 ? tileSize : 160;
  const layout = useMemo(
    () => (box && near && list.length ? makeLayout(box.w, box.h, list.length, size) : null),
    [box, near, list.length, size],
  );

  // Live settings the motion loop reads without restarting.
  const live = useRef({ speed, angle, curl, layout, box, list });
  live.current = {
    list,
    speed: Number.isFinite(speed) ? Math.max(0, speed) : 26,
    angle: Number.isFinite(angle) ? angle : 200,
    curl: Number.isFinite(curl) ? Math.min(1, Math.max(0, curl)) : 0.6,
    layout,
    box,
  };

  // Size of the box, and whether it is near the screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setBox((b) => (b && Math.abs(b.w - w) < 1 && Math.abs(b.h - h) < 1 ? b : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "200px" });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // The motion: one loop that moves every picture with a transform.
  const kick = useRef<() => void>(() => {});
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, dirX: 0, dirY: 0, hover: 0, hoverTarget: 0, drag: false, aimed: false });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const m = motion.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let onScreen = false;

    const place = () => {
      const { layout: lay, box: b, curl: k, list: pics } = live.current;
      if (!lay || !b) return;
      const half = Math.max(b.w, b.h) / 2;
      if (scene.current) scene.current.style.perspective = `${Math.round(half * 2.4)}px`;
      for (const t of lay.tiles) {
        const node = tileEls.current[t.key];
        if (!node) continue;
        const ratio = ratios.current.get(pics[t.image]?.src) ?? PLACEHOLDER_RATIO;
        const h = t.w / ratio;
        const sx = wrap(t.x + m.x, lay.width);
        const sy = wrap(t.y + m.y, lay.height);
        // Far outside the box: skip the work, it can't be seen.
        if (Math.abs(sx) > b.w / 2 + t.w * 2 || Math.abs(sy) > b.h / 2 + h * 2) {
          if (node.style.visibility !== "hidden") node.style.visibility = "hidden";
          continue;
        }
        if (node.style.visibility) node.style.visibility = "";
        const nx = sx / half;
        const ny = sy / half;
        const z = k * BEND_LIFT * half * (nx * nx + ny * ny);
        const ry = -nx * BEND_DEG * k;
        const rx = ny * BEND_DEG * k;
        node.style.transform = `translate3d(${(sx - t.w / 2).toFixed(2)}px,${(sy - h / 2).toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      const { speed: s, angle: a } = live.current;
      const still = reduce.matches;
      if (!m.aimed) {
        m.dirX = Math.cos((a * Math.PI) / 180);
        m.dirY = Math.sin((a * Math.PI) / 180);
      }
      m.hover += (m.hoverTarget - m.hover) * (1 - Math.exp(-dt / 0.35));
      const drift = still ? 0 : s * (1 - m.hover * (1 - HOVER_DRIFT));
      const tx = m.dirX * drift;
      const ty = m.dirY * drift;
      if (!m.drag) {
        if (still) {
          m.vx = 0;
          m.vy = 0;
        } else {
          const keep = Math.exp(-dt / GLIDE_S);
          m.vx = tx + (m.vx - tx) * keep;
          m.vy = ty + (m.vy - ty) * keep;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
      }
      // Keep the numbers small on a page that stays open for hours.
      const lay = live.current.layout;
      if (lay) {
        m.x = wrap(m.x, lay.width);
        m.y = wrap(m.y, lay.height);
      }
      place();
      const moving = m.drag || Math.hypot(m.vx, m.vy) > 0.5 || drift > 0;
      if (onScreen && !document.hidden && moving) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const start = () => {
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      place();
      start();
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    });
    io.observe(el);
    const onVisible = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0), (last = 0)) : start());
    document.addEventListener("visibilitychange", onVisible);
    reduce.addEventListener?.("change", start);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      reduce.removeEventListener?.("change", start);
      kick.current = () => {};
    };
  }, []);

  // New layout or new settings: place everything again and keep moving.
  useEffect(() => {
    kick.current();
  }, [layout, speed, angle, curl]);

  // Grab and throw.
  const drag = useRef<{ id: number; x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    const m = motion.current;
    m.drag = true;
    m.vx = 0;
    m.vy = 0;
    e.currentTarget.dataset.drag = "true";
    kick.current();
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, e.timeStamp - d.t) / 1000;
    const m = motion.current;
    m.x += dx;
    m.y += dy;
    // A smoothed speed, so the throw follows the last moment of the drag.
    m.vx = m.vx * 0.6 + (dx / dt) * 0.4;
    m.vy = m.vy * 0.6 + (dy / dt) * 0.4;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = e.timeStamp;
  };
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const m = motion.current;
    m.drag = false;
    // A hand that stopped before letting go doesn't throw.
    if (e.timeStamp - d.t > 80) {
      m.vx = 0;
      m.vy = 0;
    }
    const v = Math.hypot(m.vx, m.vy);
    if (v > MAX_SPEED) {
      m.vx *= MAX_SPEED / v;
      m.vy *= MAX_SPEED / v;
    }
    // A real throw sets the way it drifts from now on.
    if (v > 80) {
      m.dirX = m.vx / v;
      m.dirY = m.vy / v;
      m.aimed = true;
    }
    delete e.currentTarget.dataset.drag;
    kick.current();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const push = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!push) return;
    e.preventDefault();
    const m = motion.current;
    // The arrow moves the view that way, so the pictures go the other way.
    m.vx = -push[0] * KEY_PUSH;
    m.vy = -push[1] * KEY_PUSH;
    m.dirX = -push[0];
    m.dirY = -push[1];
    m.aimed = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      m.x += m.vx * 0.2;
      m.y += m.vy * 0.2;
    }
    kick.current();
  };

  // Hover: the drift slows so a picture is easy to look at, and the picture under the mouse lifts a little.
  const hot = useRef<HTMLDivElement | null>(null);
  const setHot = (node: HTMLDivElement | null) => {
    if (hot.current === node) return;
    if (hot.current) delete hot.current.dataset.hot;
    hot.current = node;
    if (node) node.dataset.hot = "true";
  };
  const onHover = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || drag.current) return;
    setHot(((e.target as Element).closest?.(".icg-tile") as HTMLDivElement | null) ?? null);
  };

  // A picture that has loaded fades in, with its own shape.
  const onLoad = (key: number, image: number, img: HTMLImageElement) => {
    const r = img.naturalWidth / img.naturalHeight;
    if (Number.isFinite(r) && r > 0) {
      const ratio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));
      if (ratios.current.get(img.getAttribute("src") ?? "") !== ratio) {
        ratios.current.set(img.getAttribute("src") ?? "", ratio);
        // Every copy of this picture takes its shape.
        for (const t of layout?.tiles ?? []) {
          const node = tileEls.current[t.key];
          if (t.image === image && node) node.style.height = `${t.w / ratio}px`;
        }
        kick.current();
      }
    }
    const node = tileEls.current[key];
    if (node) node.dataset.on = "true";
  };

  const fadePct = Number.isFinite(fade) ? Math.min(45, Math.max(0, fade)) : 8;
  const fadePx = box ? Math.round((Math.min(box.w, box.h) * fadePct) / 100) : 0;
  const unique = useMemo(() => [...new Set(list.map((i) => i.alt).filter(Boolean))], [list]);

  return (
    <div
      ref={root}
      className={`icg${className ? ` ${className}` : ""}`}
      role="region"
      aria-roledescription="gallery"
      aria-label={ariaLabel}
      tabIndex={list.length ? 0 : -1}
      style={{ ["--icg-f" as string]: `${fadePx}px`, ["--icg-radius" as string]: radius, ...style }}
      onPointerDown={list.length ? onPointerDown : undefined}
      onPointerMove={onPointerMove}
      onPointerOver={onHover}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      onPointerEnter={(e) => e.pointerType === "mouse" && (motion.current.hoverTarget = 1)}
      onPointerLeave={() => {
        motion.current.hoverTarget = 0;
        setHot(null);
        kick.current();
      }}
      onKeyDown={onKeyDown}
      onDragStart={(e) => e.preventDefault()}
    >
      <style>{CSS}</style>
      {list.length === 0 ? (
        <div className="icg-empty">{emptyLabel}</div>
      ) : (
        <>
          <div className="icg-view" aria-hidden="true">
            <div ref={scene} className="icg-scene">
              {layout?.tiles.map((t) => {
                const img = list[t.image];
                const ratio = ratios.current.get(img.src) ?? PLACEHOLDER_RATIO;
                return (
                  <div
                    key={t.key}
                    ref={(n) => {
                      tileEls.current[t.key] = n;
                    }}
                    className="icg-tile"
                    style={{ width: t.w, height: t.w / ratio, visibility: "hidden" }}
                  >
                    <div className="icg-face" style={{ transitionDelay: `${t.delay}ms` }}>
                      <img
                        src={img.src}
                        alt=""
                        draggable={false}
                        decoding="async"
                        fetchPriority="low"
                        ref={(n) => {
                          // Already in the cache: no load event comes.
                          if (n?.complete && n.naturalWidth) onLoad(t.key, t.image, n);
                        }}
                        onLoad={(e) => onLoad(t.key, t.image, e.currentTarget)}
                        onError={() => {
                          // A picture that can't load leaves the canvas; the others close the gap.
                          setBroken((b) => (b.has(img.src) ? b : new Set(b).add(img.src)));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {unique.length > 0 && (
            <ul className="icg-sr">
              {unique.map((alt) => (
                <li key={alt}>{alt}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default InfiniteCurlGallery;
