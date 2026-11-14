"use client";

import { PixelButton } from "./pixel-button";

/** The preview: one button on the dotted card. Hover it to bring the pixels up, click to send a wave. */
export function PixelButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <PixelButton>Make a wave</PixelButton>
    </div>
  );
}

/** Types: both side by side, so the difference shows at a glance. */
export function PixelButtonTypesDemo() {
  return (
    <div className="card dots flex min-h-40 flex-wrap items-center justify-center gap-x-8 gap-y-6 rounded-2xl px-5 py-10">
      {(
        [
          ["hover", "Only on hover"],
          ["always", "Always on"],
        ] as const
      ).map(([mode, label]) => (
        <div key={mode} className="flex flex-col items-center gap-3">
          <PixelButton mode={mode}>Make a wave</PixelButton>
          <span className="text-[13px] text-[var(--muted)]">
            {label} · <code className="font-mono text-[12px]">mode=&quot;{mode}&quot;</code>
          </span>
        </div>
      ))}
    </div>
  );
}
