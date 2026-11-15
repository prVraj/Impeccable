"use client";

import { Screen } from "@/components/site/tv-screen";
import { OrreryGallery } from "./orrery-gallery";
import { DEMO_IMAGES } from "./demo";

/** The full gallery on the tube: the orbit plays each time the channel comes on, then it can be dragged. */
export default function OrreryGalleryChannel() {
  return (
    <Screen>
      <OrreryGallery images={DEMO_IMAGES} brand="Impeccable" height="100%" aria-label="Impeccable pictures" />
    </Screen>
  );
}
