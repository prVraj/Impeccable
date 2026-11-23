"use client";

/**
 * Tile flip image, from Impeccable.
 *
 * A picture that changes by tiles. Give it a new `src` and the picture splits
 * into tiny square tiles. Each tile turns over on its side like a card, the old
 * picture on its front and the new one on its back, in a random order that
 * builds up and then eases off, and the whole picture is replaced in 1.2
 * seconds. Between changes it is a plain image.
 *
 * The turning tiles are drawn on one canvas, so even thousands of them stay
 * smooth, and tiles that are not turning are drawn as one piece of picture, so
 * no line ever shows between them.
 *
 * No packages. It fills its box like a cover photo; size it with className or
 * style.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export type TileFlipImageProps = {
  /** The picture to show. Give it a new one and the tiles turn over to it. */
  src: string;
  /** What the picture shows, for screen readers. */
  alt: string;
  /** About how wide each tile is, in pixels. Smaller is finer. Default: 14. */
  tile?: number;
  /** The box's shape, as a CSS aspect-ratio. Ignored when className or style sets the height. Default: "3 / 2". */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const TOTAL_MS = 1200; // from the first tile starting to the last one landing
const FLIP_MS = 560; // one tile turning over
const TILE = 14; // about how wide a tile is, in CSS pixels
const SHADE = 0.3; // how dark a face gets as it turns edge on, so the turn reads in 3D
const BEHIND = 0.2; // the gap behind a turning tile shows the new picture, this much darker
const HANDOFF_MS = 160; // at the end the drawing fades into the plain image, so the swap never shows
const FADE_MS = 300; // reduced motion: a plain crossfade
const MAX_TILES = 3000; // on a very big picture the tiles grow, so it never draws more than this

/** Each tile: lifts off gently, turns fastest when edge on, lands softly. */
const turn = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** When the tiles start: a few at first, most in the middle, a few last, so the whole change eases in and out. */
const wave = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

const CSS = `
.tfi{position:relative;display:block;width:100%;overflow:hidden;isolation:isolate}
.tfi-img,.tfi-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.tfi-img{object-fit:cover}
.tfi-canvas{pointer-events:none;transition:opacity ${HANDOFF_MS}ms ease-out}
`;

/* ---------- picture maths ---------- */

type Pic = { src: string; alt: string };
type Cover = { x: number; y: number; w: number; h: number; s: number };
type Tile = { x: number; y: number; w: number; h: number; delay: number };
type Job = { id: number; to: Pic; from: HTMLImageElement; next: HTMLImageElement; reduced: boolean };

/** Where a picture sits when it covers a W by H box, centered: its drawn size, top left corner and scale. */
function cover(im: HTMLImageElement, W: number, H: number): Cover {
  const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
  const w = im.naturalWidth * s;
  const h = im.naturalHeight * s;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h, s };
}

/** The tiles for a W by H canvas, each about `size` wide, edges on whole pixels, starts shuffled. */
function cut(W: number, H: number, size: number): Tile[] {
  let s = Math.max(4, size);
  if ((W / s) * (H / s) > MAX_TILES) s = Math.sqrt((W * H) / MAX_TILES);
  const cols = Math.max(1, Math.round(W / s));
  const rows = Math.max(1, Math.round(H / s));
  const xs = Array.from({ length: cols + 1 }, (_, i) => Math.round((i * W) / cols));
  const ys = Array.from({ length: rows + 1 }, (_, i) => Math.round((i * H) / rows));
  const n = cols * rows;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const spread = TOTAL_MS - FLIP_MS;
  return order.map((cell, rank) => {
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    return {
      x: xs[c],
      y: ys[r],
      w: xs[c + 1] - xs[c],
      h: ys[r + 1] - ys[r],
      delay: n > 1 ? wave(rank / (n - 1)) * spread : 0,
    };
  });
}

/** Loads a picture before any tile turns, so no tile turns to an empty back. Null if it can't load. */
function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((done) => {
    const im = new Image();
    im.decoding = "async";
    const ok = () => done(im.naturalWidth && im.naturalHeight ? im : null);
    // Decoding first keeps the first frames smooth, but a page that isn't being drawn may never finish it: wait 250ms at most.
    im.onload = () => {
      if (typeof im.decode === "function") im.decode().then(ok, ok);
      window.setTimeout(ok, 250);
    };
    im.onerror = () => done(null);
    im.src = src;
  });
}

/* ---------- the picture ---------- */

