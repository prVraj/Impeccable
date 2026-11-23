"use client";

import { TumbleGallery, type TumbleImages } from "./tumble-gallery";

/** Five free Unsplash photos from Vraj's picks, cropped to 4:3, 720px wide WebP, about 250KB for all five (public/tumble-gallery). */
export const DEMO_IMAGES: TumbleImages = [
  { src: "/tumble-gallery/road.webp", alt: "An empty desert road running straight toward snowy mountains" },
  { src: "/tumble-gallery/lake.webp", alt: "A rowing boat on a turquoise mountain lake" },
  { src: "/tumble-gallery/city.webp", alt: "A city skyline lit up at dusk under a purple sky" },
  { src: "/tumble-gallery/balloons.webp", alt: "Hot air balloons over rocky valleys at sunrise" },
  { src: "/tumble-gallery/peaks.webp", alt: "Ancient stone ruins on a green mountain ridge in the clouds" },
];

/** The preview: the drum sits in the middle of the card and flips on its own. */
export function TumbleGalleryDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl px-4 py-6">
      <TumbleGallery images={DEMO_IMAGES} aria-label="Places to see" />
    </div>
  );
}
