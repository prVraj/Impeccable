import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "velvet-grain",
  name: "Velvet Grain",
  group: "backgrounds",
  category: "Background",
  // Short line for the docs home, search and family cards.
  blurb: "A still grain background you brush like velvet: a heavy brush follows the pointer and smooths a track.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A fine grain background you brush like velvet. A heavy, soft brush trails your pointer and the track slowly fills back in. Put it behind a calm hero.",
  tags: ["Background", "WebGL", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-27 11:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "interactive grain background react", title: "Interactive Grain Background for React" },
};
