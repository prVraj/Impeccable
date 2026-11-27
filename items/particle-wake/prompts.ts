/* ---------- Particle Wake ----------
 * Install: adds the exact effect; asks where it goes and for the SVG.
 * Blend: asks four short questions, then fits it through the component's own props. */

const WAKE_ONE_LINE = `My own SVG (a logo, an icon, a mark), or a word, drawn as thousands of tiny dots in a few soft brightness levels, like fine dust. When the pointer moves through it, the dots near the pointer get swept along in its wake and part around it, then drift back home one by one until the shape is whole again. A click or a tap pushes them out in a soft ring. On phones there is no hover: a finger dragged sideways sweeps them, a tap pushes them, and up and down swipes still scroll the page. The first time it comes into view, the dots gather into the shape.`;

const WAKE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/particle-wake.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it is one \`<canvas>\` and one \`requestAnimationFrame\` loop.
- JavaScript project? Name the file \`particle-wake.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/particle-wake.tsx\`
- Keep these exports and their names: \`ParticleWake\` (also the default export) and \`ParticleWakeProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`STEP_MS\`, \`SPRING\`, \`FRICTION\`, \`CARRY\`, \`PUSH\`, \`TAP_PUSH\`, \`TAP_REACH\`, \`MAX_SPEED\`, \`SETTLE\`, \`INTRO_SPREAD\`, \`INTRO_FADE_MS\`, \`FULL_SIZE_AT\`, \`MIN_SCALE\`, \`FIT\`, \`MAX_DOTS\` and \`ALPHAS\`. They are the design and its feel.
- Keep the fallbacks: the loop runs only while dots are moving and the shape is on screen; with \`prefers-reduced-motion: reduce\` the shape stands still and nothing moves; on touch screens it never reacts to hover, only to a sideways drag or a tap, and the wrapper keeps \`touch-action: pan-y\` so the page still scrolls.
- The SVG goes in as a string, either the markup itself or a link to the file. If my SVG lives in a file in this project, read the file and pass its markup, or pass its public link. Only its shape is used (anything filled or stroked becomes dots); its own colors are ignored. An image link from another website must allow reading its pixels (CORS), so prefer a file from this project.`;

const WAKE_HOW = `## How the dots work

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The shape.** The SVG (or the word, in the font of the wrapper) is drawn once on a hidden canvas the size of the box, filling 84% of it. A loose grid with a gap of \`gap\` px (default 4) is laid over it, each point nudged a little at random so it reads as dust, not a grid. Every point that lands on the shape becomes a dot with its own size, one of four brightness levels and its own pull home. The random numbers are seeded, so the dust looks the same on every visit. In a box narrower than 640px (a phone), the gap, the dots and the pointer's reach shrink with the box (down to 45%), so a small shape stays just as full and a swipe stays gentle. Very big boxes get a wider gap so there are never more than 14,000 dots.
2. **The sweep.** The physics runs in fixed 60-per-second steps, so it feels the same on any screen. Dots within \`radius\` px of a moving pointer take on part of its speed (most right under it, none at the edge) and get a small outward nudge, so the pointer drags a stream of dots behind it and parts the shape where it passes. A pointer that rests does nothing.
3. **The way home.** Every dot is pulled back to its home spot like a soft spring and slowed a little each step. Each dot's pull is 0.7x to 1.3x the base, so they come back one by one, not as a block. A click or a tap kicks the dots around it outward, then they come home the same way.
4. **The intro.** The first time it comes into view, the dots start scattered around the shape, fade in and gather home.
5. **The light build.** It sleeps when nothing moves and when it is off screen, redraws itself when the box changes size, and reads its color again when the theme changes, so the dots follow light and dark mode.`;

const WAKE_LOCKED = `The dust look (the loose jittered grid, the dot sizes and the four brightness levels), the sweep (dots carried along with the pointer and parted around it, then drifting home one by one), the tap push, the gather on first view and the light build (one canvas, a loop that sleeps when nothing moves or it is off screen)`;

