import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "spotlight-ticker",
  name: "Spotlight Ticker",
  group: "components",
  category: "Media",
  // Short line for the docs home, search and family cards.
  blurb: "A gliding row of pictures that stops as the one you point at grows.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A gliding row of pictures stops as the one you point at grows, and a click opens its story. Use it on a home or work page with 5 to 10 projects.",
  tags: ["Ticker", "Marquee", "Hover", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 10:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react image marquee", title: "Image Marquee for React" },
};
