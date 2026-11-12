"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import { ArrowExpandIcon, ComputerIcon, RefreshCcwIcon, SmartPhone01Icon, Tablet01Icon } from "./hugeicons";

/** Narrowest the preview can be dragged: the smallest phones in use. */
const MIN = 320;
/** How long a device switch takes. Long enough to follow, short enough not to wait on. */
const DURATION = 500;

const DEVICES = [
  { id: "desktop", label: "Desktop, 1280px", width: 1280, Icon: ComputerIcon },
  { id: "tablet", label: "Tablet, 768px", width: 768, Icon: Tablet01Icon },
  { id: "mobile", label: "Mobile, 375px", width: 375, Icon: SmartPhone01Icon },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];
/** "fit" fills the space at 100% (the default); "custom" is where the handle left it. */
type Mode = DeviceId | "fit" | "custom";

/** Ease in and out (quartic), close to cubic-bezier(0.77, 0, 0.175, 1). */
const easeInOut = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/**
 * State for the responsive preview: which width is chosen, fullscreen, and a
 * key that remounts the component on reset.
 */
export function useViewport() {
  const [mode, setMode] = useState<Mode>("fit");
  const [custom, setCustom] = useState(0);
  // Buttons ease to the new width; dragging and window resizes follow at once.
  const animate = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [full, setFull] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const pick = useCallback((m: Mode) => {
    animate.current = true;
    setMode(m);
  }, []);

  const drag = useCallback((w: number) => {
    animate.current = false;
    setCustom(w);
    setMode("custom");
  }, []);

  // Fullscreen is for trying the component on your own screen: it covers the
  // whole page with just the component at real size, no handle, no devices.
  // Focus goes back to the button that opened it, so keyboard users don't lose their place.
  const opener = useRef<HTMLElement | null>(null);
  const openFull = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setFull(true);
  }, []);
  const closeFull = useCallback(() => setFull(false), []);

  // While it covers the page: Escape closes it and the page behind stops scrolling.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
      opener.current?.focus({ preventScroll: true });
    };
  }, [full]);

  return {
    mode,
    custom,
    animate,
    pick,
    drag,
    dragging,
    setDragging,
    full,
    openFull,
    closeFull,
    resetKey,
    reset: () => setResetKey((k) => k + 1),
    /** The readout element; the stage writes the live width into it. */
    readoutRef,
  };
}

export type Viewport = ReturnType<typeof useViewport>;

const iconButton =
  "press relative inline-grid size-8 place-items-center rounded-lg text-[var(--muted)] transition-[color,background-color,box-shadow] duration-200 hover:bg-[var(--panel)] hover:text-[var(--fg)] hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

/** A hairline between groups in the toolbar. */
const Divider = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={cx("mx-1 h-4 w-[var(--stroke-1)] bg-[var(--line)]", className)} />
);

/**
 * One frame, like the Preview / Code switch next to it: width readout,
 * Desktop / Tablet / Mobile, reset and fullscreen. In Code view the preview
 * tools dim; fullscreen stays.
 */
