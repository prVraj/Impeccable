import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "pixel-button",
  name: "Pixel-button",
  group: "buttons",
  category: "Button",
  // Short line for the docs home, search and family cards.
  blurb: "A button with twinkling pixels behind its label, a light circling its edge and a click wave.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A button with twinkling pixels behind its label, on hover or always on, a light circling its edge and a click wave. Use it for one main action.",
  tags: ["Button", "Pixel", "Hover glow", "Click wave", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-14 12:00",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "pixel button react", title: "Pixel Glow Button with Click Wave for React" },
};
