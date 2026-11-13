import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "framed-upload",
  name: "Framed-Upload",
  group: "components",
  category: "Upload",
  // Short line for the docs home, search and family cards.
  blurb: "Drop in a picture and it hangs in a frame, like a print on a wall.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall. Use it on cover or portfolio forms, one picture per frame.",
  tags: ["Upload", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-11 23:50",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "image upload component react", title: "Image Upload Component for React" },
};
