"use client";

import { OrreryGallery, type OrreryImage } from "./orrery-gallery";

/** Original studio pictures made for this demo (public/orrery-gallery). Each one opens another Impeccable page. */
export const DEMO_IMAGES: OrreryImage[] = [
  { src: "/orrery-gallery/violet.webp", alt: "Two violet spheres in a violet studio", href: "/docs/text-mirroring" },
  { src: "/orrery-gallery/crimson.webp", alt: "A red ring standing in a red studio", href: "/docs/burning-toast" },
  { src: "/orrery-gallery/cobalt.webp", alt: "Two blue capsules stacked in a blue studio", href: "/docs/brain-txt" },
  { src: "/orrery-gallery/lime.webp", alt: "A soft lime cube in a lime studio", href: "/docs/scratch-me" },
  { src: "/orrery-gallery/pink.webp", alt: "Three pink spheres in a pink studio", href: "/docs/password-strength" },
  { src: "/orrery-gallery/orange.webp", alt: "An orange arch over a small ball", href: "/docs/framed-upload" },
  { src: "/orrery-gallery/cyan.webp", alt: "A cyan ball on a short pillar", href: "/docs/task-progress" },
  { src: "/orrery-gallery/sand.webp", alt: "A sand cone beside a small ball", href: "/docs/peephole-button" },
  { src: "/orrery-gallery/teal.webp", alt: "A teal ball floating over a ring", href: "/docs/glass-shatter-button" },
  { src: "/orrery-gallery/night.webp", alt: "A ringed planet over a night floor", href: "/docs/black-hole-refresh" },
];

/** The preview: the gallery fills the card. The orbit plays when it scrolls into view. */
export function OrreryGalleryDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <OrreryGallery images={DEMO_IMAGES} brand="Impeccable" height="clamp(420px, 62cqi, 560px)" aria-label="Impeccable pictures" />
    </div>
  );
}
