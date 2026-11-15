import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "infinite-curl-gallery",
  name: "Infinite-Curl-Gallery",
  group: "components",
  category: "Gallery",
  // Short line for the docs home, search and family cards.
  blurb: "Pictures drift on an endless canvas you can throw any way.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Pictures drift on an endless canvas you can throw any way, curling and fading at its edges. Use it on a portfolio or moodboard with 8 to 30 pictures.",
  tags: ["Gallery", "Drag", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-15 15:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "infinite gallery react", title: "Infinite Gallery for React" },
};
