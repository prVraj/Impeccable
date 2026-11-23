import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "cube-flip-image",
  name: "Cube flip image",
  group: "interactions",
  category: "Image change",
  // Short line for the docs home, search and family cards.
  blurb: "A picture of tiny cubes that roll out from your click to the next one.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Click a picture and tiny cubes roll over from that spot, a wave that shows the next one. Use it on a gallery or hero with 3 to 10 photos.",
  tags: ["Image", "Click", "Sound", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-23 23:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react click image transition", title: "Cube Image Transition for React" },
};
