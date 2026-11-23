import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "settle-counter",
  name: "Settle counter",
  group: "components",
  category: "Number change",
  // Short line for the docs home, search and family cards.
  blurb: "A number whose changed digits arrive big and faint, then settle into place.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A number where each changed digit arrives big and faint, then settles in as the old one fades. Use it large, on a live count in a hero or dashboard.",
  tags: ["Counter", "Number change", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 17:10",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react animated number counter", title: "Animated Number Counter for React" },
};
