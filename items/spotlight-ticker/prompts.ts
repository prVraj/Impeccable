/* ---------- Spotlight Ticker ----------
 * Install: adds the exact ticker; asks only where it goes and which pictures and stories it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const SPOT_ONE_LINE = `A row of square pictures that glides sideways forever, like a ticker. When I point at a picture the row stops, that picture grows to 1.8 times its size and the others dim. When I click it, the others fade away, the picture glides to the left and its story comes in beside it: a heading, a few short bullet points and one button. It closes like a pop up (the X, Esc, a click on the picture or a click anywhere outside), the picture glides back and the row carries on. On a phone one tap opens the story.`;

const SPOT_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/spotlight-ticker.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the row moves with one \`requestAnimationFrame\` loop, the grow and dim are CSS transitions, and the glide uses the browser's own Web Animations API. Its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`spotlight-ticker.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/spotlight-ticker.tsx\`
- Keep these exports and their names: \`SpotlightTicker\` (also the default export), \`SpotlightTickerProps\`, \`SpotlightTickerItem\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`ZOOM\`, \`DIM\`, \`GAP\`, \`FOCUS_MS\`, \`FOCUS_EASE\`, \`STOP_MS\`, \`START_MS\`, \`FADE_MS\`, \`GLIDE_MS\`, \`CLOSE_MS\`, \`GLIDE_EASE\`, \`TEXT_DELAY\`, \`TEXT_MS\`, \`TEXT_DROP\`, \`TEXT_BLUR\`, \`TEXT_STAGGER\`, \`TEXT_OUT_MS\`, \`EDGE\`, \`SHADOW_ROOM\`, \`STACK_AT\`, \`SMALL_AT\`, \`SMALL\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: hover only grows a picture where a real mouse can hover (\`(hover: hover) and (pointer: fine)\`), touch screens open the story on one tap, phones (under 640px) get pictures at 70% size and the story under the picture, Tab moves picture by picture and Enter opens it, and with \`prefers-reduced-motion: reduce\` the row stands still and scrolls by hand. The row pauses while it is off screen or the tab is hidden.`;

const SPOT_HOW = `## How the ticker works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The row.** The pictures sit in a row with a gap of 15% of their size, copied as many times as it takes to fill the width twice. One animation loop moves the row at \`speed\` pixels per second (default 32, slow enough to see each picture) and wraps it after one full set, so it never ends. \`direction\` "left" or "right" sets the way it moves. Both sides of the row fade out softly with a CSS mask (40% of a picture wide, at most 8% of the row), so pictures never get cut off with a hard edge.
2. **Point at a picture.** The row glides to a stop in about 0.45 seconds. The picture grows to 1.8 times its size in 450ms with a gentle start and a long soft landing, rises above its neighbours with a soft shadow, and every other picture drops to 40% opacity, so the one you point at is in focus. Near an edge it steps inward, clear of the faded sides, so it is never cut. The row keeps 48px of room above and below the grown picture, so its shadow is never clipped. Move to another picture and the focus moves with you; leave the row and it eases back to speed over about a second.
3. **Click it.** The other pictures fade out in 420ms. The picture glides from where it is to the left of the story in 720ms (it eases in, travels and settles softly), keeping its corners. Then the story drops in from above, line by line: the close button and heading, each bullet point, then the button, each falling 16px, fading in and losing a 4px blur over 650ms, 110ms apart, starting 520ms in as the picture settles. The block grows if the story is taller than the row.
4. **Close it.** Like a pop up: the X, Esc, a click on the big picture or a click anywhere outside the story. The story lifts away and fades in 240ms while the picture glides back to its place in the row in 620ms, the other pictures fade back in over 420ms, and the row carries on from where it stopped. Focus goes back to the picture.
5. **Phones.** No hover: one tap opens the story straight away. Under 640px the pictures are 70% of \`size\`, and on narrow blocks (under 560px) the story sits under the picture.
6. **Colors.** The text takes \`--foreground\` (else \`--fg\`) and surfaces mix it into \`--background\` (else \`--bg\`), so it follows light and dark mode. The button is a quiet outlined pill in those same colors. Only width, height, transform and opacity change while it moves.`;

export function installPrompt(tsSource: string) {
  return `# Spotlight Ticker

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${SPOT_ONE_LINE}

## Before you build: one question

Look through this project first: pages that show work, projects, products, features or case studies (a home page, a portfolio or work section, a showcase or "what we make" strip), the pictures they already have, and where their words and links come from. Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the 5–10 pictures you would use, with the heading, 2–4 short bullet points and the button (words and link) for each, taken from my real content. I can pick one or name another.
  *Why: each picture opens a short story with one button, so it belongs where people browse things they might want to open, and it needs real words to show.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The gliding row, the stop with one picture growing while the others dim, the glide into the story with its line-by-line drop from above, the pop up close and all their timing are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing strip or grid there, keep that spot's data and links and remove only the old markup. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its eight item pictures and their stories, the gray panel round it, and the home page's TV.

${SPOT_SHARED_BUILD}

## Use it

\`\`\`tsx
import { SpotlightTicker } from "@/components/ui/spotlight-ticker";

const ITEMS = [
  {
    image: { src: "/showcase/comet-button.webp", alt: "Comet button, a glow racing round its border" },
    title: "Comet button",
    points: ["A glow races round the border while it loads.", "Success lights the whole border, then eases back."],
    cta: { label: "Open component", href: "/docs/comet-button" },
  },
  // one entry per picture, 5 to 10 reads best
];

export function Showcase() {
  return <SpotlightTicker items={ITEMS} aria-label="Our components" />;
}
\`\`\`

- It fills the width it is given. Give it the full width of its section; it needs about 1.8 times the picture size plus 96px in height (about 384px at the default size), so the grown picture and its shadow have room.
- Pictures are shown square and cropped to fill. Keep each file small (about 500px square, WebP), with real \`alt\` text. Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`).
- \`cta\` with \`href\` is a link; use the project's own link component only if plain \`href\` breaks its routing, then pass \`onClick\` and navigate there instead.

${SPOT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The row glides at about 32 pixels a second. Pointing at a picture glides it to a stop while that picture grows to 1.8 times its size and the others dim, all in about 0.45 seconds. Clicking glides the picture to the left in 0.72 seconds while its heading, bullet points and button drop in from above line by line, done in about 1.5 seconds. The X, Esc, a click on the picture and a click outside each close it in about 0.75 seconds, and the row carries on.
- It looks right in light and dark mode (check both): text, bullet dots, button and close button read well on each background.
- It works with a finger on a phone: one tap opens the story under the picture, a tap outside closes it, the pictures are smaller, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the row stands still and scrolls by hand, and nothing glides.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/spotlight-ticker.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Spotlight Ticker, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${SPOT_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that show work, projects, products, features or case studies, the pictures they already have, where their words and links come from, its corner radius tokens, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best, naming the 5–10 pictures you'd use, with the heading, 2–4 short bullet points and the button (words and link) for each, from my real content.
      *Why: each picture opens a short story with one button, so it belongs where people browse things they might want to open.*
   2. **Which way does it move?** Left (suggested, the way people read) or right; for two rows stacked, one each way.
      *Why: the direction sets the feel; two rows moving apart look busier.*
   3. **How fast?** Calm, 32 pixels a second (suggested, people can see each picture), brisk 50, or fast 80.
      *Why: the speed decides whether people read the pictures or only feel the motion.*
   4. **Picture size and corners?** 160px with 16px corners (suggested), 200px for a bold strip, or 120px for a quiet one; corners from my theme's radius.
      *Why: the size sets how many pictures show at once, and the corners make them match my other cards.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the direction, the speed, the size and corners, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where it is rendered, and per entry in \`items\` the \`image\` (\`src\`, \`alt\`), \`title\`, \`points\` and \`cta\` (\`label\`, \`href\` or \`onClick\`, \`target\`), plus \`aria-label\`.
- The direction: \`direction\` ("left" or "right").
- The speed: \`speed\` in pixels per second.
- The size and corners: \`size\` and \`radius\` (px).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The gliding row, the stop with one picture growing to 1.8 times while the others dim to 40%, the glide into the story with its line-by-line drop from above, the pop up close, their timing, and the one-tap rule on touch screens stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its eight item pictures and stories, the gray panel and the home page's TV).

${SPOT_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { SpotlightTicker, type SpotlightTickerItem } from "@/components/ui/spotlight-ticker";

// From my brief. Leave out any prop that stays at its default.
export function Showcase({ items }: { items: SpotlightTickerItem[] }) {
  return (
    <SpotlightTicker
      items={items}
      direction="left"
      speed={32} // pixels per second
      size={160}
      radius={16} // my theme's radius in px
      aria-label="Our work"
    />
  );
}
\`\`\`

- Colors come from my theme on their own: the text takes \`--foreground\` and the surfaces mix it into \`--background\`, so set those in my theme, never as hex on the component.
- \`radius\` is a number of pixels: read my theme's radius token and use its pixel value.
- Keep each story short: a heading of a few words and 2–4 bullet points of one line each read best beside the picture.

${SPOT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My pictures glide the way and at the speed I chose. Pointing at one glides the row to a stop while it grows to 1.8 times my size and the others dim, all in about 0.45 seconds. Clicking glides the picture to the left in 0.72 seconds while my heading, bullet points and button drop in from above line by line. The X, Esc, a click on the picture and a click outside each close it in about 0.75 seconds, and the row carries on.
- It looks right in light and dark mode (check both): text, bullet dots, button and close button read well on each background, with my corners.
- It works with a finger on a phone: one tap opens the story under the picture, a tap outside closes it, the pictures are smaller, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the row stands still and scrolls by hand, and nothing glides.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/spotlight-ticker.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
