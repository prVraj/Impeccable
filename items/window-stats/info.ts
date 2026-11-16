import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "window-stats",
  name: "Window Stats",
  group: "sections",
  family: "stats-sections",
  category: "Stats section",
  // Short line for the docs home, search and family cards.
  blurb: "Your numbers on photo cards that slide over a still statement.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Your numbers on photo cards that slide over a still statement, which softens behind them. Use it on an about or landing page with 3 to 7 numbers.",
  tags: ["Stats section", "Scroll", "Parallax", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 10:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "parallax scroll section react", title: "Parallax Stats Section for React" },
};
