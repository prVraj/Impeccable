"use client";

import { VenomButton } from "./venom-button";

/** The preview: one button with room around it for the strands to reach. */
export function VenomButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <VenomButton color="var(--fg)" textColor="var(--bg)">
        Come closer
      </VenomButton>
    </div>
  );
}
