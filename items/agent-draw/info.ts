import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "agent-draw",
  name: "Agent-Draw",
  group: "animations",
  category: "Loader",
  // Short line for the docs home, search and family cards.
  blurb: "Named cursors draw your page's skeleton live while it loads.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Named cursors draw your page's skeleton while its data loads, then the real content fades in. Use it on slow screens, like a dashboard or profile.",
  tags: ["Loader", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-07 19:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "skeleton loading animation react", title: "Skeleton Loading Animation for React" },
};
