/* ---------- Text-mirroring ----------
 * Install: adds the exact component; asks only which heading it goes on.
 * Blend: asks five short questions, then fits it through the component's own props. */

const TEXT_MIRRORING_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/text-mirroring.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: every move is a CSS transition set from inline styles, and the mirror is a small SVG over each letter, clipped to that letter's own shape.
- JavaScript project? Name the file \`text-mirroring.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/text-mirroring.tsx\`
- Keep these exports and their names: \`TextMirroring\` (also the default export) and \`TextMirroringProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`SHRINK\`, \`LAYER_MS\`, \`LETTER_STAGGER\`, \`OUT_MS\`, \`FACE_MS\`, \`EASE_IN\`, \`EASE_OUT\`, \`PACE_COPIES\`, \`RIM_EM\`, \`LINE_EM\`, and the hard cap \`MAX_DEPTH\` (8). They are the design, and the cap is what keeps the "infinite" mirror a fixed, small number of letters.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the smaller letters only fade in place, with no movement; screen readers hear the text once, as normal text, and never the mirror; on touch screens a tap turns it on and a tap anywhere else turns it off.`;

const TEXT_MIRRORING_HOW = `## How the mirror works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** The text is plain bold header type: 64px (or 52px), weight 900 (black), tight letter spacing. Over each letter sits a hidden mirror drawn in SVG. Nothing runs while it rests.
2. **The letter turns to glass.** On hover, each letter's solid face fades out and the glass fades in, in about half a second, left to right, 18ms apart. Glass is a see-through fill mixed from the text color, a diagonal light streak and a crisp rim along the letter's edge.
3. **A letter inside the letter.** Then smaller copies of the letter open one at a time, each inside the one before it, like a screen shared into itself: the second is born where the first sits and settles one step smaller, then the third out of the second, and so on. Each is 80% the size of the one in front, centred on the letter, with a thin edge line. They are clipped to the letter's own shape, so nothing is ever drawn outside or behind the letter: you only see them through the letter, like a mirror inside a mirror. The edges bunch up the deeper they go, so the tunnel looks endless. Each one settles in 620ms with a fast start and a soft landing, and the last one lands at \`duration\` (1.5 seconds by default).
4. **Leaving.** Moving away plays it backwards and faster: the deepest letter folds back first into the one in front of it, then the next, and only when they are gone does the glass turn back to solid. Leaving halfway through turns around smoothly from wherever it is.
5. **No loop.** "Infinite" is only the look. There are only a few letters inside each letter: 5 on tablets and desktops, and 3 on a phone (when the text has shrunk to fit a narrow screen, under about 430px), never more than 8, each drawn once. There is no timer and no animation loop, so it can't run away or slow the page.

The letters, the glass and the edges are all mixed from the text color, so it follows light and dark mode on its own.`;

const TEXT_MIRRORING_ONE_LINE =
  "Bold header text that, on hover, turns to glass and opens smaller copies of each letter inside itself, one inside the other, like an infinite mirror; leaving plays it backwards.";

