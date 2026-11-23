"use client";

import { useEffect, useState } from "react";
import { TileFlipImage } from "./tile-flip-image";

/** Nine free Unsplash photos from Vraj's picks, cropped to 3:2, 780px wide WebP, about 520KB for all nine (public/tile-flip-image). */
export const DEMO_PICTURES = [
  { src: "/tile-flip-image/mountain-lake.webp", alt: "A rowing boat on a turquoise mountain lake" },
  { src: "/tile-flip-image/tokyo-street.webp", alt: "A busy Tokyo street lined with glowing signs at dusk" },
  { src: "/tile-flip-image/balloons.webp", alt: "Hot air balloons over rocky valleys at sunrise" },
  { src: "/tile-flip-image/desert-road.webp", alt: "An empty desert road running straight toward snowy mountains" },
  { src: "/tile-flip-image/hong-kong.webp", alt: "Hong Kong's skyline lit up under a pink and blue evening sky" },
  { src: "/tile-flip-image/dolomites.webp", alt: "A winding road through rocky peaks at golden hour" },
  { src: "/tile-flip-image/manhattan.webp", alt: "Manhattan's skyline and bridges under white clouds" },
  { src: "/tile-flip-image/ridge.webp", alt: "A hiker standing on a rock above misty green hills" },
  { src: "/tile-flip-image/machu-picchu.webp", alt: "Stone ruins on a green mountain ridge in the clouds" },
];

const HOLD_MS = 3000; // each picture stays this long before the next one

/**
 * Plays the pictures on their own, a new one every 3 seconds. `next` changes it now and restarts the wait.
 * `firstMs` is the wait before the first change (the TV starts sooner, so its still on /components catches tiles mid turn).
 */
export function useDemoPicture(firstMs = HOLD_MS) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setI((n) => (n + 1) % DEMO_PICTURES.length), i === 0 ? firstMs : HOLD_MS);
    return () => clearTimeout(t);
  }, [i, firstMs]);
  // Fetch the next picture early, so its tiles can start turning the moment it is asked for.
  useEffect(() => {
    const im = new Image();
    im.src = DEMO_PICTURES[(i + 1) % DEMO_PICTURES.length].src;
  }, [i]);
  return { ...DEMO_PICTURES[i], next: () => setI((n) => (n + 1) % DEMO_PICTURES.length) };
}

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

/** The preview: one photo in the middle of the dotted card, and one pill to change it. */
export function TileFlipImageDemo() {
  const { src, alt, next } = useDemoPicture();
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-10 @min-[40rem]:min-h-96 @min-[40rem]:py-14">
      <div className="flex w-full max-w-[32rem] flex-col items-center gap-6">
        <TileFlipImage src={src} alt={alt} className="rounded-xl shadow-[0_0_0_1px_var(--faint)]" />
        <button type="button" onClick={next} className={PILL}>
          Next picture
        </button>
      </div>
    </div>
  );
}

/** Three tile sizes side by side, playing the same photos. */
export function TileFlipImageSizesDemo() {
  const { src, alt } = useDemoPicture();
  const rows = [
    { label: "Fine", code: "tile={8}", tile: 8 },
    { label: "Default", code: "tile={14}", tile: 14 },
    { label: "Bold", code: "tile={28}", tile: 28 },
  ];
  return (
    <div className="card dots grid gap-8 rounded-2xl px-5 py-10 @min-[40rem]:grid-cols-3 @min-[40rem]:gap-5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-3">
          <TileFlipImage src={src} alt={alt} tile={r.tile} className="max-w-[20rem] rounded-lg shadow-[0_0_0_1px_var(--faint)]" />
          <span className="text-[13px] text-[var(--muted)]">
            {r.label} · <code className="font-mono text-[12px]">{r.code}</code>
          </span>
        </div>
      ))}
    </div>
  );
}
