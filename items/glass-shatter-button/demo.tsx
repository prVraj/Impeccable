"use client";

import { GlassShatterButton } from "./glass-shatter-button";

/** The preview: one button on the dotted card. Bring the pointer close to light the glass, click to shatter it. */
export function GlassShatterButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <GlassShatterButton glowColor="var(--accent)">Break the glass</GlassShatterButton>
    </div>
  );
}
