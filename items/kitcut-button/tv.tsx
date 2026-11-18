"use client";

import { useEffect, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { KitcutButton } from "./kitcut-button";

/** The button alone on the tube. It cracks open on its own every few seconds, with no sound, then snaps back with a WooHoo. */
export default function KitcutButtonChannel() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let t = window.setTimeout(function loop() {
      setLoading(true);
      t = window.setTimeout(() => {
        setLoading(false);
        t = window.setTimeout(loop, 2600);
      }, 3800);
    }, 900);
    return () => window.clearTimeout(t);
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
