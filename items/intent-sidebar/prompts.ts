/* ---------- Intent sidebar ----------
 * Install: adds the exact sidebar; asks only where it goes and where its chats and files come from.
 * Blend: asks three short questions, then fits it through the component's own props. */

const ONE_LINE = `A chat sidebar (Pinned and Recents, or any groups) that reads what I mean to do. When I rest my pointer on a chat for 400ms, a hover card opens beside the sidebar with the chat's name, when it was last used and its first file; once it is open, moving to another chat glides the card there at once with no new wait. The first file opens the chat at that file, and pointing at "+N" grows the card into a list of every file in the chat. Each chat has a ⋯ menu with letter shortcuts and two submenus (Notifications, Move to project) that use a safe triangle: moving diagonally towards an open submenu never closes it, even across other rows, but resting on another row for 500ms closes it and lights that row. On phones there is no hover: a tap opens a chat, a file count opens the files in a bottom sheet, and ⋯ opens the menu as a bottom sheet whose submenus slide in like pages.`;

const SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/intent-sidebar.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the timers are plain \`setTimeout\`, the safe triangle is a few lines of geometry on pointer positions, and every motion is a CSS transition or keyframe. Its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`intent-sidebar.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/intent-sidebar.tsx\`
- Keep these exports and their names: \`IntentSidebar\` (also the default export), \`IntentSidebarProps\`, \`IntentChat\`, \`IntentSection\`, \`IntentFile\`, \`IntentAction\`, \`IntentNotify\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the timing values at the top exactly as written: \`OPEN_DELAY\`, \`CLOSE_DELAY\`, \`SKIP_WINDOW\`, \`SUB_OPEN_DELAY\`, \`REST_MS\`, \`GLIDE_MS\`, \`EASE\`, and the \`CSS\` block. They are the design and its feel.
- Keep the fallbacks: hover cards and side submenus only where a real mouse can hover (\`(hover: hover) and (pointer: fine)\`); phones and tablets get taps and bottom sheets. The menu works fully from the keyboard (arrows, Home, End, Enter, Space, Esc, letter shortcuts). With \`prefers-reduced-motion: reduce\` nothing glides or slides, things only fade.`;

const HOW = `## How the sidebar works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Hover card.** Rest on a chat for 400ms and the card fades in just right of the sidebar, its title level with the chat's name. A quick pass opens nothing. While a card is open, pointing at another chat moves the card there at once, gliding in 260ms while its words fade in and its height eases to fit. It closes 300ms after the pointer leaves both the chat and the card, and pointing at a chat within 300ms after that opens its card at once. The card has its own safe triangle: on the way from a chat to its card, other chats crossed inside the triangle (from where the pointer left the chat to the card's near corners) are ignored, unless the pointer rests on one for 500ms. Near the bottom it moves up to stay inside the sidebar. Clicking a chat opens it and keeps the card away until the pointer moves to another chat. Scrolling closes it.
2. **Files.** The card shows the first file; clicking it opens the chat at that file. "+N" counts the rest: pointing at it (or clicking it) grows the card into a list of every file, six visible and the rest scrolling. Each file opens the chat at that file.
3. **The ⋯ menu.** ⋯ shows on the chat you point at and stays lit while open. The menu opens under the chat (above it when there is no room). Letters pick actions: O open in new window, P pin or unpin, U mark as unread or read, R rename, S settings, A archive, D delete. An unread chat shows its name one weight bolder (500), never a dot. Notifications and Move to project show their current choice and open a submenu after 100ms. Click outside, Esc, scrolling or switching windows closes it; pressing ⋯ again closes it too.
4. **Safe triangle.** While a submenu is open, an invisible triangle runs from where the pointer left the submenu's row to the submenu's two near corners. Rows crossed inside that triangle are ignored. Resting on one for 500ms counts: the submenu closes and that row lights up. Moving outside the triangle switches at once. With no room on the right, the submenu opens on the left and the triangle turns with it.
5. **Phones.** No hover cards. A tap opens a chat; each chat shows its file count, which opens a bottom sheet of files; ⋯ is always visible and opens a bottom sheet menu whose submenus slide in like pages with a back button. Tap outside or Esc closes it.
6. **Colors.** Text takes \`--foreground\` (else \`--fg\`); rows, card and menus mix it into \`--background\` (else \`--bg\`), so it follows light and dark mode. Delete is red.`;

