import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "health-check",
  name: "Health check",
  group: "skills",
  category: "Skill",
  // Short line for the docs home, search and family cards.
  blurb: "Checks your site for leaked keys, risky packages and broken pages.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A skill that checks your site for leaked keys, risky packages and broken pages, then hands you the push commands. Run it before every push or launch.",
  tags: ["Skill", "Claude", "Free + MIT", "Security"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-17 18:20",
  // When it last got a change people would notice (the latest updates get the Updated chip).
  updated: "2026-11-19 13:56",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "claude code security review", title: "Claude Code Pre-Push Security Check" },
};
