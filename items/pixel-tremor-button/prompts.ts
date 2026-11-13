/* ---------- Pixel-Tremor-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PIXEL_TREMOR_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/pixel-tremor-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the button and its pixels are drawn on one small canvas inside it and the rest is plain CSS.
- JavaScript project? Name the file \`pixel-tremor-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/pixel-tremor-button.tsx\`
- Keep these exports and their names: \`PixelTremorButton\`, \`PixelTremorButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PAD\`, \`GAP\`, \`RAGGED\`, \`SHADE\`, \`SEAM\`, \`IN_MS\`, \`OUT_MS\`, \`HOVER_IN_MS\`, \`HOVER_OUT_MS\`, \`SPEED\`, \`WIDTH\`, \`LIFT\`, \`GROW\`, \`FADE\`, \`MAX_WAVES\`, \`SHADOW\`, \`EDGE\` and the \`CSS\` block. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the blocks still appear but nothing lifts. On touch screens, pressing pixelates the part under the finger and the tap sends the wave from it. Enter or Space sends the wave from the centre, and focus shows a ring in the text color around it. A disabled button never pixelates. Until the first drawing is ready the button shows a plain fill, so it is never empty. The rounded shape is drawn by hand, so it also works where the canvas \`roundRect\` is missing.`;

const PIXEL_TREMOR_HOW = `## How the pixels work

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A canvas inside the button draws one plain, solid pill in \`color\` (white by default) with a soft drop shadow and a hairline edge, so a white button still shows on a white page. The button itself has no background. It looks like a simple button until someone reaches for it.
2. **The block grid.** Behind the scenes the button is split into square blocks of \`pixel\` px (6 by default) plus a 1px seam, stretched a hair so a whole number of them fills the button edge to edge. Each block knows how broken it is, from 0 (part of the solid surface) to 1 (a separate block).
3. **The chunk under the pointer.** While the pointer is on the button, blocks within \`reach\` px (34) of it break out, fully near the pointer and less toward the edge, with a ragged edge so it looks like a chunk, not a circle. A broken block is cut out of the surface and drawn on its own, a little smaller, over a dark seam (55% black at full), with a slightly different shade from its neighbours. The blocks hold still; only the chunk moves with the pointer. Blocks break out in about 70ms and melt back in about 240ms, so the chunk follows the pointer and leaves a short trail. Where the chunk reaches a rounded end, blocks whose centre is outside the shape stay cut away, so the edge steps like pixel art.
4. **The wave.** Pressing the button starts a wave at the exact spot pressed. It travels out at 0.22px per ms as a 10px band: every block it passes breaks out, lifts 2px and grows 15%, then settles back into the surface. It loses half its strength by the far edge and ends once it has crossed the whole button. Quick presses overlap, up to 4 waves at once.
5. **The label.** Normal text on top of the canvas. It never pixelates or moves, so it is always easy to read. It is black or white, whichever reads best on \`color\`, unless \`textColor\` is set.
6. **Drawing.** The canvas reaches 10px past every edge for the shadow and lifted blocks. A loop runs only while something moves and stops once the surface is solid again. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. The color is read from the page on every frame, so a theme color follows light and dark mode, and the button redraws when it changes size.`;

export function installPrompt(tsSource: string) {
  return `# Pixel-Tremor-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A plain white button that turns to pixels where you touch it: a small chunk right under the pointer breaks into square blocks that follow it, and a click sends a wave of pixels out from the exact spot you clicked. The label stays sharp the whole time.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, a launch or waitlist button, or a "Play" or "Start" button). Keep the button's label, link and click handler. I can pick one or name another.
  *Why: it looks plain until someone reaches for it, so it suits one main action that should reward that moment, not every button on the page.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The plain white surface at rest, the ragged chunk of blocks that follows the pointer, the wave of pixels from the click point and the sharp label that never pixelates are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Make a wave" label and the dotted card behind it.

${PIXEL_TREMOR_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PixelTremorButton } from "@/components/ui/pixel-tremor-button";

export function HeroAction() {
  return <PixelTremorButton onClick={() => router.push("/signup")}>Start building</PixelTremorButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- It is white by default with a dark label. \`className\` and \`style\` go on the button itself (44px tall, 24px sides). Its border-radius sets the shape.
- Leave about 10px of free space around it. A parent with hidden overflow closer than that clips its shadow and the blocks the wave lifts.

${PIXEL_TREMOR_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a plain white pill with a soft shadow and a sharp label. Moving the pointer over it breaks a small, ragged chunk right under the pointer into 6px blocks with dark seams; the chunk follows the pointer and melts back within about a quarter second where it leaves. A click sends a band of pixels from the exact spot clicked across the whole button in well under a second; quick clicks overlap. The click still works as before.
- It looks right in light and dark mode (check both): the white button and its blocks show on both.
- On a phone, pressing pixelates the part under the finger, the tap sends the wave from it, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the blocks still appear under the pointer and in the wave, but nothing lifts.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/pixel-tremor-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Pixel-Tremor-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A plain white button that turns to pixels where you touch it: a small chunk right under the pointer breaks into square blocks that follow it, and a click sends a wave of pixels out from the exact spot you clicked. The label stays sharp the whole time. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, its theme colors (CSS variables, Tailwind theme, shadcn theme), its light and dark mode, and whether it already has a pixel, retro or playful look.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, a launch or waitlist button, a "Play" or "Start" button).
      *Why: it looks plain until someone reaches for it, so it suits one main action that should reward that moment, not every button on the page.*
   2. **The colors?** Keep the default (a white button with a dark label, suggested), or name which of my existing color variables you'd use for the button and the label (for example my card or background color with my foreground color).
      *Why: the button is plain until touched, so its color decides whether it sits calmly in my design or stands out as the main action.*
   3. **How big should the blocks be?** Fine at 4px, default at 6px (suggested), or chunky at 8px for a bolder retro look.
      *Why: bigger blocks make the pixel moment louder and the stepped edges rougher; smaller ones read as a fine texture.*
   4. **How big should the pixel chunk under the pointer be?** Small at 24px, default at 34px (suggested), or large at 52px for a wide button.
      *Why: it sets how much of the button breaks apart at once, which should fit the button's size and how calm or playful my product is.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place, the colors, the block size, the chunk size), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The colors: \`color\` and \`textColor\`, as my theme's CSS variables.
- The block size: \`pixel\`.
- The chunk size: \`reach\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The plain surface at rest, the ragged chunk of blocks that follows the pointer, the wave of pixels from the click point and the sharp label stay exactly as in the source, with their sizes and timing. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Make a wave" label and the dotted card behind it).

${PIXEL_TREMOR_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { PixelTremorButton } from "@/components/ui/pixel-tremor-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <PixelTremorButton
      color="var(--background)" // my theme's variables, not hex
      textColor="var(--foreground)"
      pixel={6}
      reach={34}
      onClick={() => router.push("/signup")}
    >
      Start building
    </PixelTremorButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- Check the button against both my light and dark backgrounds and the label against the button: each should stand out in both themes. The seams between blocks are dark, so a very dark button color hides them; if I pick one, say so and suggest a lighter one.
- \`className\` and \`style\` go on the button itself (44px tall, 24px sides). Its border-radius sets the shape, so if my buttons are square-cornered, keep their radius and the blocks follow it. Leave about 10px of free space around it.

${PIXEL_TREMOR_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a plain pill in my color with a sharp label in my label color. Moving the pointer over it breaks a chunk of my chosen size into blocks of my chosen size; it follows the pointer and melts back where it leaves. A click sends a band of pixels from the exact spot clicked across the whole button in well under a second. The click still works as before.
- It looks right in light and dark mode (check both), with the button, its blocks and the label standing out in each.
- On a phone, pressing pixelates the part under the finger, the tap sends the wave from it, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the blocks still appear under the pointer and in the wave, but nothing lifts.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/pixel-tremor-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
