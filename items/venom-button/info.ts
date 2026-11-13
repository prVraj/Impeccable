import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "venom-button",
  name: "Venom-button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A glossy ink button whose tentacles grab your pointer and pull on it.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A glossy ink button whose tentacles grab your pointer and pull on it until they snap. Use it for one main action, like the call to action in a hero.",
  tags: ["Button", "Pointer", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-13 09:40",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "animated button react", title: "Ink Tentacle Button for React" },
};
