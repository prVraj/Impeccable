"use client";

/**
 * Cube flip image, from Impeccable.
 *
 * A picture you click to change. The picture is made of tiny cubes, the
 * current picture on their front faces and the next one on their backs. Click
 * anywhere and a wave spreads out from that exact point: each cube rises toward
 * you, casting a soft shadow, and rolls a half turn away from the click, past a
 * darker side, onto its new face, so the next picture takes over in about 2.4
 * seconds, a wave slow enough to watch. Clicks during a change are ignored: one click, one change.
 *
 * The turning cubes are drawn on one canvas, so even thousands of them stay
 * smooth. Between changes it is a plain image. An optional sound plays with
 * each change.
 *
 * No packages. It fills its box like a cover photo; size it with className or
 * style.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

export type CubeFlipPicture = { src: string; alt: string };

export type CubeFlipImageProps = {
  /** The pictures, in order. Each click shows the next one, and after the last it starts again. */
  images: CubeFlipPicture[];
  /** About how wide each cube is, in pixels. Smaller is finer. Default: 20. */
  tile?: number;
  /** The box's shape, as a CSS aspect-ratio. Ignored when className or style sets the height. Default: "3 / 2". */
  ratio?: string;
  /** A sound file to play with each change, like "/sounds/cube-roll.mp3". Leave it out for silence. */
  sound?: string;
  /** What a click does, for screen readers, read after the picture's alt. Default: "show the next picture". */
  label?: string;
  /** Called with the new picture's index once a change has landed. */
  onChange?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const ROLL_MS = 760; // one cube rolling a half turn, slow enough to follow
const SWELL_MS = 200; // a cube starts rising this long before it rolls, and settles this long after: the wave's swell
const SPREAD_MS = 1400; // the wave travelling from the click to the farthest corner, slow enough to watch
const JITTER_MS = 40; // a little randomness in each start, so the wave looks hand made, not ruled
const TOTAL_MS = SWELL_MS + SPREAD_MS + JITTER_MS + ROLL_MS + SWELL_MS; // 2.6 seconds, wherever you click
const TILE = 20; // about how wide a cube is, in CSS pixels
const DEPTH = 3; // how far you sit from a cube, in cube sides: smaller looks more 3D (faces narrow more toward their far edge)
const GAP = 0.2; // the wave: each cube shrinks this much at the crest, so a dark gap opens round it and you see it flip on its own
const LIFT = 0.06; // and grows back this much as it rises toward you (the shadow does most of the lifting)
const SHADE = 0.42; // how dark a face gets as it turns away from you
const SIDE = 0.18; // the side face, seen at mid roll, is the new picture this much darker, so the cube reads as solid
const EDGE = 0.2; // the thin dark line where two faces of a cube meet
const BEHIND = 0.62; // the gap round a rising cube shows the new picture, this much darker, so the cubes stand apart
const SHADOW = 0.5; // the soft shadow a risen cube casts on the picture below it, at the crest
const DROP = 0.26; // how far that shadow falls down and to the right, as a share of the cube, at the crest
const HANDOFF_MS = 160; // at the end the drawing fades into the plain image, so the swap never shows
const FADE_MS = 300; // reduced motion: a plain crossfade, no cubes and no sound
const LOUDNESS = 0.6; // 0 to 1, the sound
const MAX_TILES = 2500; // on a very big picture the cubes grow, so it never draws more than this

/** A cube's roll: tips over slowly, falls fastest at the middle, settles softly onto its new face. */
const roll = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** One edge of a cube as you see it: where it sits along the roll (0 to 1 across the cell) and how tall it looks. */
type Edge = { at: number; tall: number };
/** One face of a cube as you see it: its two edges, which picture is on it, and how dark it is. */
type Face = { a: Edge; b: Edge; pic: "old" | "side" | "new"; dark: number };

/**
 * A cube of side 1 turned by `a` (0 to a half turn), seen in perspective from DEPTH sides away, rolling toward +.
 * Its front face holds the old picture, the face that comes round at a quarter turn is the side, and the back face,
 * which arrives at a half turn, holds the new picture. Returns the faces you can see, left to right, sized so the
 * cube fits its cell, then grown by `grow` for the wave (it rises toward you at mid roll). `edges` are the lines
 * where two visible faces meet.
 */
