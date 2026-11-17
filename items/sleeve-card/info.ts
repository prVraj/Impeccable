import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "sleeve-card",
  name: "Sleeve Card",
  group: "components",
  category: "Card",
  // Short line for the docs home, search and family cards.
  blurb: "A project card lifts in 3D and a View Project tab slides out.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A project card lifts and turns in 3D on hover as a View Project tab slides out from behind. Use it on a portfolio page, one card for each project.",
  tags: ["Card", "3D", "Hover", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-17 17:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "3d hover card react", title: "3D Hover Project Card for React" },
};
