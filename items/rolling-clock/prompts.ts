/* ---------- Rolling clock ----------
 * Install: adds the exact clock; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const CLOCK_ONE_LINE = `A live clock (HH : MM : SS) showing my visitor's own time, where every digit rolls when it changes: the bigger number rises from below and the old one leaves upward. They don't move in a straight line. Each pair of digits rolls on a curve, like two little wheels side by side: the left digit swings out to the left and the right digit swings out to the right, leaning, shrinking and fading as they leave the front. When several digits change at once (12:59:59 to 13:00:00) they roll one after another, right to left. It first shows 00:00:00, and when it comes into view every digit spins up to the real time and eases out to a stop, so people see how it rolls.`;

const CLOCK_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/rolling-clock.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: each digit moves with a short \`requestAnimationFrame\` loop that stops when it has landed, and its styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`rolling-clock.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/rolling-clock.tsx\`
- Keep these exports and their names: \`RollingClock\` (also the default export) and \`RollingClockProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`ROLL_MS\`, \`STAGGER_MS\`, \`STEP\`, \`BEND\`, \`TILT\`, \`SIDE\`, \`ROLL\`, \`INTRO_MS\`, \`INTRO\`, \`INTRO_WAIT\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: the server draws 00:00:00 and the time is read only after the page loads (the server's time would not match the visitor's, and React would complain). It waits until it is in view (an \`IntersectionObserver\`) before it spins up. With \`prefers-reduced-motion: reduce\` digits do not roll or spin: the new number fades in where it stands. Screen readers get the time as hidden text inside \`role="timer"\`, which does not announce every second.`;

const CLOCK_HOW = `## How the clock works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The digits.** HH : MM : SS, each digit in its own box one digit wide (\`1ch\`, with tabular numbers, so the clock never jiggles sideways). It takes its font, size, weight and color from the text around it. In 12 hour mode a small AM or PM sits after the seconds and rolls the same way at noon and midnight.
2. **The roll.** When a digit changes, the new number rises from below into the front while the old one leaves upward, both travelling 0.92em in 0.62 seconds with an ease that starts gently and lands softly. Only the old and the new number are ever on screen.
3. **The curve.** They never move in a straight line. Each pair (hours, minutes, seconds) rolls like two wheels side by side: the left digit swings out up to 0.3em to the left as it moves away from the front, the right digit swings out to the right. On the way they lean up to 14 degrees along the curve, shrink to 56% and fade out, so the front number is always the clear one.
4. **The cascade.** When several digits change on the same second, they roll right to left, 70ms apart, so 12:59:59 to 13:00:00 runs like a wave.
5. **The first spin.** It starts at 00:00:00. Once it is in view it holds for 0.3 seconds, then every digit spins up through each number from 0 to the real time in 1.5 seconds with a long ease out (fast at first, then slowing to a soft stop), on the same curve, right to left 70ms apart. It aims for the time it will be when it lands, so it lands on the right second and carries on with the normal roll. It plays once each time the clock appears.
6. **Ticking.** It wakes exactly when the second changes (not every frame), and checks again when the tab comes back, so it never drifts. Between rolls nothing runs.`;

const CLOCK_LOCKED = `The roll (the new number rising from below), the curve (left digit swinging left, right digit swinging right, leaning, shrinking and fading) and the right to left cascade, with their sizes and timing`;

const CLOCK_DEMO_PARTS = `the 24 and 12 hour clocks side by side, the dotted card behind them, and the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Rolling clock

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${CLOCK_ONE_LINE}

## Before you build: one question

Look through this project first: its hero, footer, any dashboard header or status bar, and any place it already shows a time. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 spots it fits best from my code, and the size it would take there. I can pick one or name another.
  *Why: the roll shows best large and calm, so it belongs where a live time means something to my visitors.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${CLOCK_LOCKED}, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing clock there, remove only the old display. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${CLOCK_DEMO_PARTS}.

${CLOCK_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { RollingClock } from "@/components/ui/rolling-clock";

export function LocalTime() {
  return <RollingClock className="text-5xl font-medium tracking-tight" aria-label="Your local time" />;
}
\`\`\`

- Size, weight, font and color come from the text around it, so set them with \`className\` or \`style\` (a large size like \`text-5xl\` shows the roll best).
- The digits swing a little above, below and to the sides while they roll, so leave about half its height free above and below it.
- \`hour12\` switches to 12 hour time with AM or PM; leave it out for 24 hour time.

${CLOCK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It starts at 00:00:00 and, once in view, spins up to my visitor's time and eases to a stop. Then every second the last digit rolls: the next number rises from below in about 0.6 seconds while the old one leaves upward, swinging out to the right on a curve (the left digit of a pair swings left). At the top of a minute several digits roll right to left, one after another.
- It looks right in light and dark mode (check both): it takes the text color around it.
- It fits on a phone without scrolling sideways, at the size I chose.
- With \`prefers-reduced-motion: reduce\`, it shows the real time with a short fade (no spin), and each new digit fades in where it stands.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/rolling-clock.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Rolling clock, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${CLOCK_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its hero, footer, any dashboard header or status bar, any place it already shows a time, its type scale and fonts, its theme colors and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 spots it fits best, and the size it would take there.
      *Why: the roll shows best large and calm, so it belongs where a live time means something to my visitors.*
   2. **12 or 24 hour?** 24 hour (suggested), or 12 hour with a small AM or PM, if my visitors read time that way.
      *Why: it should read time the way my visitors do.*
   3. **The type?** Name which of my existing text styles you'd use (font, size and weight), for example my display heading style (suggested) or a smaller label style for a status bar.
      *Why: the digits are the whole component, so they should look like my other big numbers.*
   4. **The color?** Keep my text color (suggested, calm), or name which of my existing color variables you'd use, like my brand or accent color.
      *Why: the digits are the only thing on it, so one variable colors the whole clock.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, 12 or 24 hour, the type, the color, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered, and \`aria-label\`.
- 12 or 24 hour: \`hour12\`.
- The type: font, size, weight and letter spacing through \`className\` or \`style\`, from my existing text styles.
- The color: the text color through \`className\` or \`style\`, as my theme's CSS variable.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${CLOCK_LOCKED}, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${CLOCK_DEMO_PARTS}).

${CLOCK_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { RollingClock } from "@/components/ui/rolling-clock";

// From my brief. Leave out any prop that stays at its default.
export function LocalTime() {
  return (
    <RollingClock
      hour12
      aria-label="Your local time"
      className="font-display text-6xl font-semibold tracking-tight" // my existing display style
      style={{ color: "var(--primary)" }} // my theme's variable, not hex
    />
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- The clock asks for tabular numbers, so most fonts keep it steady. If my chosen font has no even-width numbers, tell me.
- The digits swing a little above, below and to the sides while they roll, so leave about half its height free above and below it.

${CLOCK_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It starts at 00:00:00 and spins up to my visitor's time, 12 or 24 hour as I chose, in my type and color. Every second the last digit rolls in about 0.6 seconds: the new number rises from below while the old one leaves upward on a curve. At the top of a minute several digits roll right to left.
- It looks right in light and dark mode (check both), with my color readable in each.
- It fits on a phone without scrolling sideways, at the size I chose.
- With \`prefers-reduced-motion: reduce\`, it shows the real time with a short fade (no spin), and each new digit fades in where it stands.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/rolling-clock.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
