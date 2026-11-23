"use client";

import { useEffect, useRef, useState } from "react";
import { Screen, type ChannelProps } from "@/components/site/tv-screen";
import { KitcutButton } from "./kitcut-button";

/** How long the snap back takes after loading ends: the halves close, "WooHoo" holds, then it eases back (see kitcut-button.tsx). */
const SNAP_BACK_MS = 260 + 1100 + 600;

/** The button alone on the tube. It cracks open on its own every few seconds, with no sound, then snaps back with a WooHoo. */
export default function KitcutButtonChannel({ onLoop }: ChannelProps) {
  const [loading, setLoading] = useState(false);
  // Tells the iMac when one crack (open, then "WooHoo") starts and has fully settled, so it never cuts away mid-way.
  const beat = useRef(onLoop);
  useEffect(() => {
    beat.current = onLoop;
  }, [onLoop]);
  useEffect(() => {
    let settled = 0;
    let t = window.setTimeout(function loop() {
      setLoading(true);
      beat.current?.("start");
      t = window.setTimeout(() => {
        setLoading(false);
        settled = window.setTimeout(() => beat.current?.("end"), SNAP_BACK_MS);
        t = window.setTimeout(loop, 2600);
      }, 3800);
    }, 900);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(settled);
    };
  }, []);
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <KitcutButton color="var(--brand-500)" loading={loading} sound={false} tabIndex={-1}>
          Install component
        </KitcutButton>
      </div>
    </Screen>
  );
}
