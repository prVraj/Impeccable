import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "peek-list",
  name: "Peek List",
  group: "components",
  category: "List",
  // Short line for the docs home, search and family cards.
  blurb: "Rows whose picture follows your pointer, and open like a pop up.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Point at a row and its picture follows your pointer; a click opens the row like a pop up. Use it for 3 to 8 products, services or features.",
  tags: ["List", "Hover", "Expand", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 14:30",
  // When it last got a change people would notice (the latest updates get the Updated chip).
  updated: "2026-11-24 12:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react hover image list", title: "Hover Image Reveal List for React" },
};
