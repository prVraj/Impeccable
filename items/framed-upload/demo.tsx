"use client";

import { FramedUpload } from "./framed-upload";

/** One frame already hung, one waiting for a picture. */
export function FramedUploadDemo() {
  return (
    <div className="card grid grid-cols-2 place-items-center gap-5 rounded-2xl px-5 py-12 text-[var(--fg)] @min-[40rem]:gap-10 @min-[40rem]:px-10 @min-[40rem]:py-16">
      <FramedUpload defaultSrc="/previews/framed-upload-sample.svg" alt="A violet poster with a setting sun" style={{ maxWidth: 240 }} />
      <FramedUpload style={{ maxWidth: 240 }} />
    </div>
  );
}
