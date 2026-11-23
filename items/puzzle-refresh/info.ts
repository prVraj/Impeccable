import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "puzzle-refresh",
  name: "Puzzle Refresh",
  group: "animations",
  category: "Page refresh",
  // Short line for the docs home, search and family cards.
  blurb: "Your page cracks into jigsaw pieces that fall, then fly back together.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Your page cracks into jigsaw pieces that tumble into a heap, then fly back up and click into place. Use it on refresh for a playful site or portfolio.",
  tags: ["Page refresh", "Sound", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-24 00:20",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "jigsaw puzzle animation", title: "Jigsaw Puzzle Animation for React" },
};
