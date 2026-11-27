"use client";

import { VelvetGrain } from "./velvet-grain";

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

/** The preview: a quiet hero for Impeccable UI on the grain. Brush it with the pointer, or drag a finger on a phone. */
export function VelvetGrainDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <VelvetGrain
        className="flex flex-col items-center justify-center gap-6 px-6 text-center"
        style={{ height: "clamp(440px, 62cqi, 600px)" }}
      >
        <h2 className="max-w-[20ch] text-heading-32 text-balance text-[var(--fg)] @min-[40rem]:text-heading-40">
          Let&apos;s make something for Humans once again.
        </h2>
        <a href="/components" className={PILL}>
          Browse components
        </a>
      </VelvetGrain>
    </div>
  );
}