function cubeFaces(a: number, grow: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  // The cube's four upright edges, seen from above: x across, z away from you. Turning moves the front away to +.
  const corner = (x: number, z: number) => {
    const rx = x * c - z * s;
    const rz = x * s + z * c;
    const p = DEPTH / (DEPTH + rz); // nearer edges look bigger
    return { x: rx * p, p };
  };
  const A = corner(-0.5, -0.5); // front left
  const B = corner(0.5, -0.5); // front right
  const C = corner(0.5, 0.5); // back right (the new picture's left edge, once it faces you)
  const D = corner(-0.5, 0.5); // back left
  // How squarely each face looks at you: 1 = straight on, 0 or less = edge on or turned away.
  const all = [
    { from: A, to: B, pic: "old" as const, facing: c },
    { from: D, to: A, pic: "side" as const, facing: s },
    { from: C, to: D, pic: "new" as const, facing: -c },
  ].filter((f) => f.to.x - f.from.x > 1e-4);
  let left = Infinity;
  let right = -Infinity;
  for (const f of all) {
    left = Math.min(left, f.from.x);
    right = Math.max(right, f.to.x);
  }
  const k = 1 / (right - left || 1);
  const edge = (e: { x: number; p: number }): Edge => ({ at: 0.5 + ((e.x - left) * k - 0.5) * grow, tall: e.p * k * grow });
  const faces: Face[] = all.map((f) => ({
    a: edge(f.from),
    b: edge(f.to),
    pic: f.pic,
    dark: SHADE * (1 - Math.max(0, f.facing)) + (f.pic === "side" ? SIDE : 0),
  }));
  const edges = faces.slice(1).map((f) => f.a);
  return { faces, edges, left: faces[0]?.a ?? edge(A), right: faces[faces.length - 1]?.b ?? edge(B) };
}

const CSS = `
.cfi{position:relative;display:block;width:100%;padding:0;margin:0;border:0;background:none;overflow:hidden;isolation:isolate;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.cfi:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.cfi-img,.cfi-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.cfi-img{object-fit:cover}
.cfi-canvas{transition:opacity ${HANDOFF_MS}ms ease-out}
`;

/* ---------- picture maths ---------- */

type Cover = { x: number; y: number; w: number; h: number; s: number };
/** One cube: its cell, when it starts, and which way it rolls (away from the click). */
type Cube = { x: number; y: number; w: number; h: number; delay: number; across: boolean; dir: 1 | -1 };
type Job = { id: number; to: number; from: HTMLImageElement; next: HTMLImageElement; ox: number; oy: number; reduced: boolean };

/** Where a picture sits when it covers a W by H box, centered: its drawn size, top left corner and scale. */
function cover(im: HTMLImageElement, W: number, H: number): Cover {
  const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
  const w = im.naturalWidth * s;
  const h = im.naturalHeight * s;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h, s };
}

/** The cubes for a W by H canvas, about `size` wide, edges on whole pixels, starting in a wave from (ox, oy). */
function cut(W: number, H: number, size: number, ox: number, oy: number): Cube[] {
  let s = Math.max(4, size);
  if ((W / s) * (H / s) > MAX_TILES) s = Math.sqrt((W * H) / MAX_TILES);
  const cols = Math.max(1, Math.round(W / s));
  const rows = Math.max(1, Math.round(H / s));
  const xs = Array.from({ length: cols + 1 }, (_, i) => Math.round((i * W) / cols));
  const ys = Array.from({ length: rows + 1 }, (_, i) => Math.round((i * H) / rows));
  // The farthest corner from the click, so the wave always takes the same time to cross.
  const far = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) || 1;
  const cubes: Cube[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = xs[c];
      const y = ys[r];
      const w = xs[c + 1] - x;
      const h = ys[r + 1] - y;
      const dx = x + w / 2 - ox;
      const dy = y + h / 2 - oy;
      const across = Math.abs(dx) >= Math.abs(dy);
      cubes.push({
        x,
        y,
        w,
        h,
        delay: SWELL_MS + (Math.hypot(dx, dy) / far) * SPREAD_MS + Math.random() * JITTER_MS,
        across,
        dir: (across ? dx : dy) < 0 ? -1 : 1,
      });
    }
  }
  return cubes;
}

/** Loads each picture once, so a click can start the change at once. */
const loaded = new Map<string, Promise<HTMLImageElement | null>>();
function load(src: string): Promise<HTMLImageElement | null> {
  let p = loaded.get(src);
  if (!p) {
    p = new Promise((done) => {
      const im = new Image();
      im.decoding = "async";
      const ok = () => done(im.naturalWidth && im.naturalHeight ? im : null);
      // Decoding first keeps the first frames smooth, but a page that isn't being drawn may never finish it: wait 250ms at most.
      im.onload = () => {
        if (typeof im.decode === "function") im.decode().then(ok, ok);
        window.setTimeout(ok, 250);
      };
      im.onerror = () => {
        loaded.delete(src);
        done(null);
      };
      im.src = src;
    });
    loaded.set(src, p);
  }
  return p;
}

