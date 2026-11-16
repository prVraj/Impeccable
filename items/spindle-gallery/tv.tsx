"use client";

import { Screen } from "@/components/site/tv-screen";
import { SpindleGallery } from "./spindle-gallery";
import { DEMO_IMAGES } from "./demo";

/** The full gallery on the tube: the orbit plays each time the channel comes on, then it turns and can be dragged. */
export default function SpindleGalleryChannel() {
  return (
    <Screen>
      <SpindleGallery images={DEMO_IMAGES} height="100%" aria-label="Impeccable posters" />
    </Screen>
  );
}
