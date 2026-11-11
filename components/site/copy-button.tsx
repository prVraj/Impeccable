"use client";

import { useState } from "react";
import { Check, Copy } from "./icons";

/** Outlined "Copy" button: label first, then the icon, so it reads as the place to copy from. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={done ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
      className="press inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[var(--line)] bg-transparent px-2.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--faint)] hover:text-[var(--fg)]"
    >
      {/* Both words share one spot so the button doesn't change width. */}
      <span className="grid">
        <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${done ? "opacity-0" : ""}`}>{label}</span>
        <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${done ? "" : "opacity-0"}`} aria-hidden="true">
          Copied
        </span>
      </span>
      <span className="relative size-3.5">
        <Copy className={`absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-200 ${done ? "scale-75 opacity-0 blur-[2px]" : ""}`} />
        <Check className={`absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-200 ${done ? "" : "scale-75 opacity-0 blur-[2px]"}`} />
      </span>
    </button>
  );
}