const USE = `\`\`\`tsx
import { IntentSidebar, type IntentSection } from "@/components/ui/intent-sidebar";

const SECTIONS: IntentSection[] = [
  {
    title: "Recents",
    chats: [
      {
        id: "launch",
        title: "Launch plan",
        time: "2h ago",
        files: [
          { id: "plan", name: "Launch plan" },
          { id: "copy", name: "Landing page copy" },
        ],
      },
    ],
  },
];

export function Sidebar() {
  return (
    <aside style={{ display: "flex", flexDirection: "column", height: "100dvh", width: 260 }}>
      <IntentSidebar
        sections={SECTIONS}
        activeId="launch"
        onOpen={(chatId, fileId) => console.log(chatId, fileId)}
        onAction={(chatId, action, value) => console.log(chatId, action, value)}
      />
    </aside>
  );
}
\`\`\``;

export function installPrompt(tsSource: string) {
  return `# Intent sidebar

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its sidebars or lists of chats, threads, documents or projects, where that data comes from (and its files or pages), and how the app opens one. Then ask me this in one message and wait for my answer:

- **Where should it go, and what does it list?** Suggest the 1–3 spots it fits best from my code. For each one, say which data fills its groups and chats, where each chat's time and files come from, and what \`onOpen\` and \`onAction\` would call in my app. I can pick one or name another.
  *Why: the sidebar only shows what it is given, so it needs my real chats, files and actions to be useful.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The hover card's wait and glide, the +N file list, the ⋯ menu with its letters, the safe triangle, the 500ms rest, the phone sheets and all their timing are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing sidebar list there, keep that spot's data and links and remove only the old markup. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its app window, its chats about Impeccable UI, and the home page's TV.

${SHARED_BUILD}

## Use it

${USE}

- Give its parent a height (a full-height sidebar, or a flex column): the list scrolls inside it.
- The card and menus float just right of the sidebar, over the page: no \`overflow: hidden\` on its parents.
- \`onAction\` tells my app what was picked (\`pin\`, \`notify\` with "all", "mentions" or "none", \`move\` with a project name, \`delete\` and so on). The sidebar never changes my data itself, so update the chats there.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- Resting on a chat opens its card in about 0.4 seconds; moving down the list moves the card with no new wait; leaving closes it in about 0.3 seconds. "+N" lists every file and each one opens the chat at that file.
- In the ⋯ menu, moving diagonally from Notifications to its submenu across Settings keeps the submenu open; resting on Settings for half a second closes it and lights Settings.
- It looks right in light and dark mode (check both).
- It works with a finger on a phone: no hover cards, taps open chats, the file count and ⋯ open bottom sheets, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or slides; things only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/intent-sidebar.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Intent sidebar, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its sidebars and lists of chats, threads, documents or projects, where their data and files come from, how the app opens one, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and what does it list?** Suggest the 1–3 spots it fits best, naming the groups (like Pinned and Recents), where each chat's time and files come from, and what opening a chat or a file does.
      *Why: the sidebar only shows what it is given, so it needs my real chats and files.*
   2. **Which menu actions does my app support?** Suggest which of Open in new window, Pin, Mark as unread, Rename, Notifications, Move to project, Settings, Archive and Delete to wire up, and which projects Move to project lists.
      *Why: every action in the menu should do something real in my app.*
   3. **Which theme colors should it use?** Suggest my sidebar's background and text colors (from my theme variables) for \`--background\` and \`--foreground\` on its wrapper.
      *Why: the rows, card and menus mix only those two colors, so they decide how it fits.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and data, the actions wired, the colors, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and data: \`sections\`, \`activeId\`, \`projects\`, \`aria-label\`, and what \`onOpen\` and \`onAction\` do in my app.
- The colors: \`--background\` and \`--foreground\` set on its wrapper from my theme variables, plus \`className\` and \`style\` on the sidebar.
- Actions my app doesn't support: tell me which ones, and remove only those lines from \`entriesFor\` (and their letters).

**Locked**

- The hover card's 400ms wait, its glide and skip delay, the +N file list, the menu's shape and letters, the safe triangle with its 500ms rest, the phone sheets, and all timing stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its app window, its Impeccable UI chats and the home page's TV).

${SHARED_BUILD}

## Fit it to the brand

${USE}

- Colors come from my theme on their own: set \`--foreground\` and \`--background\` from my theme variables on the wrapper, never as hex on the component.
- Give its parent a height (a full-height sidebar, or a flex column): the list scrolls inside it. No \`overflow: hidden\` on its parents, so the card and menus can float over the page.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- Resting on a chat opens its card in about 0.4 seconds; moving down the list moves the card with no new wait; "+N" lists every file and each one opens the chat at that file.
- In the ⋯ menu, moving diagonally to a submenu across another row keeps it open; resting on that row for half a second closes it and lights the row.
- It looks right in light and dark mode with my colors (check both).
- It works with a finger on a phone: no hover cards, taps open chats, the file count and ⋯ open bottom sheets, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or slides; things only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/intent-sidebar.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
