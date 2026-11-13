"use client";

import { Screen } from "@/components/site/tv-screen";
import { PixelTremorButton } from "./pixel-tremor-button";

/** The button alone on the tube. Move over it and the part under the pointer turns to pixels; click it and a wave of pixels runs across. */
export default function PixelTremorButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <PixelTremorButton>Make a wave</PixelTremorButton>
      </div>
    </Screen>
  );
}
