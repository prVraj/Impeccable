"use client";

import { useSyncExternalStore } from "react";
import { PeekList, type PeekListItem } from "./peek-list";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
export function useDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
}

/** Five real Impeccable items. Pictures are their own /components stills (3:2 WebP, light and dark, 5 to 25KB each), so nothing new to load. */
export const DEMO_ITEMS: PeekListItem[] = [
  {
    title: "Orrery Gallery",
    description:
      "Round pictures orbit your name like planets, fall into a stack and open into a curved strip you drag. Made for a portfolio or launch page.",
    image: { src: "/previews/orrery-gallery-light.webp", alt: "Orrery Gallery, round pictures orbiting in a ring" },
    cta: { label: "Open component", href: "/docs/orrery-gallery" },
  },
  {
    title: "Isometric Wall",
    description:
      "Faded picture cards slide slowly along diagonal columns on a tilted floor, and the one you point at lifts gently. It sits behind a hero, so the words stay clear.",
    image: { src: "/previews/isometric-wall-light.webp", alt: "Isometric Wall, picture cards on a tilted floor behind a headline" },
    cta: { label: "Open component", href: "/docs/isometric-wall" },
  },
  {
    title: "Capsule Testimonials",
    description:
      "Reviews sit as slim capsules with a face and a name, then open into a full card on click while the stars light up one by one.",
    image: { src: "/previews/capsule-testimonials-light.webp", alt: "Capsule Testimonials, slim review capsules next to one open review" },
    cta: { label: "Open component", href: "/docs/capsule-testimonials" },
  },
  {
    title: "Reel Stats",
    description:
      "Point at a heading and its picture rolls into the frame like a reel, as a soft tab glides behind the words. Pictures load only when they come near.",
    image: { src: "/previews/reel-stats-light.webp", alt: "Reel Stats, headings beside a picture rolling into a frame" },
    cta: { label: "Open component", href: "/docs/reel-stats" },
  },
  {
    title: "Kitcut button",
    description:
      "A button that cracks down the middle and splits open while it loads, then snaps back with a WooHoo. Made for your main action, like Publish or Pay.",
    image: { src: "/previews/kitcut-button-light.webp", alt: "Kitcut button, a purple button split in two with dots in the gap" },
    cta: { label: "Open component", href: "/docs/kitcut-button" },
  },
];

/** The pictures for the current theme: "x-light.webp" or "x-dark.webp". */
export function themed(items: PeekListItem[], dark: boolean) {
  return dark ? items.map((it) => ({ ...it, image: { ...it.image, src: it.image.src.replace("-light.webp", "-dark.webp") } })) : items;
}

export function PeekListDemo() {
  const dark = useDark();
  return (
    <div className="peek-demo flex w-full justify-center px-4 pt-8 pb-12 @min-[40rem]:px-10 @min-[40rem]:pb-16">
      {/* Room above the list for the picture that floats over the first row; phones never show it, so they skip the room. */}
      <style>{`@media (hover: hover) and (pointer: fine) { .peek-demo { padding-top: 8.5rem; } }`}</style>
      <div className="w-full max-w-[44rem]">
        <PeekList items={themed(DEMO_ITEMS, dark)} aria-label="Impeccable components" />
      </div>
    </div>
  );
}
