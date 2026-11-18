"use client";

import { KitcutButton } from "./kitcut-button";

/** Pretends the install takes about four seconds, so the gap stays open long enough to see the dots. */
const wait = () => new Promise((done) => setTimeout(done, 4000));

/** The preview: one button on the dotted card. Click it to crack it open, and watch it snap back with a WooHoo. */
export function KitcutButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <KitcutButton color="var(--brand-500)" onClick={wait}>
        Install component
      </KitcutButton>
    </div>
  );
}
