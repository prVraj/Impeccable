"use client";

import { Screen } from "@/components/site/tv-screen";
import { SettleCounter } from "./settle-counter";
import { useDemoNumber } from "./demo";

/** The live count settling on the tube. */
export default function SettleCounterChannel() {
  const { value } = useDemoNumber();
  return (
    <Screen>
      <div className="@container flex h-full flex-col items-center justify-center gap-[3cqi]">
        <span className="text-[var(--muted)]" style={{ fontSize: "min(13px, 3.2cqi)" }}>
          Humans on Impeccable UI right now
        </span>
        <SettleCounter value={value} className="font-medium tracking-tight" style={{ fontSize: "min(64px, 15cqi)" }} />
      </div>
    </Screen>
  );
}