const WAKE_DEMO_PARTS = `the dotted demo card, the "Move your pointer through it" line, the "From your SVG" and "From a word" boxes and the drawn pointer on the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Particle Wake

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, with my own SVG, and change nothing else.

${WAKE_ONE_LINE}

## Before you build: one question

Look through this project first: its pages and sections (a hero, a footer, an about or launch page), any logo or icon SVG files it already has, and anything that already follows the pointer there (a custom cursor, a canvas, a hover effect). Then ask me this in one message and wait for my answer:

- **Where should it go, and which SVG should it draw?** Suggest the 1–3 places in my code it fits best (a hero, suggested, or a footer or an empty state), and say what would get in its way there. Then ask me for my SVG: I can paste the markup, give you a file path or link, or pick one of the SVG files you found (suggest my logo if you found it). If I have no SVG, offer a short word instead, like my product name.
  *Why: the dots are made from my SVG, so the shape is the whole point, and it should sit where nothing else fights the pointer.*

Ask nothing else. If I say *skip*, use the best place and my logo, or my product name as a word if there is no logo.

## Keep it as it is

${WAKE_LOCKED}, are the design. Keep them exactly as in the source, with the default color (the text color around it), gap, dot size, radius and strength. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${WAKE_DEMO_PARTS}.

${WAKE_SHARED_BUILD}

## Use it

\`\`\`tsx
import { ParticleWake } from "@/components/ui/particle-wake";

const logo = \`<svg viewBox="0 0 64 64">...</svg>\`; // my SVG markup

export function Hero() {
  return (
    <section>
      <ParticleWake svg={logo} label="Acme logo" className="h-72 max-w-3xl" />
    </section>
  );
}
\`\`\`

- \`svg\` takes the markup as a string or a link to the file (\`svg="/logo.svg"\`). For a word instead, pass \`text="Acme"\`: it is drawn in the font of the wrapper, so set the font with \`className\`.
- Give the wrapper a size with \`className\` or \`style\`. Without one it is full width and 2:1. The shape fits inside, centred.
- \`label\` is what a screen reader says, like my product name.

${WAKE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My SVG shows as fine dust in the place I picked. Moving the pointer through it sweeps the dots along and parts them, and they drift back home in about two seconds. A click pushes them out in a ring. Links and buttons around it still work.
- It looks right in light and dark mode (check both): the dots take the text color around them.
- On a phone, a sideways drag sweeps the dots, a tap pushes them, up and down swipes still scroll, and nothing reacts to hover.
- With \`prefers-reduced-motion: reduce\`, the shape stands still and nothing moves.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, which SVG it draws, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/particle-wake.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Particle Wake, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${WAKE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and sections (a hero, a footer, an about or launch page), any logo or icon SVG files, anything that already follows the pointer, how calm or playful the product feels, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest 1–3 places from my code: a hero (suggested), a footer, or an empty or launch page.
      *Why: it is a big moment that asks people to play, so it belongs where nothing else fights the pointer.*
   2. **Which SVG?** Paste the markup, give a file path or link, or pick one of the SVG files you found (suggest my logo if you found it). No SVG? Use a short word instead, like my product name, in my heading font.
      *Why: the dots are made from this shape, so it is the whole point of the effect.*
   3. **The color?** Name which of my existing color variables you'd use: my text color (suggested, the default), my brand or primary color, or my muted text color for something quieter.
      *Why: the dots are a single color, so one variable makes them feel like my brand in light and dark mode.*
   4. **How lively?** Calm (strength 0.6, radius 48), as designed (suggested: strength 1, radius 64) or wild (strength 1.5, radius 90). Suggest one from how my product feels.
      *Why: it sets how far the pointer throws the dots, from a gentle ripple to a big swirl.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the SVG, the color, how lively, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where \`<ParticleWake />\` is rendered, and its size through \`className\` or \`style\`.
- The shape: \`svg\` (or \`text\` when I have no SVG, with the font set through \`className\`), and \`label\`.
- The color: \`color\`, as my theme's CSS variable.
- How lively: \`strength\` and \`radius\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${WAKE_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${WAKE_DEMO_PARTS}).

${WAKE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { ParticleWake } from "@/components/ui/particle-wake";
import logo from "./logo.svg?raw"; // or paste the markup as a string, or svg="/logo.svg"

export function Hero() {
  return (
    <section>
      {/* From my brief. Leave out any prop that stays at its default. */}
      <ParticleWake
        svg={logo}
        label="Acme"
        color="var(--primary)" // my theme's variable, not hex
        strength={0.6}
        radius={48}
        className="h-72 max-w-3xl"
      />
    </section>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`. If my light and dark colors need different values, use a variable that already switches with my theme.
- Use the import style this project already uses for raw files (\`?raw\` in Vite, a string constant, or a public link). Don't add a loader package for it.
- For a word, pass \`text\` and set the font with \`className\` (my heading font and weight).

${WAKE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My SVG (or word) shows as fine dust, in my color, in the place I picked. Moving the pointer through it sweeps the dots as lively as I chose, and they drift back home in about two seconds. A click pushes them out in a ring. Links and buttons around it still work.
- It looks right in light and dark mode (check both), with my color readable in each.
- On a phone, a sideways drag sweeps the dots, a tap pushes them, up and down swipes still scroll, and nothing reacts to hover.
- With \`prefers-reduced-motion: reduce\`, the shape stands still and nothing moves.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/particle-wake.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
