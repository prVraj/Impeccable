"use client";

/**
 * Sleeve Card, from Impeccable.
 *
 * A project card that lifts and turns in 3D under the pointer, and a second card
 * slides out from behind it, like a record from its sleeve, with "View Project"
 * written down its edge. A third, softer card peeks out between them. Give it an
 * `href` and the whole card is one link, or an `onClick` and it is one button.
 *
 * Mouse: hover or focus opens it. Touch: the first tap opens it, the second tap
 * follows the link, a tap anywhere else closes it. Reduced motion: no turn, the
 * tab just fades in.
 *
 * Colors come from your theme: the card from --card (else --background / --bg),
 * the text from --foreground (else --fg), so it follows light and dark mode.
 * One file, React only, CSS transforms, no packages.
 */

import { useEffect, useRef, useState } from "react";

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.22,1,.36,1)"; // quick start, long soft landing
const OPEN_MS = 620; // the card turns and the tab slides out
const TAB_DELAY = 50; // the tab leaves a beat after the card starts to turn
const PAD = 8; // px between the card edge and the picture
const TURN = -16; // deg: the card turns so its right edge comes toward you
const LIFT = 26; // px: and it rises off the page toward you
const SHIFT = -4; // % of its width: it steps left to make room for the tab
const REVEAL = 24; // % of the card width the tab slides out to the right
const TAB_DROP = 4; // % of the card height the tab sits lower
const TAB_TILT = 3; // deg: the tab leans a little
const TAB_SCALE = 0.9; // the tab sits further back, so it looks smaller
const PEEK_REVEAL = 13; // % the middle card slides out
const PEEK_RISE = -3; // % the middle card sits higher
const PEEK_SCALE = 0.95;
const PRESS = 0.97; // the card gives a little under a press
const TUCK = "translateX(-4%) scale(.92)"; // at rest the cards behind sit fully inside, so no colored edge shows

/** Default colors: a soft lavender tab, a sage card between, both mixed into your page in dark mode. */
const ACCENT = "#a48bf7";
const ACCENT_TEXT = "#1a1233";
const PEEK = "color-mix(in oklab, #b7c6aa 72%, var(--slc-bg))";

