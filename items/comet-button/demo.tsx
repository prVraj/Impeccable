"use client";

import { CometButton } from "./comet-button";

/** Pretends the server takes about two and a half seconds, so the glow has time to run. */
const wait = () => new Promise((done) => setTimeout(done, 2700));

/** The preview: one button on the dotted card. Click it to load, and watch the glow settle when it's done. */
export function CometButtonDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <CometButton onClick={wait}>Let me load</CometButton>
    </div>
  );
}
