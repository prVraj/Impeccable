"use client";

import { Screen } from "@/components/site/tv-screen";
import { VelvetGrain } from "./velvet-grain";

/** The grain fills the tube and the brush draws slow figure eights on its own; point at the screen to take over. */
export default function VelvetGrainChannel() {
  return (
    <Screen>
      <VelvetGrain autoBrush radius={46} className="flex h-full w-full items-center justify-center">
        <p className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--fg)]">Made for humans</p>
      </VelvetGrain>
    </Screen>
  );
}
