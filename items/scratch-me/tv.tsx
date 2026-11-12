"use client";

import { useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { ScratchMe } from "./scratch-me";

/** A tiny checkout screen with a scratch card on it. Scratch it right on the tube. */
export default function ScratchMeChannel({ onReplay }: { onReplay: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[4cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] mb-[4cqw] text-[5.4cqw] leading-tight font-semibold tracking-tight">
          A gift for your first order
        </p>
        <ScratchMe code="IMPECCABLE20" onReveal={() => setDone(true)} />
        <button
          type="button"
          onClick={onReplay}
          className={`press mt-[1cqw] text-[2.6cqw] font-medium text-[var(--muted)] transition-opacity hover:text-[var(--fg)] ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          Scratch again
        </button>
      </div>
    </Screen>
  );
}
