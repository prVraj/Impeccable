"use client";

import { Screen } from "@/components/site/tv-screen";
import { TumbleGallery } from "./tumble-gallery";
import { DEMO_IMAGES } from "./demo";

/** The drum on the tube: it flips on its own and can be dragged up or down. */
export default function TumbleGalleryChannel() {
  return (
    <Screen>
      <TumbleGallery images={DEMO_IMAGES} height="100%" aria-label="Places to see" />
    </Screen>
  );
}
