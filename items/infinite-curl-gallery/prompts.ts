/* ---------- Infinite Curl Gallery ----------
 * Install: adds the exact gallery; asks only where it goes and which pictures it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const CURL_ONE_LINE = `An endless gallery: my pictures float across a canvas that wraps around in every direction, so it never runs out. Near its edges the canvas curls toward the viewer like the inside of a bowl, and it fades out there through a mask (not a colored overlay), so it blends into any background in light and dark mode. It drifts slowly on its own; you can grab it and throw it in any direction, and it glides on that way. The pictures can't be selected or dragged out of the page.`;

const CURL_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/infinite-curl-gallery.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the motion is one \`requestAnimationFrame\` loop that writes CSS transforms, and the look is one CSS block inside the file.
- JavaScript project? Name the file \`infinite-curl-gallery.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/infinite-curl-gallery.tsx\`
- Keep these exports and their names: \`InfiniteCurlGallery\` (also the default export), \`InfiniteCurlGalleryProps\`, \`CurlImage\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`SIZES\`, \`CELL\`, \`BIG\`, \`BEND_DEG\`, \`BEND_LIFT\`, \`GLIDE_S\`, \`MAX_SPEED\`, \`HOVER_DRIFT\`, \`KEY_PUSH\`, \`ENTER_MS\`, \`ENTER_SPREAD_MS\`, \`PLACEHOLDER_RATIO\`, \`MIN_RATIO\`, \`MAX_RATIO\` and the \`CSS\` block. They are the design and its feel.
- Keep the speed rules: nothing is placed and no picture loads until the gallery is within 200px of the screen; it moves with \`transform\` only (no layout work while it runs); the loop stops when the gallery is off screen, when the tab is hidden, and when nothing moves.
- Keep the no-select rules: \`user-select: none\`, \`draggable={false}\` on every picture, \`-webkit-user-drag: none\`, \`-webkit-touch-callout: none\`, \`pointer-events: none\` on the pictures themselves, and \`touch-action: none\` on the gallery so a finger drags it instead of scrolling the page.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` it doesn't drift or glide and moves only while dragged; arrow keys move it when it has focus; screen readers get one region with my label and a hidden list of the pictures' alt texts (the floating copies are hidden from them).`;

const CURL_HOW = `## How the gallery works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The canvas.** The pictures sit on a grid of cells that repeats in every direction. Each cell holds one picture with its own width (from 34% to 92% of \`tileSize\`, mostly small, a few big, never two big ones side by side) and a small random offset. The layout comes from a fixed random sequence, so it is the same on every visit. The grid is a little bigger than the box, so the place where it wraps around is always out of sight. Every picture gets at least one cell, and no picture sits next to itself when that can be avoided.
2. **Its shape.** Each picture keeps its own shape once it has loaded (very tall or very wide ones are cropped a little, between 0.56 and 1.8 width to height). Until then it is a soft 4:5 placeholder.
3. **The curl.** Each frame, every picture's position on screen decides its 3D turn: the farther from the middle, the more it turns to face the middle (up to 34° at \`curl\` 1) and the closer it comes to the viewer. The box has CSS perspective, so the edges bend like the inside of a bowl.
4. **The fade.** The edges fade out through a CSS mask: nine pieces that never overlap (a solid middle, four side strips and four round corners), so every side, corners included, fades the same \`fade\` percent of the shorter side and the corners never fade twice. It is a mask, not a colored overlay, so it fades into whatever is behind, in any theme.
5. **The drift.** It drifts at \`speed\` pixels a second toward \`angle\`. While the mouse is on it the drift slows to 30%, and the picture under the mouse lifts a little (6%).
6. **The throw.** Dragging moves the canvas 1:1 with the hand. On release it keeps the hand's speed (up to 4200 px/s) and eases back to the drift in about half a second; a real throw also turns the drift to the way it was thrown. A hand that stopped before letting go doesn't throw. Arrow keys push it the same way.
7. **Arriving.** Pictures fade and settle in (0.7s) as they load, the ones far from the middle a little later, so they arrive from the middle out.
8. **Speed.** Nothing loads until the gallery is near the screen. Pictures far outside the box are skipped each frame. The loop pauses off screen, in a hidden tab and when nothing moves.`;

export function installPrompt(tsSource: string) {
  return `# Infinite Curl Gallery

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${CURL_ONE_LINE}

## Before you build: one question

Look through this project first: pages that show a set of pictures (a portfolio, work or case-study page, a moodboard, an about or team page, a landing page hero), where those pictures live (a folder, a CMS, an array in the code), and how much room each page gives them. Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best from my code, and for each one the pictures you would use and where they come from. I can pick one or name another.
  *Why: the gallery is made of my pictures and fills its box, so it belongs where I already have 8 to 30 pictures and room for a tall box.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The endless canvas that wraps every way, the curl toward the viewer at the edges, the masked fade, the slow drift with the throw that glides on, and the pictures that can't be selected or dragged out, with their sizes and timing, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing grid or slider there, keep that spot's data and remove only the old display. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Add your photos" and "Show samples" buttons, dropping photos on the card, the sample photos, the dotted card behind it, and the home page's TV.

${CURL_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { InfiniteCurlGallery } from "@/components/ui/infinite-curl-gallery";

const work = [
  { src: "/work/coffee-brand.webp", alt: "Coffee brand packaging" },
  { src: "/work/app-onboarding.webp", alt: "Onboarding screens for a banking app" },
  { src: "/work/poster-series.webp", alt: "Poster series for a jazz festival" },
];

export function WorkWall() {
  return <InfiniteCurlGallery images={work} aria-label="Selected work" className="h-[80svh] w-full" />;
}
\`\`\`

- It fills its box and has no background, so give it a height (and a width if its parent doesn't). The page shows through behind it.
- Pass small pictures: about 400px on the long side is plenty, since the biggest show at 160px. Use the project's image folder or CDN; if it has an image service, ask it for that size.
- Give every picture a short \`alt\`; screen readers hear them as one list.
- On phones a finger on the gallery drags it instead of scrolling the page, so leave some page above or below it to scroll with.

${CURL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The pictures drift slowly (26 pixels a second) and never run out in any direction. The ones near the edges turn toward the middle and fade out. Dragging moves it with the hand, and a quick throw glides on, then eases back to a slow drift the way it was thrown. Selecting all (Ctrl or Cmd + A) or dragging a picture selects and lifts nothing.
- It looks right in light and dark mode (check both): the edges fade into the page with no colored band.
- It works with a finger on a phone: dragging moves the gallery, not the page, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, it stays still and moves only while dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/infinite-curl-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Infinite Curl Gallery, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${CURL_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that show a set of pictures (a portfolio or work page, a moodboard, an about or team page, a landing page hero), where those pictures live, how much room each page gives them, how fast other things on the site move, and its theme: corner radius tokens, colors, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best, with the pictures you would use and where they come from.
      *Why: the gallery is made of my pictures and fills its box, so it belongs where I already have 8 to 30 pictures and room for a tall box.*
   2. **How fast should it drift?** 26 pixels a second (suggested), 14 for a calm, slow page, or 0 so it stays still until someone drags it.
      *Why: the drift is what makes it feel alive; a page full of other motion may want it calmer.*
   3. **How much should the edges curl?** 0.6 (suggested), 0.3 for a gentle bend, or 0 for a flat wall of pictures.
      *Why: the curl is the 3D feel; a quieter, more editorial brand may want less of it.*
   4. **The pictures' corners?** My existing radius token (suggest the one my cards use, by name), square corners, or the default \`--radius-lg\`.
      *Why: the corners are the only shape the gallery adds, so they should match the rest of my product.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the drift speed, the curl, the corners, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, \`images\` (from my existing pictures, with alt text) and \`aria-label\`.
- The drift: \`speed\` (and \`angle\` if I name a direction).
- The curl: \`curl\`.
- The corners: \`radius\`, as my theme's CSS variable.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The endless canvas that wraps every way, the curl toward the viewer at the edges, the masked fade, the drift with the throw that glides on, the pictures that can't be selected or dragged out, and the speed rules (nothing loads until it is near the screen, transforms only, pauses off screen) stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Add your photos" and "Show samples" buttons, dropping photos on the card, the sample photos, the dotted card and the home page's TV).

${CURL_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { InfiniteCurlGallery } from "@/components/ui/infinite-curl-gallery";
import { projects } from "@/content/projects"; // my existing pictures

// From my brief. Leave out any prop that stays at its default.
export function WorkWall() {
  return (
    <InfiniteCurlGallery
      images={projects.map((p) => ({ src: p.cover, alt: p.title }))}
      speed={14}
      curl={0.3}
      radius="var(--radius)" // my theme's variable, not a number copied from it
      aria-label="Selected work"
      className="h-[80svh] w-full"
    />
  );
}
\`\`\`

- Read the radius from my theme's CSS variables or Tailwind tokens; never copy values into the component.
- It fills its box and has no background, so give it a height. It fades into whatever is behind it, so it needs no color of its own.
- Pass small pictures (about 400px on the long side) with short alt texts.

${CURL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My pictures drift at my chosen speed and never run out in any direction. The ones near the edges turn toward the middle as much as my curl says, with my corners, and fade out. Dragging moves it with the hand, and a quick throw glides on, then eases back to the drift the way it was thrown. Selecting all (Ctrl or Cmd + A) or dragging a picture selects and lifts nothing.
- It looks right in light and dark mode (check both): the edges fade into the page with no colored band.
- It works with a finger on a phone: dragging moves the gallery, not the page, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, it stays still and moves only while dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/infinite-curl-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
