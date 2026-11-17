import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "isometric-wall",
  name: "Isometric Wall",
  group: "backgrounds",
  category: "Background",
  // Short line for the docs home, search and family cards.
  blurb: "Faded picture cards slide along diagonal columns; hover one and it lifts.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Faded picture cards slide slowly along diagonal columns on a tilted floor, and the one you hover lifts gently. Use it behind a hero with one short headline.",
  tags: ["Background", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 23:50",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "isometric image grid background react", title: "Isometric Image Grid for React" },
};
