/* ---------- Velvet Grain ----------
 * Install: adds the exact background; asks only which section it goes behind.
 * Blend: asks three short questions, then fits it through the component's own props. */

const VELVET_GRAIN_ONE_LINE = `A fine, still grain background that you brush like velvet. A heavy, soft brush trails the pointer a beat behind, smooths a track through the grain, and the track slowly fills back in. It sits behind the content and never catches a click.`;

const VELVET_GRAIN_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/velvet-grain.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the grain is drawn with plain WebGL on one canvas, and the rest is a few lines of CSS.
- JavaScript project? Name the file \`velvet-grain.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/velvet-grain.tsx\`
- Keep these exports and their names: \`VelvetGrain\`, \`VelvetGrainProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`GRAIN_PX\`, \`INK\`, \`SPARSE\`, \`DENSE\`, \`HAZE\`, \`HAZE_KEEP\`, \`SMOOTH_FINE\`, \`RIM\`, \`FREQ\`, \`DAMP\`, \`SPREAD\`, \`FAST\`, \`STAMP_A\`, \`STAMP_STEP\`, \`CELL\`, \`MAX_CELLS\`, \`REST\`, \`REDUCED_FADE\`, \`AUTO_LOOP\`, \`AUTO_IDLE\`, \`MAX_PIXELS\`, the two shaders (\`VERT\`, \`FRAG\`) and the \`CSS\` block. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the brush sits right under the pointer with no weight and the track fills back in within 600ms. Phones have no hover, so there it only follows a finger that is down (scrolling counts as a drag). Off screen and at rest nothing runs. If the graphics card drops the canvas, it comes back on its own. Without WebGL the box simply shows its own background.
- Keep the grain out of the way: \`pointer-events: none\`, \`user-select: none\` and \`aria-hidden\` on its layer. It must never catch a click, a text selection or a screen reader.`;