export function TileFlipImage({ src, alt, tile = TILE, ratio = "3 / 2", className, style }: TileFlipImageProps) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState<Pic>({ src, alt });
  const [run, setRun] = useState<{ id: number; ending: boolean } | null>(null);
  const job = useRef<Job | null>(null);
  const now = useRef<Pic>({ src, alt }); // what is on screen (or landing)
  const want = useRef<Pic>({ src, alt }); // the latest picture asked for
  const busy = useRef(false); // loading or turning: a newer picture waits for this one to land
  const land = useRef<(() => void) | null>(null); // lands the change now (used when the box resizes)
  const ids = useRef(0);
  const alive = useRef(true);
  const tileRef = useRef(tile);
  useEffect(() => {
    tileRef.current = tile;
  }, [tile]);

  // Shows a picture at once, with no tiles.
  const put = useCallback((pic: Pic) => {
    now.current = pic;
    setShown(pic);
    setRun(null);
    busy.current = false;
  }, []);

  // Starts the change to the latest picture, if it differs from what is on screen.
  const go = useCallback(() => {
    if (busy.current || !alive.current) return;
    const next = want.current;
    if (next.src === now.current.src) {
      if (next.alt !== now.current.alt) put(next);
      return;
    }
    busy.current = true;
    load(next.src).then((im) => {
      if (!alive.current) return;
      // A newer picture was asked for while this one loaded: go straight to that one.
      if (want.current.src !== next.src) {
        busy.current = false;
        return go();
      }
      const from = img.current;
      const box = root.current?.getBoundingClientRect();
      // The old picture never loaded, the new one failed, no size yet or the tab is hidden: just swap.
      if (!im || !from || !from.complete || !from.naturalWidth || !box || box.width < 1 || box.height < 1 || document.hidden) {
        put(next);
        return go();
      }
      const id = ++ids.current;
      job.current = { id, to: next, from, next: im, reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches };
      setRun({ id, ending: false });
    });
  }, [put]);

  // A new src or alt from outside.
  useEffect(() => {
    want.current = { src, alt };
    go();
  }, [src, alt, go]);

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
    const tiles = j.reduced ? [] : cut(W, H, tileRef.current * dpr);
    const total = j.reduced ? FADE_MS : TOTAL_MS;
    const whole = (im: HTMLImageElement, c: Cover) => ctx!.drawImage(im, c.x, c.y, c.w, c.h);

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
      // 1. The new picture everywhere: the tiles that have landed.
      whole(j.next, nw);
      // 2. The old picture, in one piece, on every tile that hasn't started, so no line shows between them.
      const turning: Tile[] = [];
      ctx.save();
      ctx.beginPath();
      let waiting = false;
      for (const tl of tiles) {
        if (t < tl.delay) {
          ctx.rect(tl.x, tl.y, tl.w, tl.h);
          waiting = true;
        } else if (t < tl.delay + FLIP_MS) turning.push(tl);
      }
      if (waiting) {
        ctx.clip();
        whole(j.from, old);
      }
      ctx.restore();
      if (!turning.length) return;
      // 3. Behind each turning tile, the new picture a little darker, like a gap with depth.
      ctx.beginPath();
      for (const tl of turning) ctx.rect(tl.x, tl.y, tl.w, tl.h);
      ctx.fillStyle = `rgba(0,0,0,${BEHIND})`;
      ctx.fill();
      // 4. The turning tiles: squeezed by how far they have turned, old face first, then new, darker when edge on.
      for (const tl of turning) {
        const c = Math.cos(turn((t - tl.delay) / FLIP_MS) * Math.PI);
        const a = Math.abs(c);
        const dw = tl.w * a;
        if (dw < 0.25) continue;
        const im = c > 0 ? j.from : j.next;
        const at = c > 0 ? old : nw;
        const dx = tl.x + (tl.w - dw) / 2;
        ctx.drawImage(im, (tl.x - at.x) / at.s, (tl.y - at.y) / at.s, tl.w / at.s, tl.h / at.s, dx, tl.y, dw, tl.h);
        const shade = SHADE * (1 - a);
        if (shade > 0.01) {
          ctx.fillStyle = `rgba(0,0,0,${shade})`;
          ctx.fillRect(dx, tl.y, dw, tl.h);
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
      now.current = j.to;
      setShown(j.to);
      setRun((x) => (x && x.id === j.id ? { ...x, ending: true } : x));
      window.setTimeout(() => {
        if (!alive.current) return;
        setRun((x) => (x && x.id === j.id ? null : x));
        busy.current = false;
        go();
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
    };
  }, []);

  const drawing = !!run && !run.ending;

  return (
    <div ref={root} className={["tfi", className].filter(Boolean).join(" ")} style={{ aspectRatio: ratio, ...style }}>
      <style>{CSS}</style>
      {/* Hidden while the canvas draws the change, so a see-through picture never shows twice. */}
      <img ref={img} className="tfi-img" src={shown.src} alt={shown.alt} draggable={false} style={drawing ? { opacity: 0 } : undefined} />
      {run && <canvas ref={canvas} className="tfi-canvas" aria-hidden="true" style={run.ending ? { opacity: 0 } : undefined} />}
    </div>
  );
}

export default TileFlipImage;
