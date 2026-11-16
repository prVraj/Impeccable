import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "spindle-gallery",
  name: "Spindle Gallery",
  group: "components",
  category: "Media",
  // Short line for the docs home, search and family cards.
  blurb: "Round pictures orbit, then open into a turning 3D ring of cards.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Round pictures orbit and stack, then open into a 3D ring of cards with space between them. Use it on a launch or portfolio page with 8 to 12 posters.",
  tags: ["Media", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 14:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "3d image carousel react", title: "3D Image Carousel for React" },
};
