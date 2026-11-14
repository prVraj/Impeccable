"use client";

import { TugOfWorkLoader } from "./tug-of-work-loader";

/** The preview: the loader alone on the dotted card, looping on its own. */
export function TugOfWorkLoaderDemo() {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <TugOfWorkLoader className="max-w-sm" />
    </div>
  );
}
