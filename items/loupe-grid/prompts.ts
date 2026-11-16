/* ---------- Loupe Grid ----------
 * Install: adds the exact background; asks only which section it goes behind.
 * Blend: asks three short questions, then fits it through the component's own props. */

const LOUPE_GRID_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/loupe-grid.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the grid is drawn on one canvas and the rest is a few lines of CSS.
- JavaScript project? Name the file \`loupe-grid.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/loupe-grid.tsx\`
- Keep these exports and their names: \`LoupeGrid\`, \`LoupeGridProps\`, \`LoupeGridType\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PLUS_ARM\`, \`PLUS_W\`, \`DOT_R\`, \`LINE_W\`, \`MARK_A\`, \`LINE_A\`, \`LINE_HOT_A\`, \`PUSH\`, \`GLOW\`, \`GLOW_DARK\`, \`GLOW_R\`, \`IN_MS\`, \`OUT_MS\`, \`FOLLOW_MS\`, \`TOUCH_HOLD_MS\`, \`STEP\`, \`LEVELS\`, \`MAX_PIXELS\` and the \`CSS\` block. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the marks still light up and glow but don't grow or move. On touch screens the loupe shows where a finger touches and fades 450ms after it lifts. Off screen and at rest nothing runs. A very large box draws a little softer instead of running out of memory.
- Keep the grid out of the way: \`pointer-events: none\`, \`user-select: none\` and \`aria-hidden\` on its layer. It must never catch a click, a text selection or a screen reader.`;

