"use client";

import { PeterTingleButton } from "./peter-tingle-button";

/** The preview: one button with room around it, so the pointer can sneak up from any side. */
export function PeterTingleButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <PeterTingleButton color="var(--fg)">Sneak up on me</PeterTingleButton>
    </div>
  );
}
