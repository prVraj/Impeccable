"use client";

import { Screen } from "@/components/site/tv-screen";
import { GlassShatterButton } from "./glass-shatter-button";

/** The button alone on the tube. Bring the pointer close and the glass lights up; click it and the glass shatters and seals. */
export default function GlassShatterButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <GlassShatterButton glowColor="var(--accent)">Break the glass</GlassShatterButton>
      </div>
    </Screen>
  );
}
