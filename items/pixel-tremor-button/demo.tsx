"use client";

import { PixelTremorButton } from "./pixel-tremor-button";

/** The preview: one plain white button on the dotted card. Move over it to pixelate the part under the pointer, click to send a wave of pixels. */
export function PixelTremorButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <PixelTremorButton>Make a wave</PixelTremorButton>
    </div>
  );
}
