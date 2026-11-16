"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { LoupeGrid, type LoupeGridType } from "./loupe-grid";

/** The four types, in the order the switch and the Types section show them. */
export const TYPES: { id: LoupeGridType; label: string }[] = [
  { id: "plus", label: "Plus" },
  { id: "plus-lines", label: "Plus and lines" },
  { id: "dots", label: "Dots" },
  { id: "dots-lines", label: "Dots and lines" },
];

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

/** The preview: the grid fills the card, and a row of secondary pills switches the type. */
export function LoupeGridDemo() {
  const [type, setType] = useState<LoupeGridType>("plus");
  return (
    <div className="card overflow-hidden rounded-2xl">
      <LoupeGrid
        type={type}
        className="flex flex-col items-center justify-end px-4 pb-5"
        style={{ height: "clamp(400px, 60cqi, 540px)" }}
      >
        <div role="group" aria-label="Grid type" className="flex flex-wrap justify-center gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
              className={cx(PILL, type === t.id && "shadow-[0_0_0_1.5px_var(--accent)]! text-[var(--accent)]")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </LoupeGrid>
    </div>
  );
}

/** Types: all four side by side, each one live. */
export function LoupeGridTypesDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TYPES.map((t) => (
        <div key={t.id} className="card overflow-hidden rounded-2xl">
          <LoupeGrid type={t.id} className="flex items-end p-3" style={{ height: 200 }}>
            <span className="text-[13px] text-[var(--muted)]">
              {t.label} · <code className="font-mono text-[12px]">type=&quot;{t.id}&quot;</code>
            </span>
          </LoupeGrid>
        </div>
      ))}
    </div>
  );
}