const CSS = `
.slc { --slc-fg: var(--foreground, var(--fg, CanvasText)); --slc-bg: var(--background, var(--bg, Canvas)); --slc-card: var(--card, var(--panel, var(--slc-bg)));
  position: relative; display: block; width: 100%; box-sizing: border-box; container-type: inline-size; color: var(--slc-fg); text-decoration: none; text-align: start;
  font: inherit; margin: 0; padding: 0; border: 0; background: none; outline: none; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; }
.slc[data-link="true"] { cursor: pointer; }
.slc:focus-visible .slc-card { box-shadow: 0 0 0 2px var(--slc-card), 0 0 0 4px color-mix(in oklab, var(--slc-fg) 55%, transparent), var(--slc-shadow-open); }
.slc-card { position: relative; z-index: 2; display: block; box-sizing: border-box; height: 100%; padding: ${PAD}px; border-radius: var(--slc-r); background: var(--slc-card);
  box-shadow: var(--slc-shadow); transform: perspective(900px); transition: transform ${OPEN_MS}ms ${EASE}, box-shadow ${OPEN_MS}ms ${EASE}; backface-visibility: hidden; }
.slc-pic { position: relative; display: block; overflow: hidden; aspect-ratio: 1 / 1.04; border-radius: max(0px, calc(var(--slc-r) - ${PAD}px)); background: color-mix(in oklab, var(--slc-fg) 6%, var(--slc-card)); }
.slc-pic img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; display: block; pointer-events: none; -webkit-user-drag: none; user-select: none; }
.slc-tag { position: absolute; top: ${PAD}px; right: ${PAD}px; max-width: calc(100% - ${PAD * 2}px); box-sizing: border-box; padding: .3em .85em; border-radius: 999px; background: var(--slc-accent); color: var(--slc-on-accent);
  font-size: clamp(10px, 4.2cqi, 13px); font-weight: 500; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slc-body { display: block; padding: clamp(8px, 4.6cqi, 14px) clamp(4px, 2.6cqi, 8px) clamp(4px, 2.2cqi, 8px); }
.slc-title { display: block; font-size: clamp(13px, 6.6cqi, 20px); font-weight: 500; line-height: 1.25; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slc-meta { display: block; margin-top: .35em; font-size: clamp(10px, 4.3cqi, 13px); line-height: 1.35; color: color-mix(in oklab, var(--slc-fg) 58%, transparent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slc-stat { color: color-mix(in oklab, var(--slc-fg) 78%, transparent); font-variant-numeric: tabular-nums; margin-right: .55em; }
.slc-back { position: absolute; inset: 0; display: block; border-radius: var(--slc-r); transform-origin: 100% 50%; transform: ${TUCK}; transition: transform ${OPEN_MS}ms ${EASE}; }
.slc-peek { z-index: 0; background: var(--slc-peek); }
.slc-tab { z-index: 1; background: var(--slc-accent); color: var(--slc-on-accent); box-shadow: 0 10px 24px -14px rgba(0,0,0,.35); }
.slc-label { position: absolute; top: 9%; right: calc(${REVEAL / 2}% / ${TAB_SCALE}); max-height: 82%; transform: translateX(50%) rotate(180deg); writing-mode: vertical-rl;
  font-size: clamp(9px, 4.2cqi, 13px); font-weight: 600; letter-spacing: .08em; line-height: 1; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* Open: the card turns toward you and rises, the tab and the middle card slide out from behind. */
.slc[data-open="true"], .slc:focus-visible { z-index: 3; }
.slc[data-open="true"] .slc-card, .slc:focus-visible .slc-card { transform: perspective(900px) translateX(${SHIFT}%) translateZ(${LIFT}px) rotateY(${TURN}deg); box-shadow: var(--slc-shadow-open); }
.slc[data-open="true"] .slc-tab, .slc:focus-visible .slc-tab { transform: translate(${REVEAL}%, ${TAB_DROP}%) rotate(${TAB_TILT}deg) scale(${TAB_SCALE}); transition-delay: ${TAB_DELAY}ms; }
.slc[data-open="true"] .slc-peek, .slc:focus-visible .slc-peek { transform: translate(${PEEK_REVEAL}%, ${PEEK_RISE}%) scale(${PEEK_SCALE}); }
.slc[data-link="true"][data-pressed="true"] .slc-card { transform: perspective(900px) translateX(${SHIFT}%) translateZ(${LIFT}px) rotateY(${TURN}deg) scale(${PRESS}); transition-duration: 160ms; }
@media (hover: hover) {
  .slc:hover { z-index: 3; }
  .slc:hover .slc-card { transform: perspective(900px) translateX(${SHIFT}%) translateZ(${LIFT}px) rotateY(${TURN}deg); box-shadow: var(--slc-shadow-open); }
  .slc:hover .slc-tab { transform: translate(${REVEAL}%, ${TAB_DROP}%) rotate(${TAB_TILT}deg) scale(${TAB_SCALE}); transition-delay: ${TAB_DELAY}ms; }
  .slc:hover .slc-peek { transform: translate(${PEEK_REVEAL}%, ${PEEK_RISE}%) scale(${PEEK_SCALE}); }
}
/* Reduced motion: nothing turns or slides, the tab simply fades in at its place. */
@media (prefers-reduced-motion: reduce) {
  .slc .slc-card { transform: none !important; transition: box-shadow .2s linear; }
  .slc .slc-back { transform: translate(${REVEAL}%, 0) scale(${TAB_SCALE}) !important; opacity: 0; visibility: hidden; transition: opacity .2s linear, visibility 0s .2s; }
  .slc .slc-peek { display: none; }
  .slc[data-open="true"] .slc-tab, .slc:focus-visible .slc-tab { opacity: 1; visibility: visible; transition: opacity .2s linear; }
}
@media (prefers-reduced-motion: reduce) and (hover: hover) {
  .slc:hover .slc-tab { opacity: 1; visibility: visible; transition: opacity .2s linear; }
}`;

