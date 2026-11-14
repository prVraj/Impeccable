import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "peephole-button",
  name: "Peephole-button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A glass button with a picture window that opens on hover.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A glass button with a picture window that opens on hover into the whole image or your brand color. Use it on Contact or Gallery with a real photo.",
  tags: ["Button", "Glass", "Image reveal", "Avatar", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-14 13:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "image reveal button", title: "Image Reveal Button for React" },
};
