"use client";

import { Screen } from "@/components/site/tv-screen";
import { PixelButton } from "./pixel-button";

/** The button alone on the tube, pixels always on so the channel never looks empty. Hover to make them glow, click to send a wave. */
export default function PixelButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <PixelButton mode="always">Make a wave</PixelButton>
      </div>
    </Screen>
  );
}
