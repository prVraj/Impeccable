/* ---------- Kitcut button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const ONE_LINE = `A solid brand button that cracks open while it works. On click a jagged zigzag crack runs down its middle with a short crack sound, the two halves pull apart with the label split and slightly blurred, and three small dots wait in the gap. When the work is done the halves snap back together, a few sparks fly from the seam and the label says "WooHoo" for a moment, then it eases back to rest.`;

const KITCUT_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/kitcut-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the halves are plain CSS shapes, the sparks use the browser's own animation API and the crack sound is made in the browser with the Web Audio API, so there is no sound file.
- JavaScript project? Name the file \`kitcut-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/kitcut-button.tsx\`
- Keep these exports and their names: \`KitcutButton\`, \`KitcutButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`CRACK_MS\`, \`SPLIT_MS\`, \`MIN_OPEN_MS\`, \`CLOSE_MS\`, \`WIN_HOLD_MS\`, \`BACK_MS\`, \`GAP\`, \`SLIDE\`, \`SHIFT\`, \`BLUR\`, \`JAG\`, \`SPARKS\`, \`LOUDNESS\`, the sound recipe in \`playCrack\` and the \`CSS\` block with its easing curves. They are the design and its timing.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` nothing cracks, moves or flies: the label fades to blinking dots and back, and the success word fades in and out. The sound plays only after a real click, never when only \`loading\` opens it, and a browser without sound support just stays silent. Clicks while it is open are ignored. Keyboard focus shows a ring in the button's color. A disabled button is dimmed and never cracks. Hover darkens it only on devices with a real pointer, so it never sticks after a tap.`;

const KITCUT_HOW = `## How the crack works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A 44px brand button with 8px corners (smoothed corners where the browser supports \`corner-shape\`): a soft top to bottom shade of \`color\`, a thin darker edge, a lit line along the top inside and a small shadow tinted with the same color. The label picks black or white to read on the fill unless \`textColor\` is set.
2. **The crack.** On click the button dips to 97.5% and back, and a jagged zigzag crack (dark with a thin light edge) runs down its middle from top to bottom in 90ms. The zigzag is new on every click. At the same moment the crack sound plays: a sharp snap, a low knock under it and four tiny splinters in the next 70ms.
3. **The split.** After 110ms the two halves pull back from the crack, 24px each (at most a fifth of the width), in 460ms, fast at first with a hair of overshoot as they land. Each half also moves 3px outward as a whole and keeps the button's soft shadow below it. The label is split with them: each half keeps its part, slides 10px outward and goes slightly blurred (1.5px) and a little faded. The button's outer size never changes.
4. **Waiting.** Three 5px dots pop into the gap a third of the way into the split and hop one after another (a 1 second wave). They sit on the page, so they take the page's text color at half strength unless \`dotColor\` is set. The gap stays open at least 720ms, so the dots are seen even when the work is instant. Clicks while it is open do nothing.
5. **The snap.** When loading ends, the halves rush back together in 260ms, slow at first and fastest at the moment they meet. The seam flashes white and fades in 320ms, and the button is whole again.
6. **WooHoo.** If it worked (\`success\` is true and the promise didn't reject), the button bumps from 103.5% to full size, its fill gets a touch lighter, the label pops in as \`successText\` ("WooHoo") and 14 small sparks in the button's color and a lighter tint of it fly up and down out of the seam and fade in under a second. They never go past the button's sides, so a full-width button can't make the page scroll sideways. It holds for 1.1 seconds, then the word lifts away and the label returns while the fill eases back in 600ms. If it failed, the halves still snap back, but the label returns with no success state.
7. **Timing.** Every step runs on timers and CSS transitions measured in milliseconds, so it takes the same time on slow phones and fast screens. Colors come from CSS variables, so theme variables follow light and dark mode, and the label color is checked again when the theme changes.`;

const USE_IT = `\`\`\`tsx
"use client";
import { KitcutButton } from "@/components/ui/kitcut-button";

export function PublishAction() {
  // Return the promise and the button stays open until it settles.
  return <KitcutButton onClick={() => publishPost()}>Publish post</KitcutButton>;
}

// Or, if the page already tracks loading:
// <KitcutButton loading={isPublishing} success={!error} onClick={publish}>Publish post</KitcutButton>
\`\`\``;

export function installPrompt(tsSource: string) {
  return `# Kitcut button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its forms, its publish, send, save, sign up and checkout buttons, and anything that waits on a server. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example a form's submit button, a "Publish" or "Send" button, or a checkout button). Keep the button's label, click handler and form wiring, and say how you'll tell it when it is loading (the promise its handler already returns, or the loading flag the page already has).
  *Why: it cracks open only while something is loading, so it belongs on a main action that really waits for something.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The solid brand button, the zigzag crack with its crack sound, the halves pulling apart with the label split and blurred, the three dots in the gap, the snap back with a seam flash, and the success state (a bump, sparks from the seam and "WooHoo", then an easy return) are the design. Keep them exactly as in the source, with their sizes and timing. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the button, its "Install component" label, its violet theme color and the fake four second wait.

${KITCUT_SHARED_BUILD}

## Use it

${USE_IT}

- It is a real \`<button>\` and takes every button prop (\`type\`, \`disabled\`, \`aria-*\`). In a form, set \`type="submit"\` and pass \`loading\` from the form's own pending flag.
- Use either \`loading\` or a promise from \`onClick\`, not both: when \`loading\` is set, the promise is ignored.
- The success state ("WooHoo") plays when loading ends. A rejected promise skips it. With \`loading\`, pass \`success={!error}\` so a failure doesn't celebrate.
- \`className\` and \`style\` go on the button itself. It is 44px tall with 16px each side and is as wide as its label or "WooHoo", whichever is longer. The sparks fly about 40px above and below it, so don't put it right against the top or bottom of a box with \`overflow: hidden\`.

${KITCUT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a solid button in the default violet. On click a zigzag crack runs down its middle with a crack sound, the halves pull apart in about half a second with the label split and slightly blurred, and three small dots hop in the gap for at least 0.7 seconds. A second click does nothing. When loading ends, the halves snap back in about a quarter of a second, the seam flashes, sparks fly out and the label says "WooHoo" for about a second, then it eases back. The button never changes size.
- It looks right in light and dark mode (check both): the dots and sparks show on both pages.
- On a phone, a tap starts it (with sound, unless the phone is on silent) and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, nothing cracks or flies: the label fades to blinking dots, then to "WooHoo" and back.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/kitcut-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Kitcut button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its forms, its publish, send, save, sign up and checkout buttons, anything that waits on a server, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace (a form's submit button, a "Publish" or "Send" button, a checkout button), and say how you'll tell it when it is loading (the promise its handler returns, or the loading flag the page already has).
      *Why: it cracks open only while something is loading, so it belongs on a main action that really waits for something.*
   2. **The colors?** Use my primary button color for the fill (suggested) or keep the default violet, and name which of my existing color variables you'd use for the fill, the label on it, and the dots in the gap (suggested: my muted text color; the default is my text color at half strength).
      *Why: the fill is the whole button, and the edge, shading, crack and sparks are all made from it, so this one choice makes it my brand. The dots sit on my page, not on the button.*
   3. **What should it say when it worked?** Keep "WooHoo" (suggested), or a short word in my product's voice that fits what the button does (for example "Published" or "Sent").
      *Why: it shows for about a second with the sparks, so it is the button's moment to sound like my product.*
   4. **The crack sound?** On (suggested), or off for a quiet product or a button people press many times in a row.
      *Why: the sound makes the crack feel real, but some products should stay silent.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place and how it knows it's loading, the fill, label and dot colors, the success word, the sound), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, click handler and form wiring, with \`loading\` or a promise from \`onClick\`.
- The colors: \`color\`, \`textColor\` and \`dotColor\`, as my theme's CSS variables.
- The success word: \`successText\`. If the place can fail, pass \`success={!error}\` (or let the promise reject) so a failure doesn't celebrate.
- The sound: \`sound\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The solid button shape and shading, the zigzag crack with its sound, the halves pulling apart with the label split and blurred, the three dots in the gap, the snap back with a seam flash, and the success state (a bump, sparks from the seam, then an easy return) stay exactly as in the source, with their sizes and timing. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card behind the button, its "Install component" label, its violet theme color and the fake four second wait).

${KITCUT_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { KitcutButton } from "@/components/ui/kitcut-button";

// From my brief. Leave out any prop that stays at its default.
export function PublishAction() {
  return (
    <KitcutButton
      color="var(--primary)" // my theme's variables, not hex
      textColor="var(--primary-foreground)"
      dotColor="var(--muted-foreground)"
      successText="Published"
      sound={true}
      onClick={() => publishPost()} // return the promise: it stays open until it settles
    >
      Publish post
    </KitcutButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my fill color changes between light and dark mode (like a primary that turns light in dark mode), leave \`textColor\` out so the label picks black or white on its own, or pass the matching foreground variable.
- The dots sit on the page behind the button, so pick a dot color that reads on my page background in both themes, not on the button.
- \`className\` and \`style\` go on the button itself (44px tall). Leave about 40px of room above and below it for the sparks.

${KITCUT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a solid button in my fill color. On click a zigzag crack runs down its middle (with a crack sound if I kept it on), the halves pull apart in about half a second with the label split and slightly blurred, and three small dots in my dot color hop in the gap for at least 0.7 seconds. A second click does nothing. When loading ends, the halves snap back in about a quarter of a second, the seam flashes, sparks in my color fly out and the label shows my success word for about a second, then it eases back. The button never changes size.
- It looks right in light and dark mode (check both): the label reads on the fill and the dots and sparks show on both pages.
- On a phone, a tap starts it and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, nothing cracks or flies: the label fades to blinking dots, then to my success word and back.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/kitcut-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
