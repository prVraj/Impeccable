"use client";

import { Screen } from "@/components/site/tv-screen";
import { FramedUpload } from "./framed-upload";

/** A tiny gallery wall: one framed print. Drop a picture on the tube to swap it. */
export default function FramedUploadChannel() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[4cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] mb-[4cqw] text-[5.4cqw] leading-tight font-semibold tracking-tight">
          Hang your first picture
        </p>
        <FramedUpload
          defaultSrc="/previews/framed-upload-sample.svg"
          alt="A violet poster with a setting sun"
          style={{ maxWidth: "26cqw" }}
        />
      </div>
    </Screen>
  );
}