/* ---------- the picture ---------- */

export function CubeFlipImage({
  images,
  tile = TILE,
  ratio = "3 / 2",
  sound,
  label = "show the next picture",
  onChange,
  className,
  style,
}: CubeFlipImageProps) {
  const root = useRef<HTMLButtonElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState<{ id: number; ending: boolean } | null>(null);
  const job = useRef<Job | null>(null);
  const busy = useRef(false); // a change is loading or running: clicks are ignored until it lands
  const land = useRef<(() => void) | null>(null);
  const ids = useRef(0);
  const alive = useRef(true);
  const live = useRef({ tile, onChange });
  useEffect(() => {
    live.current = { tile, onChange };
  }, [tile, onChange]);

  const count = images.length;
  const at = count ? Math.min(index, count - 1) : 0;
  const pic = images[at];
  const nextSrc = count > 1 ? images[(at + 1) % count].src : null;

  // Fetch the next picture early, so a click can start the change the moment it lands.
  useEffect(() => {
    if (nextSrc) load(nextSrc);
  }, [nextSrc]);

  // The sound: one Audio element, fetched on the first click.
  useEffect(() => {
    if (!sound) {
      audio.current = null;
      return;
    }
    const a = new Audio(sound);
    a.preload = "none"; // fetched on the first click (12KB), so pages that never click download nothing
    a.volume = LOUDNESS;
    audio.current = a;
    return () => {
      a.pause();
      if (audio.current === a) audio.current = null;
    };
  }, [sound]);

  const play = () => {
    const a = audio.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play()?.catch(() => {}); // a phone on silent, or a browser that blocks it: stay quiet
    } catch {
      // no sound support: the picture still changes
    }
  };

  // A click (or Enter / Space): start the wave from that point, unless a change is already running.
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    // A click on the picture changes the picture, even when it sits inside a link (like a card).
    e.preventDefault();
    if (busy.current || count < 2 || !root.current) return;
    const from = img.current;
    const box = root.current.getBoundingClientRect();
    if (!from || !from.complete || !from.naturalWidth || box.width < 1 || box.height < 1) return;
    busy.current = true;
    // A keyboard press has no point on the picture (detail 0): start from the middle.
    const keyboard = e.detail === 0;
    const ox = keyboard ? box.width / 2 : Math.min(box.width, Math.max(0, e.clientX - box.left));
    const oy = keyboard ? box.height / 2 : Math.min(box.height, Math.max(0, e.clientY - box.top));
    const to = (at + 1) % count;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sound starts inside the click itself, because browsers only allow sound that starts from one.
    if (!reduced) play();
    load(images[to].src).then((im) => {
      if (!alive.current) return;
      // The next picture failed to load, or the tab is hidden: just show it.
      if (!im || document.hidden) {
        setIndex(to);
        busy.current = false;
        live.current.onChange?.(to);
        return;
      }
      const id = ++ids.current;
      job.current = { id, to, from, next: im, ox, oy, reduced };
      setRun({ id, ending: false });
    });
  };

  // The change: drawn frame by frame on the canvas, then handed back to the plain image.
  useLayoutEffect(() => {
    const cv = canvas.current;
    const box = root.current;
    const j = job.current;
    if (!run || run.ending || !cv || !box || !j || j.id !== run.id) return;
    const r = box.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(1, Math.round(r.width * dpr));
    const H = Math.max(1, Math.round(r.height * dpr));
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    if (ctx) ctx.imageSmoothingQuality = "high";
    const old = cover(j.from, W, H);
    const nw = cover(j.next, W, H);
    const cubes = j.reduced ? [] : cut(W, H, live.current.tile * dpr, j.ox * dpr, j.oy * dpr);
    const total = j.reduced ? FADE_MS : TOTAL_MS;
    const whole = (im: HTMLImageElement, c: Cover) => ctx!.drawImage(im, c.x, c.y, c.w, c.h);
    /**
     * One face of a rolling cube, from edge A to edge B: the cube's own piece of a picture, drawn in thin strips so
     * it narrows toward its far edge (perspective), then darkened by `dark`. `along` is the cell's size in the roll's
     * direction, `cross` the other way. Rolling backward (dir -1) mirrors the positions, never the picture.
     */
    const face = (im: HTMLImageElement, c: Cover, q: Cube, A: Edge, B: Edge, dark: number) => {
      const along = q.across ? q.w : q.h;
      const cross = q.across ? q.h : q.w;
      const span = (B.at - A.at) * along;
      if (span < 0.25) return;
      const strips = Math.max(1, Math.min(8, Math.ceil(span / 5)));
      for (let i = 0; i < strips; i++) {
        const t0 = i / strips;
        const t1 = (i + 1) / strips;
        let f0 = A.at + (B.at - A.at) * t0;
        let f1 = A.at + (B.at - A.at) * t1;
        let u0 = t0;
        let u1 = t1;
        if (q.dir < 0) [f0, f1, u0, u1] = [1 - f1, 1 - f0, 1 - t1, 1 - t0];
        const tall = A.tall + (B.tall - A.tall) * ((t0 + t1) / 2);
        const lo = ((1 - tall) / 2) * cross;
        // Source: the strip of this cube's piece of the picture. Destination: where that strip sits now.
        const [sx, sy, sw, sh, dx, dy, dw, dh] = q.across
          ? [q.x + u0 * q.w, q.y, (u1 - u0) * q.w, q.h, q.x + f0 * q.w, q.y + lo, (f1 - f0) * q.w + 0.35, tall * q.h]
          : [q.x, q.y + u0 * q.h, q.w, (u1 - u0) * q.h, q.x + lo, q.y + f0 * q.h, tall * q.w, (f1 - f0) * q.h + 0.35];
        ctx!.drawImage(im, (sx - c.x) / c.s, (sy - c.y) / c.s, sw / c.s, sh / c.s, dx, dy, dw, dh);
      }
      if (dark <= 0.01) return;
      // The shade, once over the whole face as one tapered shape, so the strips never show as stripes.
      const corner = (f: number, side: number, tall: number) => {
        const at = (q.dir < 0 ? 1 - f : f) * along;
        const off = ((1 - tall) / 2 + side * tall) * cross;
        return q.across ? [q.x + at, q.y + off] : [q.x + off, q.y + at];
      };
      const pts = [corner(A.at, 0, A.tall), corner(B.at, 0, B.tall), corner(B.at, 1, B.tall), corner(A.at, 1, A.tall)];
      ctx!.beginPath();
      ctx!.moveTo(pts[0][0], pts[0][1]);
      for (const p of pts.slice(1)) ctx!.lineTo(p[0], p[1]);
      ctx!.closePath();
      ctx!.fillStyle = `rgba(0,0,0,${dark})`;
      ctx!.fill();
    };

    const draw = (t: number) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      if (j.reduced) {
        whole(j.from, old);
        ctx.globalAlpha = Math.min(1, t / FADE_MS);
        whole(j.next, nw);
        ctx.globalAlpha = 1;
        return;
      }
      // 1. The new picture everywhere: the cubes that have landed.
      whole(j.next, nw);
      // 2. The old picture, in one piece, on every cube the wave's swell hasn't reached, so no line shows between them.
      const rolling: Cube[] = [];
      ctx.save();
      ctx.beginPath();
      let waiting = false;
      for (const q of cubes) {
        if (t < q.delay - SWELL_MS) {
          ctx.rect(q.x, q.y, q.w, q.h);
          waiting = true;
        } else if (t < q.delay + ROLL_MS + SWELL_MS) rolling.push(q);
      }
      if (waiting) {
        ctx.clip();
        whole(j.from, old);
      }
      ctx.restore();
      if (!rolling.length) return;
      // 3. Under each rolling cube, the new picture a little darker: the gap a risen cube leaves.
      ctx.beginPath();
      for (const q of rolling) ctx.rect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = `rgba(0,0,0,${BEHIND})`;
      ctx.fill();
      // Each cube in the wave: it swells up, rolls half a turn at the crest, then settles back down, like water.
      const shapes = rolling.map((q) => {
        const p = Math.min(1, Math.max(0, (t - q.delay) / ROLL_MS));
        const u = (t - q.delay + SWELL_MS) / (ROLL_MS + 2 * SWELL_MS);
        const rise = Math.sin(Math.PI * u) ** 2; // 0 flat, 1 at the crest, easing in and out with no kink
        return { q, rise, cube: cubeFaces(roll(p) * Math.PI, 1 - (GAP - LIFT) * rise) };
      });
      // 4. The wave's shadow: each risen cube casts a soft shadow down and to the right, darker and farther the higher it is.
      for (const { q, rise, cube } of shapes) {
        if (rise < 0.02) continue;
        const along = q.across ? q.w : q.h;
        const cross = q.across ? q.h : q.w;
        const f0 = q.dir > 0 ? cube.left.at : 1 - cube.right.at;
        const f1 = q.dir > 0 ? cube.right.at : 1 - cube.left.at;
        const tall = Math.max(cube.left.tall, cube.right.tall);
        const lo = ((1 - tall) / 2) * cross;
        const [x, y, w, h] = q.across
          ? [q.x + f0 * q.w, q.y + lo, (f1 - f0) * q.w, tall * q.h]
          : [q.x + lo, q.y + f0 * q.h, tall * q.w, (f1 - f0) * q.h];
        const off = DROP * rise * Math.max(along, cross);
        // Three layers, widest and faintest first, so the shadow has a soft edge without a costly blur.
        const soft = Math.max(1, off);
        for (const [grow, share] of [
          [1, 0.25],
          [0.5, 0.3],
          [0, 0.45],
        ]) {
          const g = soft * grow;
          ctx.fillStyle = `rgba(0,0,0,${SHADOW * rise * share})`;
          ctx.fillRect(x + off - g, y + off - g, w + g * 2, h + g * 2);
        }
      }
      // 5. The cubes, lowest first, so a cube at the crest is drawn over its neighbors. The old face turns away, the
      //    darker side comes round at a quarter turn, then the new face arrives at a half turn, each face narrowing
      //    toward its far edge.
      shapes.sort((m, n) => m.rise - n.rise);
      for (const { q, cube } of shapes) {
        for (const f of cube.faces) {
          if (f.pic === "old") face(j.from, old, q, f.a, f.b, f.dark);
          else face(j.next, nw, q, f.a, f.b, f.dark);
        }
        // The thin line where two faces meet, as tall as that edge looks.
        const along = q.across ? q.w : q.h;
        const cross = q.across ? q.h : q.w;
        ctx.fillStyle = `rgba(0,0,0,${EDGE})`;
        for (const e of cube.edges) {
          const at = (q.dir > 0 ? e.at : 1 - e.at) * along;
          const tall = e.tall * cross;
          const lo = (cross - tall) / 2;
          if (q.across) ctx.fillRect(q.x + at - 0.5, q.y + lo, 1, tall);
          else ctx.fillRect(q.x + lo, q.y + at - 0.5, tall, 1);
        }
      }
    };

    let done = false;
    let raf = 0;
    let guard = 0;
    const start = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(guard);
      land.current = null;
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        whole(j.next, nw);
      }
      if (!alive.current) return;
      // The plain image takes the new picture under the canvas, then the canvas fades away over it.
      setIndex(j.to);
      setRun((x) => (x && x.id === j.id ? { ...x, ending: true } : x));
      window.setTimeout(() => {
        if (!alive.current) return;
        setRun((x) => (x && x.id === j.id ? null : x));
        busy.current = false;
        live.current.onChange?.(j.to);
      }, HANDOFF_MS + 40);
    };
    const tick = () => {
      const t = performance.now() - start;
      if (t >= total) return finish();
      draw(t);
      raf = requestAnimationFrame(tick);
    };
    // A background tab pauses frames: never wait longer than the change itself.
    guard = window.setTimeout(finish, total + 500);
    land.current = finish;
    if (!ctx) finish();
    else {
      draw(0);
      raf = requestAnimationFrame(tick);
    }
    return () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(guard);
      land.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.id]);

  // The box changes size mid change (a phone turned, a window resized): land at once rather than draw out of place.
  useEffect(() => {
    const box = root.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    let last = "";
    const ro = new ResizeObserver(([e]) => {
      const key = `${Math.round(e.contentRect.width)}x${Math.round(e.contentRect.height)}`;
      if (last && key !== last) land.current?.();
      last = key;
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      busy.current = false;
    };
  }, []);

  if (!pic) return null;
  const drawing = !!run && !run.ending;

  return (
    <button
      ref={root}
      type="button"
      onClick={click}
      aria-label={`${pic.alt}, ${label}`}
      className={["cfi", className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio, ...style }}
    >
      <style>{CSS}</style>
      {/* Hidden while the canvas draws the change, so a see-through picture never shows twice. */}
      <img ref={img} className="cfi-img" src={pic.src} alt="" draggable={false} style={drawing ? { opacity: 0 } : undefined} />
      {run && <canvas ref={canvas} className="cfi-canvas" aria-hidden="true" style={run.ending ? { opacity: 0 } : undefined} />}
    </button>
  );
}

export default CubeFlipImage;
