import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "liquid-orbit-loader",
  name: "Liquid Orbit loader",
  group: "loaders",
  category: "Loader",
  // Short line for the docs home, search and family cards.
  blurb: "A liquid drop floats and wobbles inside a ring of the same liquid.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A drop of liquid floats and wobbles in a liquid ring, then pours away and rises back. Use it on a first load or a dashboard waiting on data.",
  tags: ["Loader", "Spinner", "Liquid", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-24 15:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react liquid loader", title: "Liquid Loading Animation for React" },
};
