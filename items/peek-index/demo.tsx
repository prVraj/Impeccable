"use client";

import { useSyncExternalStore } from "react";
import { PeekIndex, type PeekIndexItem } from "./peek-index";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
export function useDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
}

/** Four of Impeccable's own groups. Pictures are the /components stills of one item in each (3:2 WebP, light and dark, 5 to 25KB each), so nothing new to load. */
export const DEMO_ITEMS: PeekIndexItem[] = [
  {
    title: "Components",
    description:
      "Galleries, lists and small pieces of UI that move like they were made by hand. Each one is a single React file you paste in, with no extra packages to install.",
    points: ["Orrery Gallery", "Spotlight Ticker", "Peek List", "Rolling clock"],
    media: { src: "/previews/orrery-gallery-light.webp", alt: "Orrery Gallery, round pictures orbiting in a ring" },
    link: { label: "Open Orrery Gallery", href: "/docs/orrery-gallery" },
  },
  {
    title: "Buttons",
    description:
      "Buttons with a little story in every click: they crack, shatter, glow or peek while they load, then settle back calmly. Made for the one action that matters on the page.",
    points: ["Kitcut button", "Comet button", "Glass Shatter button", "Peephole button"],
    media: { src: "/previews/kitcut-button-light.webp", alt: "Kitcut button, a purple button split in two with dots in the gap" },
    link: { label: "Open Kitcut button", href: "/docs/kitcut-button" },
  },
  {
    title: "Sections",
    description:
      "Whole parts of a page, ready to drop in: stats, reviews and questions that move with the scroll and the pointer. Your words and pictures go in, the motion stays.",
    points: ["Window Stats", "Reel Stats", "Capsule Testimonials", "Coffee FAQ"],
    media: { src: "/previews/window-stats-light.webp", alt: "Window Stats, a photo card with a big number sliding over the page" },
    link: { label: "Open Window Stats", href: "/docs/window-stats" },
  },
  {
    title: "Animations",
    description:
      "Moments people remember: a refresh that falls into a black hole, a screen that burns away, an agent that draws. Use one where the page needs a little wonder.",
    points: ["Black Hole Refresh", "Puzzle Refresh", "Burning Screen", "Agent Draw"],
    media: { src: "/previews/black-hole-refresh-light.webp", alt: "Black Hole Refresh, a black hole pulling a page into thin threads" },
    link: { label: "Open Black Hole Refresh", href: "/docs/black-hole-refresh" },
  },
];

/** The pictures for the current theme: "x-light.webp" or "x-dark.webp". */
export function themed(items: PeekIndexItem[], dark: boolean) {
  return dark ? items.map((it) => ({ ...it, media: { ...it.media, src: it.media.src.replace("-light.webp", "-dark.webp") } })) : items;
}

export function PeekIndexDemo() {
  const dark = useDark();
  return (
    <div className="peek-index-demo flex w-full justify-center px-4 pt-6 pb-10 @min-[40rem]:px-10 @min-[40rem]:pb-14">
      {/* Room above the list for the picture that floats over the first row; phones never show it, so they skip the room. */}
      <style>{`@media (hover: hover) and (pointer: fine) { .peek-index-demo { padding-top: 10.5rem; } }`}</style>
      <div className="w-full max-w-[48rem]">
        <PeekIndex items={themed(DEMO_ITEMS, dark)} aria-label="Impeccable groups" />
      </div>
    </div>
  );
}
