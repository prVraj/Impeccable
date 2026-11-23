import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "tile-flip-image",
  name: "Tile flip image",
  group: "animations",
  category: "Image change",
  // Short line for the docs home, search and family cards.
  blurb: "A picture that turns over tile by tile onto the next one.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A picture that turns over in tiny tiles, in random order, onto the next one in 1.2 seconds. Use it on a hero or product shot that changes.",
  tags: ["Image", "Image change", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 19:15",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react image transition", title: "Image Tile Transition for React" },
};
