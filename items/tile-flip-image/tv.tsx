"use client";

import { Screen } from "@/components/site/tv-screen";
import { TileFlipImage } from "./tile-flip-image";
import { useDemoPicture } from "./demo";

/** The photos, their tiles turning over to the next one every 3 seconds. */
export default function TileFlipImageChannel() {
  const { src, alt } = useDemoPicture(1800);
  return (
    <Screen>
      <div className="@container grid h-full place-items-center px-[8cqi]">
        <TileFlipImage src={src} alt={alt} className="max-w-[min(100%,26rem)] rounded-[2cqi] shadow-[0_0_0_1px_var(--faint)]" style={{ maxHeight: "80cqh" }} />
      </div>
    </Screen>
  );
}
