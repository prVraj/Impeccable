/* ---------- Cube flip image ----------
 * Install: adds the exact picture; asks only where it goes and which pictures it shows.
 * Blend: asks five short questions, then fits it through the component's own props. */

const CUBE_ONE_LINE = `A picture you click to change. It is made of tiny cubes (about 20px each), the current picture on their front faces and the next one on their backs. Click anywhere and a wave spreads out from that exact spot: a dark gap opens round each cube so you see it on its own, it rises toward you, casting a soft shadow on the picture below, and rolls a half turn away from the click, past a darker side face, onto its new face, seen in perspective so each face narrows toward its far edge. The wave travels slowly enough to watch, like an ocean wave, and the next picture has taken over in about 2.6 seconds. Clicks during a change are ignored: one click, one change. An optional sound, a cascade of small cube clacks, plays with each change.`;

const CUBE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/cube-flip-image.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the change is drawn on one \`<canvas>\` with \`requestAnimationFrame\`, only while it runs, the sound is a plain \`Audio\` element, and its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`cube-flip-image.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/cube-flip-image.tsx\`
- The sound is a file, not code. If I want it, download \`https://impeccable-ui.com/cube-flip-image/cube-roll.mp3\` (26KB) into this project's public or static folder, for example \`public/sounds/cube-roll.mp3\`, and pass its path to \`sound\`. If the project's Content Security Policy limits \`media-src\`, the file must be served from this site itself.
- Keep these exports and their names: \`CubeFlipImage\` (also the default export), \`CubeFlipImageProps\` and \`CubeFlipPicture\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`ROLL_MS\`, \`SWELL_MS\`, \`SPREAD_MS\`, \`JITTER_MS\`, \`TOTAL_MS\`, \`TILE\`, \`DEPTH\`, \`GAP\`, \`LIFT\`, \`SHADE\`, \`SIDE\`, \`EDGE\`, \`BEHIND\`, \`SHADOW\`, \`DROP\`, \`HANDOFF_MS\`, \`FADE_MS\`, \`LOUDNESS\`, \`MAX_TILES\`, the \`roll\` curve, the cube geometry in \`cubeFaces\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the first picture is drawn as a plain image with no motion, so the server and the browser draw the same thing. It is a real \`<button>\`, so Enter or Space starts the wave from the middle, and screen readers hear the picture's \`alt\` and what a click does. With \`prefers-reduced-motion: reduce\` no cube rolls and no sound plays: the next picture simply fades in over 0.3 seconds. If a picture fails to load, or the tab is hidden, it swaps with no motion. A phone on silent or a browser that blocks sound just stays quiet.`;

const CUBE_HOW = `## How the picture works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** It is a button holding one plain \`<img>\` that covers its box, centered, like a cover photo. Nothing runs and there is no canvas. The next picture is fetched in the background, so a click can start at once.
2. **One click, one change.** A click starts a change only when none is running. Clicks during a change are ignored, so many quick clicks still give one change. After the last picture it starts again from the first.
3. **The point.** The wave starts from the exact spot the click landed on. A keyboard press starts it from the middle.
4. **The sound.** If \`sound\` is set, it plays inside the click itself (browsers only allow sound that starts from one), at 60% volume, and not with reduced motion.
5. **One canvas.** For the change, a canvas the size of the box (at the screen's sharpness, up to 2x) is laid over the image and every frame is drawn on it, so thousands of cubes stay smooth.
6. **The cubes.** The box is cut into square cubes about \`tile\` pixels wide (20 by default), edges on whole pixels. On a very big picture they grow so there are never more than 2,500. Cubes the wave hasn't reached are drawn as one piece of the old picture, and cubes that have landed as one piece of the new one, so no line ever shows between them.
7. **The wave.** Each cube starts rolling when the wave reaches it: 0.2 seconds, plus its distance from the click as a share of the distance to the farthest corner times 1.4 seconds, plus up to 0.04 seconds of randomness so the wave looks hand made. The wave travels at an even, watchable speed, so wherever you click, the last cube settles at about 2.6 seconds.
8. **The roll.** Each cube rolls a half turn (180 degrees) in 0.76 seconds, away from the click: sideways when the click is more to its side, up or down when it is more above or below. Its front face holds the old picture, its back face the new one, and the side face between them, which faces you at a quarter turn, shows the new picture 18% darker so the cube reads as solid. It is seen in perspective from 3 cube sides away (\`DEPTH\`, worked out in \`cubeFaces\`): each face is drawn in thin strips so it narrows toward its far edge, with a thin dark line where two faces meet, and each face darkens up to 42% as it turns away from you. The roll tips over slowly, turns fastest at the middle and settles softly onto the new face.
9. **The ocean wave.** Each cube swells up 0.2 seconds before it rolls, rolls half a turn at the crest, and settles back down over 0.2 seconds after, like water lifting and falling as a wave passes. As it swells, a dark gap opens round it: it shrinks by up to 20% (\`GAP\`) and grows back 6% as it rises toward you (\`LIFT\`), so at the crest it is 14% smaller than its cell and every cube is seen turning on its own. Both follow a smooth curve with no kink at either end (sine squared). Risen cubes are drawn over their neighbors, lowest first, and each casts a soft shadow down and to the right on the picture below, in three layers so its edge is soft: up to 50% dark and 26% of a cube away at the crest (\`SHADOW\`, \`DROP\`). The shadow is what makes the cubes look lifted. The gap round a rolling cube shows the new picture 62% darker (\`BEHIND\`), so the cubes stand apart.
10. **Landing.** The last frame is the whole new picture. The plain image takes it under the canvas, then the canvas fades away over it in 0.16 seconds, so the swap never shows. \`onChange\` is called with the new index.
11. **Edge cases.** If the box changes size mid change, it lands at once. A hidden tab never leaves it stuck halfway.`;

