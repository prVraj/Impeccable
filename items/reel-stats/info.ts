import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "reel-stats",
  name: "Reel Stats",
  group: "sections",
  family: "stats-sections",
  category: "Stats section",
  // Short line for the docs home, search and family cards.
  blurb: "Point at a heading and its picture rolls in as a soft tab glides to it.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Point at a heading and its picture rolls into the frame as a soft tab glides to it. Use it on a services or landing page with 3 to 6 short points.",
  tags: ["Stats section", "Hover", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 18:20",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "hover image reveal section react", title: "Hover Image Stats Section for React" },
};
