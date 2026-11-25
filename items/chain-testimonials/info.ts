import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "chain-testimonials",
  name: "Chain Testimonials",
  group: "sections",
  family: "testimonial-sections",
  category: "Testimonial section",
  // Short line for the docs home, search and family cards.
  blurb: "Picture cards joined like a chain; the middle one opens into a review.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Picture cards joined like a chain, and the middle one opens into a review. The chain shifts on its own. Use it on a landing page with 5 to 9 reviews.",
  tags: ["Testimonial section", "Carousel", "Autoplay", "Swipe", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-25 12:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react testimonial carousel", title: "React Testimonial Carousel" },
};
