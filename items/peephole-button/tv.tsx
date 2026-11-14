"use client";

import { Screen } from "@/components/site/tv-screen";
import { PeepholeButton } from "./peephole-button";

/** Both types on the tube: hover the first to open the picture, the second to pour the color. */
export default function PeepholeButtonChannel() {
  return (
    <Screen>
      <div className="dots flex h-full flex-col items-center justify-center gap-4">
        <PeepholeButton image="/peephole/fields.webp">Take a peek</PeepholeButton>
        <PeepholeButton variant="fill" image="/peephole/avatar-ava.webp" side="right">
          Talk to Ava
        </PeepholeButton>
      </div>
    </Screen>
  );
}
