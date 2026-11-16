import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "stats-sections",
  kind: "family",
  name: "Stats sections",
  group: "sections",
  // Short line for the docs home, search and family cards.
  blurb: "Every stats section in the library, side by side.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Every stats section in the library, side by side. Pick the one that fits your story, then open it to try it, install it or blend it in.",
  // Its page shows its own labels (how many sections, light + dark, mobile).
  tags: [],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 09:58",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "stats section", title: "Stats Section Templates for React" },
};
