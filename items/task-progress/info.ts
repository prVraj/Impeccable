import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "task-progress",
  name: "Task progress",
  group: "components",
  category: "Feedback",
  // Short line for the docs home, search and family cards.
  blurb: "A task list that strikes each task through as it finishes.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A task list that shows what is done, running or next, and strikes tasks through as they finish. Use it on AI agent or setup screens with 5 to 9 steps.",
  tags: ["Feedback", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-14 15:30",
  // Last visible change: the folded list now follows the task in progress.
  updated: "2026-11-25 08:35",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "animated task list react", title: "Animated Task List for React" },
};
