/* ---------- Tile flip image ----------
 * Install: adds the exact picture; asks only where it goes and which pictures it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const TILE_ONE_LINE = `A picture that changes by tiles: give it a new picture and it splits into tiny square tiles (about 14px each), and every tile turns over on its side like a card, the old picture on its front and the new one on its back. The tiles start in a random order that builds up and eases off, each one turns in 0.56 seconds, darkening as it goes edge on, and the last one lands 1.2 seconds after the first started. Between changes it is a plain image.`;

const TILE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/tile-flip-image.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the change is drawn on one \`<canvas>\` with \`requestAnimationFrame\`, only while it runs, and its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`tile-flip-image.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/tile-flip-image.tsx\`
- Keep these exports and their names: \`TileFlipImage\` (also the default export) and \`TileFlipImageProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`TOTAL_MS\`, \`FLIP_MS\`, \`TILE\`, \`SHADE\`, \`BEHIND\`, \`HANDOFF_MS\`, \`FADE_MS\`, \`MAX_TILES\`, the \`turn\` and \`wave\` curves and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the first picture is drawn as a plain image with no motion, so the server and the browser draw the same thing. With \`prefers-reduced-motion: reduce\` no tile turns: the new picture simply fades in over 0.3 seconds. If a picture fails to load, or the tab is hidden, it swaps with no motion. Screen readers always get one plain image with its \`alt\`.`;

const TILE_HOW = `## How the picture works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** It is one plain \`<img>\` that covers its box, centered, like a cover photo. Nothing runs and there is no canvas.
2. **Loading first.** When \`src\` changes, the new picture loads before anything moves, so no tile ever turns to an empty back.
3. **One canvas.** For the change, a canvas the size of the box (at the screen's sharpness, up to 2x) is laid over the image, and every frame is drawn on it. Thousands of tiny tiles stay smooth this way, where thousands of separate page elements would stutter.
4. **The tiles.** The box is cut into square tiles about \`tile\` pixels wide (14 by default), edges on whole pixels. On a very big picture the tiles grow so there are never more than 3,000. Tiles that haven't started are drawn as one piece of the old picture, and tiles that have landed as one piece of the new one, so no line ever shows between them.
5. **The turn.** Each tile turns over 180 degrees on its upright axis in 0.56 seconds: it lifts off gently, turns fastest when edge on and lands softly (an ease in and out). The old picture is on its front and the same piece of the new one on its back, and each face darkens up to 30% as it turns edge on. The gap beside a turning tile shows the new picture 20% darker, like depth, never the page behind.
6. **The order.** The tiles are shuffled, and their starts follow a soft curve over the first 0.64 seconds: a few first, most in the middle, a few last. So the whole change eases in and out, and the last tile lands at 1.2 seconds.
7. **Landing.** The last frame is the whole new picture. The plain image takes the new picture under the canvas, then the canvas fades away over it in 0.16 seconds, so the swap never shows.
8. **Fast changes.** A picture asked for during a change waits for that change to land, then the tiles turn to the latest one; pictures in between are skipped. If the box changes size mid change, it lands at once. A hidden tab never leaves it stuck halfway.`;

const TILE_LOCKED = `The tiny square tiles (about 14px by default), each turning over 180 degrees on its upright axis with the old picture on its front and the new one on its back, the random order that builds up and eases off, the darkening as a face turns edge on and the darker new picture in the gap, the 0.56 second turn, the 1.2 seconds for the whole picture, the soft fade back to the plain image at the end, and their easing`;

const TILE_DEMO_PARTS = `the nine travel photos it plays, the change every 3 seconds, the Next picture button, the dotted card and the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Tile flip image

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${TILE_ONE_LINE}

## Before you build: one question

Look through this project first: its hero, product or feature pictures, galleries, carousels, and any place that already swaps one picture for another (a slideshow, a product color switch, a before and after). Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures does it show?** Suggest the 1–3 pictures in my code it fits best, what makes each one change (a timer, a button, a tab), and the pictures it would switch between. I can pick one or name another.
  *Why: the tiles only turn when the picture changes, so it belongs on a picture that changes, and it needs real pictures to show.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${TILE_LOCKED}, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing picture there, pass that same picture to \`src\` and \`alt\` and remove only the old image. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${TILE_DEMO_PARTS}.

${TILE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { useState } from "react";
import { TileFlipImage } from "@/components/ui/tile-flip-image";

const SHOTS = [
  { src: "/shots/settle-counter.webp", alt: "Settle counter, a live count of humans on Impeccable UI" },
  { src: "/shots/tumble-gallery.webp", alt: "Tumble Gallery, a split flap board of pictures" },
];

// Give it a new src and the tiles turn over to it. The box takes its size from className.
export function ShotSwitcher() {
  const [i, setI] = useState(0);
  return (
    <div>
      <TileFlipImage src={SHOTS[i].src} alt={SHOTS[i].alt} className="w-full max-w-xl rounded-2xl" />
      <button type="button" onClick={() => setI((i + 1) % SHOTS.length)}>Next</button>
    </div>
  );
}
\`\`\`

- \`src\` and \`alt\` are the picture, like an \`<img>\`; give it a new \`src\` and the tiles turn over to it.
- \`tile\` is about how wide each tile is, in pixels (14 by default). Smaller is finer, larger is bolder.
- \`ratio\` is the box's shape as a CSS aspect ratio (\`"3 / 2"\` by default). The picture covers the box, centered.
- Corners and size come from \`className\` or \`style\`. The box clips the tiles, so rounded corners stay round while they turn.
- Use pictures of about the same shape, so the old and new line up the same way.

${TILE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- When the picture changes, the new one has fully loaded first, then small tiles turn over one by one in a random order, and the whole picture is the new one about 1.2 seconds later, with no blink at the end.
- It looks right in light and dark mode (check both), and there is no flash or jump when the last tiles land.
- It fits on a phone without scrolling sideways, and the turning stays smooth there.
- With \`prefers-reduced-motion: reduce\`, the new picture only fades in, with no tiles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, which pictures it shows, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tile-flip-image.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Tile flip image, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${TILE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its hero, product or feature pictures, galleries, carousels, any place that already swaps one picture for another, the shapes and corner radius of its pictures and cards, its surfaces and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 pictures in my code it fits best, what makes each one change, and the pictures it would switch between.
      *Why: the tiles only turn when the picture changes, so it belongs on a picture that changes, and it needs real pictures to show.*
   2. **Tile size?** Fine (\`tile={8}\`, a soft shimmer), the default (\`tile={14}\`, suggested) or bold (\`tile={28}\`, blocks you can follow one by one).
      *Why: the tile size is the whole texture of the change, from a fine shimmer to big blocks.*
   3. **The shape?** Keep the 3:2 box (suggested), or the shape my pictures already use there (like 16:9, 4:3 or square).
      *Why: it should sit in my layout like the pictures around it.*
   4. **The corners?** Name which of my existing radius tokens or classes you'd use, for example my card radius (suggested) or square corners.
      *Why: the box clips the tiles, so its corners are the picture's corners.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the tile size, the shape, the corners, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, what changes its \`src\`, and the \`src\` and \`alt\` of each picture.
- The tile size: \`tile\`.
- The shape: \`ratio\`, or the size through \`className\` or \`style\`.
- The corners: the radius through \`className\` or \`style\`, from my existing tokens.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${TILE_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${TILE_DEMO_PARTS}).

${TILE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { TileFlipImage } from "@/components/ui/tile-flip-image";

// From my brief. Leave out any prop that stays at its default.
export function ProductShot({ shot }: { shot: { src: string; alt: string } }) {
  return (
    <TileFlipImage
      src={shot.src}
      alt={shot.alt}
      tile={8} // fine tiles
      ratio="16 / 9" // the shape my pictures use here
      className="w-full rounded-[var(--radius-card)]" // my card radius token, not a number I made up
    />
  );
}
\`\`\`

- Read radii and colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Use pictures of about the same shape, so the tiles' front and back line up the same way.

${TILE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It shows my pictures in the shape, tile size and corners I chose. When the picture changes, the new one has fully loaded first, then the tiles turn over one by one in a random order, and the whole picture is the new one about 1.2 seconds later, with no blink at the end.
- It looks right in light and dark mode (check both), and there is no flash or jump when the last tiles land.
- It fits on a phone without scrolling sideways, and the turning stays smooth there.
- With \`prefers-reduced-motion: reduce\`, the new picture only fades in, with no tiles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tile-flip-image.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
