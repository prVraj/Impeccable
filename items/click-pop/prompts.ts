/* ---------- Click Pop ----------
 * Install: adds the exact pop; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const POP_ONE_LINE = `A small pop at the pointer every time someone clicks, in one of five types: **burst** (four short lines shoot out above the pointer tip, shrink to dots and fade), **ring** (a thin ring opens around the click and fades), **particles** (eight dots scatter all around, drift down a little and fade), **crosshair** (four ticks swing in from a turned cross and lock onto the click) or **wavy** (four lines wriggle out from the tip, straighten, then shrink away). Each pop starts at the very tip of the pointer and is gone in about half a second. It can cover every click on the site, or only the clicks inside one part of a page.`;

const POP_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/click-pop.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: each pop is a tiny SVG drawn by one \`requestAnimationFrame\` loop that runs only while a pop is on screen.
- JavaScript project? Name the file \`click-pop.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/click-pop.tsx\`
- Keep these exports and their names: \`ClickPop\` (also the default export), \`clickPop\`, \`ClickPopProps\`, \`ClickPopOptions\` and \`ClickPopType\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`BOX\`, \`MAX_LIVE\`, \`BURST\`, \`RING\`, \`PARTICLES\`, \`CROSSHAIR\`, \`WAVY\` and the easing curves under them. They are the design and its timing.
- Keep the fallbacks: nothing is on the page until the first click, the layer never catches the pointer (\`pointer-events: none\`), so clicks, drags and text selection pass straight through, and each pop removes itself when it ends. With \`prefers-reduced-motion: reduce\` there are no pops at all. Only the main mouse button pops.`;

const POP_HOW = `## How the pop works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The listener.** \`<ClickPop />\` without children listens for every press on the page (\`pointerdown\`, in the capture phase and passive, so it never blocks or delays a click). With children, it listens only inside its wrapper. It pops on the press, not on release, so it feels instant.
2. **The layer.** On the first pop it adds one fixed, see-through layer over the page that never catches the pointer. Each pop is a small SVG in that layer, centred on the pointer tip. When the last pop ends, the layer is removed, so nothing stays on the page between clicks.
3. **The frame loop.** One \`requestAnimationFrame\` loop draws every pop on screen and stops as soon as none are left. Fast clicking keeps at most 12 pops at once; the oldest goes first.
4. **The types.** Burst: four lines at -58, -24, 14 and 48 degrees from straight up travel from 18px to 40px out, shrink to dots and fade after the halfway mark, in 0.42 seconds. Ring: opens from 3px to 26px while its line thins, in 0.52 seconds. Particles: eight dots, each a little off its slot and a little nearer or farther, drift down as they shrink, in 0.62 seconds. Crosshair: four ticks start as a cross turned 45 degrees, swing straight while they close from 20px to 9px, and a dot grows in the middle, in 0.48 seconds. Wavy: four lines (left, up-left, up and up-right) wriggle out to 56px, straighten as they arrive, then shrink toward their outer end, in 0.4 seconds.
5. **The color.** The color is set on each SVG and every line uses \`currentColor\`, so any CSS color works, including a theme variable that changes in dark mode.`;

const POP_LOCKED = `The five pops (their shapes, distances, timing and easing), the pop starting at the exact pointer tip on the press, and the light build (no layer until the first click, a layer that never catches the pointer, each pop removing itself)`;

const POP_DEMO_PARTS = `the dotted demo card, the "Click anywhere" text, the five type pills, the drawn pointers that pop on their own in the Types boxes and the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Click Pop

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${POP_ONE_LINE}

## Before you build: one question

Look through this project first: its root layout, its pages and sections, and anything that already reacts to clicks (a custom cursor, ripple effects, click sounds). Then ask me this in one message and wait for my answer:

- **Where should it pop?** Suggest the 1–3 places in my code it fits best: the whole site (one \`<ClickPop />\` in my root layout, suggested) or one part of a page I name (a hero, a pricing card, a game area), and say what would get in its way there (an existing click effect). I can pick one or name another.
  *Why: one pop on every click feels like part of the site, but it should never fight another click effect.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${POP_LOCKED}, are the design. Keep them exactly as in the source, with the default type (\`burst\`) and the default color. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${POP_DEMO_PARTS}.

${POP_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/layout.tsx: once, and every click on the site pops.
import { ClickPop } from "@/components/ui/click-pop";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClickPop />
      </body>
    </html>
  );
}
\`\`\`

- Without children it renders nothing of its own: put it anywhere inside \`<body>\`, once. Two of them would pop twice.
- To pop only inside one part of a page, wrap that part instead: \`<ClickPop className="...">...</ClickPop>\`. The wrapper is a plain \`div\`, so give it the classes the part needs.
- \`clickPop(x, y, { type, color, size })\` fires one pop from code at a point on the screen (\`clientX\`, \`clientY\`).

${POP_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Every click in the place I picked pops at the very tip of the pointer: four short lines shoot out above it and fade in about 0.4 seconds. Links, buttons, drags and text selection still work exactly as before.
- It looks right in light and dark mode (check both): the violet reads on both.
- On a phone, a tap pops the same way and scrolling stays smooth.
- With \`prefers-reduced-motion: reduce\`, nothing pops.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/click-pop.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Click Pop, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${POP_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its root layout, its pages and sections, anything that already reacts to clicks (a custom cursor, ripple effects, click sounds), how calm or playful the product feels, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it pop?** The whole site (one \`<ClickPop />\` in my root layout, suggested), or one part of a page you name from my code (a hero, a pricing card, a game area).
      *Why: one pop on every click feels like part of the site, but it should never fight another click effect.*
   2. **Which type?** Burst (suggested for most products: four short lines above the tip), ring or crosshair (the calmest, for serious or data-heavy products), particles or wavy (the most playful, for creative or fun products). Suggest one from how my product feels.
      *Why: the type is the whole personality of the pop, so it should match the tone of my product.*
   3. **The color?** Name which of my existing color variables you'd use: my brand or primary color (suggested), my accent color, or my muted text color for something quieter.
      *Why: the pop is a single color, so one variable makes it feel like my brand in light and dark mode.*
   4. **Taps on phones?** Pop on taps too (suggested), or mouse and pen only.
      *Why: on a phone the finger covers part of the pop, so some products prefer to keep it to the desktop.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the type, the color, taps on phones, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where \`<ClickPop />\` is rendered, and for one part of a page, the wrapper's \`className\`.
- The type: \`type\`.
- The color: \`color\`, as my theme's CSS variable.
- Taps on phones: \`touch\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${POP_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${POP_DEMO_PARTS}).

${POP_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
// app/layout.tsx
import { ClickPop } from "@/components/ui/click-pop";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* From my brief. Leave out any prop that stays at its default. */}
        <ClickPop
          type="ring"
          color="var(--primary)" // my theme's variable, not hex
          touch={false}
        />
      </body>
    </html>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`. If my light and dark colors need different values, use a variable that already switches with my theme.
- Without children it renders nothing of its own: put it inside \`<body>\`, once. Two of them would pop twice.
- To pop only inside one part of a page, wrap that part: \`<ClickPop type="ring" className="...">...</ClickPop>\`.

${POP_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Every click in the place I picked pops my chosen type, in my color, at the very tip of the pointer, and is gone in about half a second. Links, buttons, drags and text selection still work exactly as before.
- It looks right in light and dark mode (check both), with my color readable in each.
- On a phone, taps pop or not as I chose, and scrolling stays smooth.
- With \`prefers-reduced-motion: reduce\`, nothing pops.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/click-pop.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
