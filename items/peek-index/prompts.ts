/* ---------- Peek Index ----------
 * Install: adds the exact list; asks only where it goes, which rows it shows, and pictures or videos.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PKI_ONE_LINE = `A numbered list of rows (01, 02, 03...), one for each service, product or feature, split by thin lines, each with a large title and a + on the right. When I point at a row, its picture or video appears just above my pointer and follows it, but only inside that row, and the other rows soften; leaving the row fades it away and entering another row shows that row's picture. When I click a row, it grows in place and pushes the rows below down, while the picture glides from my pointer to its seat on the left. On the right: a lead paragraph, a short list of points and one underlined link. The + turns into a −. The −, Esc or a click anywhere outside closes it. On a phone there is no floating picture: one tap opens the row, with the picture across the full width and the words below it.`;

const PKI_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/peek-index.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the picture follows the pointer with one \`requestAnimationFrame\` loop that runs only while a picture shows, the fades and the turning + are CSS transitions, and the row growing and the picture's glide use the browser's own Web Animations API. Its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`peek-index.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/peek-index.tsx\`
- Keep these exports and their names: \`PeekIndex\` (also the default export), \`PeekIndexProps\`, \`PeekIndexItem\`, \`PeekIndexMedia\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PEEK_IN_MS\`, \`PEEK_OUT_MS\`, \`PEEK_SCALE\`, \`PEEK_EASE\`, \`PEEK_GAP\`, \`FOLLOW\`, \`OPEN_MS\`, \`CLOSE_MS\`, \`GLIDE_EASE\`, \`HOVER_DIM\`, \`DIM\`, \`TEXT_DELAY\`, \`TEXT_MS\`, \`TEXT_DROP\`, \`TEXT_BLUR\`, \`TEXT_STAGGER\`, \`TEXT_STEPS\`, \`TEXT_OUT_MS\`, \`STACK_AT\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the floating picture shows only where a real mouse can hover (\`(hover: hover) and (pointer: fine)\`), never on phones or tablets, where one tap opens the row. Narrow lists (under 480px, phones) put the picture across the full width with the words below it. Tab moves row by row, Enter opens a row and Enter again (or Esc) closes it. A video plays only while it shows, muted and looping, and with \`prefers-reduced-motion: reduce\` it stays on its poster while nothing glides or grows and things only fade.`;

const PKI_HOW = `## How the list works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The rows.** No boxes: each row is a large number (01, 02...), a large title in the same size and a thin + on the right, with a thin line under it (the text color at 12%). The whole row is one button.
2. **Point at a row.** Its picture or video (240px wide by default, 4:3, 10px corners, a soft shadow) appears centered over the pointer with its bottom edge 12px above the pointer's tip, so it never covers the pointer, fading in while it grows from 90% in 420ms with a gentle start and a long soft landing. It trails the pointer softly (about a tenth of a second behind) and stays inside the row's sides, so it is never cut. Leave the row and it fades away in 300ms where it is; enter another row and that row's picture appears at the pointer. Only one row shows a picture at a time. While the pointer is on the list, every other row softens to 70% in the same 420ms; the lines between rows stay.
3. **Click it.** The row grows to fit its story in 720ms and pushes the rows below down, while the other rows dim to 40% at the same pace. The picture glides from where it floats to its seat on the left half in the same 720ms, growing as it goes (opened by keyboard or touch, it unrolls from the top in its seat instead). The upright line of the + turns flat so it reads as a −, in step with the row. Then the lead paragraph, each point and the link drop in from above, line by line, each falling 16px, fading in and losing a 4px blur over 650ms, 110ms apart, starting 380ms in; after the fourth line the rest land together. The link sits at the bottom of the right column.
4. **Close it.** The −, Esc or a click anywhere outside the row. The words and the picture fade away together in 220ms, then the row folds back in 600ms while the − turns back into the +, and the other rows come back. A click on another row closes the open one and opens that one.
5. **Phones.** No hover, so no floating picture: one tap opens the row. On narrow lists the picture fills the width and the words sit below it.
6. **Colors.** Everything takes \`--foreground\` (else \`--fg\`), mixed into \`--background\` (else \`--bg\`) for the muted points and the lines, so it follows light and dark mode. The + and − are the text color.`;

const USE = `\`\`\`tsx
import { PeekIndex } from "@/components/ui/peek-index";

const ITEMS = [
  {
    title: "Brand identity",
    description: "A brand has to stand out and work twice as hard. We build the one your website and product grow from.",
    points: ["Logo and visual identity", "Brand guidelines", "Naming and voice"],
    media: { src: "/work/brand.webp", alt: "A brand board with a logo and colors" },
    link: { label: "See our branding work", href: "/work/brand" },
  },
  {
    title: "Product design",
    description: "Apps people understand on the first try.",
    points: ["Research", "Prototypes", "Design systems"],
    media: { type: "video", src: "/work/product.mp4", poster: "/work/product.webp", alt: "A product walkthrough" },
    link: { label: "See our product work", href: "/work/product" },
  },
  // one entry per row, 3 to 8 reads best
];

export function Services() {
  return <PeekIndex items={ITEMS} aria-label="What we do" />;
}
\`\`\``;

const MEDIA_RULES = `- Pictures and videos are shown at 4:3 (or the \`ratio\` set) and cropped to fill. Keep each picture small (about 1000px wide, WebP), with real \`alt\` text.
- A video row uses \`media: { type: "video", src, poster, alt }\`: short (a few seconds), silent, MP4 or WebM, under about 2MB, always with a \`poster\` still. It loads only when its row is pointed at or opened, plays muted on a loop while it shows, and stays on the poster with reduced motion. Never add sound or controls.
- Pictures or videos from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`, \`media-src\`).`;

export function installPrompt(tsSource: string) {
  return `# Peek Index

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${PKI_ONE_LINE}

## Before you build: one question

Look through this project first: pages that list services, products, features or projects (a services section, a "what we do" list, a features list), the pictures and videos they already have, and where their words and links come from. Then ask me this in one message and wait for my answer:

- **Where should it go, which rows does it show, and does any row show a video instead of a picture?** Suggest the 1–3 spots it fits best from my code. For each one, name the 3–8 rows you would use, with the title, a two to four sentence lead, 3–6 short points, the picture and the link (words and address) for each, taken from my real content. Then say for each row whether you'd use a picture (suggested) or a short video, and which file; suggest a video only where I already have a short one.
  *Why: each row opens a short story with one link, so it belongs where people compare a few services and open one; a video moves more but weighs more, so it is my call.*

Ask nothing else. If I say *skip*, use the best suggestion, with pictures only.

## Keep it as it is

The numbered rows split by thin lines, the picture that follows the pointer inside its row, the row growing while the picture glides to its seat, the + turning into a −, the other rows softening, the line-by-line drop, the close on Esc or a click outside and all their timing are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing list there, keep that spot's data and links and remove only the old markup. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its four group rows with their pictures and stories, and the home page's TV.

${PKI_SHARED_BUILD}

## Use it

${USE}

- It fills the width it is given; about 720–960px wide reads best. The floating picture rises about 200px above the first row, so leave that much room above the list, and make sure no parent cuts it off with \`overflow: hidden\`.
${MEDIA_RULES}
- \`link\` with \`href\` is a link; use the project's own link component only if plain \`href\` breaks its routing, then pass \`onClick\` and navigate there instead.

${PKI_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a row shows its picture or video just above the pointer in about 0.4 seconds; it follows the pointer softly, never leaves the row's sides, fades when I leave the row and switches when I enter another, while the other rows soften to 70%. Clicking grows the row and glides the picture to the left half in 0.72 seconds while the paragraph, points and link drop in from above, and the + turns into a −. The −, Esc and a click outside each close it in under a second. Videos play only while they show.
- It looks right in light and dark mode (check both): numbers, titles, points, lines and the +/− read well on each background.
- It works with a finger on a phone: no floating picture, one tap opens the row with the picture across the full width and the words below, a tap outside closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or grows, things only fade, and videos stay on their poster.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, which rows use a video, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peek-index.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Peek Index, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${PKI_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that list services, products, features or projects, the pictures and videos they already have, where their words and links come from, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which rows does it show?** Suggest the 1–3 spots it fits best, naming the 3–8 rows you'd use, with the title, a two to four sentence lead, 3–6 points, the picture and the link (words and address) for each, from my real content.
      *Why: each row opens a short story with one link, so it belongs where people compare a few services and open one.*
   2. **Pictures or videos?** Pictures in every row (suggested), a short video in the rows where I already have one, or videos in every row. Name the files you'd use.
      *Why: a video brings a row to life but weighs more and needs a poster still, so it is my call.*
   3. **How big is the floating picture?** 240px wide (suggested), 300px for a bold, picture-led list, or 200px for a quiet one.
      *Why: a bigger picture sells the work more, a smaller one keeps the titles in charge.*
   4. **What shape are the pictures?** 4:3 (suggested), 3:2 for screenshots and photos, or 16:9 for video.
      *Why: matching my pictures' own shape means nothing important gets cropped.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and rows, pictures or videos (which rows), the picture size and shape, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and rows: where it is rendered, and per entry in \`items\` the \`title\`, \`description\`, \`points\` and \`link\` (\`label\`, \`href\` or \`onClick\`, \`target\`), plus \`aria-label\`.
- Pictures or videos: per entry, \`media\` (\`type\`, \`src\`, \`alt\`, \`poster\`).
- The picture: \`previewWidth\` (px) and \`ratio\` (width / height).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The numbered rows split by thin lines, the picture that follows the pointer inside its row, the row growing while the picture glides to its seat, the + turning into a −, the other rows softening, the line-by-line drop, the close on Esc or a click outside, their timing, and the rule that phones never show a floating picture stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its four group rows with their pictures and stories, and the home page's TV).

${PKI_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { PeekIndex, type PeekIndexItem } from "@/components/ui/peek-index";

// From my brief. Leave out any prop that stays at its default.
export function Services({ items }: { items: PeekIndexItem[] }) {
  return (
    <PeekIndex
      items={items}
      previewWidth={240}
      ratio={4 / 3}
      aria-label="What we do"
    />
  );
}
\`\`\`

- Colors come from my theme on their own: everything takes \`--foreground\` mixed into \`--background\`, so set those in my theme, never as hex on the component. The + and − stay the text color.
- Keep each story short: a title of one to three words, a lead of two to four sentences and 3–6 points of a few words each.
${MEDIA_RULES}
- The floating picture rises about 200px above the first row: leave that room above the list, and no \`overflow: hidden\` on its parents.

${PKI_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a row shows its picture or video just above the pointer in about 0.4 seconds at the size and shape I chose; it follows the pointer softly, never leaves the row's sides, fades when I leave the row and switches when I enter another, while the other rows soften to 70%. Clicking grows the row and glides the picture to the left half in 0.72 seconds while my paragraph, points and link drop in from above, and the + turns into a −. The −, Esc and a click outside each close it in under a second. The rows I chose show videos, and they play only while they show.
- It looks right in light and dark mode (check both).
- It works with a finger on a phone: no floating picture, one tap opens the row with the picture across the full width and the words below, a tap outside closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing glides or grows, things only fade, and videos stay on their poster.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peek-index.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
