"use client";

import { useSyncExternalStore } from "react";
import { SpotlightTicker, type SpotlightTickerItem } from "./spotlight-ticker";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
export function useDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
}

/** Eight real Impeccable items. Pictures are square crops of their own previews, light and dark, 480px WebP, about 111KB for all sixteen (public/spotlight-ticker). */
export const DEMO_ITEMS: SpotlightTickerItem[] = [
  {
    image: { src: "/spotlight-ticker/orrery-gallery.webp", alt: "Orrery Gallery, round pictures orbiting a name, like planets" },
    title: "Orrery Gallery",
    points: [
      "Pictures orbit your name, then fall into a stack.",
      "The stack opens into a curved strip you drag.",
      "Made for a portfolio or launch page.",
    ],
    cta: { label: "Open component", href: "/docs/orrery-gallery" },
  },
  {
    image: { src: "/spotlight-ticker/isometric-wall.webp", alt: "Isometric Wall, picture cards on a tilted floor behind a headline" },
    title: "Isometric Wall",
    points: [
      "Faded picture cards slide along diagonal columns.",
      "The card you point at lifts a little.",
      "Sits behind a hero, so the words stay clear.",
    ],
    cta: { label: "Open component", href: "/docs/isometric-wall" },
  },
  {
    image: { src: "/spotlight-ticker/comet-button.webp", alt: "Comet button, a dark pill with a glow racing round its border" },
    title: "Comet button",
    points: [
      "A glow races round the border while it loads.",
      "Success lights the whole border, then eases back.",
      "For a save or sign up button that waits.",
    ],
    cta: { label: "Open component", href: "/docs/comet-button" },
  },
  {
    image: { src: "/spotlight-ticker/capsule-testimonials.webp", alt: "Capsule Testimonials, slim review capsules with faces and names" },
    title: "Capsule Testimonials",
    points: [
      "Reviews sit as slim capsules with a face.",
      "One opens into a full card on click.",
      "Stars light up one by one.",
    ],
    cta: { label: "Open component", href: "/docs/capsule-testimonials" },
  },
  {
    image: { src: "/spotlight-ticker/reel-stats.webp", alt: "Reel Stats, a picture rolling into a frame next to headings" },
    title: "Reel Stats",
    points: [
      "Point at a heading and its picture rolls in.",
      "A soft tab glides behind the words.",
      "Pictures load only when they come near.",
    ],
    cta: { label: "Open component", href: "/docs/reel-stats" },
  },
  {
    image: { src: "/spotlight-ticker/sleeve-card.webp", alt: "Sleeve Card, a project card turning in 3D with a tab sliding out" },
    title: "Sleeve Card",
    points: [
      "A project card lifts and turns in 3D.",
      "A View Project tab slides out from behind.",
      "One link, one stop for the keyboard.",
    ],
    cta: { label: "Open component", href: "/docs/sleeve-card" },
  },
  {
    image: { src: "/spotlight-ticker/glass-shatter-button.webp", alt: "Glass Shatter button, a dark button inside a ring of glass" },
    title: "Glass Shatter button",
    points: [
      "A ring of glass glows as your pointer comes near.",
      "It shatters into shards on click, then seals.",
      "Made for the one main action on a page.",
    ],
    cta: { label: "Open component", href: "/docs/glass-shatter-button" },
  },
  {
    image: { src: "/spotlight-ticker/window-stats.webp", alt: "Window Stats, photo cards with big numbers over a statement" },
    title: "Window Stats",
    points: [
      "Your numbers ride on photo cards.",
      "They slide over a statement that softens behind.",
      "Loved by 100k+ humans.",
    ],
    cta: { label: "Open component", href: "/docs/window-stats" },
  },
];

/** The pictures for the current theme: "x.webp" or "x-dark.webp". */
export function themed(items: SpotlightTickerItem[], dark: boolean) {
  return dark ? items.map((it) => ({ ...it, image: { ...it.image, src: it.image.src.replace(".webp", "-dark.webp") } })) : items;
}

export function SpotlightTickerDemo() {
  const dark = useDark();
  return (
    <div className="card w-full overflow-hidden rounded-2xl !bg-[var(--panel-2)] px-4 py-6 dark:!bg-[var(--bg)] @min-[40rem]:px-8 @min-[40rem]:py-8">
      <SpotlightTicker items={themed(DEMO_ITEMS, dark)} aria-label="Impeccable components" />
    </div>
  );
}
