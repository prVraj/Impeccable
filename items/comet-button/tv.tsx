"use client";

import { useEffect, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { CometButton } from "./comet-button";

/** The button alone on the tube. It loads on its own every few seconds, so the glow runs and settles without a click. */
export default function CometButtonChannel() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let t = window.setTimeout(function loop() {
      setLoading((v) => !v);
      t = window.setTimeout(loop, 2700);
    }, 900);
    return () => window.clearTimeout(t);
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
