"use client";

import { Screen } from "@/components/site/tv-screen";
import { RollingClock } from "./rolling-clock";

/** The visitor's time rolling on the tube. */
export default function RollingClockChannel() {
  return (
    <Screen>
      <div className="@container grid h-full place-items-center">
        <RollingClock className="font-medium tracking-tight" style={{ fontSize: "min(56px, 12cqi)" }} />
      </div>
    </Screen>
  );
}
