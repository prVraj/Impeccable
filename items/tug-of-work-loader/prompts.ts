/* ---------- Tug of Work loader ----------
 * Install: adds the exact loader; asks only where it goes and what it tracks.
 * Blend: asks four short questions, then fits it through the component's own props. */

const TUG_ONE_LINE = `A see-through progress bar where the filled part is a heavy slab of stone and a tiny person drags it. They lean back on a rope tied to the stone's chipped front and walk backwards; the stone lurches along behind them, rumbling and kicking up dust, until it reaches 100%. When the bar waits they keep heaving and the stone only budges. At 100% the stone shoves them out of the end of the bar and they tumble off and fall. Until then, nothing leaves the bar's border. Under the bar sits a support line, "Developers are working really hard.", and the percentage.`;

const TUG_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/tug-of-work-loader.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the bar is plain CSS and the person is drawn on one canvas inside it.
- JavaScript project? Name the file \`tug-of-work-loader.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/tug-of-work-loader.tsx\`
- Keep these exports and their names: \`TugOfWorkLoader\`, \`TugOfWorkLoaderProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PAD\`, \`BODY\`, \`GROUND\`, \`LEAN\`, \`REACH\`, \`PULL_SPEED\`, \`CATCH_MS\`, \`STRIDE\`, \`MAX_STEPS\`, \`HEAVE_MS\`, \`SWEAT_MS\`, \`STUMBLE_MS\`, \`DROP_MS\`, \`DROP\`, \`HOLD_MS\`, \`FADE_MS\`, \`STONE\`, \`LAG\`, \`BUDGE\`, \`DUST\`, the \`RUN\` list and the \`CSS\` block. They are the design and its timing.
- The bar stays see-through: a thin border, no solid background, and a stone that is only a tint. Everything on the canvas (the stone, the person, the rope, the sweat and the dust) is clipped to the inside of the bar, so nothing leaves its border while they pull. Keep that clip. Only the fall at 100 is drawn outside it.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the stone still moves but the person stands still, with no steps, heaves, lurches, dust or sweat, and at 100 they raise their arms instead of falling. When the tab is hidden or the bar is scrolled out of view, drawing stops and picks up where it left off. A theme switch redraws it in the new colors. It is a \`role="progressbar"\` with \`aria-valuenow\` when it has a value, and has no \`aria-valuenow\` while it loops (the progress is not real then).`;

