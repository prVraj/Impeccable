"use client";

import { Screen } from "@/components/site/tv-screen";
import { InfiniteCurlGallery } from "./infinite-curl-gallery";
import { SAMPLE_IMAGES } from "./demo";

/** The gallery filling the tube, drifting on its own. Grab it to throw it. */
export default function InfiniteCurlGalleryChannel() {
  return (
    <Screen>
      <InfiniteCurlGallery images={SAMPLE_IMAGES} tileSize={84} speed={29} aria-label="Sample photos" className="absolute inset-0" />
    </Screen>
  );
}
