/* ---------- Peek List ----------
 * Install: adds the exact list; asks only where it goes and which rows it shows.
 * Blend: asks three short questions, then fits it through the component's own props. */

const PEEK_ONE_LINE = `A list of rows, one for each product, service or feature. When I point at a row, its picture appears just above my pointer and follows it, but only inside that row, and the other rows soften; leaving the row fades it away and entering another row shows that row's picture. When I click a row, it grows in place like a pop up and pushes the rows below down, while the picture glides from my pointer to the left of the story: the heading, a short description and one button. The + turns into an X in the top right corner of the open row. The X, Esc or a click anywhere outside closes it. On a phone there is no floating picture: one tap opens the row.`;

const PEEK_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/peek-list.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the picture follows the pointer with one \`requestAnimationFrame\` loop that runs only while a picture shows, the fades and the turning X are CSS transitions, and the row growing and the picture's glide use the browser's own Web Animations API. Its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`peek-list.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/peek-list.tsx\`
- Keep these exports and their names: \`PeekList\` (also the default export), \`PeekListProps\`, \`PeekListItem\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PEEK_IN_MS\`, \`PEEK_OUT_MS\`, \`PEEK_SCALE\`, \`PEEK_EASE\`, \`PEEK_LIFT\`, \`FOLLOW\`, \`OPEN_MS\`, \`CLOSE_MS\`, \`GLIDE_EASE\`, \`DIM\`, \`DIM_MS\`, \`TEXT_DELAY\`, \`TEXT_MS\`, \`TEXT_DROP\`, \`TEXT_BLUR\`, \`TEXT_STAGGER\`, \`TEXT_OUT_MS\`, \`X_SIZE\`, \`X_GAP\`, \`STACK_AT\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the floating picture shows only where a real mouse can hover (\`(hover: hover) and (pointer: fine)\`), never on phones or tablets, where one tap opens the row. Narrow lists (under 560px) put the picture above the words. Tab moves row by row, Enter opens a row and moves focus to the X, Esc closes it and gives focus back. With \`prefers-reduced-motion: reduce\` nothing glides or grows, things only fade.`;

const PEEK_HOW = `## How the list works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The rows.** Each row is a soft gray box (the text color mixed 5% into the page) with 16px corners, the name on the left and a + on the right. Pointing at a row deepens its gray a little.
2. **Point at a row.** Its picture (240px wide by default, 3:2, 10px corners, a soft shadow) appears centered over the pointer with its bottom edge 12px above the pointer's tip, so it never covers the pointer, fading in while it grows from 90% in 420ms with a gentle start and a long soft landing. It trails the pointer softly (about a tenth of a second behind) and stays inside the row's sides, so it is never cut. Leave the row and it fades away in 300ms where it is; enter another row and that row's picture appears at the pointer. Only one row shows a picture at a time. While the pointer is on the list, every other row softens to 70% in the same 420ms, and the row you point at stays at full strength.
3. **Click it.** The row grows to fit its story in 720ms and pushes the rows below down, while the other rows dim to 40% at the same pace. The picture glides from where it floats to its seat on the left of the story in the same 720ms, growing as it goes. The title glides from its spot in the row to the top of the story. The + turns 45 degrees into an X on a small round button, moving in step to 16px inside the open row's top right corner (on narrow lists it sits on the picture's top right corner). Then the description and the button drop in from above, line by line, each falling 16px, fading in and losing a 4px blur over 650ms, 110ms apart, starting 380ms in.
4. **Close it.** Like a pop up: the X, Esc or a click anywhere outside the row. The story and the picture fade away together in 220ms, then the row folds back in 600ms while the title glides home and the X turns back into the +, and the other rows come back. A click on another row closes the open one and opens that one.
5. **Phones.** No hover, so no floating picture: one tap opens the row, and on narrow lists the picture sits above the words.
6. **Colors.** The text takes \`--foreground\` (else \`--fg\`) and the rows mix it into \`--background\` (else \`--bg\`), so it follows light and dark mode. The button is a quiet outlined button with 8px corners in those same colors.`;

const USE = `\`\`\`tsx
import { PeekList } from "@/components/ui/peek-list";

const ITEMS = [
  {
    title: "Design systems",
    description: "Tokens, components and docs your team can build on for years.",
    image: { src: "/work/design-systems.webp", alt: "A design system's color tokens and buttons" },
    cta: { label: "See the work", href: "/work/design-systems" },
  },
  // one entry per row, 3 to 8 reads best
];

export function Services() {
  return <PeekList items={ITEMS} aria-label="What we do" />;
}
\`\`\``;

