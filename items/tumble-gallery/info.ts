import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "tumble-gallery",
  name: "Tumble Gallery",
  group: "components",
  category: "Media",
  // Short line for the docs home, search and family cards.
  blurb: "A split flap board for pictures that flips in 3D like a card file.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A split flap board for pictures that flips in 3D and lands flat on the next one. Use it on a hero or portfolio page with 4 or more wide pictures.",
  tags: ["Media", "3D", "Split flap", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-20 14:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "split flap image gallery react", title: "3D Split Flap Image Gallery for React" },
};
