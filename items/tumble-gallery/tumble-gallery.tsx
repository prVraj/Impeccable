"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Tumble Gallery
 * A split flap board for pictures. The picture you see sits flat, facing you, cut
 * across the middle by an invisible hinge. Every few seconds one flap falls forward
 * over the hinge, slow at first and faster and faster, like a card falling under
 * gravity, and lands on the next picture. Hover pauses it,
 * dragging up or down flips it by hand. It needs at least 4 pictures: the flaps go
 * round a wheel, and with fewer the one travelling round the back would show.
 * One file, React only, CSS 3D, no packages.
 */

export type TumbleImage = {
  /** Picture address. Same site, or a site your Content-Security-Policy allows. */
  src: string;
  /** Says what the picture shows. Read by screen readers. */
  alt: string;
};

/** At least 4 pictures. Fewer is a type error, and at runtime it shows a notice instead. */
export type TumbleImages = [TumbleImage, TumbleImage, TumbleImage, TumbleImage, ...TumbleImage[]];

export type TumbleGalleryProps = {
  images: TumbleImages;
  /** Flip on its own. Off: it only moves when dragged. */
  autoPlay?: boolean;
  /** How long each picture rests before the next flip, in ms. */
  interval?: number;
  /** Corner radius of each picture, in px. */
  radius?: number;
  /** Height of the gallery, any CSS height. Left out, it keeps a shape that fits its width. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

/* ---------- Tuning (the design and its timing) ---------- */
export const TUMBLE_MIN = 4; // the wheel needs one flap free to travel round the back
const ASPECT = 4 / 3; // picture width / height
const MAX_W = 580; // px, the widest a picture gets
const FILL_W = 0.72; // a picture takes at most this much of the width (a flap swinging at you looks wider)
const ROOM_H = 1.16; // the gallery is this many pictures tall
const VIEW = 2.2; // perspective distance, x picture height (smaller = deeper 3D)
const LEAN = 7; // deg each flap waiting in a stack leans back behind the one in front
const FLIP_MS = 800; // one flip to the next picture
const SETTLE_MS = 320; // a short drag lands in this long at least
const REST_MS = 2000; // the rest between flips
const SHADE = 0.42; // a flap turned edge-on darkens this much
const SEAL = 2; // px: the two halves of the picture in view overlap this much at the hinge (same pixels), so no line shows
const DRAG_START = 4; // px before a press becomes a drag
const FLICK = 0.2; // s of a flick's speed carried into where it lands
const EASE_IN = (x: number) => x * x * x; // slow at first, faster and faster
const EASE_OUT = (x: number) => 1 - Math.pow(1 - x, 3);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const f2 = (v: number) => Math.round(v * 100) / 100;

const CSS = `
.tg-root{position:relative;width:100%;aspect-ratio:1.5;max-height:560px;overflow:hidden;color:var(--foreground,var(--fg,currentColor));user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:pinch-zoom;cursor:grab;-webkit-tap-highlight-color:transparent}
.tg-root[data-drag]{cursor:grabbing}
.tg-stage{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;pointer-events:none}
.tg-flap{position:absolute;left:calc(var(--tg-w) / -2);top:calc(var(--tg-h) / -2);width:var(--tg-w);height:calc(var(--tg-h) / 2);transform-origin:50% 100%;transform-style:preserve-3d;will-change:transform}
.tg-root:not([data-ready]) .tg-flap{visibility:hidden}
.tg-face{position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;-webkit-backface-visibility:hidden;backface-visibility:hidden;background:color-mix(in srgb,currentColor 9%,transparent)}
.tg-front{border-radius:var(--tg-r) var(--tg-r) 0 0}
.tg-back{border-radius:0 0 var(--tg-r) var(--tg-r);transform:rotateX(180deg)}
.tg-face img{position:absolute;left:0;width:100%;height:var(--tg-h);max-width:none;max-height:none;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none}
.tg-front img{top:0}
.tg-back img{top:calc(var(--tg-h) / -2)}
.tg-flap[data-seal] .tg-face{bottom:-${SEAL}px}
.tg-flap[data-seal] .tg-back img{top:calc(var(--tg-h) / -2 + ${SEAL}px)}
.tg-shade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
.tg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.tg-note{display:flex;align-items:center;justify-content:center;padding:24px;border:1px dashed color-mix(in srgb,currentColor 30%,transparent);border-radius:12px;font:14px/1.5 system-ui,sans-serif;text-align:center;color:var(--foreground,var(--fg,currentColor))}
`;

export function TumbleGallery({
  images,
  autoPlay = true,
  interval = REST_MS,
  radius = 20,
  height,
  className,
  style,
  "aria-label": ariaLabel = "Gallery",
}: TumbleGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const srRef = useRef<HTMLDivElement>(null);
  const list: TumbleImage[] = Array.isArray(images) ? images : [];
  const n = list.length;
  const tooFew = n < TUMBLE_MIN;

  // The newest props, read by the running loop without restarting it.
  const live = useRef({ autoPlay, rest: REST_MS, radius: 20 });
  live.current = {
    autoPlay,
    rest: Number.isFinite(interval) ? clamp(interval, 300, 60000) : REST_MS,
    radius: Number.isFinite(radius) ? Math.max(0, radius) : 20,
  };

  const srcKey = list.map((i) => i.src).join("\n");
  const altKey = list.map((i) => i.alt).join("\n");
  const relayout = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (tooFew) console.error(`TumbleGallery needs at least ${TUMBLE_MIN} images, it got ${n}. It shows a notice until it has ${TUMBLE_MIN}.`);
  }, [tooFew, n]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || tooFew) return;
    const flaps = Array.from(stage.children) as HTMLElement[];
    const count = flaps.length;
    const shades = flaps.map((f) => Array.from(f.querySelectorAll<HTMLElement>(".tg-shade")));
    const alts = altKey.split("\n");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- Pictures: keep a soft placeholder, never the broken icon ---------- */
    const cleanups: (() => void)[] = [];
    stage.querySelectorAll("img").forEach((img) => {
      const hide = () => (img.style.visibility = "hidden");
      if (img.complete && img.getAttribute("src") && !img.naturalWidth) hide();
      img.addEventListener("error", hide);
      cleanups.push(() => img.removeEventListener("error", hide));
    });

    /* ---------- Layout ---------- */
    let H = 200, stepPx = 100;
    const layout = () => {
      const r = root.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      H = Math.max(24, Math.min(h / ROOM_H, (w * FILL_W) / ASPECT, MAX_W / ASPECT));
      const W = H * ASPECT;
      stepPx = H * 0.5; // dragging half a picture flips one flap
      root.style.perspective = `${Math.round(Math.max(420, H * VIEW))}px`;
      root.style.setProperty("--tg-w", `${Math.round(W)}px`);
      root.style.setProperty("--tg-h", `${Math.round(H / 2) * 2}px`);
      root.style.setProperty("--tg-r", `${Math.min(live.current.radius, H / 2)}px`);
      draw();
    };

    /* ---------- The wheel ---------- */
    // Flap i shows the top half of picture i on its front and the bottom half of picture i+1 on its back.
    // t (0..count) is how far flap i has gone round since it was the top of the picture in view:
    // 0..1 it falls over the hinge, then it waits in the bottom stack, swings round the back,
    // and waits in the top stack, each waiting flap leaning a little further back.
    const low = 1 + Math.floor((count - 1) / 2); // last place in the bottom stack
    const angleOf = (t: number) => {
      if (t <= 1) return 180 * t;
      if (t <= low) return 180 + LEAN * (t - 1);
      const backFrom = 180 + LEAN * (low - 1);
      const backTo = 360 - LEAN * (count - low - 1);
      if (t <= low + 1) return backFrom + (backTo - backFrom) * (t - low);
      return backTo + (360 - backTo) * (t - low - 1) / Math.max(1e-6, count - low - 1);
    };

    /* ---------- State ---------- */
    let pos = 0; // flaps fallen; the picture in view is pos (mod count)
    let from = 0, to = 0, animStart = 0, animMs = 0;
    let animating = false, easeIn = true;
    let restUntil = 0;
    let hovering = false;
    let inView = true;
    let raf = 0;
    let shown = -1;
    let pointer = -1, startY = 0, startPos = 0, dragging = false;
    let lastY = 0, lastT = 0, vel = 0; // flaps a second

    const draw = () => {
      for (let i = 0; i < count; i++) {
        const t = (((pos - i) % count) + count) % count;
        const a = angleOf(t);
        flaps[i].style.transform = `rotateX(${f2(-a)}deg)`;
        // Only the two flat halves in view overlap; a leaning flap's overlap would poke out in front.
        const seal = a < 0.5 || a > 359.5 || Math.abs(a - 180) < 0.5;
        if (seal !== flaps[i].hasAttribute("data-seal")) flaps[i].toggleAttribute("data-seal", seal);
        const c = Math.cos((a * Math.PI) / 180);
        const [front, back] = shades[i];
        // The front darkens as it tips toward you, the back lightens as it lands.
        if (front) front.style.opacity = String(f2(SHADE * clamp(1 - c, 0, 1)));
        if (back) back.style.opacity = String(f2(SHADE * clamp(1 + c, 0, 1)));
      }
      const mid = ((Math.round(pos) % count) + count) % count;
      if (mid !== shown) {
        shown = mid;
        if (srRef.current) srRef.current.textContent = `${mid + 1} of ${count}: ${alts[mid] ?? ""}`;
      }
    };

    const flipTo = (target: number, ms: number, now: number, inOut: boolean) => {
      from = pos;
      to = target;
      animStart = now;
      animMs = Math.max(1, ms);
      easeIn = inOut;
      animating = true;
      kick();
    };

    const canAuto = () => live.current.autoPlay && !reduce.matches && !hovering && inView && !document.hidden && pointer < 0;

    const tick = (now: number) => {
      raf = 0;
      if (animating) {
        const p = clamp((now - animStart) / animMs, 0, 1);
        pos = from + (to - from) * (easeIn ? EASE_IN : EASE_OUT)(p);
        if (p >= 1) {
          animating = false;
          pos = ((to % count) + count) % count; // keep the numbers small
          restUntil = now + live.current.rest;
        }
        draw();
      } else if (canAuto() && !dragging) {
        if (!restUntil) restUntil = now + live.current.rest;
        if (now >= restUntil) {
          flipTo(Math.round(pos) + 1, FLIP_MS, now, true);
        }
      }
      if (animating || canAuto()) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ---------- Drag up or down ---------- */
    const onDown = (e: PointerEvent) => {
      if (pointer >= 0 || (e.pointerType === "mouse" && e.button !== 0)) return;
      pointer = e.pointerId;
      startY = lastY = e.clientY;
      lastT = performance.now();
      startPos = pos;
      vel = 0;
      dragging = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      if (!dragging) {
        if (Math.abs(e.clientY - startY) < DRAG_START) return;
        dragging = true;
        animating = false;
        startPos = pos;
        startY = e.clientY;
        root.setAttribute("data-drag", "");
        try {
          root.setPointerCapture(e.pointerId);
        } catch {}
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      // Dragging down pulls the top flaps over the hinge toward you.
      const v = (e.clientY - lastY) / stepPx / dt;
      vel = vel * 0.6 + v * 0.4;
      lastY = e.clientY;
      lastT = now;
      pos = startPos + (e.clientY - startY) / stepPx;
      draw();
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = -1;
      root.removeAttribute("data-drag");
      if (!dragging) return;
      dragging = false;
      if (performance.now() - lastT > 90) vel = 0; // held still before letting go
      // Never more than one picture away from where the drag started: no skipping.
      const base = Math.round(startPos);
      const target = clamp(Math.round(pos + clamp(vel * FLICK, -1, 1)), base - 1, base + 1);
      const dist = Math.abs(target - pos);
      flipTo(target, Math.max(SETTLE_MS, FLIP_MS * 0.6 * dist), performance.now(), false);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovering = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovering = false;
      restUntil = 0; // a fresh rest before the next flip
      kick();
    };
    const resume = () => {
      restUntil = 0;
      kick();
    };

    /* ---------- Wiring ---------- */
    relayout.current = layout;
    layout();
    root.setAttribute("data-ready", "");
    kick();

    const ro = new ResizeObserver(layout);
    ro.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) resume();
    });
    io.observe(root);
    const onVis = () => !document.hidden && resume();
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener?.("change", resume);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    const noDrag = (e: Event) => e.preventDefault();
    root.addEventListener("dragstart", noDrag);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener?.("change", resume);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("dragstart", noDrag);
      cleanups.forEach((f) => f());
      root.removeAttribute("data-ready");
      relayout.current = null;
    };
  }, [srcKey, altKey, tooFew]);

  // Radius can change without a restart.
  useEffect(() => {
    relayout.current?.();
  }, [radius]);

  if (tooFew) {
    return (
      <div className={className} style={style} role="alert">
        <style>{CSS}</style>
        <div className="tg-note">
          Tumble Gallery needs at least {TUMBLE_MIN} images. It has {n}.
        </div>
      </div>
    );
  }

  const boxStyle: CSSProperties = { ...style };
  if (height !== undefined) {
    boxStyle.height = typeof height === "number" ? `${height}px` : height;
    boxStyle.aspectRatio = "auto";
    boxStyle.maxHeight = "none";
  }

  return (
    <div
      ref={rootRef}
      className={className ? `tg-root ${className}` : "tg-root"}
      style={boxStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <style>{CSS}</style>
      <div ref={srRef} className="tg-sr" aria-live="off">
        {`1 of ${n}: ${list[0]?.alt ?? ""}`}
      </div>
      <div ref={stageRef} className="tg-stage" aria-hidden="true">
        {list.map((img, i) => {
          const next = list[(i + 1) % n];
          return (
            <div key={`${i}-${img.src}`} className="tg-flap">
              <div className="tg-face tg-front">
                <img src={img.src} alt="" draggable={false} decoding="async" />
                <div className="tg-shade" />
              </div>
              <div className="tg-face tg-back">
                <img src={next.src} alt="" draggable={false} decoding="async" />
                <div className="tg-shade" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TumbleGallery;