export function installPrompt(tsSource: string) {
  return `# Peek List

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${PEEK_ONE_LINE}

## Before you build: one question

Look through this project first: pages that list products, services, features or projects (a services section, a "what we do" list, a features list, a work index), the pictures they already have, and where their words and links come from. Then ask me this in one message and wait for my answer:

- **Where should it go, and which rows does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the 3–8 rows you would use, with the title, a one to three sentence description, the picture and the button (words and link) for each, taken from my real content. I can pick one or name another.
  *Why: each row opens a short story with one button, so it belongs where people compare a few things and open one, and it needs real words and pictures to show.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The picture that follows the pointer inside its row, the row growing like a pop up while the picture glides to its seat, the + turning into the X in the corner, the other rows softening, the line-by-line drop, the pop up close and all their timing are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing list there, keep that spot's data and links and remove only the old markup. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its five item pictures and their stories, and the home page's TV.

${PEEK_SHARED_BUILD}

## Use it

${USE}

- It fills the width it is given; about 640–720px wide reads best. The floating picture rises about 100px above the first row, so leave that much room above the list, and make sure no parent cuts it off with \`overflow: hidden\`.
- Pictures are shown at 3:2 and cropped to fill. Keep each file small (about 1000px wide, WebP), with real \`alt\` text. Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`).
- \`cta\` with \`href\` is a link; use the project's own link component only if plain \`href\` breaks its routing, then pass \`onClick\` and navigate there instead.

${PEEK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a row shows its picture just above the pointer in about 0.4 seconds; it follows the pointer softly, never leaves the row's sides, fades when I leave the row and switches when I enter another, while the other rows soften to 70%. Clicking grows the row and glides the picture to the left in 0.72 seconds while the description and button drop in from above, and the + turns into an X in the top right corner of the open row. The X, Esc and a click outside each close it in under a second.
- It looks right in light and dark mode (check both): rows, text, button and X read well on each background.
- It works with a finger on a phone: no floating picture, one tap opens the row with the picture above the words, a tap outside closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or grows; things only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peek-list.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Peek List, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${PEEK_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that list products, services, features or projects, the pictures they already have, where their words and links come from, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which rows does it show?** Suggest the 1–3 spots it fits best, naming the 3–8 rows you'd use, with the title, description, picture and button (words and link) for each, from my real content.
      *Why: each row opens a short story with one button, so it belongs where people compare a few things and open one.*
   2. **How big is the floating picture?** 240px wide (suggested), 300px for a bold, picture-led list, or 200px for a quiet one.
      *Why: a bigger picture sells the product more, a smaller one keeps the names in charge.*
   3. **What shape are the pictures?** 3:2 (suggested, fits most screenshots and photos), 4:3, or 16:9.
      *Why: matching my pictures' own shape means nothing important gets cropped.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and rows, the picture size and shape, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and rows: where it is rendered, and per entry in \`items\` the \`title\`, \`description\`, \`image\` (\`src\`, \`alt\`) and \`cta\` (\`label\`, \`href\` or \`onClick\`, \`target\`), plus \`aria-label\`.
- The picture: \`previewWidth\` (px) and \`ratio\` (width / height).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The picture that follows the pointer inside its row, the row growing like a pop up while the picture glides to its seat, the + turning into the X in the corner, the other rows softening, the line-by-line drop, the pop up close, their timing, and the rule that phones never show a floating picture stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its five item pictures and stories and the home page's TV).

${PEEK_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { PeekList, type PeekListItem } from "@/components/ui/peek-list";

// From my brief. Leave out any prop that stays at its default.
export function Services({ items }: { items: PeekListItem[] }) {
  return (
    <PeekList
      items={items}
      previewWidth={240}
      ratio={1.5} // 3:2
      aria-label="What we do"
    />
  );
}
\`\`\`

- Colors come from my theme on their own: the text takes \`--foreground\` and the rows mix it into \`--background\`, so set those in my theme, never as hex on the component.
- Keep each story short: a title of a few words and one to three sentences read best beside the picture.
- The floating picture rises about 100px above the first row: leave that room above the list, and no \`overflow: hidden\` on its parents.

${PEEK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a row shows its picture just above the pointer in about 0.4 seconds at the size and shape I chose; it follows the pointer softly, never leaves the row's sides, fades when I leave the row and switches when I enter another, while the other rows soften to 70%. Clicking grows the row and glides the picture to the left in 0.72 seconds while my description and button drop in from above. The X, Esc and a click outside each close it in under a second.
- It looks right in light and dark mode (check both).
- It works with a finger on a phone: no floating picture, one tap opens the row with the picture above the words, a tap outside closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or grows; things only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peek-list.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
