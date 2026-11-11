"use client";

import { FramedUpload } from "@/registry/impeccable/framed-upload/framed-upload";

/** One frame already hung, one waiting for a picture. */
export function FramedUploadDemo() {
  return (
    <div className="card grid grid-cols-2 place-items-center gap-5 rounded-2xl px-5 py-12 text-[var(--fg)] sm:gap-10 sm:px-10 sm:py-16">
      <FramedUpload defaultSrc="/previews/framed-upload-sample.svg" alt="A violet poster with a setting sun" style={{ maxWidth: 240 }} />
      <FramedUpload style={{ maxWidth: 240 }} />
    </div>
  );
}
