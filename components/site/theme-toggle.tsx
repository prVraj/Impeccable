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

// How long the circle takes to cover the screen, and its curve: exponential
// ease-in, slow at the start and fast at the end.
const REVEAL_MS = 500;
const REVEAL_EASE = "cubic-bezier(0.7, 0, 0.84, 0)";

type VT = { ready: Promise<void>; finished: Promise<void> };

// Switch theme with a circle at the bulb: to light, a light circle grows out
// of it until it covers the screen; to dark, the light page shrinks back
// into it.
// Browsers without View Transitions, and people who ask for less motion,
// get an instant switch.
function revealTheme(next: "light" | "dark", x: number, y: number, during: () => void = () => {}, done: () => void = () => {}) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const html = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced || html.classList.contains("theme-reveal")) {
    setTheme(next);
    during();
    done();
    return;
  }

  // Far enough to reach the farthest corner of the screen.
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  // To light: the light page grows out of the bulb on top of the dark one.
  // To dark: the light page sits on top and squeezes back into the bulb.
  const squeeze = next === "dark";
  const small = `circle(0px at ${x}px ${y}px)`;
  const big = `circle(${r}px at ${x}px ${y}px)`;
  html.classList.add("theme-reveal");
  html.classList.toggle("theme-squeeze", squeeze);
  const t = doc.startViewTransition(() => {
    setTheme(next);
    during();
  });
  t.ready
    .then(() => {
      html.animate(
        { clipPath: squeeze ? [big, small] : [small, big] },
        {
          duration: REVEAL_MS,
          easing: REVEAL_EASE,
          fill: "forwards",
          pseudoElement: squeeze ? "::view-transition-old(root)" : "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
  t.finished.finally(() => {
    html.classList.remove("theme-reveal", "theme-squeeze");
    done();
  });
}

// How long the shards take to fly back in when the bulb mends.
const MEND_MS = 320;

// The bulb hangs below the header from its bottom line. This wrapper fills
// the header's height so the bulb's wire starts exactly on that line.
// Dark to light: the bulb bursts and, in the same moment, the light page
// grows out of it. Light to dark: the light page squeezes back into the
// bulb first, and only then do the shards fly back and the bulb is whole.
export function ThemeToggle() {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (btn.dataset.busy) return;
    const box = btn.getBoundingClientRect();
    // The circle starts from the middle of the glass, near the bottom.
    const x = box.left + box.width / 2;
    const y = box.top + box.height * 0.76;
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    btn.dataset.busy = "1";
    const free = (...cls: string[]) => {
      btn.classList.remove(...cls);
      delete btn.dataset.busy;
    };
    if (next === "light") {
      revealTheme("light", x, y, () => btn.classList.add("is-breaking"), () => free("is-breaking"));
      return;
    }
    // Dark, but the bulb stays broken and off until the light has gone.
    revealTheme(
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
