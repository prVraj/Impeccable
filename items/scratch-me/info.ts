import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "scratch-me",
  name: "Scratch-me",
  group: "components",
  category: "Interactive",
  // Short line for the docs home, search and family cards.
  blurb: "Scratch off the foil to reveal a promo code; it copies itself.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A scratch-off foil hides a promo code that copies itself once revealed. Use it on a pricing, upgrade or thank-you page for one special offer.",
  tags: ["Interactive", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-11 12:10",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "scratch card react", title: "Scratch Card Component for React" },
};
