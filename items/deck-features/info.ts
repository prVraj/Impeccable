import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "deck-features",
  name: "Deck Features",
  group: "sections",
  family: "feature-sections",
  category: "Feature section",
  // Short line for the docs home, search and family cards.
  blurb: "Feature cards pile up like a deck as you scroll past them.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Feature cards pile up like a deck as you scroll, and the last one slides through them all. Use it on a landing page to show 3 to 6 features.",
  tags: ["Feature section", "Scroll", "Sticky", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-17 17:06",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "stacking cards section react", title: "Stacking Cards Section for React" },
};
