import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "rolling-clock",
  name: "Rolling clock",
  group: "components",
  category: "Data display",
  // Short line for the docs home, search and family cards.
  blurb: "A live clock whose digits roll up on a curve as the time changes.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A live clock whose digits roll on a curve, the new number rising from below as the old one swings away. Use it in a hero, footer or dashboard header.",
  tags: ["Clock", "Live time", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 11:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react animated clock", title: "Animated Rolling Clock for React" },
};
