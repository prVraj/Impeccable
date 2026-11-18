/* ---------- Sleeve Card ----------
 * Install: adds the exact card; asks only where it goes and which projects it shows.
 * Blend: asks three short questions, then fits it through the component's own props. */

const SLEEVE_ONE_LINE = `A project card with a picture, a name and one line of numbers. When I point at it, it rises off the page and turns in 3D, its right edge coming toward me, and a second card slides out from behind it, like a record from its sleeve, with "View Project" written up its edge; a softer third card peeks out between them. The whole card is one link. On a phone the first tap opens it and the second tap follows the link.`;

const SLEEVE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/sleeve-card.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it moves plain elements with CSS transforms, and its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`sleeve-card.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/sleeve-card.tsx\`
- Keep these exports and their names: \`SleeveCard\` (also the default export), \`SleeveCardProps\`, \`SleeveCardImage\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`EASE\`, \`OPEN_MS\`, \`TAB_DELAY\`, \`PAD\`, \`TURN\`, \`LIFT\`, \`SHIFT\`, \`REVEAL\`, \`TAB_DROP\`, \`TAB_TILT\`, \`TAB_SCALE\`, \`PEEK_REVEAL\`, \`PEEK_RISE\`, \`PEEK_SCALE\`, \`PRESS\`, \`TUCK\`, \`SHADOW\` and the \`CSS\` block. They are the design and its timing.
- Keep the link rules: with \`href\` the whole card is one \`<a>\` (one stop for the keyboard), with only \`onClick\` it is one \`<button>\`. Never put a second link or button inside it.
- Keep the fallbacks: the open state runs on hover only where a real pointer can hover (\`@media (hover: hover)\`), on keyboard focus, and on a first tap on touch screens (a tap anywhere else closes it). With \`prefers-reduced-motion: reduce\` nothing turns or slides: the tab fades in at its place. The picture loads lazily and can't be dragged out.`;

const SLEEVE_HOW = `## How the card works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Three cards in one.** The card you see sits on top. Behind it, the same size, sit the tab (the accent color, with the label written up its edge) and a softer card between them. At rest both are tucked 4% inside and a little smaller, so no colored edge shows round the corners.
2. **It opens.** On hover, focus or a first tap, the top card turns 16 degrees round its middle, so its right edge comes toward you, rises 26px toward you through a 900px perspective, and steps 4% of its width to the left. Its shadow grows and falls to the lower left. All of it takes 0.62 seconds with a quick start and a long soft landing.
3. **The tab slides out.** 50ms later the tab slides 24% of the card's width to the right, drops 4%, leans 3 degrees and sits at 90% size, so it looks further back. The label sits in the part that shows, reading bottom to top, in capitals. The soft card slides 13% right and 3% up at 95% size, so a sliver of it peeks out above the tab.
4. **It closes.** When the pointer leaves, everything slides back in one motion with the same curve.
5. **The press.** Pressing the open card makes it give to 97% for a moment, so a click feels physical.
6. **Room.** The tab sticks out about a quarter of the card's width to the right, so each card needs that much free space on its right (the gap in a grid). The open card rises above its neighbours.
7. **Colors.** The card takes \`--card\` from the theme (else the page background), and the text takes \`--foreground\` (else \`--fg\`), so it follows light and dark mode. The tab is \`accent\`, with \`accentText\` on it; the soft card is \`peek\`. Text sizes follow the card's own width, so a small card has small text. Only transforms and shadows change while it moves.`;

export function installPrompt(tsSource: string) {
  return `# Sleeve Card

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${SLEEVE_ONE_LINE}

## Before you build: one question

Look through this project first: pages that list work, projects, case studies or products (a portfolio or work section, a case study list, a product or template grid), the cards they use now, and where their pictures and links come from. Then ask me this in one message and wait for my answer:

- **Where should it go, and which projects does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the projects (picture, name, number and link) you would use. I can pick one or name another.
  *Why: each card is one door into a project, so it belongs in a list of things people open to see more.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The 3D turn and rise with its shadow, the tab that slides out from behind with its label written up the edge, the soft card that peeks between them, and the timing of all three are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces existing cards there, keep that spot's data and links and remove only the old cards. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its three item pictures, the gray panel round them, the page reload on click, and the home page's TV.

${SLEEVE_SHARED_BUILD}

## Use it

\`\`\`tsx
import { SleeveCard } from "@/components/ui/sleeve-card";

export function Work() {
  return (
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-x-16">
      <SleeveCard
        href="/work/nova"
        image={{ src: "/work/nova.webp", alt: "Nova app on a phone" }}
        title="Nova"
        stat="6.2%"
        statLabel="Average engagement rate"
      />
      {/* one card per project */}
    </div>
  );
}
\`\`\`

- Each card fills the width it is given. Leave about a quarter of a card's width free on its right (the column gap), or the open tab covers the next card.
- Pictures are shown nearly square (1 by 1.04) and cropped to fill. Keep each file small (about twice the size it shows, WebP), with real \`alt\` text. Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`).
- Use the project's own link component only if plain \`href\` breaks its routing; then pass \`onClick\` and navigate there instead.

