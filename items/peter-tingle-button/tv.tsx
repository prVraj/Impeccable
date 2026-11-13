"use client";

import { Screen } from "@/components/site/tv-screen";
import { PeterTingleButton } from "./peter-tingle-button";

/** The button alone on the tube. Bring the pointer near the screen and it starts to tingle. */
export default function PeterTingleButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <PeterTingleButton color="var(--fg)">Sneak up on me</PeterTingleButton>
      </div>
    </Screen>
  );
}
