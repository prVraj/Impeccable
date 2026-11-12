/** Prompts for brain.txt. Same shape as the others.
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const BRAIN_TXT_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/brain-txt.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it only uses SVG, pointer events and \`requestAnimationFrame\`.
- JavaScript project? Name the file \`brain-txt.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/brain-txt.tsx\`
- Keep these exports and their names: \`BrainTxt\`, \`BrainTxtProps\`, \`Thought\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top (\`MAX_LINKS\`, \`SPRING\`, \`ANCHOR\`, \`DAMP\`, \`ENTER_MS\`, \`FADE\`), the layout (\`homes\`) and the linking rule (\`linkDots\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` nothing wobbles or grows in, and the loop stops whenever the web is still.`;

const BRAIN_TXT_HOW = `## How the map works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Place the dots.** The dots sit on a loose sunflower spiral around the brain, with a little seeded jitter so it never looks like a pattern. Same \`seed\`, same map. Dots differ slightly in size and gray.
2. **Link them.** All dot pairs are sorted by distance, shortest first. A link is added only if both dots have fewer than 3 links and it doesn't cross a link already drawn. So each dot links to at most 3 nearby dots (never more), and lines don't cross.
3. **Link the brain.** The dots closest to the brain get a direct line to it, unless \`brainLinks\` is false. Each thought can force it on or off with \`brain: true\` or \`brain: false\`.
4. **Enter.** On first view the dots burst out of the brain and grow to size in under a second.
5. **Hover and click.** Hovering a dot draws it a little bigger and lights it, its links and its neighbours in the accent color; everything else fades to about 14%. Hovering the brain lights all of its links. Clicking a dot opens a small card beside it with the thought, an optional tag and a close button. Escape, the close button or a click on empty space closes it.
6. **Drag.** Dragging empty space moves the whole web; the dots lag a touch and wobble into place. Dragging a dot or the brain pulls it, and its links pull the neighbours along like springs. On release, everything springs back home. Keyboard: Tab to a dot, Enter opens it.

Lines and dots take their color from the text color around the map, so they follow light and dark mode on their own. The card is white in light mode and near-black in dark mode.`;

export function installPrompt(tsSource: string) {
  return `# brain.txt

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A brain sits in the middle of a web of dots, and each dot holds one thought. Hover a dot to light up its links, click it to read it, and drag anything to play with the web. Every dot links to at most 3 nearby dots.

## Before you build: one question

Look through this project first: its pages and sections. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 places that fit best (for example an about page, a "thoughts" or notes page, or a section of the home page). I can pick one of them or name another.
  *Why: it needs room (about 420px tall) and a reason to explore, so it fits a page people visit to get to know me.*

Ask nothing else. If I say *skip*, use the best suggestion. Use the thoughts from the example below as placeholders and tell me where to write my own.

## Keep it as it is

The motion is the design. Keep the brain in the middle, the 3-link limit, the spring feel, the hover highlight, the card and the colors exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo controls (sliders, toggles or "shuffle" buttons) from the Impeccable website.

${BRAIN_TXT_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { BrainTxt, type Thought } from "@/components/ui/brain-txt";

const THOUGHTS: Thought[] = [
  { text: "Boredom is the waiting room for ideas." },
  { text: "If it's worth thinking twice, it's worth writing once.", tag: "writing" },
  { text: "Copy first, then make it yours.", featured: true },
  // 8 to 20 thoughts look best.
];

export function Thoughts() {
  return <BrainTxt thoughts={THOUGHTS} />;
}
\`\`\`

- Put the thoughts in a plain array next to where it's used (or wherever this project keeps content). Each is \`{ text, tag?, featured?, brain? }\`.
- Give it room: it's 420px tall by default (\`height\` prop) and fills the width of its parent.

${BRAIN_TXT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The dots burst out of the brain. No dot has more than 3 lines to other dots, and lines don't cross.
- Hovering a dot lights it and its neighbours; clicking opens its card next to it, inside the box. Escape closes it.
- Dragging empty space moves the web; dragging a dot or the brain pulls its neighbours; everything springs back.
- It looks right in light and dark mode, and works with a finger on a phone.
- With \`prefers-reduced-motion: reduce\`, nothing wobbles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/brain-txt.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# brain.txt, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A brain sits in the middle of a web of dots, and each dot holds one thought. Hover a dot to light up its links, click it to read it, and drag anything to play with the web. Every dot links to at most 3 nearby dots. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and sections, any existing notes or quotes content, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 places that fit best (an about page, a thoughts page, a home section).
      *Why: it needs room (about 420px tall) and a reason to explore, so it fits a page people visit to get to know me.*
   2. **Which thoughts?** Use content you found in the project (name it), or I paste my own, or start with placeholders I'll replace.
      *Why: the thoughts are the content. Real ones make it worth exploring; placeholders make it a toy.*
   3. **What sits in the middle?** The 🧠 emoji (default), another emoji, or my logo or avatar (name the file you'd use).
      *Why: the center is the first thing people see, and it stands for me or my product.*
   4. **Accent color?** The default blue, or one of my color variables (name it). It colors lit lines, featured dots and tags, so it must be readable in light and dark mode.
      *Why: it is the only color in the map, so it decides whether the map feels like my brand.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the thoughts, the center, the accent (by my variable name), and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- Where it goes: the page or section I picked.
- The thoughts: \`thoughts\`.
- The center: \`center\`.
- The accent color: \`accent\`, as one of my theme variables.
- The help text: \`hint\`, only to match my voice.

**Locked**

- The motion is the design. The layout, the 3-link limit, the spring feel, the hover highlight, the fade and the card shape stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, and no demo controls on my site.

${BRAIN_TXT_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { BrainTxt, type Thought } from "@/components/ui/brain-txt";

// From my brief. Leave out any prop that stays at its default.
const THOUGHTS: Thought[] = [
  { text: "…", tag: "…" },
];

export function Thoughts() {
  return (
    <BrainTxt
      thoughts={THOUGHTS}
      accent="var(--primary)"
      center={<img src="/logo.svg" alt="" width={26} height={26} />}
    />
  );
}
\`\`\`

- Pass the accent as my CSS variable (\`var(--name)\`) or Tailwind color variable, not a hex code, so it follows my theme. If a variable holds bare channels (for example \`222 47% 11%\`), wrap it as \`hsl(...)\`.
- The map takes its text color from its parent, so place it where my normal text color applies. Use \`hint\` to reword the help text in my voice, or \`null\` to hide it.

${BRAIN_TXT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My thoughts, center and accent show. No dot has more than 3 lines to other dots, and lines don't cross.
- Hovering lights a dot and its neighbours in my accent; clicking opens its card inside the box; dragging pulls the web and it springs back.
- It looks right in light and dark mode, and works with a finger on a phone.
- With \`prefers-reduced-motion: reduce\`, nothing wobbles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/brain-txt.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
