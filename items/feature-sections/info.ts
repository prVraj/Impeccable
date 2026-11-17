import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "feature-sections",
  kind: "family",
  name: "Feature sections",
  group: "sections",
  // Short line for the docs home, search and family cards.
  blurb: "Every feature section in the library, side by side.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Every feature section in the library, side by side. Pick the one that tells your product story best, then open it to try, install or blend it in.",
  // Its page shows its own labels (how many sections, light + dark, mobile).
  tags: [],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-17 17:05",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "feature section", title: "Templates for React" },
};
