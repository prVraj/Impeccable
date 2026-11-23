"use client";

import { Screen } from "@/components/site/tv-screen";
import { SpotlightTicker } from "./spotlight-ticker";
import { DEMO_ITEMS, themed, useDark } from "./demo";

/** The row gliding on the tube. */
export default function SpotlightTickerChannel() {
  const dark = useDark();
  return (
    <Screen>
      <div className="flex h-full items-center bg-[var(--bg)]">
        <SpotlightTicker items={themed(DEMO_ITEMS, dark)} size={120} speed={30} />
      </div>
    </Screen>
  );
}
