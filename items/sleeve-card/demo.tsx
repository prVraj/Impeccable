"use client";

import { useSyncExternalStore } from "react";
import { SleeveCard, type SleeveCardProps } from "./sleeve-card";

/** True while the site is in dark mode, so each card shows its item's dark preview. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
export function useDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** The card's picture for the current theme: "x.webp" or "x-dark.webp". */
export function themed(card: Omit<SleeveCardProps, "onClick">, dark: boolean) {
  return dark ? { ...card, image: { ...card.image, src: card.image.src.replace(".webp", "-dark.webp") } } : card;
}

/** Three real Impeccable items as projects. Pictures are their own previews, light and dark, 560px WebP, about 136KB for all six (public/sleeve-card). */
export const DEMO_CARDS: Omit<SleeveCardProps, "onClick">[] = [
  {
    image: { src: "/sleeve-card/spindle-gallery.webp", alt: "Spindle Gallery, a ring of posters turning in 3D" },
    title: "Spindle Gallery",
    stat: "60 fps",
    statLabel: "On every screen",
  },
  {
    image: { src: "/sleeve-card/isometric-wall.webp", alt: "Isometric Wall, picture cards on a tilted floor behind a headline" },
    title: "Isometric Wall",
    stat: "0",
    statLabel: "Extra packages",
  },
  {
    image: { src: "/sleeve-card/capsule-testimonials.webp", alt: "Capsule Testimonials, slim review capsules with faces" },
    title: "Capsule Testimonials",
    stat: "100k+",
    statLabel: "Humans loved it",
  },
];

/** In the docs the card reloads the page instead of leaving it. In your app give it an href. */
const reload = () => window.location.reload();

/** The preview: three project cards in a row, stacked on a phone, with room on the right for the last tab. Hover one (or tap it twice). */
export function SleeveCardDemo() {
  const dark = useDark();
  return (
    <div className="card w-full rounded-2xl !bg-[var(--panel-2)] px-6 py-12 dark:!bg-[var(--bg)] @min-[40rem]:px-10 @min-[40rem]:py-16">
      <div className="mx-auto grid w-full max-w-[18rem] grid-cols-1 gap-12 pr-14 @min-[40rem]:max-w-[47rem] @min-[40rem]:grid-cols-3 @min-[40rem]:gap-x-12 @min-[40rem]:pr-12">
        {DEMO_CARDS.map((card) => (
          <SleeveCard key={card.title as string} {...themed(card, dark)} onClick={reload} />
        ))}
      </div>
    </div>
  );
}
