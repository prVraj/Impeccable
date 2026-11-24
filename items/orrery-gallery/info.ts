import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "orrery-gallery",
  name: "Orrery Gallery",
  group: "components",
  category: "Media",
  // Short line for the docs home, search and family cards.
  blurb: "Round pictures orbit your name, then open into a strip you drag.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Round pictures orbit your name, fall into a stack and open into a curved strip you drag. Use it on a portfolio or launch page with 6 to 12 links.",
  tags: ["Media", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-15 15:45",
  // When it last got a change people would notice (the latest updates get the Updated chip).
  updated: "2026-11-16 19:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "draggable image gallery react", title: "Orbiting Image Gallery for React" },
};
