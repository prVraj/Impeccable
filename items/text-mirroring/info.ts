import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "text-mirroring",
  name: "Text-mirroring",
  group: "components",
  category: "Text",
  // Short line for the docs home, search and family cards.
  blurb: "Bold header text that echoes into an infinite glass mirror on hover.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Bold header text that echoes into an infinite glass mirror on hover. Use it on one hero or section title of two to four short words.",
  tags: ["Text", "Hover", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-12 19:45",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "text hover effects react", title: "Glass Text Hover Effect for React" },
};
