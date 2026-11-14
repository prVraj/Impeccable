"use client";

/**
 * Peephole-button, from Impeccable.
 *
 * A glassy button with a small window (the slot) that shows a picture. Two types:
 *
 *   - "reveal": the button is frosted glass tinted by your picture, and the picture
 *     shows sharp only inside the slot. On hover the slot stretches open across the
 *     whole button and the full picture shows through the glass.
 *   - "fill": your own picture (an avatar or logo) sits in the slot on a clear glass
 *     button. On hover a fill of your brand color pours out of the slot across the
 *     button, and the label turns white exactly where the color has reached.
 *
 * The slot can be a circle or a square, sit on the left or the right, and take
 * any size. Phones have no hover, so pressing opens it and it closes a moment
 * after the finger lifts. Keyboard focus opens it too.
 *
 * No packages and no animation loop: the opening is one CSS clip-path transition.
 */

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

export type PeepholeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The picture: the whole picture in "reveal", your avatar or logo in "fill". Any image URL. */
  image?: string;
  /** "reveal" opens the whole picture on hover. "fill" pours your brand color out of the slot on hover. Default "reveal". */
  variant?: "reveal" | "fill";
  /** The slot's shape. "circle" makes a round slot in a pill. "square" makes a rounded square slot in a rounded button. Default "circle". */
  shape?: "circle" | "square";
  /** Which end the slot sits at. Default "left". */
  side?: "left" | "right";
  /** The slot's size in px, from 20 to 80. The button grows to keep 6px around it. Default 32. */
  slotSize?: number;
  /** The button's corner radius in px when shape is "square". The slot's corners follow, minus the space around it. Default 12. */
  radius?: number;
  /** A small icon drawn in the middle of the slot, over the picture. */
  icon?: ReactNode;
  /** "fill" only: the color that pours out of the slot. Any CSS color, including var(--…). Default the Impeccable violet. */
  fillColor?: string;
  /** "fill" only: the label color where the fill has reached. Default white. */
  fillTextColor?: string;
  /** The label color at rest. Default white in "reveal", and black or white to suit the theme in "fill". */
  textColor?: string;
};

/* ---------- tuning (the design: keep as written) ---------- */

const MIN_H = 44; // px: the button's height, unless the slot needs more
const GAP = 6; // px: the least space around the slot, so the picture has room to breathe
const SLOT_MIN = 20; // px
const SLOT_MAX = 80; // px
const LINGER_MS = 700; // on touch: how long it stays open after the finger lifts

