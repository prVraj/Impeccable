/* ---------- ASCII-Tide-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const ASCII_TIDE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/ascii-tide-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the characters and the tide are drawn on one small canvas inside the button and the rest is plain CSS.
- JavaScript project? Name the file \`ascii-tide-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/ascii-tide-button.tsx\`
- Keep these exports and their names: \`AsciiTideButton\`, \`AsciiTideButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`CELL_W\`, \`CELL_H\`, \`FONT\`, \`RAMP\`, \`FIELD\`, \`CHAR_ALPHA\`, \`FLOW\`, \`SOFT\`, \`HOVER_IN_MS\`, \`HOVER_OUT_MS\`, \`FOLLOW_MS\`, \`SPEED\`, \`WIDTH\`, \`TIDE_LIFT\`, \`TIDE_GLOW\`, \`FADE\`, \`MAX_TIDES\` and the \`CSS\` block. They are the design.
- Keep it simple: no gradient border, no glow around the outside, no extra colors. The only color besides the fill and the label is the tide.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the characters hold still and only the tide passes. On touch screens, pressing shows the field under the finger and the tap sends the tide from it. Enter or Space sends the tide from the centre, and focus shows a ring in the text color around it. A disabled button shows no characters and no tide. A hidden tab stops drawing.`;

const ASCII_TIDE_HOW = `## How the characters work

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A plain pill in \`color\` (near-black by default) with a faint inner edge and a small shadow. Nothing is drawn on the canvas. It looks like a simple button until someone reaches for it.
2. **The character grid.** Behind the label, the button is split into small cells (6px across, 7px down), each able to hold one 7px monospace character from the ramp \` .:-=+*\`, faint to strong.
3. **The field around the pointer.** While the pointer is on the button, cells within \`reach\` px (64) of it fill with characters, strongest near the pointer and fading softly toward the edge. Two slow waves cross the field and drift over time, so each cell moves between faint and strong characters like text-mode water. The field rises in about 160ms, sinks in about 320ms after the pointer leaves, and follows the pointer with a short, soft lag. Characters are drawn at most 50% bright in \`charColor\` (the label color by default), so the label always reads first.
4. **The tide.** A tap starts a tide at the exact spot pressed. It rolls out slowly (0.16px per ms) as a soft 16px band. Characters it passes turn \`tideColor\` (a light, slightly warm violet by default), grow stronger and show even where the field was empty. It loses about 40% of its strength by the far edge and ends once it has crossed the whole button. Quick taps overlap, up to 3 tides at once. The color is kept light and soft on purpose, so a tap feels calm.
5. **The label.** Normal text above the canvas. It never moves, so it is always easy to read. It is black or white, whichever reads best on the fill, unless \`textColor\` is set.
6. **Drawing.** The canvas fills the button exactly; the button clips it. A loop runs only while the field shows, a tide rolls or the field is still settling, and stops when the button is at rest. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. Colors are read from the page on every frame, so theme colors follow light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# ASCII-Tide-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A plain dark button that shows drifting ASCII characters behind its label where the pointer is, and sends a calm tide of soft violet across it on tap. The label stays sharp the whole time.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, a "Get started" or waitlist button, or a developer-facing "Try the API" button). Keep the button's label, link and click handler. I can pick one or name another.
  *Why: it looks plain until someone reaches for it, so it suits one main action that should reward that moment, not every button on the page.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The plain pill at rest, the faint drifting ASCII field that follows the pointer behind the label, and the slow, soft violet tide on tap are the design. Keep them exactly as in the source, with no gradient border or outer glow. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the button.

${ASCII_TIDE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { AsciiTideButton } from "@/components/ui/ascii-tide-button";

export function HeroAction() {
  return <AsciiTideButton onClick={() => router.push("/signup")}>Get started</AsciiTideButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- \`className\` and \`style\` go on the button itself (44px tall, 24px sides). Everything happens inside the button, so it needs no extra room around it.

${ASCII_TIDE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a plain dark pill with a sharp label. Moving the pointer over it raises faint ASCII characters behind the label around the pointer, drifting slowly, and they sink away within about a third of a second after the pointer leaves. A click sends a slow, soft violet tide from the exact spot clicked across the whole button in about a second; quick clicks overlap. The click still works as before.
- It looks right in light and dark mode (check both): the pill and its faint edge show on both.
- On a phone, pressing shows the characters under the finger, the tap sends the tide from it, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the characters hold still and only the tide passes.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/ascii-tide-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# ASCII-Tide-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A plain dark button that shows drifting ASCII characters behind its label where the pointer is, and sends a calm tide of soft violet across it on tap. The label stays sharp the whole time. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, a "Get started" or waitlist button, a developer-facing "Try the API" button).
      *Why: it looks plain until someone reaches for it, so it suits one main action that should reward that moment, not every button on the page.*
   2. **The fill and label colors?** Keep the default (a near-black pill with a white label, suggested), or name which of my existing color variables you'd use for the fill and the label (for example my foreground and background colors).
      *Why: the characters sit on the fill, so a dark fill makes them read best; a light fill works too, with dark characters.*
   3. **The tide color?** Keep the default (a light, slightly warm violet), or name a light, soft shade from my theme (for example a 200 or 300 step of my brand color, never the full-strength one).
      *Why: the tide is the only color moment, and a light shade keeps a tap calm instead of loud.*
   4. **How far should the characters reach?** Small at 40px, default at 64px (suggested), or the whole button at 160px.
      *Why: a small field feels like a spotlight on the pointer; a big one fills the button like a screen.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place, the fill and label, the tide color, the reach), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The fill and label: \`color\` and \`textColor\` (and \`charColor\` only if the characters need a different color to stay faint on my fill), as my theme's CSS variables.
- The tide: \`tideColor\`, a light shade from my theme.
- The reach: \`reach\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The plain pill at rest, the faint drifting ASCII field that follows the pointer behind a sharp label, and the slow, soft tide on tap stay exactly as in the source, with their sizes and timing, and with no gradient border or outer glow. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card behind the button).

${ASCII_TIDE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { AsciiTideButton } from "@/components/ui/ascii-tide-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <AsciiTideButton
      color="var(--foreground)" // my theme's variables, not hex
      textColor="var(--background)"
      tideColor="var(--brand-300)" // a light shade, never the full-strength brand color
      reach={64}
      onClick={() => router.push("/signup")}
    >
      Get started
    </AsciiTideButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my theme has no light shade of the brand color, mix one: \`color-mix(in oklab, var(--primary) 45%, white)\`.
- Check the fill against both my light and dark backgrounds and the label against the fill, in both themes. The tide should be clearly lighter than my brand color.
- \`className\` and \`style\` go on the button itself (44px tall, 24px sides).

${ASCII_TIDE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a plain pill in my fill color with a sharp label in my label color. Moving the pointer over it raises faint ASCII characters within my reach, drifting slowly, and they sink away after the pointer leaves. A click sends a slow, soft tide in my tide color from the exact spot clicked across the whole button. The click still works as before.
- It looks right in light and dark mode (check both), with the pill and the label standing out in each.
- On a phone, pressing shows the characters under the finger, the tap sends the tide from it, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the characters hold still and only the tide passes.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/ascii-tide-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
