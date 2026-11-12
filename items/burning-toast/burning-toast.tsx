"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------------------
 * Burning-toast
 * Toasts that stack at the bottom of the screen and burn away instead of
 * sliding out. The close button burns it from the X, the timer burns it from
 * the top, and a swipe burns it from where your finger lets go.
 * Place <BurningToaster /> once, then call toast("Saved") from anywhere.
 * A growing clip-path cuts the hole; a WebGL layer draws the charred edge,
 * glow and flames; a 2D canvas draws the ash. Without WebGL, or with reduced
 * motion, the toast fades out instead.
 * ------------------------------------------------------------------------- */

export type ToastType = "default" | "success" | "info" | "warning" | "error";
export type ToastPosition = "bottom-right" | "bottom-center";

export type ToastOptions = {
  /** The supporting line under the main message. */
  description?: ReactNode;
  /** Picks the icon. Default "default" (a bell). */
  type?: ToastType;
  /** Ms before it burns on its own. Overrides the toaster's duration. Infinity keeps it. */
  duration?: number;
  /** Your own icon. Pass null for none. */
  icon?: ReactNode | null;
  /** Reuse an id to update a toast that is still showing. */
  id?: string | number;
  /** Called once the toast has burned away. */
  onDismiss?: (id: string | number) => void;
  /** Send it to the toaster with this `id`. Leave out for the main toaster. */
  toaster?: string;
};

export type BurnColors = {
  /** Charred edge and ash flakes. Used on light toasts. */
  char: string;
  /** Hot rim, flames and sparks. Used on dark toasts. */
  glow: string;
  /** Scorch haze around the edge. */
  smoke: string;
  /** Ash rising off the toast. */
  ember: string;
};

export type ToastColors = {
  /** Toast background. Default: the page's Canvas color (follows light and dark). */
  surface: string;
  /** Main text and icon. Default: CanvasText. */
  text: string;
  /** Supporting text and the close button. Default: the text color at 62%. */
  muted: string;
  /** Hairline around the toast. Default: the text color at 10%. */
  border: string;
};

export type BurningToasterProps = {
  /** Only needed for a second toaster on the same page: it shows only toasts sent with `toaster: id`. */
  id?: string;
  /** Bottom right or bottom center. On phones it is always bottom center. Default "bottom-right". */
  position?: ToastPosition;
  /** Ms before a toast burns on its own. Hovering pauses it. Default 4000. */
  duration?: number;
  /** Length of the burn in ms. Default 1200. */
  burnDuration?: number;
  /** How many toasts show in the stack. Default 3. */
  visibleToasts?: number;
  /** Gap from the screen edge in px. Default 24 (16 on phones). */
  offset?: number;
  /** Toast colors. Any CSS color, including var(--…). */
  colors?: Partial<ToastColors>;
  /** Corner radius. Any CSS length, including var(--…). Default var(--radius-lg, 12px). */
  radius?: string;
  /** Icon color per type. Default: the text color for all. */
  iconColors?: Partial<Record<ToastType, string>>;
  /** Override any of the default black, white and gray burn colors. */
  burnColors?: Partial<BurnColors>;
  className?: string;
  style?: CSSProperties;
};

type ToastItem = {
  id: string | number;
  title: ReactNode;
  description?: ReactNode;
  type: ToastType;
  duration?: number;
  icon?: ReactNode | null;
  onDismiss?: (id: string | number) => void;
  toaster?: string;
  /** Set by toast.dismiss(): burn it from the top. */
  dismissed?: boolean;
};

/* ---------------------------------------------------------------------------
 * The store: toast() works from anywhere, even outside React.
 * ------------------------------------------------------------------------- */

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const toasters = new Map<string, number>();
let counter = 0;
const EMPTY: ToastItem[] = [];