const VELVET_GRAIN_HOW = `## How the brush works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The grain.** Every pixel-sized speck is either on or off, with its own brightness, and never moves, so the grain looks like fabric, not TV static. It is thinner at the top and gathers toward the bottom in big soft clouds. Specks are drawn at up to 36% of \`color\` (the text color by default). It has no background of its own.
2. **The layer.** The box is \`position: relative\` with \`isolation: isolate\`. The canvas sits in a layer at \`z-index: -1\` inside it, so everything passed as children always paints above the grain, and the box's own background color paints below it. The layer has \`pointer-events: none\`, so clicks and selection go straight to the content.
3. **Sensing.** It listens to the pointer on the whole window, not on the grain, so it still reacts under headlines and buttons on top of it. On touch screens it only follows a finger that is down, and keeps following while the page scrolls.
4. **The brush.** The brush is a weight on a spring (about 2.3 times a second, slightly under-damped): it lags a beat behind the pointer, swings a little past a sharp turn and settles. It spreads up to about 30% wider when it moves fast. It lands where the pointer is, never sliding in from where it was last time.
5. **The track.** As the brush moves it leaves evenly spaced soft dabs on a small grid (one cell every 6px). Where the track is, the grain is smoothed into an even haze (lighter than thin grain, darker than thick grain, so the track always shows), and along its edges a little extra grain piles up, like sand pushed aside. The track holds its shape for a moment, then melts away evenly over \`fade\` (1800ms), and the same specks return.
6. **Drawing.** One full-screen triangle and one small texture: each frame the track grid and the grain density go to the graphics card, which draws every speck. The loop stops the moment the track has filled back in and the brush has settled. It starts drawing only once the box comes near the screen. All timing runs on elapsed time, so it feels the same on slow phones and fast screens. The canvas is at most 2x the screen's pixel ratio, and the color is read from the page again when the theme changes, so it follows light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Velvet Grain

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${VELVET_GRAIN_ONE_LINE}

## Before you build: one question

Look through this project first: its landing and hero sections, its sign-up and pricing sections, its root layout and which sections have plain, empty backgrounds. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 sections it fits best behind (for example the hero, or the sign-up section), or the whole page. For a section, keep its content and wrap it in the grain. For the whole page, it goes once in the root layout, fixed to the screen. I can pick one or name another.
  *Why: the grain is quiet until the pointer brushes it, so it suits a calm section with a short headline and room around it, not a busy one full of cards and images.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The still grain, the heavy brush that trails the pointer and smooths a soft track through it, the grain piling up at the track's edges, and the slow fill back in are the design. Keep them exactly as in the source, with the default props. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it wraps an existing section, keep that section's content, spacing and background color. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Let's make something for Humans once again." headline, its Browse components pill, or the auto brush used on the home screen.

${VELVET_GRAIN_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { VelvetGrain } from "@/components/ui/velvet-grain";

// Behind one section: wrap its content and give it a size.
export function Hero() {
  return (
    <VelvetGrain className="flex min-h-[560px] flex-col items-center justify-center gap-6 px-6">
      <h1>Made for humans, once again</h1>
      <a href="/components">Browse components</a>
    </VelvetGrain>
  );
}

// Behind the whole page: once in the root layout, empty, fixed to the screen.
<VelvetGrain className="fixed inset-0 -z-10" />
\`\`\`

- It is a \`<div>\` and takes every div prop. \`className\` and \`style\` go on the box: give it a size (or let it fill its parent) and, if you want one, a background color. The grain has none.
- Everything inside it sits above the grain and works as normal. Keep the section's own tag and landmarks (\`<section>\`, \`<main>\`) inside it, or wrap the grain inside the section.
- For a whole page, keep it empty and fixed, so it stays one screen big however long the page is.

${VELVET_GRAIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest the grain is fine and still, thinner at the top. Moving the mouse across it: a soft brush about 180px wide follows a beat behind, swings a little past sharp turns, and leaves a smooth hazy track with a little extra grain along its edges; the track fills back in over about 2 seconds. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both), and the grain switches with the theme.
- On a phone it stays still until a finger drags across it, then the brush follows the finger; the page still scrolls normally, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the brush sits right under the pointer with no lag or swing, and the track fills back in sooner.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/velvet-grain.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Velvet Grain, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${VELVET_GRAIN_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its sign-up and pricing sections, its root layout, how busy each section is, its theme colors (CSS variables, Tailwind theme, shadcn theme), any grain, noise or texture it already uses, and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 sections it fits best behind (the hero, the sign-up section, an empty state), or the whole page, fixed to the screen.
      *Why: the grain is quiet until the pointer brushes it, so it suits a calm section with a short headline and room around it.*
   2. **How much grain?** Light at 0.3, default at 0.5 (suggested), or rich at 0.7. Suggest the one that fits how much texture my design already has.
      *Why: light grain reads as a soft finish behind the words, rich grain reads as a material, like velvet or film.*
   3. **The color?** Keep the default (the grain is my text color, drawn faint), or name which of my existing color variables you'd use instead (for example my muted foreground for a softer grain, or my brand color for a tinted one).
      *Why: the grain covers the whole section, so its color sets the mood of everything on top of it.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 4 lines: the place, the amount of grain, the color, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which section it wraps (keeping that section's content and background), or the whole page with \`className="fixed inset-0 -z-10"\`.
- The amount of grain: \`density\`.
- The color: \`color\`, as one of my theme's CSS variables.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The still grain, the heavy brush that trails the pointer and smooths a soft track (\`radius\` 90, \`mass\` 1), the grain piling up at the track's edges, and the slow fill back in (\`fade\` 1800) stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Let's make something for Humans once again." headline, its Browse components pill, or the auto brush used on the home screen).

${VELVET_GRAIN_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { VelvetGrain } from "@/components/ui/velvet-grain";

// From my brief. Leave out any prop that stays at its default.
export function Hero() {
  return (
    <VelvetGrain
      density={0.7}
      color="var(--muted-foreground)" // my theme's variable, not hex
      className="flex min-h-[560px] flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <h1>Made for humans, once again</h1>
      <a href="/components">Browse components</a>
    </VelvetGrain>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--muted-foreground))\`.
- Pass a full color: the specks are drawn at up to 36% of \`color\` on their own. Check it against my light and dark backgrounds: the grain should be clearly there but never fight the text on top. If my brand color is too loud for that, say so and suggest my muted foreground instead.
- \`className\` and \`style\` go on the box: give it a size (or let it fill its parent) and, if you want one, a background color. The grain has none. Everything inside it sits above the grain.

${VELVET_GRAIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The grain has my amount and color, fine and still at rest. Moving the mouse across it: a soft brush about 180px wide follows a beat behind, swings a little past sharp turns, and leaves a smooth hazy track with a little extra grain along its edges; the track fills back in over about 2 seconds. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both), with the grain clearly there but quieter than the text in each.
- On a phone it stays still until a finger drags across it, then the brush follows the finger; the page still scrolls normally, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the brush sits right under the pointer with no lag or swing, and the track fills back in sooner.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/velvet-grain.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
