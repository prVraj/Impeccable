import type { ItemInfo } from "@/lib/site";

export const info: ItemInfo = {
  slug: "intent-sidebar",
  name: "Intent sidebar",
  group: "intentional",
  category: "Sidebar",
  // Short line for the docs home, search and family cards.
  blurb: "A chat sidebar with hover cards and menus that know where you are heading.",
  // Two lines at most: the line under the page title, the meta description and the install description.
  description:
    "A chat sidebar that reads intent: hover cards that follow you from chat to chat, every file one click away, and submenus that stay open on a diagonal.",
  tags: ["Sidebar", "Hover card", "Safe triangle", "Keyboard", "No extra packages", "Light + dark", "Mobile"],
  // When it was added (newest shows first in search and on the home page).
  added: "2026-11-26 16:30",
  // Search words for Google and AI tools (see the seo field in lib/site.ts). The visible name stays as it is.
  seo: { keyword: "react sidebar hover card submenu", title: "Chat Sidebar with Hover Cards for React" },
  // The Logic checkpoint: every rule this sidebar follows, shown right after Installation.
  // Each rule earns its place: it changes what a person sees or does here, and says why when the why isn't obvious.
  // Generic menu basics (flip when there's no room, close on outside click) are left out on purpose.
  logic: [
    {
      title: "Hover card",
      rules: [
        "Point at a chat for 400 ms and a card opens beside it, so passing over chats never flashes a card.",
        "With a card open, pointing at another chat moves the card there at once, with no second wait.",
        "The card glides to the new chat in 260 ms and resizes to fit, so it never closes, jumps or blinks.",
        "On the way to the card you can cross other chats. They're ignored unless you rest on one for 500 ms.",
        "Leave the chat and the card, and it closes after 300 ms, so a small slip doesn't lose it.",
        "Clicking a chat opens it and hides the card until you point at another chat, so it never covers what you opened.",
      ],
    },
    {
      title: "Files in a chat",
      rules: [
        "The card shows the chat's first file. Click it to open the chat right at that file.",
        "Point at or click +N and the card grows into a list of every file, so you can jump straight to any of them.",
      ],
    },
    {
      title: "The ⋯ menu",
      rules: [
        "⋯ shows on the chat you point at and stays lit while its menu is open, so you know which chat the menu is for.",
        "Every action has a letter: O, P, U, R, S, A or D picks it while the menu is open.",
        "Notifications and Move to project show their current choice, so you can see it without opening them.",
        "An unread chat shows its name a little bolder, with no dot. Opening it marks it read.",
      ],
    },
    {
      title: "Safe triangle",
      rules: [
        "Point at Notifications or Move to project for 100 ms to open its submenu, so brushing past doesn't open it.",
        "Moving diagonally toward the open submenu, the rows you cross are ignored, so it stays open.",
        "Rest on another row for 500 ms and it counts: the submenu closes and that row lights up.",
        "Move away from the submenu instead, and the row under your pointer lights up at once.",
      ],
    },
    {
      title: "Keyboard",
      rules: [
        "Arrow keys move through the menu. Right arrow opens a submenu, Left arrow or Esc closes it.",
        "Tab to a chat and its card shows. Right arrow moves into the card to reach its files.",
      ],
    },
    {
      title: "Phones",
      rules: [
        "No hover on phones. Tap a chat to open it, or tap its file count for a sheet with every file.",
        "⋯ is always visible and opens a sheet from the bottom. Submenus slide in as pages with a back button.",
      ],
    },
    {
      title: "Reduced motion",
      rules: ["With reduced motion on, nothing glides or slides. Cards, menus and sheets only fade."],
    },
  ],
};