const LOUPE_GRID_HOW = `## How the loupe works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The grid.** Marks sit on an even grid, \`gap\` (56px) apart, centred in the box so the edges match. At rest they are drawn at 30% of \`color\` (the text color by default), and on the types with lines, faint lines at 10% run edge to edge through them. It has no background of its own.
2. **The layer.** The box is \`position: relative\` with \`isolation: isolate\`. The canvas sits in a layer at \`z-index: -1\` inside it, so everything passed as children always paints above the grid, and the box's own background color paints below it. The layer has \`pointer-events: none\`, so clicks and selection go straight to the content.
3. **Sensing.** It listens to the pointer on the whole window, not on the grid, so it still reacts under headlines and buttons on top of it. When the pointer is inside the box, the loupe eases in over 200ms; when it leaves, it fades out over 550ms. Both follow a smooth S curve, so they start and end softly. The loupe trails the pointer by about 60ms, so it glides instead of jumping. On touch, the finger's position counts while it is down, and the loupe fades 450ms after it lifts.
4. **The loupe.** Every mark within \`radius\` (150px) is lit by a smooth curve: fully at the pointer, nothing at the rim, so there is never a hard ring. A lit mark grows up to \`magnify\` (1.8 times), mixes from its faint color into \`hoverColor\`, gets a soft round glow behind it (weaker for a dark hover color, so it never smudges a light page), and spreads a few pixels away from the pointer. Lines are cut into 6px pieces inside the loupe, so they bend with the marks and brighten toward the pointer.
5. **Drawing.** The whole grid is drawn once. After that, each frame only clears and redraws the square around the loupe (and the square it left), and the loop stops the moment the loupe has settled. It draws only once the box comes near the screen and ignores the pointer while it is away. All timing runs on elapsed time, so it feels the same on slow phones and fast screens. The canvas is at most 2x the screen's pixel ratio, and its colors are read from the page again when the theme changes, so it follows light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Loupe Grid

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A faint grid background whose marks swell, brighten and glow under the pointer, as if a loupe passed over it. On the types with lines, the lines bend with the marks. It sits behind the content and never catches a click.

## Before you build: one question

Look through this project first: its landing and hero sections, its sign-up and pricing sections, its root layout and which sections have plain, empty backgrounds. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 sections it fits best behind (for example the hero, or the sign-up section), or the whole page. For a section, keep its content and wrap it in the grid. For the whole page, it goes once in the root layout, fixed to the screen. I can pick one or name another.
  *Why: the grid is quiet until the pointer passes over it, so it suits a calm section with a short headline and room around it, not a busy one full of cards and images.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The faint grid of plus marks, the loupe that makes the nearby marks swell, light up, glow and spread a little under the pointer, and its smooth ease in and out are the design. Keep them exactly as in the source, with the default \`type\` (\`"plus"\`). If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it wraps an existing section, keep that section's content, spacing and background color. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the row of type pills (Plus, Plus and lines, Dots, Dots and lines), the four type cards and their labels.

${LOUPE_GRID_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { LoupeGrid } from "@/components/ui/loupe-grid";

// Behind one section: wrap its content and give it a size.
export function Hero() {
  return (
    <LoupeGrid className="flex min-h-[560px] flex-col items-center justify-center gap-6 px-6">
      <h1>Ship the calm version</h1>
      <a href="/signup">Get started</a>
    </LoupeGrid>
  );
}

// Behind the whole page: once in the root layout, empty, fixed to the screen.
<LoupeGrid className="fixed inset-0 -z-10" />
\`\`\`

- It is a \`<div>\` and takes every div prop. \`className\` and \`style\` go on the box: give it a size (or let it fill its parent) and, if you want one, a background color. The grid has none.
- Everything inside it sits above the grid and works as normal. Keep the section's own tag and landmarks (\`<section>\`, \`<main>\`) inside it, or wrap the grid inside the section.
- For a whole page, keep it empty and fixed, so it stays one screen big however long the page is.

${LOUPE_GRID_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest the grid is faint and still. Moving the mouse over it: the marks within about 150px swell (up to 1.8 times right under the pointer), turn bright and glow softly, and spread a little; the effect eases in fast and fades out slowly when the pointer leaves. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both), and the marks switch with the theme.
- On a phone, touching the grid shows the loupe under the finger and it fades shortly after lifting; the page still scrolls normally, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the marks still light up and glow, but don't grow or move.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/loupe-grid.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Loupe Grid, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A faint grid background whose marks swell, brighten and glow under the pointer, as if a loupe passed over it. On the types with lines, the lines bend with the marks. It sits behind the content and never catches a click. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its sign-up and pricing sections, its root layout, how busy each section is, its theme colors (CSS variables, Tailwind theme, shadcn theme), any grid, dot or line patterns it already uses, and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 sections it fits best behind (the hero, the sign-up section, an empty state), or the whole page, fixed to the screen.
      *Why: the grid is quiet until the pointer passes over it, so it suits a calm section with a short headline and room around it.*
   2. **Which marks, and how dense?** Plus marks (the default), plus marks on lines, dots, or dots on lines; and the spacing: roomy at 72px, default at 56px (suggested), or fine at 40px. Suggest the one closest to the lines, borders and icons already in my design.
      *Why: plus marks and lines feel technical, like a blueprint, and dots feel softer; the spacing decides whether it reads as texture or as a pattern.*
   3. **The colors?** Keep the default (marks and lines are my text color, drawn faint, and they brighten into my text color under the pointer), or name which of my existing color variables you'd use for the marks at rest and for the hover color (for example my muted foreground for the marks and my brand color for the hover).
      *Why: the hover color is the only color that moves on screen, so it decides whether the effect feels like my brand.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 4 lines: the place, the type and spacing, the colors, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which section it wraps (keeping that section's content and background), or the whole page with \`className="fixed inset-0 -z-10"\`.
- The marks and spacing: \`type\` and \`gap\`.
- The colors: \`color\` and \`hoverColor\`, as my theme's CSS variables.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The faint grid at rest, the loupe that makes the nearby marks swell, light up, glow and spread a little under the pointer (with lines bending along), its size (\`radius\` 150, \`magnify\` 1.8) and its ease in and out stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the row of type pills, the four type cards and their labels).

${LOUPE_GRID_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { LoupeGrid } from "@/components/ui/loupe-grid";

// From my brief. Leave out any prop that stays at its default.
export function Hero() {
  return (
    <LoupeGrid
      type="dots-lines"
      gap={56}
      color="var(--muted-foreground)" // my theme's variables, not hex
      hoverColor="var(--primary)"
      className="flex min-h-[560px] flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <h1>Ship the calm version</h1>
      <a href="/signup">Get started</a>
    </LoupeGrid>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- Pass full colors: the marks are drawn at 30% and the lines at 10% of \`color\` on their own. Check both against my light and dark backgrounds: the grid should be just visible at rest and the hover color should stand out in each. If my brand color doesn't, say so and suggest my foreground color instead.
- \`className\` and \`style\` go on the box: give it a size (or let it fill its parent) and, if you want one, a background color. The grid has none. Everything inside it sits above the grid.

${LOUPE_GRID_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The grid has my type, spacing and colors, faint and still at rest. Moving the mouse over it: the marks within about 150px swell (up to 1.8 times right under the pointer), turn into my hover color, glow softly and spread a little; it eases in fast and fades out slowly when the pointer leaves. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both), with the grid just visible at rest and the hover color standing out in each.
- On a phone, touching the grid shows the loupe under the finger and it fades shortly after lifting; the page still scrolls normally, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the marks still light up and glow, but don't grow or move.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/loupe-grid.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
