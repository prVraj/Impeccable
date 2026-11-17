"use client";

import { useEffect, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { SleeveCard } from "./sleeve-card";
import { DEMO_CARDS, themed, useDark } from "./demo";

const BEAT = 1800; // ms open, then ms closed

/** One project card on the tube. It opens and closes on its own (a mouse over it opens it too). */
export default function SleeveCardChannel() {
  const [open, setOpen] = useState(false);
  const dark = useDark();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOpen(true);
    const t = setInterval(() => setOpen((o) => !o), BEAT);
    return () => clearInterval(t);
  }, []);
  return (
    <Screen>
      <div className="flex h-full items-center justify-center bg-[var(--panel-2)] pr-[8cqw]">
        <SleeveCard {...themed(DEMO_CARDS[0], dark)} open={open || undefined} onClick={() => window.location.reload()} style={{ maxWidth: "34cqw" }} />
      </div>
    </Screen>
  );
}
