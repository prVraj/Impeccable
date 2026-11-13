import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "peter-tingle-button",
  name: "Peter-Tingle-button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A button that feels your pointer coming and tingles toward it.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A button that feels your pointer coming and tingles, with wavy lines pulsing toward it. Use it for one main action, like a hero call to action.",
  tags: ["Button", "Pointer", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-13 10:15",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "animated button react", title: "Animated Button for React" },
};