const TUG_HOW = `## How the loader works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The bar.** A pill (44px tall by default, \`height\`) with a 1px border at 26% of \`color\` and nothing behind it, so the page shows through. A canvas covers the inside, 3px in from the border, and everything below is drawn on it.
2. **The stone.** The filled part is a slab of stone in an 18% tint of \`color\` (\`STONE\`), with a darker underside, a chipped front edge (fixed chips, the middle left clean for the rope), and grain, pits and cracks laid out in fixed tiles counted back from the front, so they travel with it and read as one solid object being dragged.
3. **The person.** A stick figure in \`color\`, about three quarters of the bar's inner height. They face the stone and lean back about 29 degrees on a rope tied to the middle of its front edge; the rope runs taut to their hands and a short tail hangs behind.
4. **Pulling.** With a \`value\`, the stone moves to it, never faster than 30% of the bar a second, and settles softly. Without one, it loops through a fixed run (\`RUN\`, over \`duration\`, 8 seconds): pulls with pauses between them, like real work. The person stays a rope's length ahead and walks backwards with it; their steps follow the distance pulled (up to 2.8 pairs of steps a second), so their feet don't slide on slow pulls.
5. **Weight.** While it moves, the stone drags up to 1.4px behind on each step (\`LAG\`) and lurches forward when the next one lands, rumbles up and down a fraction of a pixel, and kicks up specks of dust at its front bottom corner (about one for every 3px it moves, \`DUST\`, plus a puff on each lurch). The dust drifts up and fades in about half a second.
6. **Waiting.** When the stone stops before 100, they keep heaving on the rope every 1.1 seconds, leaning further back, hands pumping. The stone budges 0.9px forward on each heave (\`BUDGE\`), shudders and puffs a little dust, then settles. After a moment they shake, and every 1.6 seconds a drop of sweat flies off the back of their head and falls.
7. **The end.** Near 100 they run out of room, so they stop where the bar is still full height (before its rounded end) and pull the rope in hand over hand as the stone comes to them. At 100 \`onComplete\` runs once and the stone shoves them backwards out of the end of the bar in 0.28 seconds (\`STUMBLE_MS\`): they scramble, the rope drops and their arms windmill. Then they fall about three bar heights (\`DROP\`) in 0.76 seconds (\`DROP_MS\`), tumbling backwards and drifting a little right, and fade out. In \`value\` mode they stay gone while it sits at 100, and fade back in at the start when the value drops again. When looping, the finished bar rests 1.5 seconds, fades out, starts again from 0 and fades in.
8. **Going back.** If the value drops (a new upload, a retry), the stone and the person jump straight there; they never walk the stone backwards.
9. **Drawing.** The canvas reaches past the bar's right end (only as far as the screen allows, so a full-width bar never makes the page scroll sideways) and three bar heights below it, for the fall. Until the fall, everything is clipped to the inside of the bar, so nothing leaves the border. A loop runs while anything moves and rests when nothing does. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. The color is read from the page on every frame, so it follows light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Tug of Work loader

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${TUG_ONE_LINE}

## Before you build: one question

Look through this project first: its uploads, exports, imports, build or deploy steps, setup or onboarding screens, and any spinner or progress bar it already shows while people wait. Then ask me this in one message and wait for my answer:

- **Where should it go, and what does it track?** Suggest the 1–3 spots it fits best from my code (for example a file upload with real progress, an export or build screen, or a first-run setup screen). For each one, say whether you would pass its real progress as \`value\` (0 to 100), or leave \`value\` out so it loops because the wait can't be measured. I can pick one or name another.
  *Why: with real progress the person pulls the bar to the true number, which is honest and satisfying; a looping bar only suits waits you can't measure.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The see-through bar, the stone slab with its lurch, rumble and dust, the tiny person leaning back on the rope and walking backwards, the straining while it waits, the hand-over-hand pull at the end and the fall off the end at 100%, with their timing, are the design. So is the support line "Developers are working really hard." Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing spinner or progress bar there, keep that spot's logic and remove only the old indicator. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the loader and the home page's TV.

${TUG_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { TugOfWorkLoader } from "@/components/ui/tug-of-work-loader";

// Real progress: pass a number from 0 to 100.
export function UploadProgress({ percent }: { percent: number }) {
  return <TugOfWorkLoader value={percent} className="max-w-sm" />;
}

// A wait you can't measure: leave value out and it loops.
export function Building() {
  return <TugOfWorkLoader className="max-w-sm" />;
}
\`\`\`

- It fills the width it is given, so set a max width with \`className\` (about 280 to 480px reads best). It is 44px tall plus the line under it.
- Show it only while the wait lasts. \`onComplete\` runs when it reaches 100, if you want to move on. At 100 the person falls about three bar heights below the bar's right end, over whatever is there, for about a second.

${TUG_HOW}

## Check

- It type-checks and the page renders with no console errors.
- A see-through bar whose filled part is a stone slab, a tiny person ahead of it with a rope to their hands, and "Developers are working really hard." with the percentage under it. As the progress grows they walk backwards, dragging the stone, which lurches and kicks up dust; when it stops they heave and strain and the stone only budges; near the end they pull hand over hand; at 100 the stone shoves them out of the end of the bar and they tumble down and fade. Until then, nothing crosses the bar's border.
- It looks right in light and dark mode (check both): the border, the stone with its grain and the person all show.
- On a phone (375px wide) it fits with no sideways scroll, and the support line wraps under the bar.
- With \`prefers-reduced-motion: reduce\`, the stone still moves and the percentage counts, but the person stands still, no dust flies, and at 100 they raise their arms instead of falling.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed and what it tracks, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tug-of-work-loader.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Tug of Work loader, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${TUG_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its uploads, exports, imports, build or deploy steps, setup or onboarding screens, any spinner or progress bar it already shows, the tone of its copy, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and what does it track?** Suggest the 1–3 spots it fits best from my code (a file upload with real progress, an export or build screen, a first-run setup screen). For each, say whether you would pass its real progress as \`value\`, or leave it out so it loops.
      *Why: with real progress the person pulls the bar to the true number; a looping bar only suits waits you can't measure.*
   2. **The support line?** Keep "Developers are working really hard." (suggested), write one in my product's voice that names the wait (for example "Our team is hauling your files up."), or hide it. Say whether to keep the percentage next to it.
      *Why: it is the only text, so it sets the joke and tells people what they are waiting for.*
   3. **The color?** Keep the default (my text color, suggested), or name which of my existing color variables you'd use (for example my primary or muted foreground color). Suggest one that reads on both my light and dark backgrounds.
      *Why: the person, the rope, the border and the stone all take this one color, so it decides whether the loader feels like my brand or like plain ink.*
   4. **The size?** Small at 36px, default at 44px (suggested), or large at 56px, and how wide (a max width between 280 and 480px).
      *Why: the person grows with the bar; small fits inside cards and dialogs, large suits a full screen wait.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place and what it tracks, the support line, the color, the size), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and what it tracks: where it is rendered, and \`value\` wired to my real progress (or left out to loop). \`onComplete\` if that spot needs to move on at 100.
- The support line: \`label\` (or \`null\` to hide it) and \`showValue\`.
- The color: \`color\`, as my theme's CSS variable.
- The size: \`height\`, and the max width through \`className\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The see-through bar, the stone slab with its lurch, rumble and dust, the tiny person leaning back on the rope and walking backwards, the straining while it waits, the hand-over-hand pull at the end and the fall off the end at 100%, with their timing, and nothing leaving the border until the fall. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card behind the loader and the home page's TV).

${TUG_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { TugOfWorkLoader } from "@/components/ui/tug-of-work-loader";

// From my brief. Leave out any prop that stays at its default.
export function UploadProgress({ percent }: { percent: number }) {
  return (
    <TugOfWorkLoader
      value={percent}                             // or leave it out to loop
      label="Our team is hauling your files up."  // my support line, or null to hide it
      color="var(--primary)"                      // my theme's variable, not hex
      height={44}
      className="max-w-sm"
      onComplete={() => setStep("done")}
    />
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my color is very light in light mode or very dark in dark mode, use the shade my theme already switches per mode, or mix one: \`color-mix(in oklab, var(--primary) 70%, var(--foreground))\`.
- Keep the support line short: one sentence, about 40 characters, so it stays on one line on desktop.
- If it replaces an existing spinner or progress bar, keep that spot's logic and remove only the old indicator.

${TUG_HOW}

## Check

- It type-checks and the page renders with no console errors.
- A see-through bar in my color whose filled part is a stone slab, a tiny person ahead of it with a rope to their hands, and my support line under it. With my real progress, the person drags the stone to the true number, lurching and kicking up dust; when it stops they heave and strain and the stone only budges; near the end they pull hand over hand; at 100 the stone shoves them out of the end of the bar and they tumble down and fade. Until then, nothing crosses the bar's border.
- It looks right in light and dark mode (check both): the border, the stone and the person show clearly in my color on both.
- On a phone (375px wide) it fits with no sideways scroll, and my support line wraps under the bar.
- With \`prefers-reduced-motion: reduce\`, the stone still moves and the percentage counts, but the person stands still, no dust flies, and at 100 they raise their arms instead of falling.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tug-of-work-loader.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