function emit() {
  for (const l of listeners) l();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function add(title: ReactNode, opts: ToastOptions = {}) {
  const id = opts.id ?? `t${++counter}`;
  const item: ToastItem = {
    id,
    title,
    description: opts.description,
    type: opts.type ?? "default",
    duration: opts.duration,
    icon: opts.icon,
    onDismiss: opts.onDismiss,
    toaster: opts.toaster,
  };
  const i = items.findIndex((t) => t.id === id);
  items = i >= 0 ? items.map((t) => (t.id === id ? { ...t, ...item } : t)) : [...items, item];
  emit();
  return id;
}

function remove(id: string | number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

/** Shows a toast. Returns its id. */
export function toast(title: ReactNode, options?: ToastOptions) {
  return add(title, options);
}
toast.success = (title: ReactNode, o?: Omit<ToastOptions, "type">) => add(title, { ...o, type: "success" });
toast.info = (title: ReactNode, o?: Omit<ToastOptions, "type">) => add(title, { ...o, type: "info" });
toast.warning = (title: ReactNode, o?: Omit<ToastOptions, "type">) => add(title, { ...o, type: "warning" });
toast.error = (title: ReactNode, o?: Omit<ToastOptions, "type">) => add(title, { ...o, type: "error" });
/** Burns one toast (from the top), or all of them when no id is given. */
toast.dismiss = (id?: string | number) => {
  items = items.map((t) => (id === undefined || t.id === id ? { ...t, dismissed: true } : t));
  emit();
};

/* ---------------------------------------------------------------------------
 * The toaster
 * ------------------------------------------------------------------------- */

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const WIDTH = 356;
const PEEK = 14; // how far each toast behind peeks out above the front one
const GAP = 12; // gap between toasts when the stack is spread out
const PHONE = 600; // below this width toasts are always centered and full width

const DEFAULT_BURN: BurnColors = {
  char: "#0a0a0a",
  glow: "#ffffff",
  smoke: "#737373",
  ember: "#8a8a8a",
};

export function BurningToaster({
  id,
  position = "bottom-right",
  duration = 4000,
  burnDuration = 1200,
  visibleToasts = 3,
  offset,
  colors,
  radius = "var(--radius-lg, 12px)",
  iconColors,
  burnColors,
  className,
  style,
}: BurningToasterProps) {
  const all = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  const toasts = all.filter((t) => t.toaster === id);
  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [width, setWidth] = useState(1024);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Phone layout depends on the space the toaster has, not the device.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    setWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // When the last toaster leaves the page, its toasts go with it.
  useEffect(() => {
    const key = id ?? "";
    toasters.set(key, (toasters.get(key) ?? 0) + 1);
    return () => {
      const left = (toasters.get(key) ?? 1) - 1;
      toasters.set(key, left);
      if (left === 0 && items.some((t) => t.toaster === id)) {
        items = items.filter((t) => t.toaster !== id);
        emit();
      }
    };
  }, [id]);

  // Timers stop while the tab is hidden.
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // A tap spreads the stack on touch screens; a tap anywhere else closes it.
  useEffect(() => {
    if (!expanded) return;
    const out = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !listRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [expanded]);

  // Nothing left to spread.
  useEffect(() => {
    if (toasts.length === 0) setExpanded(false);
  }, [toasts.length]);

  const setHeight = useCallback((id: string | number, h: number) => {
    setHeights((prev) => (prev[String(id)] === h ? prev : { ...prev, [String(id)]: h }));
  }, []);

  const phone = width < PHONE;
  const edge = offset ?? (phone ? 16 : 24);
  const centered = phone || position === "bottom-center";

  // Newest in front. Index 0 is the front toast.
  const ordered = [...toasts].reverse();
  const max = Math.max(1, Math.floor(visibleToasts) || 1);
  const shown = ordered.slice(0, max);
  const h = (t: ToastItem) => heights[String(t.id)] ?? 0;
  const frontH = shown[0] ? h(shown[0]) : 0;
  const listH = expanded
    ? shown.reduce((s, t) => s + h(t), 0) + GAP * Math.max(0, shown.length - 1)
    : shown.length
      ? frontH + PEEK * (shown.length - 1)
      : 0;

  const vars = {
    "--ibt-surface": colors?.surface ?? "Canvas",
    "--ibt-text": colors?.text ?? "CanvasText",
    "--ibt-muted": colors?.muted ?? "color-mix(in oklab, var(--ibt-text) 62%, transparent)",
    "--ibt-border": colors?.border ?? "color-mix(in oklab, var(--ibt-text) 10%, transparent)",
    "--ibt-radius": radius,
  } as CSSProperties;

  const listStyle: CSSProperties = centered
    ? phone
      ? { left: edge, right: edge, width: "auto" }
      : { left: "50%", width: WIDTH, maxWidth: `calc(100% - ${edge * 2}px)`, translate: "-50% 0" }
    : { right: edge, width: WIDTH, maxWidth: `calc(100% - ${edge * 2}px)` };

  let lift = 0;
  return (
    <section
      ref={rootRef}
      aria-label="Notifications"
      data-burning-toaster=""
      className={className}
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: 0, zIndex: 2147483600, ...vars, ...style }}
    >
      <style>{CSS}</style>
      <ol
        ref={listRef}
        className="ibt-list"
        style={{ ...listStyle, bottom: `calc(${edge}px + env(safe-area-inset-bottom, 0px))`, height: listH }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setExpanded(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setExpanded(false);
        }}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setExpanded(false);
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") setExpanded(true);
        }}
      >
        {ordered.map((t, i) => {
          const y = lift;
          if (i < max) lift += h(t) + GAP;
          return (
            <Toast
              key={t.id}
              item={t}
              index={i}
              total={Math.min(ordered.length, max)}
              visible={i < max}
              expanded={expanded}
              lift={y}
              frontH={frontH}
              ownH={h(t)}
              setHeight={setHeight}
              paused={expanded || hidden}
              duration={Number.isNaN(t.duration ?? duration) ? 4000 : (t.duration ?? duration)}
              burnDuration={burnDuration}
              iconColor={iconColors?.[t.type]}
              burnColors={burnColors}
            />
          );
        })}
      </ol>
    </section>
  );
}

