"use client";

import { useEffect } from "react";

// Site-wide click burst: on every mouse click, four short brand lines shoot out above the
// pointer tip and fade. It is part of the docs site, not a library item.
//
// Kept light on purpose: nothing renders until the first click, each burst is four tiny
// spans in one fixed layer (pointer-events none, so clicks, drags and text selection pass
// straight through), the motion is transform + opacity only, and every burst removes
// itself when its animation ends. Touch and reduced motion get nothing.

// Ray directions in degrees from straight up (minus = left), read off the reference video.
const RAYS = [-58, -24, 14, 48];
const LENGTH = 11; // px, line length at the start
const FROM = 18; // px, gap between the pointer tip and the inner end of a line at the start
const TO = 40; // px, where the inner end ends up
const DURATION = 420; // ms
const MAX_BURSTS = 8; // fast clicking never piles up more than this

export function ClickBurst() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let layer: HTMLDivElement | null = null;

    const onDown = (e: PointerEvent) => {
      // Mouse and pen only: on touch the finger hides it and it reads as noise.
      if (e.pointerType === "touch" || e.button !== 0 || reduce.matches) return;
      // Venom button swaps the pointer for a drawn one while held, so the real tip is elsewhere.
      if (document.documentElement.hasAttribute("data-venom-hold")) return;
      // A Click Pop demo on the page draws its own pop there.
      if ((e.target as Element | null)?.closest?.("[data-click-pop]")) return;

      if (!layer || !layer.isConnected) {
        layer = document.createElement("div");
        layer.setAttribute("aria-hidden", "true");
        layer.style.cssText =
          "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;contain:strict";
        document.body.appendChild(layer);
      }
      while (layer.childElementCount >= MAX_BURSTS) layer.firstElementChild?.remove();

      // brand-300 matches the reference on dark; on light it gets a touch of brand-400 so it
      // doesn't wash out on the pale background.
      const dark = document.documentElement.classList.contains("dark");
      const color = dark ? "var(--brand-300)" : "color-mix(in oklab, var(--brand-300) 75%, var(--brand-400))";

      const burst = document.createElement("div");
      burst.style.cssText = `position:absolute;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0`;
      let last: Animation | null = null;
      for (const angle of RAYS) {
        const ray = document.createElement("span");
        // The span's bottom centre sits on the pointer tip, so rotate + translateY moves it
        // out along its ray, and scaleY shrinks it toward its inner end (it ends as a dot).
        ray.style.cssText = `position:absolute;left:-1px;top:-${LENGTH}px;width:2px;height:${LENGTH}px;border-radius:1px;background:${color};transform-origin:50% 100%;will-change:transform,opacity`;
        burst.appendChild(ray);
        last = ray.animate(
          [
            { transform: `rotate(${angle}deg) translateY(-${FROM}px) scaleY(1)`, opacity: 1 },
            { opacity: 1, offset: 0.55 },
            { transform: `rotate(${angle}deg) translateY(-${TO}px) scaleY(0.15)`, opacity: 0 },
          ],
          { duration: DURATION, easing: "cubic-bezier(0.25, 0.5, 0.4, 1)", fill: "forwards" },
        );
      }
      layer.appendChild(burst);
      if (last) last.onfinish = () => burst.remove();
      else burst.remove();
    };

    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown, { capture: true });
      layer?.remove();
    };
  }, []);

  return null;
}
