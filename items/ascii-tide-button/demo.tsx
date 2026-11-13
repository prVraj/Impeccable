"use client";

import { AsciiTideButton } from "./ascii-tide-button";

/** The preview: one plain dark button on the dotted card. Move over it to raise the ASCII field, tap to send the tide. */
export function AsciiTideButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <AsciiTideButton>Get started</AsciiTideButton>
    </div>
  );
}
