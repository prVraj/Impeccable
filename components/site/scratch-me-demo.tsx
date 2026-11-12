"use client";

import { useState } from "react";
import { ScratchMe } from "@/registry/impeccable/scratch-me/scratch-me";

export function ScratchMeDemo() {
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="card relative grid place-items-center overflow-hidden rounded-2xl px-4 py-12 text-[var(--fg)] @min-[40rem]:py-16">
      <ScratchMe key={round} code="IMPECCABLE20" onReveal={() => setDone(true)} />
      <button
        type="button"
        onClick={() => {
          setRound((r) => r + 1);
          setDone(false);
        }}
        className={`absolute right-3 bottom-3 h-7 rounded-md px-2.5 text-xs font-medium text-[var(--muted)] transition-opacity hover:text-[var(--fg)] ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        Scratch again
      </button>
    </div>
  );
}
