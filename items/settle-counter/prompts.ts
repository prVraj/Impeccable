/* ---------- Settle counter ----------
 * Install: adds the exact counter; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const SETTLE_ONE_LINE = `A number where every digit that changes counts to its new number and settles into place: the old digit shrinks and fades away, the place counts through every number in between (1, 2, 3, 4, 5, 6), and the last one arrives bigger and faint (1.6 times the size, at 30%) and settles down to the size of the digits around it. Digits that stay the same don't move, and commas between thousands come and go the same way. When the number gets longer, its frame first widens to make room, then the new digit settles into the gap; when it gets shorter, the digit leaves first, then the frame closes.`;

const SETTLE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/settle-counter.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: every move is a short Web Animations API call (\`element.animate\`) that ends on its own, and the counting steps are short timers that stop when the count lands, and its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`settle-counter.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/settle-counter.tsx\`
- Keep these exports and their names: \`SettleCounter\` (also the default export) and \`SettleCounterProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`IN_MS\`, \`IN_EASE\`, \`GROW\`, \`FAINT\`, \`OUT_MS\`, \`OUT_EASE\`, \`SHRINK\`, \`WIDEN_MS\`, \`WIDEN_EASE\`, \`LAND_AT\`, \`CLOSE_AT\`, \`STAGGER_MS\`, \`FADE_MS\`, \`STEP_GAP\`, \`RUN_MAX\`, \`RUN_CURVE\`, \`STEP_IN_MS\`, \`STEP_GROW\`, \`STEP_OUT_MS\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the first number is drawn as it is, with no motion, so the server and the browser draw the same thing. With \`prefers-reduced-motion: reduce\` nothing grows, shrinks or widens: the new digit simply fades in where it stands. Screen readers get the whole number as hidden text, so they never read half-changed digits.`;

const SETTLE_HOW = `## How the counter works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The places.** Each character of the number has its own place, counted from the left. Numbers use even-width digits (tabular numbers), so the number never jiggles sideways. It takes its font, size, weight and color from the text around it.
2. **The swap.** When the digit in a place changes, the old digit shrinks to half its size and fades out in 0.38 seconds (it is gone early, with no tail). The place then counts to the new digit, up or down, through every number in between (1 to 6 shows 2, 3, 4 and 5): each in-between number arrives 1.3 times bigger and leaves in 0.18 seconds, the gaps growing so the count slows into the last number, and the whole count takes at most 0.56 seconds. The last number appears 1.6 times bigger at 30% and settles to full size and full color in 0.62 seconds, quick at first with a long, soft landing. Places whose digit stays the same don't move.
3. **A longer number.** The frame widens first: the new place opens from nothing to one digit wide in 0.42 seconds, starting and ending gently. 0.3 seconds in, when it is nearly open, the new digit (and any other digit that changed) settles in the same way as a swap, so it all lands together.
4. **A shorter number.** The leaving digit shrinks and fades first, and 0.16 seconds later the frame starts closing behind it in 0.42 seconds.
5. **Several at once.** Digits that change together start 45ms apart, left to right, like a small wave.
6. **Fast changes.** If a new number comes while digits are still settling, each one leaves from wherever it is, so nothing jumps. Nothing runs between changes.`;

const SETTLE_LOCKED = `The swap (the old digit shrinking and fading, the count through every number in between, and the last one arriving 1.6 times bigger at 30% and settling), the frame widening before a new digit lands and closing after one leaves, and their timing and easing`;

const SETTLE_DEMO_PARTS = `the "Humans on Impeccable UI right now" label, the made-up numbers it plays on its own, the Change number button, the dotted card and the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Settle counter

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${SETTLE_ONE_LINE}

## Before you build: one question

Look through this project first: its hero, stats or numbers sections, dashboard cards, pricing, and any place that already shows a number that changes (a live count, a total, a price, a score). Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 numbers in my code it fits best, what makes each one change, and the size it would take there. I can pick one or name another.
  *Why: the settle only shows when the number changes, and shows best large, so it belongs on a number my visitors watch.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${SETTLE_LOCKED}, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing number there, pass that same value to \`value\` and remove only the old display. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${SETTLE_DEMO_PARTS}.

${SETTLE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { SettleCounter } from "@/components/ui/settle-counter";

export function LiveCount({ count }: { count: number }) {
  return <SettleCounter value={count} aria-label="People online:" className="text-6xl font-medium tracking-tight" />;
}
\`\`\`

- \`value\` is the number to show; give it a new value and the changed digits settle. A string is shown as written, so \`"$1.2k"\` works too.
- \`separator\` is the mark between thousands. It is a comma by default (83,295); \`separator=""\` shows the digits alone.
- Size, weight, font and color come from the text around it, so set them with \`className\` or \`style\`.
- A new digit starts 1.6 times bigger, so leave about a third of its height free above and below it.

${SETTLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- When the number changes, only the changed digits move: each counts through the numbers in between (1 to 6 shows 2, 3, 4, 5), then the last one arrives big and faint and settles in about 0.6 seconds. When a digit is added, the number first widens, then the digit settles into the gap; when one is removed, it fades first, then the number closes up.
- It looks right in light and dark mode (check both): it takes the text color around it.
- It fits on a phone without scrolling sideways, at the size I chose, and the motion stays smooth.
- With \`prefers-reduced-motion: reduce\`, each new digit only fades in where it stands, with no growing or widening.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/settle-counter.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Settle counter, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${SETTLE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its hero, stats or numbers sections, dashboard cards, pricing, any place that already shows a number that changes, its type scale and fonts, its theme colors and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 numbers in my code it fits best, what makes each one change, and the size it would take there.
      *Why: the settle only shows when the number changes, and shows best large, so it belongs on a number my visitors watch.*
   2. **Commas?** Keep the comma between thousands (suggested, as in the source), no mark at all, or the mark my product already uses for big numbers (like a dot or a space).
      *Why: it should write numbers the way the rest of my product does.*
   3. **The type?** Name which of my existing text styles you'd use (font, size and weight), for example my display heading style (suggested) or my stat number style.
      *Why: the digits are the whole component, so they should look like my other big numbers.*
   4. **The color?** Keep my text color (suggested, calm), or name which of my existing color variables you'd use, like my brand or accent color.
      *Why: the digits are the only thing on it, so one variable colors the whole counter.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the separator, the type, the color, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered, the \`value\` it shows, and \`aria-label\`.
- The separator: \`separator\`.
- The type: font, size, weight and letter spacing through \`className\` or \`style\`, from my existing text styles.
- The color: the text color through \`className\` or \`style\`, as my theme's CSS variable.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${SETTLE_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${SETTLE_DEMO_PARTS}).

${SETTLE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { SettleCounter } from "@/components/ui/settle-counter";

// From my brief. Leave out any prop that stays at its default.
export function LiveCount({ count }: { count: number }) {
  return (
    <SettleCounter
      value={count}
      separator="."  // my product writes 83.295
      aria-label="People online:"
      className="font-display text-6xl font-semibold tracking-tight" // my existing display style
      style={{ color: "var(--primary)" }} // my theme's variable, not hex
    />
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- The counter asks for even-width (tabular) numbers, so most fonts keep it steady. If my chosen font has no even-width numbers, tell me.
- A new digit starts 1.6 times bigger, so leave about a third of its height free above and below it.

${SETTLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It shows my number with the separator, type and color I chose. When it changes, only the changed digits move: each counts through the numbers in between, then the last one arrives big and faint and settles in about 0.6 seconds. When a digit is added the number first widens; when one is removed it fades first, then closes up.
- It looks right in light and dark mode (check both), with my color readable in each.
- It fits on a phone without scrolling sideways, at the size I chose, and the motion stays smooth.
- With \`prefers-reduced-motion: reduce\`, each new digit only fades in where it stands, with no growing or widening.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/settle-counter.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
