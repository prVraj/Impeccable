import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "faq-sections",
  kind: "family",
  name: "FAQ sections",
  group: "sections",
  // Short line for the docs home, search and family cards.
  blurb: "Every FAQ section in the library, side by side.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Every FAQ section in the library, side by side. Pick the one that fits your product, then open it to try it, install it or blend it in.",
  // Its page shows its own labels (how many sections, light + dark, mobile).
  tags: [],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-14 15:25",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "faq section", title: "FAQ Section Templates for React" },
};
