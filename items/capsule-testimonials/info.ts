import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "capsule-testimonials",
  name: "Capsule Testimonials",
  group: "sections",
  family: "testimonial-sections",
  category: "Testimonial section",
  // Short line for the docs home, search and family cards.
  blurb: "Reviews sit as slim capsules, then open into a full card.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Reviews sit as slim capsules with a face and a name, then open into a full card on click. Use it on a landing or pricing page with 4 to 7 reviews.",
  tags: ["Testimonial section", "Expand", "Hover", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-16 18:14",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "testimonial section react", title: "React Testimonial Section" },
};
