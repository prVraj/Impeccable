/* ---------- Venom-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const VENOM_BUTTON_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/venom-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the tentacles are drawn on one canvas and the button is plain CSS.
- JavaScript project? Name the file \`venom-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/venom-button.tsx\`
- Keep these exports and their names: \`VenomButton\`, \`VenomButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`SENSE\`, \`FIRST\`, \`ROOTS\`, \`ROOT_GAP\`, \`NECK_LEN\`, \`FILLET\`, \`ROOT_W\`, \`TIP_W\`, \`FAN\`, \`FAN_MAX\`, \`BRAID\`, \`WRITHE\`, \`WEB\`, \`WEB_LEN\`, \`GLOB\`, \`GLOB_PER\`, \`GRIP_R\`, \`LATCH_K\`, \`RETRACT_K\`, \`POINTER_W\`, \`STRETCH\`, \`LEAN\`, \`STAGGER_MS\`, \`COOLDOWN_MS\`, \`REJOIN_MS\`, \`FADE_MS\`, the \`CSS\` block and the \`ARROW\` shape. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` there are no feelers, no wobble, no flying drops and no drawn pointer, and the tentacles fade out instead of snapping. On touch screens the tentacles follow the finger and no pointer is drawn. A disabled button has no tentacles. Keyboard focus shows a ring in the ink color.`;

const VENOM_BUTTON_HOW = `## How the tentacles work

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The button.** A 44px pill of glossy ink (soft top shine, inner shadow, small drop shadow). The ink is the text color around it unless \`color\` is set, and the label is black or white, whichever reads, unless \`textColor\` is set.
2. **Feelers.** When the mouse comes within \`reach\` + 90px of the edge, the surface bulges toward it and feelers rise and sway toward it: one at first, up to four as it gets closer. They never touch it.
3. **The grab.** Within \`reach\` (64px) separate tentacles whip out of the nearest edge, each from its own root along the curve, from a low gooey base that hugs the button. They fan out with air between them, a thin see-through web near the button, and meet only at the pointer's tip, held side by side in a small glob, so it reads as many tentacles pulling, not one. Three grab first. As the pointer comes closer, more join, up to \`strands\` (9), and the roots shuffle over to make room.
4. **The heavy pointer.** A website can't slow the real mouse, so while the tentacles hold on, and only outside the button, the system pointer is hidden and a drawn arrow takes its place. The arrow is pulled back toward the button by \`weight\` (18% by default, a little more with every tentacle and as they stretch) and trails slightly behind. Over the button the real pointer is back, so clicks on it are exact. Clicking anywhere else lets go first. Only one button holds the pointer at a time.
5. **Peeling off.** Pulling away, the tentacles that joined last snap first, one by one, each at its own distance. Each break flings its loose end back as a drop that sinks into the button. Near its limit a tentacle straightens and shivers. The button leans up to 3px and stretches up to 3.5% toward the pull.
6. **The last snap.** The last two let go at \`snapAt\` (220px from the edge, measured from the real pointer), or all of them when the pointer leaves the window, 40ms apart. A little residue drips off the pointer, the button wobbles back to rest, the arrow slides onto the real pointer and the system pointer returns. It can't grab again for 450ms.
7. **Drawing.** Everything is drawn on one full-screen canvas laid over the page, so a box with hidden overflow never cuts the tentacles. The canvas only exists while something moves, and the animation loop stops when everything is still. All motion runs on elapsed time, so it takes the same time on slow phones and fast screens.

The ink color is read from the button on every frame, so it follows light and dark mode even mid-pull.`;

export function installPrompt(tsSource: string) {
  return `# Venom-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A glossy ink button that pours out tentacles to grab the pointer: more the closer it gets. They make it feel heavy and pull on it until they snap.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, or the last button of an onboarding flow). Keep the button's label, link and click handler. I can pick one or name another.
  *Why: the tentacles reach about 220px around the button and hold the pointer, so it suits one big action with room around it, not a toolbar or a form.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The ink pill, the feelers, the separate tentacles that fan out from a gooey base and meet at the pointer (more the closer the pointer gets), the heavy drawn pointer and the one-by-one snap with flying drops and a wobble are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Come closer" label and the dotted card behind it.

${VENOM_BUTTON_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { VenomButton } from "@/components/ui/venom-button";

export function HeroAction() {
  return <VenomButton onClick={() => router.push("/signup")}>Get started</VenomButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- By default the ink is the text color around it, so place it where my normal text color applies. \`className\` and \`style\` go on the button itself (44px tall, 22px sides).
- Leave about 220px of free space around it if you can. The tentacles are drawn above the page, so a parent with hidden overflow doesn't cut them.

${VENOM_BUTTON_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Moving the mouse toward the button: feelers rise from about 150px away, three separate tentacles grab the pointer at 64px, more join as it gets closer (up to 9), and the pointer feels about 18% slower while held. Pulling away they snap one by one, and the last two let go at 220px; the button wobbles. Over the button the real pointer shows and a click works as before.
- It looks right in light and dark mode (check both), and switching the theme mid-pull changes the tentacle color too.
- It works with a finger on a phone: press the button and drag out, and the tentacles follow, peel off as I go and let go on release, with no page scroll while dragging from it and no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, there are no feelers, wobble, drops or drawn pointer, and the tentacles fade out instead of snapping.
- Nothing else on the site looks or behaves differently, and the system pointer is always back after the snap.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/venom-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Venom-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A glossy ink button that pours out tentacles to grab the pointer: more the closer it gets. They make it feel heavy and pull on it until they snap. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, how much space they have around them, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, the last step of onboarding, a launch or waitlist page).
      *Why: the tentacles reach about 220px around the button and hold the pointer, so it suits one big action with room around it.*
   2. **The ink and label colors?** Keep the default (ink is my normal text color, label black or white), or name which of my existing color variables you'd use for the ink and for the label (for example my foreground and background, or my brand color and its foreground).
      *Why: the tentacles are drawn in the ink color, so the ink decides whether the whole effect feels like my brand.*
   3. **How heavy should the pointer feel?** Heavy, 18% slower (suggested), very heavy at 25%, or off (0) with the tentacles still grabbing.
      *Why: the slowed pointer is the strongest part of the effect, but some audiences, like busy dashboards, want the pointer left alone.*
   4. **How far should the tentacles reach?** Default: grab at 64px and snap at 220px (suggested), tight: 40px and 150px for crowded layouts, or wide: 96px and 300px for an empty hero.
      *Why: it sets how much room the button claims around itself, so it should match the space around it.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the colors, the weight, the reach, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The colors: \`color\` and \`textColor\`, as my theme's CSS variables.
- The weight: \`weight\`.
- The reach: \`reach\` and \`snapAt\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The ink pill, the feelers, the separate tentacles that fan out from a gooey base and meet at the pointer (more the closer the pointer gets), the heavy drawn pointer and the one-by-one snap with flying drops and a wobble stay exactly as in the source, with their sizes, springs and timing. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Come closer" label and the dotted card behind it).

${VENOM_BUTTON_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { VenomButton } from "@/components/ui/venom-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <VenomButton
      color="var(--primary)" // my theme's variables, not hex
      textColor="var(--primary-foreground)"
      weight={0.18}
      reach={64}
      snapAt={220}
      onClick={() => router.push("/signup")}
    >
      Get started
    </VenomButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- Check the ink against both my light and dark backgrounds: it should stand out in both. If my brand color doesn't, say so and suggest my foreground color instead.
- \`className\` and \`style\` go on the button itself (44px tall, 22px sides). Leave about \`snapAt\` of free space around it if you can.

${VENOM_BUTTON_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The button and tentacles are in my ink color with my label color. Feelers rise as the mouse comes close, the first tentacles grab at my reach and more join closer in, the pointer feels as heavy as I chose (or normal if I chose off), and they snap one by one, the last at my snap distance, and the button wobbles. Over the button the real pointer shows and a click works as before.
- It looks right in light and dark mode (check both), with the ink standing out in each, and switching the theme mid-pull changes the tentacle color too.
- It works with a finger on a phone: press the button and drag out, and the tentacles follow, peel off as I go and let go on release, with no page scroll while dragging from it and no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, there are no feelers, wobble, drops or drawn pointer, and the tentacles fade out instead of snapping.
- Nothing else on the site looks or behaves differently, and the system pointer is always back after the snap.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/venom-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
