"use client";

import { LiquidOrbitLoader } from "./liquid-orbit-loader";

/** The preview: the ring and the drop alone on the dotted card, looping on their own. */
export function LiquidOrbitLoaderDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <LiquidOrbitLoader size={112} />
    </div>
  );
}
