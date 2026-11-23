"use client";

import { useEffect, useRef, useState } from "react";
import { Screen, type ChannelProps } from "@/components/site/tv-screen";
import { CometButton } from "./comet-button";

/** How long "Ah yeah!" takes after loading ends: it spreads, holds and eases back (see comet-button.tsx). */
const SUCCESS_MS = 330 + 1100 + 600;

/** The button alone on the tube. It loads on its own every few seconds, so the glow runs and settles without a click. */
export default function CometButtonChannel({ onLoop }: ChannelProps) {
  const [loading, setLoading] = useState(false);
  // Tells the iMac when one load (glow, then "Ah yeah!") starts and has fully settled, so it never cuts away mid-way.
  const beat = useRef(onLoop);
  useEffect(() => {
    beat.current = onLoop;
  }, [onLoop]);
  useEffect(() => {
    let on = false;
    let settled = 0;
    let t = window.setTimeout(function loop() {
      on = !on;
      setLoading(on);
      if (on) beat.current?.("start");
      else settled = window.setTimeout(() => beat.current?.("end"), SUCCESS_MS);
      t = window.setTimeout(loop, 2700);
    }, 900);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(settled);
    };
  }, []);
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <CometButton loading={loading} tabIndex={-1}>
          Let me load
        </CometButton>
      </div>
    </Screen>
  );
}
