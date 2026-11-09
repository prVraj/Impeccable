"use client";

import type { MouseEvent } from "react";
import { Bulb } from "./bulb";

export function setTheme(next: "light" | "dark") {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export function currentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Switch the theme in one frame with every CSS transition paused, so hundreds
// of elements don't each fade their colours (that is what makes a theme
// change stutter). Animations, like the bulb's shards, keep running.
function swapTheme(next: "light" | "dark") {
  const pause = document.createElement("style");
  pause.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(pause);
  setTheme(next);
  // Make the browser apply the new colours now, while transitions are off.
  void window.getComputedStyle(document.body).color;
  requestAnimationFrame(() => pause.remove());
}

// How long the new theme takes to spread from the bulb over the whole page.
const SPREAD_MS = 500;
const SPREAD_EASE = "ease-out";
// Going dark plays the spread backwards, so its curve is the mirror: ease-in.
const SQUEEZE_EASE = "ease-in";
// How long the shards take to fly back in when the bulb mends.
const MEND_MS = 320;

type VT = { ready: Promise<void>; finished: Promise<void> };

// To light, the light page spreads out of the bulb as a growing circle. To
// dark, the light page squeezes back into the bulb. This
// uses the browser's View Transitions: it clips the browser's own snapshot of
// the new page, so nothing extra is drawn on the page. Browsers without View
// Transitions get the instant swap.
function spreadTheme(next: "light" | "dark", x: number, y: number, during: () => void, done: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const html = document.documentElement;
  if (!doc.startViewTransition) {
    swapTheme(next);
    during();
    done();
    return;
  }
  // Far enough to reach the farthest corner of the screen.
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  // Turn off the browser's default crossfade, so the old page stays exactly as
  // it is until the circle reaches it. This lives here, not in globals.css, so
  // it can't be missing from a stale stylesheet.
  const still = document.createElement("style");
  // To dark the light page shrinks back into the bulb, so it sits on top.
  const squeeze = next === "dark";
  still.textContent =
    "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}" +
    (squeeze ? "::view-transition-old(root){z-index:1}" : "");
  document.head.appendChild(still);
  const t = doc.startViewTransition(() => {
    swapTheme(next);
    during();
  });
  let clip: Animation | undefined;
  t.ready
    .then(() => {
      const small = `circle(0px at ${x}px ${y}px)`;
      const big = `circle(${r}px at ${x}px ${y}px)`;
      // To light: the light grows out of the bulb (ease-out).
      // To dark: the exact reverse, the light squeezes back into the bulb.
      clip = html.animate(
        { clipPath: squeeze ? [big, small] : [small, big] },
        {
          duration: SPREAD_MS,
          easing: squeeze ? SQUEEZE_EASE : SPREAD_EASE,
          fill: "forwards",
          pseudoElement: squeeze ? "::view-transition-old(root)" : "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
  t.finished.finally(() => {
    // The clip holds its last frame ("forwards") so nothing flashes at the
    // end; cancel it now, or it would still clip the next switch.
    clip?.cancel();
    still.remove();
    done();
  });
}

// The bulb hangs below the header from its bottom line. This wrapper fills
// the header's height so the bulb's wire starts exactly on that line.
// Dark to light: the bulb bursts as the light spreads out of it. Light to
// dark: the light squeezes back into the bulb, then the shards fly back.
export function ThemeToggle() {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (btn.dataset.busy) return;
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    // The circle starts from the middle of the glass.
    const box = btn.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height * 0.76;
    btn.dataset.busy = "1";
    const free = (...cls: string[]) => {
      btn.classList.remove(...cls);
      delete btn.dataset.busy;
    };
    if (next === "light") {
      // The bulb bursts as the light spreads out of it.
      spreadTheme(
        "light",
        x,
        y,
        () => btn.classList.add("is-breaking"),
        () => free("is-breaking"),
      );
      return;
    }
    // The light squeezes back into the bulb, still broken; then it mends.
    spreadTheme(
      "dark",
      x,
      y,
      () => btn.classList.add("is-broken"),
      () => {
        btn.classList.add("is-mending");
        setTimeout(() => free("is-broken", "is-mending"), MEND_MS);
      },
    );
  };

  return (
    <div className="relative w-10 self-stretch">
      <button
        type="button"
        onClick={onClick}
        className="group absolute left-[6px] top-full block w-7 text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        aria-label="Switch between light and dark"
      >
        <Bulb className="block h-auto w-7" />
      </button>
    </div>
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;
