import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "coffee-faq",
  name: "Coffee-FAQ",
  group: "sections",
  family: "faq-sections",
  category: "FAQ section",
  // Short line for the docs home, search and family cards.
  blurb: "Questions that open one at a time, and a chat box that types back.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Questions that open one at a time, with a chat box at the end that types a reply to anything. Use it near the bottom of a landing or pricing page.",
  tags: ["FAQ section", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-14 15:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "faq section react", title: "Animated FAQ Section for React" },
};
