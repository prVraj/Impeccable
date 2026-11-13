"use client";

import { Screen } from "@/components/site/tv-screen";
import { VenomButton } from "./venom-button";

/** The button alone on the tube. Point at it and the strands reach out of the screen. */
export default function VenomButtonChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center">
        <VenomButton color="var(--fg)" textColor="var(--bg)">
          Come closer
        </VenomButton>
      </div>
    </Screen>
  );
}
