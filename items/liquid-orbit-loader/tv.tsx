"use client";

import { Screen } from "@/components/site/tv-screen";
import { LiquidOrbitLoader } from "./liquid-orbit-loader";

/** The liquid drop floating in its ring on the tube, pouring away and rising back. */
export default function LiquidOrbitLoaderChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <LiquidOrbitLoader size={96} />
      </div>
    </Screen>
  );
}
