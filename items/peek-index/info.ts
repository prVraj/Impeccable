import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "peek-index",
  name: "Peek Index",
  group: "components",
  category: "List",
  // Short line for the docs home, search and family cards.
  blurb: "Numbered rows whose picture follows your pointer, and open into a story.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Numbered rows whose picture or video follows your pointer; a click opens a story with points and a link. Made for 3 to 8 services or products.",
  tags: ["List", "Hover", "Expand", "Video", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-24 12:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react services accordion with hover image", title: "Numbered Services List with Hover Image for React" },
};
