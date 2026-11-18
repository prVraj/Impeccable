import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "kitcut-button",
  name: "Kitcut button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A button that cracks and splits open while it loads, then snaps back.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A button that cracks down the middle and splits open while it loads, then snaps back with a WooHoo. Use it on your main action, like Publish or Pay.",
  tags: ["Button", "Loading", "Sound", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-18 15:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "split loading button react", title: "Cracking Split Loading Button for React" },
};