export function installPrompt(tsSource: string) {
  return `# Text-mirroring

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${TEXT_MIRRORING_ONE_LINE}

## Before you build: one question

Look through this project first: its hero and section headings, and which of them are short (two to four words). Then ask me this in one message and wait for my answer:

- **Which heading should it go on?** Suggest the 1–3 headings that fit best (for example the home page hero title). I can pick one of them or name another.
  *Why: it is made for one big, short title people look at; on long or many headings the mirror gets busy and loses its moment.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The look and the motion are the design. Keep the bold type, the glass face, the smaller letters that open inside each letter and fold back on leave, and their timing exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and swap it in for the one heading I picked, keeping that heading's tag level, text and color. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the handwritten "Hover on this" note with its arrow, the "Vraj Sensei" sample text and the size labels.

${TEXT_MIRRORING_SHARED_BUILD}

## Use it

\`\`\`tsx
import { TextMirroring } from "@/components/ui/text-mirroring";

export function Hero() {
  return <TextMirroring as="h1" text="Made for humans" />;
}
\`\`\`

- Pass the heading's words as \`text\` and keep its tag with \`as\` (\`"h1"\`, \`"h2"\`...).
- Its color is the color of the letters and of the glass. It takes the text color around it, or set it with \`className\` (for example \`text-foreground\`). Don't set a font size in \`className\`: \`size\` (64 or 52) sets it and shrinks it to fit narrow screens.
- The mirror stays inside the letters, so it needs no extra room around the text.

${TEXT_MIRRORING_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Hovering the heading turns the letters to glass, then 5 smaller letters (3 on a phone) open inside each letter, one inside the other, over about 1.5 seconds, with nothing drawn outside the letters; moving away folds them back, deepest first, in under a second, and the text is solid again. Leaving halfway turns around smoothly.
- It looks right in light and dark mode (check both).
- On a phone a tap turns it on, a tap anywhere else turns it off, the text fits the screen and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the smaller letters only fade in place, with no movement.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/text-mirroring.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Text-mirroring, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${TEXT_MIRRORING_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its hero and section headings and their sizes, its fonts, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which heading should it go on?** Suggest the 1–3 short headings that fit best (the home page hero title, a section title).
      *Why: it is made for one big, short title; on long or many headings the mirror gets busy and loses its moment.*
   2. **Size?** 64px (suggested for a hero) or 52px (suggested for a section title), picked from the heading sizes you found.
      *Why: it should match the size my heading already has, so the page doesn't jump when it goes in.*
   3. **Color?** Keep the heading's current text color (suggested), or name which one of my existing color variables you'd use instead (for example my brand or primary color).
      *Why: the glass, its edges and every letter inside are mixed from that one color, so it decides how the whole mirror reads.*
   4. **How deep?** Automatic (suggested: 5 letters inside each letter on tablets and desktops, 3 on phones), always 3 for a calmer echo, or 8 for the deepest tunnel.
      *Why: more letters inside look more endless but busier; fewer stay calm next to small text.*
   5. **How slow?** 1.5 seconds to build (suggested), 1 second for a quicker build, or 2.2 seconds for a slow, dreamy one.
      *Why: the slow, one-by-one build is what makes it feel like a mirror, so pick the pace that fits how calm my product feels.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 6 lines: the heading, the size, the color, the depth, the speed, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which heading it replaces, through \`text\` and \`as\`.
- The size: \`size\` (64 or 52).
- The color: \`className\` or \`style\` color, as my theme's variable.
- The depth: \`depth\` (2 to 8), or leave it out for automatic.
- The speed: \`duration\` in ms (400 to 4000).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The look and the motion are the design. The bold type, the glass face, the smaller letters born one inside the other and clipped to each letter's shape, and the backwards leave stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the heading I picked, no restyling, and none of the website's demo parts (the handwritten "Hover on this" note with its arrow, the "Vraj Sensei" sample text and the size labels).

${TEXT_MIRRORING_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { TextMirroring } from "@/components/ui/text-mirroring";

// From my brief. Leave out any prop that stays at its default.
export function Hero() {
  return (
    <TextMirroring
      as="h1"
      text="Made for humans"
      size={64}
      duration={1500}
      style={{ color: "var(--primary)" }} // my theme's variable, not hex
    />
  );
}
\`\`\`

- Read the color from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- Keep my font family: the component sets size, weight, line height and letter spacing, and takes the font from the page.
- The mirror stays inside the letters, so it needs no extra room around the text.

${TEXT_MIRRORING_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My heading shows in my size and color. Hovering it turns the letters to glass, then my number of smaller letters open inside each letter over my chosen time, with nothing drawn outside the letters; moving away folds them back, deepest first, and the text is solid again. Leaving halfway turns around smoothly.
- It looks right in light and dark mode (check both), with my color readable in each.
- On a phone a tap turns it on, a tap anywhere else turns it off, the text fits the screen and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the smaller letters only fade in place, with no movement.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/text-mirroring.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