const CUBE_LOCKED = `The tiny cubes (about 20px by default) rolling a half turn away from the click past a darker side face, rising toward you with a soft shadow as the wave passes, the wave spreading from the exact spot clicked, one change per click with clicks during a change ignored, the perspective of each rolling cube, the shading of each face and the shadow in the gap, the thin edge where the faces meet, the dark gap that opens round each cube as it swells, the 0.76 second roll inside a 1.16 second swell, the slow wave (about 2.6 seconds for the whole picture wherever you click), the soft fade back to the plain image at the end, and their easing`;

const CUBE_DEMO_PARTS = `the nine travel photos it plays, the "Click anywhere on the photo" line, the dotted card and the home page's TV, which clicks on its own`;

export function installPrompt(tsSource: string) {
  return `# Cube flip image

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${CUBE_ONE_LINE}

## Before you build: one question

Look through this project first: its hero, galleries, portfolio or product pictures, carousels, and any place that already shows several pictures one after another. Then ask me this in one message and wait for my answer:

- **Where should it go, which pictures does it show, and should it play the cube sound?** Suggest the 1–3 places in my code it fits best and the 3 to 10 pictures each would cycle through. Sound is on in the source (suggested); I can say off.
  *Why: it changes only when someone clicks it, so it belongs where people want to see the next picture, and it needs real pictures to show.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${CUBE_LOCKED}, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, the sound file if I want sound, and the one place I picked. If it replaces an existing picture or slideshow there, pass those same pictures to \`images\` and remove only the old display. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${CUBE_DEMO_PARTS}.

${CUBE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { CubeFlipImage } from "@/components/ui/cube-flip-image";

const SHOTS = [
  { src: "/shots/settle-counter.webp", alt: "Settle counter, a live count of humans on Impeccable UI" },
  { src: "/shots/tumble-gallery.webp", alt: "Tumble Gallery, a split flap board of pictures" },
  { src: "/shots/tile-flip-image.webp", alt: "Tile flip image, a picture turning over tile by tile" },
];

// Each click rolls the cubes out from that spot to the next shot. The box takes its size from className.
export function ShotWall() {
  return <CubeFlipImage images={SHOTS} sound="/sounds/cube-roll.mp3" className="w-full max-w-xl rounded-2xl" />;
}
\`\`\`

- \`images\` are the pictures, each with \`src\` and \`alt\`, in order; each click shows the next one, then it starts again.
- \`sound\` is the path to the cube sound; leave it out for silence.
- \`tile\` is about how wide each cube is, in pixels (20 by default). Smaller is finer, larger shows the cubes more.
- \`ratio\` is the box's shape as a CSS aspect ratio (\`"3 / 2"\` by default). The picture covers the box, centered.
- \`label\` is what a click does, read by screen readers after the picture's alt ("show the next picture" by default). \`onChange\` gets the new index after each change.
- Corners and size come from \`className\` or \`style\`. The box clips the cubes, so rounded corners stay round while they roll.
- Use pictures of about the same shape, so they line up the same way.

${CUBE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- A click anywhere starts a wave from that exact spot: the cubes near it roll first, each rising toward you with a soft shadow and rolling a half turn away from the click, and the whole picture is the next one about 2.6 seconds later, with no flash or jump at the end. Clicking a corner and clicking the middle both take the same time.
- Clicking many times during a change still gives one change. A click after it lands gives the next one.
- With sound on, the cube cascade plays with each change that starts, never for an ignored click.
- Tab to it and press Enter or Space: the wave starts from the middle, and a focus ring shows.
- It looks right in light and dark mode (check both).
- It fits on a phone without scrolling sideways, a tap works like a click, and the rolling stays smooth.
- With \`prefers-reduced-motion: reduce\`, the next picture only fades in, with no cubes and no sound.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, which pictures it shows, whether sound is on, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/cube-flip-image.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Cube flip image, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${CUBE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its hero, galleries, portfolio or product pictures, carousels, any place that shows several pictures one after another, the shapes and corner radius of its pictures and cards, whether it already uses sound anywhere, and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 places in my code it fits best and the 3 to 10 pictures each would cycle through.
      *Why: it changes only when someone clicks it, so it belongs where people want to see the next picture, and it needs real pictures to show.*
   2. **Cube size?** Fine (\`tile={12}\`, a soft shimmer), the default (\`tile={20}\`, suggested) or bold (\`tile={36}\`, cubes you can see rolling one by one).
      *Why: the cube size is the whole texture of the change, from a shimmer to clearly 3D blocks.*
   3. **Sound?** On with the cube cascade (suggested for a playful or portfolio page), or off (suggested for a calm product, or a picture people click many times).
      *Why: the sound makes the cubes feel real, but some products should stay silent.*
   4. **The shape?** Keep the 3:2 box (suggested), or the shape my pictures already use there (like 16:9, 4:3 or square).
      *Why: it should sit in my layout like the pictures around it.*
   5. **The corners?** Name which of my existing radius tokens or classes you'd use, for example my card radius (suggested) or square corners.
      *Why: the box clips the cubes, so its corners are the picture's corners.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 6 lines: the place and pictures, the cube size, the sound, the shape, the corners, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, its \`images\`, \`label\` and \`onChange\`.
- The cube size: \`tile\`.
- The sound: \`sound\`, or leave it out.
- The shape: \`ratio\`, or the size through \`className\` or \`style\`.
- The corners: the radius through \`className\` or \`style\`, from my existing tokens.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${CUBE_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component, the sound file and the place I picked, no restyling, and none of the website's demo parts (${CUBE_DEMO_PARTS}).

${CUBE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { CubeFlipImage, type CubeFlipPicture } from "@/components/ui/cube-flip-image";

// From my brief. Leave out any prop that stays at its default.
export function PortfolioWall({ shots }: { shots: CubeFlipPicture[] }) {
  return (
    <CubeFlipImage
      images={shots}
      tile={36} // bold cubes
      sound="/sounds/cube-roll.mp3" // or leave it out for silence
      ratio="4 / 3" // the shape my pictures use here
      className="w-full rounded-[var(--radius-card)]" // my card radius token, not a number I made up
    />
  );
}
\`\`\`

- Read radii and colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- The focus ring takes the text color around it, so it matches my theme in light and dark.
- Use pictures of about the same shape, so they line up the same way.

${CUBE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It shows my pictures in the shape, cube size and corners I chose, with sound only if I asked for it. A click anywhere starts a wave from that exact spot, each cube rises with a soft shadow and rolls a half turn away from it, and the whole picture is the next one about 2.6 seconds later, with no flash or jump at the end.
- Clicking many times during a change still gives one change. A click after it lands gives the next one.
- Tab to it and press Enter or Space: the wave starts from the middle, and a focus ring shows.
- It looks right in light and dark mode (check both).
- It fits on a phone without scrolling sideways, a tap works like a click, and the rolling stays smooth.
- With \`prefers-reduced-motion: reduce\`, the next picture only fades in, with no cubes and no sound.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/cube-flip-image.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
