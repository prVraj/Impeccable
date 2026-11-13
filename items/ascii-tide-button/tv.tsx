"use client";

import { Screen } from "@/components/site/tv-screen";
import { AsciiTideButton } from "./ascii-tide-button";

/** The button alone on the tube. Move over it and ASCII characters drift behind the label; tap it and a calm tide rolls across. */
export default function AsciiTideButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <AsciiTideButton>Get started</AsciiTideButton>
      </div>
    </Screen>
  );
}
