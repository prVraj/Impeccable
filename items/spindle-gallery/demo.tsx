"use client";

import { SpindleGallery, type SpindleImage } from "./spindle-gallery";

/** Vraj's own posters, cropped to the page shape, 480px wide WebP, about 326KB for all ten (public/spindle-gallery). */
export const DEMO_IMAGES: SpindleImage[] = [
  { src: "/spindle-gallery/golden.webp", alt: "A woman holding a perfume bottle in golden light" },
  { src: "/spindle-gallery/crystal.webp", alt: "A pink perfume bottle on a rock in clear sea water" },
  { src: "/spindle-gallery/matcha.webp", alt: "Poster for an iced matcha: Focus that doesn't crash" },
  { src: "/spindle-gallery/sprint.webp", alt: "A runner leaping in white sneakers against orange light" },
  { src: "/spindle-gallery/cola.webp", alt: "A woman in a red shirt sipping an iced cola" },
  { src: "/spindle-gallery/mirror.webp", alt: "Poster for a micellar cleanser, a woman in a car mirror" },
  { src: "/spindle-gallery/bloom.webp", alt: "A woman holding a pink cleanser among flowers" },
  { src: "/spindle-gallery/sip.webp", alt: "Poster for a matcha drink bursting out of a phone" },
  { src: "/spindle-gallery/track.webp", alt: "Poster for a running shoe on a track: Feel the track" },
  { src: "/spindle-gallery/calm.webp", alt: "Poster for a cleanser stepping out of a phone: Calm, within reach" },
];

/** The preview: the gallery fills the card. The orbit plays when it scrolls into view. */
export function SpindleGalleryDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <SpindleGallery images={DEMO_IMAGES} height="clamp(440px, 66cqi, 600px)" aria-label="Impeccable posters" />
    </div>
  );
}