export function ViewportToolbar({ vp, showPreviewTools }: { vp: Viewport; showPreviewTools: boolean }) {
  const active = DEVICES.findIndex((d) => d.id === vp.mode);
  const [turns, setTurns] = useState(0);
  const off = !showPreviewTools;
  const dim = cx("transition-opacity duration-200", off && "pointer-events-none opacity-40");

  return (
    <div
      role="toolbar"
      aria-label="Preview size"
      className="inline-flex items-center rounded-xl bg-[var(--panel-2)] p-1 shadow-[inset_0_0_0_1px_var(--line)]"
    >
      <span
        ref={vp.readoutRef}
        className={cx("hidden px-2 font-mono text-xs whitespace-pre text-[var(--muted)] tabular-nums lg:inline", dim)}
      />
      <Divider className="hidden lg:block" />

      <div role="group" aria-label="Preview width" className={cx("relative hidden grid-cols-3 sm:inline-grid", dim)}>
        <span
          aria-hidden="true"
          className="card absolute inset-y-0 left-0 w-1/3 rounded-lg transition-[transform,opacity] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ transform: `translateX(${Math.max(active, 0) * 100}%)`, opacity: active < 0 ? 0 : 1 }}
        />
        {DEVICES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={off}
            aria-pressed={vp.mode === id}
            aria-label={label}
            title={label}
            // Pressing the chosen device again goes back to filling the space at 100%.
            onClick={() => vp.pick(vp.mode === id ? "fit" : id)}
            className={cx(
              "press relative z-10 inline-grid size-8 place-items-center rounded-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
              vp.mode === id ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
      <Divider className="hidden sm:block" />

      <button
        type="button"
        disabled={off}
        aria-label="Reset the component"
        title="Reset"
        onClick={() => {
          setTurns((t) => t + 1);
          vp.reset();
        }}
        className={cx(iconButton, dim)}
      >
        <RefreshCcwIcon
          size={16}
          className="transition-transform duration-500 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ transform: `rotate(${turns * -360}deg)` }}
        />
      </button>
      <button
        type="button"
        aria-label="Fullscreen: try it on your whole screen"
        title="Fullscreen"
        onClick={vp.openFull}
        className={iconButton}
      >
        <ArrowExpandIcon size={16} />
      </button>
    </div>
  );
}

/**
 * The preview on a dotted canvas. It renders at the chosen device width; when
 * that is wider than the space (desktop and tablet in the docs column), it is
 * scaled down to fit, like zooming out. The handle on its right edge drags it
 * narrower or wider at 100%.
 */
export function ViewportStage({ vp, children }: { vp: Viewport; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(0);
  // What is on screen now: layout width and scale. Tweens start from here.
  const now = useRef({ w: 0, s: 1 });
  const raf = useRef(0);
  const dragStart = useRef<{ x: number; v: number } | null>(null);
  const { custom, animate, readoutRef, setDragging, full } = vp;
  const fullRef = useRef(full);
  fullRef.current = full;

  // Space available to the preview (the stage minus the handle strip).
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      const cs = getComputedStyle(stage);
      setAvail(stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  /** Draw one state: inner at width w and scale s, frame sized to what shows. */
  const paint = useCallback(
    (w: number, s: number) => {
      const frame = frameRef.current;
      const inner = innerRef.current;
      if (!frame || !inner) return;
      now.current = { w, s };
      inner.style.width = `${w}px`;
      inner.style.transform = s < 1 ? `scale(${s})` : "";
      frame.style.width = `${w * s}px`;
      // Scaled, the inner still takes its full height in layout, so the frame
      // holds the visible height instead. At 100% it just follows the content.
      frame.style.height = s < 1 ? `${inner.offsetHeight * s}px` : "";
      const r = readoutRef.current;
      if (r) r.textContent = `${Math.round(w)}px  ${Math.round(s * 100)}%`;
      // Screen readers hear the handle's width too (a focusable separator needs one).
      frame.querySelector(":scope > [role=separator]")?.setAttribute("aria-valuenow", String(Math.round(w * s)));
    },
    [readoutRef],
  );

  // Where the preview should be for the current mode and space.
  useLayoutEffect(() => {
    // Fullscreen shows the component as it is on your screen: no width, no scale.
    if (full) {
      cancelAnimationFrame(raf.current);
      const frame = frameRef.current;
      const inner = innerRef.current;
      if (frame && inner) {
        frame.style.width = frame.style.height = inner.style.width = inner.style.transform = "";
      }
      return;
    }
    if (!avail) return;
    // Phones hide the width controls, so a width picked on a wider window
    // can't get stuck there: below 640px it always fills the space.
    const mode = matchMedia("(max-width: 639px)").matches ? "fit" : vp.mode;
    const device = DEVICES.find((d) => d.id === mode);
    // Desktop never renders narrower than the space, so fullscreen shows it at 100%.
    const w =
      mode === "fit"
        ? avail
        : mode === "custom"
          ? Math.min(Math.max(custom, MIN), avail)
          : device!.id === "desktop"
            ? Math.max(device!.width, avail)
            : device!.width;
    const s = Math.min(1, avail / w);

    cancelAnimationFrame(raf.current);
    const from = now.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate.current || !from.w || reduce) {
      animate.current = false;
      paint(w, s);
      return;
    }
    animate.current = false;
    // Ease what you see (the visible width) and the layout width together, so
    // the frame never grows past the space while it changes scale.
    const v0 = from.w * from.s;
    const v1 = w * s;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = easeInOut(Math.min(1, (t - t0) / DURATION));
      const lw = from.w + (w - from.w) * k;
      const v = v0 + (v1 - v0) * k;
      paint(lw, Math.min(1, v / lw));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [avail, vp.mode, custom, animate, paint, full]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Content that grows or shrinks while scaled keeps the frame's height right.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const ro = new ResizeObserver(() => {
      if (now.current.w && !fullRef.current) paint(now.current.w, now.current.s);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [paint]);

  const endDrag = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setDragging(false);
    document.documentElement.classList.remove("is-resizing");
  };

  return (
    // pr-5: a 20px strip on the right that holds the drag handle. Fullscreen has neither.
    <div ref={stageRef} className={cx("relative", full ? "flex flex-1 flex-col" : "dots rounded-2xl sm:pr-5")}>
      {/* my-auto centres it on screen, and a tall one still scrolls from its top. */}
      <div ref={frameRef} className={cx("relative w-full", full && "my-auto")}>
        <div ref={innerRef} className="@container w-full origin-top-left">
          <div key={vp.resetKey}>{children}</div>
        </div>

        {!full && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to resize the preview"
            aria-valuemin={MIN}
            aria-valuemax={Math.round(avail) || undefined}
            tabIndex={0}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragStart.current = { x: e.clientX, v: now.current.w * now.current.s };
              setDragging(true);
              document.documentElement.classList.add("is-resizing");
            }}
            onPointerMove={(e) => {
              if (dragStart.current) vp.drag(Math.round(dragStart.current.v + e.clientX - dragStart.current.x));
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            onDoubleClick={() => vp.pick("fit")}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 64 : 16;
              const v = now.current.w * now.current.s;
              if (e.key === "ArrowLeft") vp.drag(Math.max(MIN, Math.round(v - step)));
              else if (e.key === "ArrowRight") vp.drag(Math.round(v + step));
              else if (e.key === "Home") vp.pick("mobile");
              else if (e.key === "End") vp.pick("fit");
              else return;
              e.preventDefault();
            }}
            // Sits on the preview's right edge, half on it, half off, so it reads as part of the item.
            className="group absolute top-1/2 left-full hidden h-12 w-6 -translate-x-1/2 -translate-y-1/2 cursor-col-resize touch-none place-items-center rounded-lg outline-none sm:grid"
          >
            <span
              aria-hidden="true"
              className={cx(
                "card grid grid-cols-2 gap-[3px] rounded px-0.5 py-1 transition-[color,transform] duration-200 ease-[var(--ease-out)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--accent)] motion-reduce:transition-none",
                vp.dragging ? "scale-110 text-[var(--fg)]" : "text-[var(--faint)] group-hover:text-[var(--muted)]",
              )}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="size-[3px] rounded-full bg-current" />
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
