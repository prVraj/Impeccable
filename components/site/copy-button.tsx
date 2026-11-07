"use client";

import { useState } from "react";
import { Check, Copy } from "./icons";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
      className="press inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--fg)]"
    >
      <span className="relative size-3.5">
        <Copy className={`absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-200 ${done ? "scale-75 opacity-0 blur-[2px]" : ""}`} />
        <Check className={`absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-200 ${done ? "" : "scale-75 opacity-0 blur-[2px]"}`} />
      </span>
      {label && <span>{done ? "Copied" : label}</span>}
    </button>
  );
}