/** Card shadows: a hairline edge and a soft drop, deeper once it rises. Stronger on a dark page. */
const SHADOW = {
  rest: "0 0 0 1px color-mix(in oklab, var(--slc-fg) 7%, transparent), 0 1px 2px rgba(0,0,0,.06), 0 10px 24px -14px rgba(0,0,0,.22)",
  open: "0 0 0 1px color-mix(in oklab, var(--slc-fg) 7%, transparent), 0 2px 4px rgba(0,0,0,.06), -14px 28px 48px -18px rgba(0,0,0,.32)",
};

export function SleeveCard({
  image,
  title,
  tag,
  stat,
  statLabel,
  label = "View Project",
  href,
  target,
  onClick,
  open,
  accent = ACCENT,
  accentText = ACCENT_TEXT,
  peek = PEEK,
  radius = 20,
  className,
  style,
}) {
  const rootRef = useRef(null);
  const imgRef = useRef(null);
  const touch = useRef(false); // the last press was a finger
  const [tapped, setTapped] = useState(false); // opened by a first tap
  const [pressed, setPressed] = useState(false);
  const [broken, setBroken] = useState(null); // a picture that failed to load: show the soft placeholder instead
  const interactive = !!(href || onClick);

  // A picture that failed before the page woke up never fires onError, so check it once here.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setBroken(image.src);
  }, [image.src]);

  // A tap anywhere else closes a card opened by a tap.
  useEffect(() => {
    if (!tapped) return;
    const away = (e) => {
      if (!rootRef.current?.contains(e.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [tapped]);

  const handleClick = (e) => {
    // On a touch screen there is no hover, so the first tap only opens it.
    if (touch.current && !tapped && !open) {
      e.preventDefault();
      setTapped(true);
      return;
    }
    onClick?.(e);
  };

  const content = (
    <>
      <style>{CSS}</style>
      <span className="slc-back slc-peek" aria-hidden="true" />
      <span className="slc-back slc-tab">
        <span className="slc-label">{label}</span>
      </span>
      <span className="slc-card">
        <span className="slc-pic">
          {broken !== image.src && (
            // eslint-disable-next-line @next/next/no-img-element -- one plain picture, any source
            <img
              ref={imgRef}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setBroken(image.src)}
            />
          )}
          {tag != null && <span className="slc-tag">{tag}</span>}
        </span>
        <span className="slc-body">
          <span className="slc-title">{title}</span>
          {(stat != null || statLabel != null) && (
            <span className="slc-meta">
              {stat != null && <span className="slc-stat">{stat}</span>}
              {statLabel}
            </span>
          )}
        </span>
      </span>
    </>
  );

  const shared = {
    className: `slc${className ? ` ${className}` : ""}`,
    "data-open": open || tapped ? "true" : "false",
    "data-link": interactive ? "true" : "false",
    "data-pressed": pressed ? "true" : "false",
    "aria-label": typeof title === "string" ? `${label.trim()}: ${title}` : undefined,
    style: {
      "--slc-r": `${radius}px`,
      "--slc-accent": accent,
      "--slc-on-accent": accentText,
      "--slc-peek": peek,
      "--slc-shadow": SHADOW.rest,
      "--slc-shadow-open": SHADOW.open,
      ...style,
    },
    onPointerDown: (e) => {
      touch.current = e.pointerType === "touch";
      if (interactive && e.button === 0) setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
    onBlur: () => setTapped(false),
    onClick: handleClick,
  };

  if (href) {
    return (
      <a
        ref={rootRef}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        draggable={false}
        {...shared}
      >
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button ref={rootRef} type="button" {...shared}>
        {content}
      </button>
    );
  }
  return (
    <div ref={rootRef} {...shared} aria-label={undefined}>
      {content}
    </div>
  );
}
export default SleeveCard;
