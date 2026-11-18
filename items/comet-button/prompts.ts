/* ---------- Comet button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const COMET_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/comet-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the glow is drawn on one canvas around the button and the rest is plain CSS.
- JavaScript project? Name the file \`comet-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/comet-button.tsx\`
- Keep these exports and their names: \`CometButton\`, \`CometButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`OVER\`, \`SETTLE_MS\`, \`WAKE_MS\`, \`RISE_MS\`, \`LEN_REST\`, \`LEN_RUN\`, \`LOW\`, \`LINE\`, \`BLOOM\`, \`BLOOM_ALPHA\`, \`CORE\`, \`GLIDE_MAX\`, \`SUCCESS_IN_MS\`, \`SUCCESS_HOLD_MS\`, \`SUCCESS_OUT_MS\`, \`RING\`, the settle curves in \`tick\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the glow brightens in place instead of running and the dots blink instead of hopping. Clicks while it loads are ignored. Keyboard focus shows a ring in the glow color. A disabled button is dimmed and its glow never runs. A hidden tab stops drawing.`;

const COMET_HOW = `## How the glow works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A 44px dark pill (\`color\`, near-black by default) with a sharp label. A faint line of \`glowColor\` runs all the way round its edge. On top of it sit two streaks of light: a bright one centred on the top edge and a dim one (about a third as bright) centred on the bottom edge. Each streak is a thin line on the edge that turns almost white where it is brightest, plus a soft bloom that spreads about 18px outward.
2. **Loading starts.** When \`loading\` turns on (or \`onClick\` returns a promise), the label lifts 6px and fades with a light blur, and three small dots in \`glowColor\` rise into its place and hop one after another (a 1 second wave, 0.14s apart). The button keeps its width.
3. **The run.** Both streaks brighten to the same strength in about 120ms and pick up speed in about 180ms, then race clockwise round the border, one lap every \`speed\` seconds (1.4). They stay on opposite sides. While running, each streak gets longer, with a short sharp head and a long tail behind it, like a comet. The streaks move at an even speed along the edge, including round the ends.
4. **The settle.** When loading ends, the streaks don't stop dead, jump home or whip round to it. It always takes exactly 330ms and never moves backwards. If a resting spot (top centre or bottom centre) is close ahead, within \`GLIDE_MAX\` (0.28 of a lap), each streak keeps going the way it ran and glides into it, slowing smoothly to a stop on a curve that starts at the running speed, so there is no jolt. If home is further, the streaks slow to a stop where they are while they fade out, and the resting glow lights up in its place. In the same 330ms the brightness, length and tail ease back to the resting look, the dots fade out and the label drops back in.
5. **Success.** When loading ends and it worked (\`success\` is true and the promise didn't reject), the success state plays alongside the settle: the light spreads evenly round the whole border in 330ms (fast, then gentle), a soft glow in \`glowColor\` spreads behind the button, and the label becomes \`successText\` ("Ah yeah!"). It holds for 1.1 seconds, then the lit border, the glow behind it and the text ease back to the resting look in 600ms (slow, faster, slow). A new click during it starts loading again straight away.
6. **Clicks while loading.** They do nothing, and a submit button won't send its form twice.
7. **Drawing.** One canvas sits behind the label and reaches 18px past the button above and below, and on the left and right only as far as the screen allows (never past it, so the page can't scroll sideways). A loop runs only while the glow moves and stops at rest. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. Colors are read from the page when the theme changes, so theme variables follow light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Comet button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A dark pill with a soft glow resting on its edge. While it loads, the glow races round the border like a comet and the label becomes three hopping dots. When loading ends, the glow glides back to rest in 330ms.

## Before you build: one question

Look through this project first: its forms, its save, send, sign up and checkout buttons, and anything that waits on a server. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example a form's submit button, a "Save" or "Send" button, or a sign up button). Keep the button's label, click handler and form wiring, and say how you'll tell it when it is loading (the promise its handler already returns, or the loading flag the page already has).
  *Why: the glow runs only while something is loading, so it belongs on a button that really waits for something.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The dark pill with a still glow on its top and bottom edge, the two streaks that race round the border while it loads, the three hopping dots in place of the label, the 330ms glide back to rest, and the success state (the whole border lit, a soft glow behind it and "Ah yeah!", then an easy return) are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the button, its "Let me load" label and the fake two and a half second wait.

${COMET_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { CometButton } from "@/components/ui/comet-button";

export function SaveAction() {
  // Return the promise and the button loads until it settles.
  return <CometButton onClick={() => saveDraft()}>Save draft</CometButton>;
}

// Or, if the page already tracks loading:
// <CometButton loading={isSaving} onClick={save}>Save draft</CometButton>
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`type\`, \`disabled\`, \`aria-*\`). In a form, set \`type="submit"\` and pass \`loading\` from the form's own pending flag.
- Use either \`loading\` or a promise from \`onClick\`, not both: when \`loading\` is set, the promise is ignored.
- The success state ("Ah yeah!") plays when loading ends. A rejected promise skips it. With \`loading\`, pass \`success={!error}\` so a failed save doesn't celebrate.
- \`className\` and \`style\` go on the button itself. It is 44px tall with 24px each side. The soft glow spreads about 18px past the edge, so don't put it right against the edge of a box with \`overflow: hidden\`.

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a dark pill with a sharp label, a bright glow on the top edge and a dim one on the bottom. While loading, the label becomes three hopping dots, the glow runs round the border once every 1.4 seconds with a long tail, and a second click does nothing. When loading ends, the glow slows and settles back on the top in about a third of a second, and the label returns. If it worked, the whole border lights up, a soft glow spreads behind it and the label says \"Ah yeah!\" for about a second and a half, then it all eases back. The button never changes width.
- It looks right in light and dark mode (check both): the glow shows on both pages.
- On a phone, a tap starts it, the glow runs smoothly, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the glow brightens in place instead of running and the dots blink instead of hopping.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/comet-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Comet button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A dark pill with a soft glow resting on its edge. While it loads, the glow races round the border like a comet and the label becomes three hopping dots. When loading ends, the glow glides back to rest in 330ms. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its forms, its save, send, sign up and checkout buttons, anything that waits on a server, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace (a form's submit button, a "Save" or "Send" button, a sign up button), and say how you'll tell it when it is loading (the promise its handler returns, or the loading flag the page already has).
      *Why: the glow runs only while something is loading, so it belongs on a button that really waits for something.*
   2. **The glow color?** Keep the default (a soft violet), or name which of my theme colors you'd use (for example my primary or accent color, in its lighter shade if it has one).
      *Why: the glow and the dots are the only color on the button, so this is what makes it feel like my brand. It sits on a dark pill, so a light, bright shade shows best.*
   3. **The pill and label colors?** Keep the default (near-black with a white label, suggested), or name which of my existing dark color variables you'd use (for example my foreground or a dark surface color) and the label color on it.
      *Why: the glow is made to shine on a dark pill; a light pill would hide it.*
   4. **How fast should the glow run while loading?** Calm at 2 seconds a lap, default at 1.4 (suggested), or quick at 1 second.
      *Why: calm feels like patient work on long waits; quick feels busy and suits short ones.*
   5. **What should it say when it worked?** Keep "Ah yeah!" (suggested), or a short word in my product's voice that fits what the button does (for example "Saved" or "Sent").
      *Why: it shows for about a second with the whole border lit, so it is the button's moment to sound like my product.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place and how it knows it's loading, the glow color, the pill and label, the speed, the success word), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, click handler and form wiring, with \`loading\` or a promise from \`onClick\`.
- The glow: \`glowColor\`, from my theme.
- The pill and label: \`color\` and \`textColor\`, as my theme's CSS variables.
- The speed: \`speed\`.
- The success word: \`successText\`. If the place can fail, pass \`success={!error}\` (or let the promise reject) so a failure doesn't celebrate.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The dark pill with a still glow on its top and bottom edge, the two streaks that race round the border while it loads, the three hopping dots in place of the label, the 330ms glide back to rest, and the success state (the whole border lit, a soft glow behind it, then an easy return) stay exactly as in the source, with their sizes and timing. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card behind the button, its "Let me load" label and the fake two and a half second wait).

${COMET_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { CometButton } from "@/components/ui/comet-button";

// From my brief. Leave out any prop that stays at its default.
export function SaveAction() {
  return (
    <CometButton
      glowColor="var(--primary)" // my theme's variables, not hex
      color="var(--foreground)"
      textColor="var(--background)"
      speed={1.4}
      successText="Saved"
      onClick={() => saveDraft()} // return the promise: it loads until it settles
    >
      Save draft
    </CometButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my glow color is too dark to show on the pill, use its lighter shade from my theme, or mix one: \`color-mix(in oklab, var(--primary) 65%, white)\`.
- If my pill color turns light in dark mode (like a foreground variable), check that the glow still shows on it in both themes. If it doesn't, keep the default near-black pill.
- \`className\` and \`style\` go on the button itself (44px tall). Leave about 18px of room around it for the soft glow.

${COMET_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a pill in my pill color with a sharp label, a bright glow in my glow color on the top edge and a dim one on the bottom. While loading, the label becomes three hopping dots in my glow color, the glow runs round the border once every my-speed seconds with a long tail, and a second click does nothing. When loading ends, the glow slows and settles back on the top in about a third of a second, and the label returns. If it worked, the whole border lights up, a soft glow spreads behind it and the label says \"Ah yeah!\" for about a second and a half, then it all eases back. The button never changes width.
- It looks right in light and dark mode (check both): the glow shows on both pages.
- On a phone, a tap starts it, the glow runs smoothly, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the glow brightens in place instead of running and the dots blink instead of hopping.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/comet-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
