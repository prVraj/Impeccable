"use client";

import { RollingClock } from "./rolling-clock";

/** The preview: the visitor's own time, big, alone on the dotted card. */
export function RollingClockDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-12 @min-[40rem]:min-h-96 @min-[40rem]:py-16">
      <div className="text-center text-[var(--fg)]">
        <RollingClock className="text-[44px] font-medium tracking-tight @min-[40rem]:text-[72px]" />
      </div>
    </div>
  );
}

/** The two types side by side: 24 hour and 12 hour. */
export function RollingClockTypesDemo() {
  const rows = [
    { label: "24 hour", code: "<RollingClock />", el: <RollingClock /> },
    { label: "12 hour", code: "hour12", el: <RollingClock hour12 /> },
  ];
  return (
    <div
      className="card dots flex min-h-40 flex-wrap items-center justify-center rounded-2xl px-5 py-12"
      style={{ columnGap: 56, rowGap: 40 }}
    >
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-4">
          <span className="text-[32px] font-medium tracking-tight text-[var(--fg)]">{r.el}</span>
          <span className="text-[13px] text-[var(--muted)]">
            {r.label} · <code className="font-mono text-[12px]">{r.code}</code>
          </span>
        </div>
      ))}
    </div>
  );
}