${SLEEVE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a card makes it turn and rise in about 0.6 seconds while the "View Project" tab slides out on its right, and moving away slides it all back. Clicking anywhere on the card follows its link. Tab moves focus card by card, and a focused card opens.
- It looks right in light and dark mode (check both): the card, its text and its shadow read well on each background, and no colored edge shows round a closed card.
- It works with a finger on a phone: the first tap opens a card, the second tap follows the link, a tap elsewhere closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing turns or slides: the tab fades in at its place.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/sleeve-card.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Sleeve Card, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${SLEEVE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that list work, projects, case studies or products, the cards they use now, where their pictures and links come from, its corner radius tokens, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which projects does it show?** Suggest the 1–3 spots it fits best, naming the projects (picture, name, number and link) you'd use.
      *Why: each card is one door into a project, so it belongs in a list of things people open to see more.*
   2. **Colors?** Keep the soft lavender tab and sage card, or match my brand. If you suggest brand colors, name which of my existing color variables you'd use for the tab (\`accent\`), the text on it (\`accentText\`) and the card that peeks between (\`peek\`), and check the tab text stays readable in both modes.
      *Why: the tab is the only strong color on the card, so it is what ties it to my brand.*
   3. **The tab's words and the corners?** "View Project" with 14px corners (suggested), "View case study", or "Open" for short cards; corners from my theme's radius.
      *Why: the tab's words say where the click goes, and the corners make the card match my other cards.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and projects, the colors, the words and corners, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and projects: where the cards are rendered, and per card \`image\` (\`src\`, \`alt\`), \`title\`, \`stat\`, \`statLabel\`, \`href\` (or \`onClick\`) and \`target\`.
- The colors: \`accent\`, \`accentText\` and \`peek\`, as my theme's variables.
- The words and corners: \`label\` and \`radius\` (px, default 14).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The 3D turn and rise with its shadow, the tab that slides out from behind with its label up the edge, the soft card that peeks between them, their timing, and the tap-twice rule on touch screens stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its three item pictures, the gray panel, the page reload on click and the home page's TV).

${SLEEVE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
import { SleeveCard } from "@/components/ui/sleeve-card";

// From my brief. Leave out any prop that stays at its default.
export function Work({ projects }: { projects: { slug: string; cover: string; name: string; result: string; resultLabel: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-x-16">
      {projects.map((p) => (
        <SleeveCard
          key={p.slug}
          href={\`/work/\${p.slug}\`}
          image={{ src: p.cover, alt: p.name }}
          title={p.name}
          stat={p.result}
          statLabel={p.resultLabel}
          label="View case study"
          accent="var(--primary)"
          accentText="var(--primary-foreground)"
          peek="var(--muted)"
          radius={16} // my theme's radius in px
        />
      ))}
    </div>
  );
}
\`\`\`

- Colors are my theme's variables, never copied hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- The card itself takes \`--card\` (else the page background) and the text \`--foreground\`, so set those in my theme, not on the card.
- \`radius\` is a number of pixels: read my theme's radius token and use its pixel value. The picture's corners follow it.
- Leave about a quarter of a card's width free on its right (the column gap), or the open tab covers the next card.

${SLEEVE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My projects show as cards in my colors, words and corners. Pointing at one makes it turn and rise in about 0.6 seconds while my tab slides out on its right, and moving away slides it back. Clicking anywhere on a card follows its link, and a focused card opens.
- It looks right in light and dark mode (check both): the card, its text, the tab text and the shadow read well on each background, and no colored edge shows round a closed card.
- It works with a finger on a phone: the first tap opens a card, the second tap follows the link, a tap elsewhere closes it, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, nothing turns or slides: the tab fades in at its place.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/sleeve-card.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