const CSS = `
.ibt-list { position: absolute; margin: 0; padding: 0; list-style: none; box-sizing: border-box; transition: height .4s ${EASE}; }
.ibt-item { position: absolute; left: 0; right: 0; bottom: 0; transform-origin: 50% 0; transition: transform .45s ${EASE}, opacity .4s ${EASE}; }
.ibt-drag { position: relative; }
.ibt-card { position: relative; box-sizing: border-box; overflow: hidden; border-radius: var(--ibt-radius); background: var(--ibt-surface); color: var(--ibt-text); box-shadow: 0 0 0 1px var(--ibt-border), 0 4px 12px -4px rgba(0,0,0,.1), 0 14px 32px -16px rgba(0,0,0,.24); transition: height .4s ${EASE}; touch-action: none; user-select: none; -webkit-user-select: none; font: inherit; text-align: left; }
.ibt-body { display: flex; align-items: flex-start; gap: 12px; padding: 14px 10px 14px 16px; transition: opacity .3s ${EASE}; }
.ibt-icon { flex: none; display: grid; place-items: center; width: 18px; height: 20px; color: var(--ibt-icon, var(--ibt-text)); }
.ibt-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.ibt-title { margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.ibt-desc { margin: 2px 0 0; font-size: 13px; line-height: 18px; color: var(--ibt-muted); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; }
.ibt-close { all: unset; box-sizing: border-box; flex: none; align-self: center; width: 28px; height: 28px; margin: -6px 0; display: grid; place-items: center; border-radius: max(4px, calc(var(--ibt-radius) - 8px)); color: var(--ibt-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background-color .15s, color .15s, transform .15s ${EASE}; }
@media (hover: hover) { .ibt-close:hover { color: var(--ibt-text); background: color-mix(in oklab, var(--ibt-text) 8%, transparent); } }
.ibt-close:active { transform: scale(.92); }
.ibt-close:focus-visible { box-shadow: 0 0 0 2px var(--ibt-muted); }
.ibt-fx { position: absolute; pointer-events: none; }
@media (prefers-reduced-motion: reduce) {
  .ibt-list, .ibt-item, .ibt-card, .ibt-body { transition-duration: .01ms; }
}`;

/* ---------------------------------------------------------------------------
 * One toast
 * ------------------------------------------------------------------------- */

type Point = { x: number; y: number };

