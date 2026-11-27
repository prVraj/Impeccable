import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "particle-wake",
  name: "Particle Wake",
  group: "interactions",
  category: "Pointer effect",
  // Short line for the docs home, search and family cards.
  blurb: "Your logo or a word in tiny dots that the pointer sweeps away.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Your logo or a word in tiny dots that the pointer sweeps away, then they drift back home. Use it as the one big moment of a hero or a footer.",
  tags: ["Your SVG", "Pointer", "Tap and drag", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-27 12:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react svg particle effect", title: "SVG Particle Effect for React" },
};
