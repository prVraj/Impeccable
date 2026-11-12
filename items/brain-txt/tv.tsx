"use client";

import { Screen } from "@/components/site/tv-screen";
import { BrainTxt } from "./brain-txt";
import { DEMO_THOUGHTS } from "./demo";

/** brain.txt fills the tube. Fewer thoughts so the dots have room on a small screen. */
export default function BrainTxtChannel() {
  return (
    <Screen>
      <BrainTxt
        thoughts={DEMO_THOUGHTS.slice(0, 9)}
        accent="var(--accent)"
        height="100%"
        hint="Click a dot to read it. Drag to play."
      />
    </Screen>
  );
}