function Toast({
  item,
  index,
  total,
  visible,
  expanded,
  lift,
  frontH,
  ownH,
  setHeight,
  paused,
  duration,
  burnDuration,
  iconColor,
  burnColors,
}: {
  item: ToastItem;
  index: number;
  total: number;
  visible: boolean;
  expanded: boolean;
  lift: number;
  frontH: number;
  ownH: number;
  setHeight: (id: string | number, h: number) => void;
  paused: boolean;
  duration: number;
  burnDuration: number;
  iconColor?: string;
  burnColors?: Partial<BurnColors>;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [burn, setBurn] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);
  const remaining = useRef(duration);
  const drag = useRef<{ x0: number; y0: number; t0: number; axis: "x" | "y" | null; x: number; y: number } | null>(null);
  const colorsRef = useRef(burnColors);
  colorsRef.current = burnColors;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  // Come up from below on the next frame.
  useEffect(() => {
    let r = requestAnimationFrame(() => {
      r = requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(r);
  }, []);

  // Report the natural height, so the stack can lay itself out.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(item.id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, setHeight]);

  const burnFromTop = useCallback(() => {
    const card = cardRef.current;
    setBurn((b) => b ?? { x: (card?.offsetWidth ?? WIDTH) / 2, y: -6 });
  }, []);

  // The timer: counts down only while nobody is reading or dragging.
  useEffect(() => {
    if (burn || paused || dragging || !Number.isFinite(duration)) return;
    const start = Date.now();
    const t = window.setTimeout(burnFromTop, Math.max(0, remaining.current));
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - start;
    };
  }, [burn, paused, dragging, duration, burnFromTop]);

  // toast.dismiss() burns from the top too.
  useEffect(() => {
    if (item.dismissed) burnFromTop();
  }, [item.dismissed, burnFromTop]);

  // The burn itself.
  useEffect(() => {
    if (!burn) return;
    const card = cardRef.current;
    const fx = fxRef.current;
    if (!card || !fx) return;
    const done = () => {
      remove(item.id);
      item.onDismiss?.(item.id);
    };
    // A toast hidden at the back of the stack has nothing to show: it just goes.
    if (!visibleRef.current) {
      done();
      return;
    }
    return runBurn(card, fx, burn, burnDuration, { ...DEFAULT_BURN, ...colorsRef.current }, done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burn]);

  /* Swipe: sideways either way, or down. Let go past 45px (or flick) and it
   * burns from where your finger left it. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (burn || e.button !== 0 || (e.target as Element).closest("button")) return;
    drag.current = { x0: e.clientX, y0: e.clientY, t0: performance.now(), axis: null, x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = dragRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < 4) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    // Up is the wrong way: it moves a little, then stops.
    d.x = d.axis === "x" ? dx : 0;
    d.y = d.axis === "y" ? (dy > 0 ? dy : -Math.min(12, Math.sqrt(-dy) * 2)) : 0;
    el.style.transition = "none";
    el.style.transform = `translate(${d.x}px, ${d.y}px)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = dragRef.current;
    const card = cardRef.current;
    drag.current = null;
    setDragging(false);
    if (!d || !el || !card) return;
    const dist = Math.abs(d.x) + Math.max(0, d.y);
    const speed = dist / Math.max(1, performance.now() - d.t0);
    if (dist >= 45 || (dist > 12 && speed > 0.5)) {
      const r = card.getBoundingClientRect();
      const k = card.offsetWidth / Math.max(1, r.width);
      setBurn({
        x: clamp((e.clientX - r.left) * k, 0, card.offsetWidth),
        y: clamp((e.clientY - r.top) * k, 0, card.offsetHeight),
      });
      return;
    }
    el.style.transition = `transform .35s ${EASE}`;
    el.style.transform = "";
  };

  // The close button and Esc burn it from the X.
  const closeRef = useRef<HTMLButtonElement>(null);
  const burnFromClose = () => {
    const card = cardRef.current;
    const x = closeRef.current;
    if (!card || !x) return;
    const b = x.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    const k = card.offsetWidth / Math.max(1, r.width);
    setBurn((p) => p ?? { x: (b.left + b.width / 2 - r.left) * k, y: (b.top + b.height / 2 - r.top) * k });
  };

  const collapsedBehind = !expanded && index > 0;
  const transform = !mounted
    ? "translateY(110%)"
    : expanded
      ? `translateY(${-lift}px)`
      : `translateY(${-index * PEEK}px) scale(${1 - index * 0.05})`;
  const cardH = collapsedBehind ? frontH : ownH || undefined;
  const role = item.type === "error" ? "alert" : "status";

  return (
    <li
      className="ibt-item"
      data-type={item.type}
      style={{
        zIndex: total - index + 1,
        transform,
        opacity: !mounted || !visible ? 0 : 1,
        pointerEvents: visible && !burn ? "auto" : "none",
      }}
    >
      <div ref={dragRef} className="ibt-drag">
        <div
          ref={cardRef}
          className="ibt-card"
          role={role}
          aria-live={role === "alert" ? "assertive" : "polite"}
          aria-atomic="true"
          style={{ height: cardH, cursor: dragging ? "grabbing" : undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation(); // Esc closes this toast, not a dialog behind it
            burnFromClose();
          }}
        >
          <div ref={bodyRef} className="ibt-body" style={{ opacity: collapsedBehind ? 0 : 1 }}>
            {item.icon !== null && (
              <span className="ibt-icon" style={iconColor ? ({ "--ibt-icon": iconColor } as CSSProperties) : undefined}>
                {item.icon ?? ICONS[item.type]}
              </span>
            )}
            <div className="ibt-text">
              <p className="ibt-title">{item.title}</p>
              {item.description != null && <p className="ibt-desc">{item.description}</p>}
            </div>
            <button
              type="button"
              className="ibt-close"
              aria-label="Close"
              tabIndex={collapsedBehind ? -1 : 0}
              ref={closeRef}
              onClick={burnFromClose}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18.9991 19L5 5.00098" />
                <path d="M19 5L5.00092 18.999" />
              </svg>
            </button>
          </div>
        </div>
        <canvas ref={fxRef} className="ibt-fx" aria-hidden="true" width={0} height={0} />
      </div>
    </li>
  );
}

/* Hugeicons (free set, MIT): notification-03, checkmark-circle-02,
 * information-circle, alert-02, cancel-circle. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONS: Record<ToastType, ReactNode> = {
  default: (
    <Icon>
      <path d="M20 18.5011L18.349 7.93407C17.8603 4.80601 15.166 2.5 12 2.5C8.83398 2.5 6.13971 4.80601 5.65098 7.93407L4 18.5011" />
      <path d="M20 18.5C20 16.8431 16.4183 15.5 12 15.5C7.58172 15.5 4 16.8431 4 18.5C4 20.1569 7.58172 21.5 12 21.5C16.4183 21.5 20 20.1569 20 18.5Z" />
      <path d="M13 18.5H11" />
    </Icon>
  ),
  success: (
    <Icon>
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" />
      <path d="M8 12.5L10.5 15L16 9" />
    </Icon>
  ),
  info: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16V12" />
      <path d="M12.125 8.25H12M12.25 8.25C12.25 8.11193 12.1381 8 12 8C11.8619 8 11.75 8.11193 11.75 8.25C11.75 8.38807 11.8619 8.5 12 8.5C12.1381 8.5 12.25 8.38807 12.25 8.25Z" />
    </Icon>
  ),
  warning: (
    <Icon>
      <path d="M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z" />
      <path d="M12 9V13" />
      <path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" />
    </Icon>
  ),
  error: (
    <Icon>
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" />
      <path d="M14.9994 15L12 12.0003M12 12.0003L9 9M12 12.0003L9.00064 15M12 12.0003L15 9" />
    </Icon>
  ),
};

/* ---------------------------------------------------------------------------
 * The burn: the same fire as Burning-Screen, sized for a toast.
 * ------------------------------------------------------------------------- */

// Room around the toast for the flames and the rising ash.
const SIDE = 24;
const TOP = 120;
const BOTTOM = 16;

/** Burns `card` away from `from` (card coordinates). Returns a cancel function. */
function runBurn(
  card: HTMLElement,
  fx: HTMLCanvasElement,
  from: Point,
  duration: number,
  palette: BurnColors,
  done: () => void,
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = reduced ? null : getGL();
  const w = card.offsetWidth;
  const h = card.offsetHeight;

  if (!gl) {
    const a = card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" });
    a.onfinish = done;
    return () => {
      a.onfinish = null;
    };
  }

  const rw = w + SIDE * 2;
  const rh = h + TOP + BOTTOM;
  Object.assign(fx.style, { left: `${-SIDE}px`, top: `${-TOP}px`, width: `${rw}px`, height: `${rh}px` });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  sizeCanvas(fx, rw, rh, dpr);
  sizeCanvas(gl.canvas, rw, rh, dpr);
  const ctx = fx.getContext("2d")!;

  const rad = Math.min(parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0, w / 2, h / 2);
  // Edge colors adapt to the toast and to the page behind it, so the burn always
  // shows. Read again every 150ms, so a theme switch mid-burn is followed.
  let outer = "", inner = "", spark = "", ashColors: string[] = [];
  let readAt = -1e9;
  const readColors = (now: number) => {
    if (now - readAt < 150) return;
    readAt = now;
    const surface = toRgb(getComputedStyle(card).backgroundColor);
    const r = card.getBoundingClientRect();
    const page = colorAt(r.left + r.width / 2, r.top + r.height / 2);
    outer = pickVisible([palette.char, palette.glow], surface);
    inner = pickVisible([palette.glow, palette.char], page);
    spark = pickVisible([palette.glow, palette.char], surface);
    ashColors = [palette.ember, pickVisible([palette.char, palette.glow], page)];
  };

  const geo = makeGeometry(from, w, h);
  const ms = Math.max(300, duration);
  const box: Box = { x: SIDE, y: TOP, w, h };
  const particles: Particle[] = [];
  const start = performance.now();
  let last = start;
  let raf = 0;

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const p = Math.min(1, (now - start) / ms);
    const secs = (p * ms) / 1000;
    const burning = p < 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rw, rh);
    if (burning) {
      readColors(now);
      card.style.clipPath = holePath(geo, p, secs, w, h);
      drawGL(gl, { rw, rh, geo, box, rad, p, secs, clock: (now - start) / 1000, outer, inner, smoke: palette.smoke });
      ctx.drawImage(gl.canvas, 0, 0, rw, rh);
      spawnAsh(particles, geo, box, p, secs, dt, outer, spark, palette.smoke);
      spawnInnerAsh(particles, geo, box, p, secs, dt, ashColors);
    } else {
      card.style.visibility = "hidden";
    }
    stepParticles(particles, dt);
    drawParticles(ctx, particles);

    if (burning || particles.length > 0) raf = requestAnimationFrame(frame);
    else done();
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

/* Geometry: the hole's edge, shared by the clip-path and the shader. */

type Geometry = { ox: number; oy: number; r0: number; rMax: number; amp: number };
type Box = { x: number; y: number; w: number; h: number };

const WOBBLE = [
  // [frequency, weight, phase, speed]: the outline breathes and crinkles.
  [3, 0.5, 1.3, 1.7],
  [5, 0.3, 4.1, -2.3],
  [8, 0.24, 2.2, 3.4],
  [13, 0.16, 0.7, -4.6],
  [21, 0.1, 5.3, 6.2],
  [34, 0.06, 2.9, -8.8],
  [55, 0.035, 0.4, 11.5],
] as const;
const WOBBLE_SUM = WOBBLE.reduce((s, x) => s + x[1], 0);

function makeGeometry(o: Point, w: number, h: number): Geometry {
  const far = Math.max(Math.hypot(o.x, o.y), Math.hypot(w - o.x, o.y), Math.hypot(o.x, h - o.y), Math.hypot(w - o.x, h - o.y));
  const amp = 0.16;
  // Leave room for the dents so the last frame still covers every corner.
  const rMax = far / ((1 - amp * WOBBLE_SUM) * 0.9) + 12;
  return { ox: o.x, oy: o.y, r0: 4, rMax, amp };
}

/** Radius at progress p (0–1): slow ignite, then uneven surges. */
function baseRadius(g: Geometry, p: number) {
  const surge = p + 0.12 * Math.sin(23 * p) * p * (1 - p);
  return g.r0 + (g.rMax - g.r0) * Math.pow(Math.max(0, surge), 1.45);
}

function spread(theta: number, p: number) {
  return 1 + p * (0.22 * Math.sin(2 * theta + 0.7) * Math.sin(3.1 * p + 0.4) + 0.16 * Math.sin(3 * theta + 2.6) * Math.sin(5.3 * p + 0.9));
}

function edgeRadius(g: Geometry, theta: number, p: number, secs: number) {
  let n = 0;
  for (const [f, wgt, ph, sp] of WOBBLE) n += wgt * Math.sin(f * theta + ph + sp * secs);
  return baseRadius(g, p) * (1 + g.amp * n) * spread(theta, p);
}

/** The toast with a ragged hole cut out of it. The outer box is larger than the
 * toast so its shadow stays until the fire reaches it. */
function holePath(g: Geometry, p: number, secs: number, w: number, h: number) {
  const pad = 48;
  let d = `M${-pad} ${-pad}H${w + pad}V${h + pad}H${-pad}Z`;
  const n = 120;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2 - Math.PI;
    const r = edgeRadius(g, th, p, secs);
    d += `${i ? "L" : "M"}${(g.ox + Math.cos(th) * r).toFixed(1)} ${(g.oy + Math.sin(th) * r).toFixed(1)}`;
  }
  return `path(evenodd, "${d}Z")`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/* Colors */

type RGB = [number, number, number];

let colorCtx: CanvasRenderingContext2D | null = null;
function toRgb(color: string): RGB & { a?: number } {
  if (!colorCtx) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    colorCtx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!colorCtx) return [255, 255, 255];
  colorCtx.clearRect(0, 0, 1, 1);
  colorCtx.fillStyle = "#000";
  colorCtx.fillStyle = color;
  colorCtx.fillRect(0, 0, 1, 1);
  const d = colorCtx.getImageData(0, 0, 1, 1).data;
  const rgb = [d[0], d[1], d[2]] as RGB & { a?: number };
  rgb.a = d[3] / 255;
  return rgb;
}

function unit(color: string): RGB {
  const [r, g, b] = toRgb(color);
  return [r / 255, g / 255, b / 255];
}

function luminance([r, g, b]: RGB) {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** First color with enough contrast against the background, else the best one. */
function pickVisible(candidates: string[], bg: RGB) {
  const lb = luminance(bg);
  let best = candidates[0];
  let bestRatio = 0;
  for (const c of candidates) {
    const lc = luminance(toRgb(c));
    const ratio = (Math.max(lb, lc) + 0.05) / (Math.min(lb, lc) + 0.05);
    if (ratio >= 3) return c;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  }
  return best;
}

/** The page behind the toast: walks down the DOM to the point, skipping the
 * toaster, and returns the last opaque background on the way. */
function colorAt(x: number, y: number): RGB {
  let found: RGB = [255, 255, 255];
  const opaque = (el: Element): RGB | null => {
    const c = toRgb(getComputedStyle(el).backgroundColor);
    return (c.a ?? 1) > 0.5 ? [c[0], c[1], c[2]] : null;
  };
  found = opaque(document.documentElement) ?? found;
  let el: Element | null = document.body;
  while (el) {
    found = opaque(el) ?? found;
    let next: Element | null = null;
    for (let i = el.children.length - 1; i >= 0; i--) {
      const child: Element = el.children[i];
      if (child.hasAttribute("data-burning-toaster") || child.tagName === "SCRIPT" || child.tagName === "STYLE") continue;
      const r = child.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        next = child;
        break;
      }
    }
    el = next;
  }
  return found;
}

/* WebGL: charred edge, glow and flames. One context, shared by every toast. */

type GLState = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<string, WebGLUniformLocation | null>;
};

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uOrigin;
uniform float uR;
uniform float uAmp;
uniform float uSecs;
uniform float uClock;
uniform float uProg;
uniform vec3 uOuter;
uniform vec3 uInner;
uniform vec3 uSmoke;
uniform vec4 uBox;
uniform float uRad;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}

