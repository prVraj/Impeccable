"use client";

import { useEffect, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { TextMirroring } from "./text-mirroring";

/** A hero title on the tube. The mirror builds and sinks back on its own; hover holds it open. */
export default function TextMirroringChannel() {
  const [auto, setAuto] = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    // One flip every 2.8s: long enough for the copies to build, rest, and sink back.
    const id = window.setInterval(() => setAuto((a) => !a), 2800);
    const first = window.setTimeout(() => setAuto(true), 600);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, []);
  return (
    <Screen>
      <div
        className="flex h-full flex-col items-center justify-center px-[4cqw] text-center"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <p className="mb-[3cqw] text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <TextMirroring as="p" text="Vraj Sensei" active={hover || auto} style={{ fontSize: "11cqw" }} />
      </div>
    </Screen>
  );
}
