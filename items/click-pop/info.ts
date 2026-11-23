import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "click-pop",
  name: "Click Pop",
  group: "interactions",
  category: "Click effect",
  // Short line for the docs home, search and family cards.
  blurb: "A small pop at the pointer on every click, in five types: burst, ring, particles, crosshair and wavy.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A small pop at the pointer on every click: burst, ring, particles, crosshair or wavy. Use it once in your layout, in a calm color, for the whole site.",
  tags: ["Click effect", "5 types", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 18:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react click effect", title: "Click Effect Animation for React" },
};
