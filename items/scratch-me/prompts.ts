/** Prompts for Scratch-me. Same shape as the others.
 * Install: adds the exact component; asks only where it goes and which code it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const SCRATCH_ME_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/scratch-me.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it only uses two canvases, pointer events and \`requestAnimationFrame\`.
- JavaScript project? Name the file \`scratch-me.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/scratch-me.tsx\`
- Keep these exports and their names: \`ScratchMe\`, \`ScratchMeProps\`. The \`react-dom\` import (for the "Code copied" pop) comes with React.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the foil painting (\`paintFoil\`), the brush, the shavings, the progress check and the tuning values at the top (\`SAMPLE_STEP\`, \`CLEAR_MS\`, \`GRAVITY\`, \`MAX_SHAVINGS\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` there are no shavings and the foil just fades; Enter or Space on the focused card reveals it; if the Clipboard API is blocked, it falls back to a hidden textarea copy.`;

const SCRATCH_ME_HOW = `## How the scratch works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Pill and foil.** The code sits in a soft gray rounded pill with a copy icon on the right, like a code field. A canvas over the pill is painted like a scratch-off: flat metallic gray with fine grain, a soft diagonal sheen, a dashed guide and "SCRATCH HERE". Darker foil in dark mode.
2. **Brush.** On a mouse, a thin ring follows the pointer instead of the cursor. Pressing and moving erases the foil along the path with a round brush (26px), with a few tiny bites at the edge so it looks ragged, not like a clean stroke.
3. **Shavings.** Moving fast throws more of them. Each is a tiny gray flake that spins, falls with gravity and lands just below the hint line, a little unevenly, so they pile up. After the reveal the pile fades away.
4. **Progress.** While scratching, the foil is checked every 120ms on a grid (one pixel every 6px). The line under the card shows the percentage toward the goal.
5. **Reveal.** When you let go with at least half the foil gone (\`threshold\`, 0.5), the rest of the foil fades and blurs away in about half a second, the code settles to full size and it is copied to the clipboard. Let go before half and nothing happens: keep scratching.
6. **Copied.** On every copy the copy icon blurs and shrinks away while a check draws itself in its place, the line under the code says "Copied", and a small dark pill saying "Code copied" pops up from the bottom center of the screen, stays about 1.5 seconds and drops away. After 2 seconds the check animates back into the copy icon, so it's clear the code can be copied again.
7. **Copy again.** Clicking (or Enter on) the revealed code copies it again. That is the only way to copy it: nothing in the component can be selected as text, and copy shortcuts on it do nothing.

The pill, foil, text and shavings read the text color around the component, so they follow light and dark mode on their own. The code is in the page, so it is not a secret.`;

export function installPrompt(tsSource: string) {
  return `# Scratch-me

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A promo code hidden under a scratch-off foil. Scratch at least half, let go, and the rest flakes away, the code is copied to the clipboard and the card says so.

## Before you build: one question

Look through this project first: its pages, upgrade or pricing screens, and any promo or discount codes it already uses. Then ask me this in one message and wait for my answer:

- **Where should it go, and which code should it show?** Suggest the 1–3 places that fit best (for example the upgrade screen, the pricing page or an onboarding step) and the code you found, if any. I can pick one of them or name another, and give the code.
  *Why: a reward works best at the moment someone is deciding, like upgrading or checking out, and the code is copied straight to their clipboard, so it must be real.*

Ask nothing else. If I say *skip*, use the best suggestion and a placeholder code I can find easily.

## Keep it as it is

The scratch is the design. Keep the code pill with its copy icon, the foil look, the brush ring, the falling shavings, the 50% rule and the copy on reveal exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo controls ("Scratch again" buttons or sliders) from the Impeccable website.

${SCRATCH_ME_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { ScratchMe } from "@/components/ui/scratch-me";

export function UpgradeOffer() {
  return <ScratchMe code="SAVE20" />;
}
\`\`\`

- Put the code where this project keeps its other promo codes or settings, if it has such a place. Otherwise write it inline.
- Wire \`onReveal\` only if the project already tracks events, to record the reveal the same way.

${SCRATCH_ME_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Scratching erases the foil under the ring and shavings fall and pile at the bottom.
- Letting go under half does nothing; over half, the rest of the foil flakes away and the code is in the clipboard (paste it to check). "Code copied" pops up at the bottom center, and after 2 seconds the check turns back into the copy icon.
- Scratching never selects the code or any text, and the code can't be copied by selecting it.
- It works with a finger on a phone without scrolling the page while scratching, and looks right in light and dark mode.
- With \`prefers-reduced-motion: reduce\`, there are no shavings.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/scratch-me.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Scratch-me, fitted to your product

A 1-file React component from Impeccable. Add it to this project and fit it to the product like a missing puzzle piece: it should look like it was always part of it. It goes in the one place I choose, and nothing else changes.

A promo code hidden under a scratch-off foil. Scratch at least half, let go, and the rest flakes away, the code is copied to the clipboard and the card says so. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages, upgrade or pricing screens, any promo codes it already uses, the way it writes short UI text, and its theme (light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 places that fit best (upgrade screen, pricing page, onboarding step, a thank-you page).
      *Why: a reward works best at the moment someone is deciding, like upgrading or checking out.*
   2. **Which code?** The code you found (name where), or I give one.
      *Why: the code is copied straight to the clipboard, so it must be a real, working code.*
   3. **The words?** Suggest an optional label above the code (default none), the hint below it (default "Scratch to reveal your code."), the copied message (default "Copied. Paste it at checkout.") and the pop text (default "Code copied"), written in my product's voice.
      *Why: these are the only words on the card, so they should sound like my product, not like Impeccable.*
   4. **How much to scratch?** 40% (easy), 50% (default) or 60% (more play).
      *Why: it sets how much play it takes before the code shows. Too much starts to feel like work.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the code, the three lines of text, the amount, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- Where it goes: the place I picked.
- The code: \`code\`.
- The words: \`label\`, \`hint\`, \`copiedText\` and \`toast\`.
- How much to scratch: \`threshold\`.

**Locked**

- The scratch is the design. The code pill with its copy icon, the foil, the brush ring, the shavings, the reveal and the copy on reveal stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, and no demo controls on my site.

${SCRATCH_ME_SHARED_BUILD}

## Fit it to the product

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { ScratchMe } from "@/components/ui/scratch-me";

// From my brief. Leave out any prop that stays at its default.
export function UpgradeOffer() {
  return (
    <ScratchMe
      code="SAVE20"
      label="A little thank-you: 20% off Pro" // optional
      hint="Scratch to see your code."
      copiedText="Copied. Paste it when you upgrade."
      threshold={0.5}
    />
  );
}
\`\`\`

- The card takes its text color from its parent, so place it where my normal text color applies. The pill is at least 260px wide and grows with the code; place it with \`className\` or \`style\`.
- Wire \`onReveal\` only if the project already tracks events.

${SCRATCH_ME_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My code and text show. Scratching erases the foil and shavings fall and pile at the bottom.
- Letting go before my threshold does nothing; after it, the foil flakes away and the code is in the clipboard (paste it to check). "Code copied" pops up at the bottom center, and after 2 seconds the check turns back into the copy icon.
- Scratching never selects the code or any text, and the code can't be copied by selecting it.
- It works with a finger on a phone without scrolling the page while scratching, and looks right in light and dark mode.
- With \`prefers-reduced-motion: reduce\`, there are no shavings.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/scratch-me.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
