"use client";

import { Screen } from "@/components/site/tv-screen";
import { IsometricWall } from "./isometric-wall";
import { DEMO_IMAGES } from "./demo";

/** The wall fills the tube and its columns slide along; a short line sits on it, like a hero. */
export default function IsometricWallChannel() {
  return (
    <Screen>
      <IsometricWall images={DEMO_IMAGES} columns={4} speed={14} className="flex h-full w-full items-center justify-center">
        <p
          className="rounded-full px-3 py-1 text-[13px] font-semibold tracking-[-0.01em] text-[var(--fg)]"
          style={{ background: "color-mix(in oklab, var(--bg) 82%, transparent)" }}
        >
          Components that move
        </p>
      </IsometricWall>
    </Screen>
  );
}