/** Styles that can't be inline: layers, the open and close transitions, theme, focus, disabled and reduced motion. */
const CSS = `
.iph { --iph-theme-text: rgb(10 10 10); --iph-theme-glass: rgb(255 255 255 / .55); --iph-theme-edge: rgb(0 0 0 / .08); --iph-theme-wash: rgb(0 0 0 / .1); --iph-theme-empty: rgb(0 0 0 / .08); --iph-sheen: rgb(255 255 255 / .22); --iph-top: rgb(255 255 255 / .35); --iph-top-pic: rgb(255 255 255 / .45); --iph-edge-pic: rgb(255 255 255 / .22); }
:is(.dark, [data-theme="dark"]) .iph { --iph-theme-text: rgb(255 255 255); --iph-theme-glass: rgb(255 255 255 / .07); --iph-theme-edge: rgb(255 255 255 / .12); --iph-theme-wash: rgb(0 0 0 / .28); --iph-theme-empty: rgb(255 255 255 / .1); --iph-sheen: rgb(255 255 255 / .05); --iph-top: rgb(255 255 255 / .1); --iph-top-pic: rgb(255 255 255 / .16); --iph-edge-pic: rgb(255 255 255 / .14); }
.iph { --iph-ease-open: cubic-bezier(.22,1,.36,1); --iph-ease-close: cubic-bezier(.4,0,.2,1); --iph-open: 560ms; --iph-close: 420ms;
  position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%;
  height: var(--iph-h); padding: 0 var(--iph-pr) 0 var(--iph-pl); border: 0; border-radius: var(--iph-r); overflow: hidden; isolation: isolate;
  background: var(--iph-theme-glass); -webkit-backdrop-filter: blur(14px) saturate(1.6); backdrop-filter: blur(14px) saturate(1.6);
  box-shadow: 0 1px 2px rgb(0 0 0 / .08), 0 6px 16px -4px rgb(0 0 0 / .14);
  color: var(--iph-text, var(--iph-theme-text)); font: inherit; font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
  cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; transition: scale .18s cubic-bezier(.23,1,.32,1); }
.iph[data-variant="reveal"]:not([data-empty]) { color: var(--iph-text, rgb(255 255 255)); }
.iph[data-side="left"] { --iph-x0: var(--iph-i); --iph-x1: calc(100% - var(--iph-i) - var(--iph-s)); }
.iph[data-side="right"] { --iph-x0: calc(100% - var(--iph-i) - var(--iph-s)); --iph-x1: var(--iph-i); }
/* glass: a sheen on the top half and a bright edge, over everything */
.iph::after { content: ""; position: absolute; inset: 0; z-index: 5; border-radius: inherit; pointer-events: none;
  background: linear-gradient(to bottom, var(--iph-sheen), rgb(255 255 255 / 0) 55%);
  box-shadow: inset 0 0 0 1px var(--iph-theme-edge), inset 0 1px 0 var(--iph-top); }
.iph[data-variant="reveal"]::after { box-shadow: inset 0 0 0 1px var(--iph-edge-pic), inset 0 1px 0 var(--iph-top-pic); }
/* reveal: frosted glass tinted by the picture */
.iph-frost { position: absolute; inset: 0; z-index: 0; overflow: hidden; border-radius: inherit; clip-path: inset(0 round var(--iph-r)); pointer-events: none; }
.iph-frost img { width: 100%; height: 100%; object-fit: cover; scale: 1.4; filter: blur(16px) saturate(1.35); }
.iph-frost::after { content: ""; position: absolute; inset: 0; background: var(--iph-theme-wash); }
/* the window: shows the slot at rest and stretches over the whole button when open */
.iph-open { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 0 var(--iph-pr) 0 var(--iph-pl); pointer-events: none;
  clip-path: inset(var(--iph-i) var(--iph-x1) var(--iph-i) var(--iph-x0) round var(--iph-sr));
  transition: clip-path var(--iph-close) var(--iph-ease-close); }
.iph-pic { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; scale: 1.12; transition: scale var(--iph-close) var(--iph-ease-close); }
.iph-scrim { position: absolute; inset: 0; background: linear-gradient(to bottom, rgb(0 0 0 / .18), rgb(0 0 0 / .42)); opacity: 0; transition: opacity var(--iph-close) var(--iph-ease-close); }
.iph-fill { position: absolute; inset: 0; background: var(--iph-fill, rgb(72 29 232)); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .25); }
.iph-empty { position: absolute; inset: 0; background: var(--iph-theme-empty); }
/* the slot's own ring, the avatar and the icon */
.iph-slot { position: absolute; z-index: 3; top: 50%; translate: 0 -50%; width: var(--iph-s); height: var(--iph-s); border-radius: var(--iph-sr); overflow: hidden; pointer-events: none;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .45); display: grid; place-items: center; color: rgb(255 255 255); }
.iph[data-side="left"] .iph-slot { left: var(--iph-i); }
.iph[data-side="right"] .iph-slot { right: var(--iph-i); }
.iph-slot > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.iph-slot > .iph-icon { position: relative; display: grid; place-items: center; width: 55%; height: 55%; filter: drop-shadow(0 1px 2px rgb(0 0 0 / .35)); }
.iph-slot > .iph-icon > svg { width: 100%; height: 100%; }
.iph[data-variant="fill"] .iph-slot { box-shadow: inset 0 0 0 1px rgb(0 0 0 / .1); }
.iph-label { position: relative; z-index: 4; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.iph[data-variant="reveal"]:not([data-empty]) .iph-label { text-shadow: 0 1px 2px rgb(0 0 0 / .35); }
.iph[data-variant="fill"] .iph-label { z-index: 1; }
.iph-open > .iph-label { color: var(--iph-fill-text, rgb(255 255 255)); }
/* open: on hover (mouse), on touch press, and on keyboard focus */
.iph[data-open] .iph-open { clip-path: inset(0 0 0 0 round var(--iph-r)); transition: clip-path var(--iph-open) var(--iph-ease-open); }
.iph[data-open] .iph-pic { scale: 1; transition: scale var(--iph-open) var(--iph-ease-open); }
.iph[data-open] .iph-scrim { opacity: 1; transition: opacity var(--iph-open) var(--iph-ease-open); }
@media (hover: hover) {
  .iph:hover:not(:disabled) .iph-open { clip-path: inset(0 0 0 0 round var(--iph-r)); transition: clip-path var(--iph-open) var(--iph-ease-open); }
  .iph:hover:not(:disabled) .iph-pic { scale: 1; transition: scale var(--iph-open) var(--iph-ease-open); }
  .iph:hover:not(:disabled) .iph-scrim { opacity: 1; transition: opacity var(--iph-open) var(--iph-ease-open); }
}
.iph:focus-visible .iph-open { clip-path: inset(0 0 0 0 round var(--iph-r)); transition: clip-path var(--iph-open) var(--iph-ease-open); }
.iph:focus-visible .iph-pic { scale: 1; }
.iph:focus-visible .iph-scrim { opacity: 1; }
.iph:active:not(:disabled) { scale: .97; }
.iph:focus-visible { outline: 2px solid var(--iph-theme-text); outline-offset: 3px; }
.iph:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) {
  .iph, .iph .iph-open, .iph .iph-pic, .iph .iph-scrim, .iph:hover .iph-open, .iph:hover .iph-pic, .iph:hover .iph-scrim, .iph[data-open] .iph-open, .iph[data-open] .iph-pic, .iph[data-open] .iph-scrim, .iph:focus-visible .iph-open { transition: none; }
  .iph .iph-pic { scale: 1; }
  .iph:active:not(:disabled) { scale: 1; }
}`;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const PeepholeButton = forwardRef<HTMLButtonElement, PeepholeButtonProps>(function PeepholeButton(
  {
    image,
    variant = "reveal",
    shape = "circle",
    side = "left",
    slotSize = 32,
    radius = 12,
    icon,
    fillColor,
    fillTextColor,
    textColor,
    children,
    className,
    style,
    type = "button",
    disabled,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  // A picture that fails to load falls back to plain glass and an empty slot.
  const [failed, setFailed] = useState<string | null>(null);
  const pic = image && failed !== image ? image : null;
  const onError = () => setFailed(image ?? null);
  // A picture can fail before the page is interactive, when onError isn't listening yet: check once after mount.
  const btn = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const imgs = btn.current?.querySelectorAll("img") ?? [];
    for (const img of imgs) if (img.complete && img.naturalWidth === 0) setFailed(image ?? null);
  }, [image]);

  // Touch has no hover: a press opens it, and it closes a moment after the finger lifts.
  const [peek, setPeek] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    if (e.pointerType === "mouse" || disabled) return;
    clearTimeout(timer.current);
    setPeek(true);
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.type === "pointerup") onPointerUp?.(e);
    else if (e.type === "pointercancel") onPointerCancel?.(e);
    else onPointerLeave?.(e);
    if (e.pointerType === "mouse") return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeek(false), LINGER_MS);
  };

  // Geometry: the slot keeps at least GAP px around it; nested corners follow outer radius minus the space between.
  const s = clamp(Number.isFinite(slotSize) ? slotSize : 32, SLOT_MIN, SLOT_MAX);
  const h = Math.max(MIN_H, s + GAP * 2);
  const i = (h - s) / 2;
  const square = shape === "square";
  const r = square ? clamp(Number.isFinite(radius) ? radius : 12, 0, h / 2) : h / 2;
  const sr = square ? Math.max(2, r - i) : s / 2;
  const label = children !== undefined && children !== null && children !== false && children !== "";
  const near = i + s + (label ? 10 : 0); // label padding on the slot's side
  const far = label ? (square ? 16 : 18) : i; // and on the other side (no label: just the slot, with even space round it)

  const fill = variant === "fill";

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={(node) => {
          btn.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type={type}
        disabled={disabled}
        className={className ? `iph ${className}` : "iph"}
        data-variant={fill ? "fill" : "reveal"}
        data-side={side === "right" ? "right" : "left"}
        data-empty={pic ? undefined : ""}
        data-open={peek && !disabled ? "" : undefined}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        style={
          {
            "--iph-h": `${h}px`,
            "--iph-s": `${s}px`,
            "--iph-i": `${i}px`,
            "--iph-r": `${r}px`,
            "--iph-sr": `${sr}px`,
            "--iph-pl": `${side === "right" ? far : near}px`,
            "--iph-pr": `${side === "right" ? near : far}px`,
            ...(textColor ? { "--iph-text": textColor } : null),
            ...(fillColor ? { "--iph-fill": fillColor } : null),
            ...(fillTextColor ? { "--iph-fill-text": fillTextColor } : null),
            ...style,
          } as CSSProperties
        }
        {...rest}
      >
        {!fill && pic ? (
          <span className="iph-frost" aria-hidden="true">
            <img src={pic} alt="" decoding="async" draggable={false} onError={onError} />
          </span>
        ) : null}

        {fill ? <span className="iph-label">{children}</span> : null}

        <span className="iph-open" aria-hidden="true">
          {fill ? (
            <>
              <span className="iph-fill" />
              <span className="iph-label">{children}</span>
            </>
          ) : pic ? (
            <>
              <img className="iph-pic" src={pic} alt="" decoding="async" draggable={false} onError={onError} />
              <span className="iph-scrim" />
            </>
          ) : (
            <span className="iph-empty" />
          )}
        </span>

        <span className="iph-slot" aria-hidden="true">
          {fill ? (
            pic ? (
              <img src={pic} alt="" decoding="async" draggable={false} onError={onError} />
            ) : (
              <span className="iph-empty" />
            )
          ) : null}
          {icon ? <span className="iph-icon">{icon}</span> : null}
        </span>

        {!fill ? <span className="iph-label">{children}</span> : null}
      </button>
    </>
  );
});
