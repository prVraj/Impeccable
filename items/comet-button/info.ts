import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "comet-button",
  name: "Comet button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A dark pill whose soft glow races round its border while it loads.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A dark pill whose glow races round its border while it loads, then glides back to rest. Use it on a save or sign up button that waits on a server.",
  tags: ["Button", "Loading", "Glow", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-18 12:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "loading button react", title: "Glowing Loading Button for React" },
};
