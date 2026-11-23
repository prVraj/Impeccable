"use client";

import { CubeFlipImage, type CubeFlipPicture } from "./cube-flip-image";

/** The same nine Unsplash photos as Tile flip image (3:2, 780px WebP in public/tile-flip-image), so nothing new to load. */
export const DEMO_PICTURES: CubeFlipPicture[] = [
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

/** A cascade of small cube clacks, layered from ElevenLabs sound effects, about 2 seconds, timed to the wave, 26KB. */
export const DEMO_SOUND = "/cube-flip-image/cube-roll.mp3";

/** The preview: one photo in the middle of the dotted card. Click anywhere on it. */
export function CubeFlipImageDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-10 @min-[40rem]:min-h-96 @min-[40rem]:py-14">
      <div className="flex w-full max-w-[32rem] flex-col items-center gap-5">
        <CubeFlipImage images={DEMO_PICTURES} sound={DEMO_SOUND} className="rounded-xl shadow-[0_0_0_1px_var(--faint)]" />
        <span className="text-[13px] text-[var(--muted)]">Click anywhere on the photo</span>
      </div>
    </div>
  );
}

/** Three cube sizes side by side. Each one is its own picture: click any of them. */
export function CubeFlipImageSizesDemo() {
  const rows = [
    { label: "Fine", code: "tile={12}", tile: 12 },
    { label: "Default", code: "tile={20}", tile: 20 },
    { label: "Bold", code: "tile={36}", tile: 36 },
  ];
  return (
    <div className="card dots grid gap-8 rounded-2xl px-5 py-10 @min-[40rem]:grid-cols-3 @min-[40rem]:gap-5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-3">
          <CubeFlipImage
            images={DEMO_PICTURES}
            tile={r.tile}
            sound={DEMO_SOUND}
            className="max-w-[20rem] rounded-lg shadow-[0_0_0_1px_var(--faint)]"
          />
          <span className="text-[13px] text-[var(--muted)]">
            {r.label} · <code className="font-mono text-[12px]">{r.code}</code>
          </span>
        </div>
      ))}
    </div>
  );
}
