"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
      className="inline-flex h-7 items-center rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
    >
      {done ? "Copied" : label}
    </button>
  );
}