// Same outline as the clip-path so the two line up.
float edgeR(float th,float s,float p){
  float n=.5*sin(3.*th+1.3+1.7*s)+.3*sin(5.*th+4.1-2.3*s)+.24*sin(8.*th+2.2+3.4*s)
    +.16*sin(13.*th+.7-4.6*s)+.1*sin(21.*th+5.3+6.2*s)+.06*sin(34.*th+2.9-8.8*s)
    +.035*sin(55.*th+.4+11.5*s);
  float sp=1.+p*(.22*sin(2.*th+.7)*sin(3.1*p+.4)+.16*sin(3.*th+2.6)*sin(5.3*p+.9));
  return uR*(1.+uAmp*n)*sp;
}

vec4 over(vec4 dst,vec3 c,float a){a=clamp(a,0.,1.);return vec4(c*a+dst.rgb*(1.-a),a+dst.a*(1.-a));}

// Inside the toast's rounded box (soft edge), so nothing paints the page around it.
float inBox(vec2 p){
  vec2 c=uBox.xy+uBox.zw*.5;
  vec2 q=abs(p-c)-uBox.zw*.5+uRad;
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-uRad;
  return 1.-smoothstep(-.5,.75,d);
}

void main(){
  vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
  vec2 v=p-uOrigin;
  float d=length(v);
  vec2 dir=v/max(d,.001);
  float th=atan(v.y,v.x);
  float rag=(fbm(dir*26.+vec2(uSecs*1.3,-uSecs*.9))-.5)*4.;
  float s=d-edgeR(th,uSecs,uProg)+rag;
  float grow=smoothstep(0.,.06,uProg);
  vec4 col=vec4(0.);

  if(s>0.){
    // What is left of the toast: scorch, a charred band, glints and a lifted lip.
    float scorch=exp(-s/16.)*.38*(.5+.5*fbm(p*.02+vec2(uClock*.2,-uClock*.6)));
    col=over(col,uSmoke,scorch*grow);
    float bandW=4.+9.*fbm(p*.05+vec2(uSecs*.25,0.));
    float band=smoothstep(bandW,bandW*.25,s);
    float grain=fbm(p*.3+vec2(0.,uSecs*.8));
    vec3 charC=mix(uOuter,uSmoke,.35*smoothstep(.45,.85,grain));
    col=over(col,charC,band*.97);
    float glint=step(.982,hash(floor(p/1.5)+floor(uClock*14.)))*band*smoothstep(bandW,0.,s);
    col=over(col,uInner,glint);
    float lip=exp(-(s-1.5)*(s-1.5)/2.);
    col=over(col,mix(uOuter,uInner,.55),lip*.4);
  } else {
    // Inside the hole: soot, a thin uneven glow and small flames.
    float depth=max(0.,-(d-edgeR(th,uSecs,uProg))-1.);
    float sz=clamp(uR/120.,.3,1.);
    float sootW=(6.+8.*fbm(p*.04+vec2(uSecs*.5,uClock*.2)))*sz;
    float soot=exp(-depth/sootW)*(.5+.5*fbm(p*.06+vec2(0.,-uClock*.4)));
    col=over(col,mix(uInner,uSmoke,.55),soot*.32);
    float glowW=(3.+6.*fbm(p*.04+vec2(uClock*.9,uSecs)))*sz;
    float flick=.75+.25*noise(p*.12+vec2(uClock*6.,-uClock*4.));
    col=over(col,uInner,exp(-depth/glowW)*.65*flick);
    col=over(col,uInner,exp(-depth/2.5));
    float lower=.25+.75*smoothstep(-.4,.8,dir.y);
    vec2 q=vec2(p.x*.05,p.y*.02+uClock*3.4);
    float f=fbm(q+vec2(sin(uClock*1.7)*.3,0.))+.4*fbm(q*vec2(2.6,1.8)+3.1);
    float fh=depth/(90.*sz);
    float tongue=smoothstep(0.,.12,f-fh-.38)*lower;
    float core=smoothstep(0.,.1,f-fh*1.6-.5)*lower;
    col=over(col,mix(uInner,uSmoke,clamp(depth/80.,0.,1.)),tongue*.5*sz);
    col=over(col,uInner,core*.7*sz);
  }

  float rim=exp(-s*s/2.)*(.6+.4*noise(vec2(th*40.,uClock*18.)));
  col=over(col,uInner,rim*.85);

  gl_FragColor=col*grow*inBox(p);
}
`;

let glState: GLState | null | undefined;

function getGL(): GLState | null {
  if (glState !== undefined) return glState;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: true });
  glState = null;
  if (!gl) return null;
  // iOS drops WebGL when the tab goes to the background: build it again next time.
  canvas.addEventListener("webglcontextlost", () => {
    glState = undefined;
  });
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[burning-toast]", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const names = ["uRes", "uDpr", "uOrigin", "uR", "uAmp", "uSecs", "uClock", "uProg", "uOuter", "uInner", "uSmoke", "uBox", "uRad"];
  const u: GLState["u"] = {};
  for (const n of names) u[n] = gl.getUniformLocation(prog, n);
  glState = { canvas, gl, u };
  return glState;
}

function drawGL(
  s: GLState,
  f: { rw: number; rh: number; geo: Geometry; box: Box; rad: number; p: number; secs: number; clock: number; outer: string; inner: string; smoke: string },
) {
  const { gl, u } = s;
  gl.viewport(0, 0, s.canvas.width, s.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(u.uRes, f.rw, f.rh);
  gl.uniform1f(u.uDpr, s.canvas.height / f.rh);
  gl.uniform2f(u.uOrigin, f.box.x + f.geo.ox, f.box.y + f.geo.oy);
  gl.uniform1f(u.uR, baseRadius(f.geo, f.p));
  gl.uniform1f(u.uAmp, f.geo.amp);
  gl.uniform1f(u.uSecs, f.secs);
  gl.uniform1f(u.uClock, f.clock);
  gl.uniform1f(u.uProg, f.p);
  gl.uniform3fv(u.uOuter, unit(f.outer));
  gl.uniform3fv(u.uInner, unit(f.inner));
  gl.uniform3fv(u.uSmoke, unit(f.smoke));
  gl.uniform4f(u.uBox, f.box.x, f.box.y, f.box.w, f.box.h);
  gl.uniform1f(u.uRad, f.rad);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function sizeCanvas(c: HTMLCanvasElement, w: number, h: number, dpr: number) {
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  if (c.width !== W) c.width = W;
  if (c.height !== H) c.height = H;
}

/* Ash (2D canvas), in the burn region's coordinates. */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
  kind: "flake" | "spark";
  seed: number;
  shape?: number[];
  tumble?: number;
  hot?: string;
};

const MAX_PARTICLES = 160;

function flakeShape() {
  const n = 4 + Math.floor(Math.random() * 5);
  const radii: number[] = [];
  for (let i = 0; i < n; i++) radii.push(0.45 + Math.random() * 0.75);
  return radii;
}

function inside(b: Box, x: number, y: number) {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

/** Ash and sparks lifting off the burning edge. */
function spawnAsh(list: Particle[], g: Geometry, b: Box, p: number, secs: number, dt: number, flake: string, spark: string, smoke: string) {
  if (p < 0.05) return;
  const rate = 90 * dt;
  for (let i = 0; i < rate && list.length < MAX_PARTICLES; i++) {
    const th = Math.random() * Math.PI * 2 - Math.PI;
    const r = edgeRadius(g, th, p, secs) + Math.random() * 4;
    const x = b.x + g.ox + Math.cos(th) * r;
    const y = b.y + g.oy + Math.sin(th) * r;
    if (!inside(b, x, y)) continue;
    const kind: Particle["kind"] = Math.random() < 0.66 ? "flake" : "spark";
    const out = 10 + Math.random() * 30;
    list.push({
      x,
      y,
      vx: Math.cos(th) * out + (Math.random() - 0.5) * 24,
      vy: Math.sin(th) * out * 0.4 - (30 + Math.random() * 60),
      life: 0,
      max: 0.5 + Math.random() * 0.7,
      size: kind === "flake" ? 0.9 + Math.pow(Math.random(), 2.6) * 3.2 : 0.5 + Math.random() * 0.9,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 12,
      color: kind === "flake" ? (Math.random() < 0.72 ? flake : smoke) : spark,
      kind,
      seed: Math.random() * 100,
      shape: kind === "flake" ? flakeShape() : undefined,
      tumble: 3 + Math.random() * 9,
      hot: kind === "flake" && Math.random() < 0.35 ? spark : undefined,
    });
  }
}

/** A little ash rising out of the burned part. */
function spawnInnerAsh(list: Particle[], g: Geometry, b: Box, p: number, secs: number, dt: number, colors: string[]) {
  if (p < 0.08) return;
  const rate = 70 * dt * Math.min(1, p * 3);
  for (let i = 0; i < rate && list.length < MAX_PARTICLES; i++) {
    const th = Math.random() * Math.PI * 2 - Math.PI;
    const r = edgeRadius(g, th, p, secs) * Math.sqrt(Math.random()) * 0.96;
    const x = b.x + g.ox + Math.cos(th) * r;
    const y = b.y + g.oy + Math.sin(th) * r;
    if (!inside(b, x, y)) continue;
    list.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: -(25 + Math.random() * 60),
      life: 0,
      max: 0.5 + Math.random() * 0.7,
      size: 0.7 + Math.pow(Math.random(), 2.4) * 2.4,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 10,
      color: Math.random() < 0.6 ? colors[0] : colors[1],
      kind: "flake",
      seed: Math.random() * 100,
      shape: flakeShape(),
      tumble: 2 + Math.random() * 7,
    });
  }
}

function stepParticles(list: Particle[], dt: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    const q = list[i];
    q.life += dt;
    if (q.life >= q.max) {
      list.splice(i, 1);
      continue;
    }
    // Heat lifts the ash, with a sideways flutter.
    q.vy -= 30 * dt;
    q.vx += Math.sin(q.seed + q.life * 6) * 20 * dt;
    q.vx *= 1 - 0.9 * dt;
    q.vy *= 1 - 0.6 * dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.rot += q.spin * dt;
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[]) {
  for (const q of list) {
    const k = q.life / q.max;
    // Fade in, fade out, and fade before the top of the canvas.
    let a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    a *= Math.min(1, q.y / 40);
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = q.color;
    if (q.kind === "flake" && q.shape) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.scale(1, 0.25 + 0.75 * Math.abs(Math.cos(q.life * (q.tumble ?? 6) + q.seed)));
      ctx.beginPath();
      const n = q.shape.length;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const r = q.shape[i] * q.size;
        if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fill();
      if (q.hot && k < 0.6) {
        ctx.globalAlpha = a * (1 - k / 0.6);
        ctx.strokeStyle = q.hot;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
