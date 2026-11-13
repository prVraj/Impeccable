/* ---------- Peter-Tingle-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks three short questions, then fits it through the component's own props. */

const PETER_TINGLE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/peter-tingle-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the sense lines are drawn on one small canvas and the button is plain CSS.
- JavaScript project? Name the file \`peter-tingle-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/peter-tingle-button.tsx\`
- Keep these exports and their names: \`PeterTingleButton\`, \`PeterTingleButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`PAD\`, \`GAP\`, \`TRAVEL\`, \`PULSE_MS\`, \`LEN_MIN\`, \`LEN_MAX\`, \`AMP\`, \`WAVE\`, \`WIGGLE\`, \`LINE_W\`, \`SPACING\`, \`BACK\`, \`SHIVER\`, \`TILT\`, \`RISE_MS\`, \`FALL_MS\`, \`RUSH\`, \`RUSH_SPEED\`, \`BURST_MS\`, \`BURST_PUSH\`, \`FLINCH\`, \`TAP_MS\`, \`FOCUS_MS\`, \`FOCUS_AMT\` and the \`CSS\` block. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the lines only fade in and out (no shiver, no waves, no drift). On touch screens a tap sets off one short tingle all around. Keyboard focus sets off a softer one and shows a ring in the fill color. A disabled button never tingles.`;

const PETER_TINGLE_HOW = `## How the tingle works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The button.** A 44px pill in the fill color, with a soft top shine and a small drop shadow. The fill is the text color around it unless \`color\` is set, and the label is black or white, whichever reads, unless \`textColor\` is set.
2. **Sensing.** It listens to the mouse across the whole page. When the pointer comes within \`range\` (120px) of the button's edge, a small loop starts. The tingle grows stronger all the way to the edge, and a pointer that comes in fast adds up to 35% more, so a rush feels like a threat and a slow approach like a hunch.
3. **The sense lines.** Short wavy lines sit around the whole edge, one every 24px (or \`lines\` of them). Each one pulses: it fades in, drifts 9px outward and fades away every 560ms, out of step with its neighbours, while its waves crawl along it. Lines facing the pointer are longer (up to 18px) and brighter; the ones facing away stay at 40%. They are drawn in \`senseColor\`, or the fill color.
4. **The shiver.** At the same time the button shivers by up to 1.1px and tilts by up to half a degree, growing with the square of the tingle, so it only shows up close in.
5. **Landing on it.** The moment the pointer reaches the button, every line flashes outward once (320ms), the button flinches a tiny bit, and then everything goes still, so the click is always steady. Leaving and coming back starts the tingle again.
6. **Drawing.** The canvas hugs the button with 44px of room on every side and sits behind it. It only draws while something moves, and the loop stops the moment it is calm. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. The colors are read from the page on every frame, so they follow light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Peter-Tingle-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A button that feels the pointer coming: wavy sense lines pulse out of its edge toward it and the button shivers, stronger the closer and faster the pointer comes. When the pointer lands on it, the lines flash out once and it goes calm.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, or a sign-up or waitlist button). Keep the button's label, link and click handler. I can pick one or name another.
  *Why: the tingle reacts to the pointer from 120px away and draws lines about 40px around the button, so it suits one main action with some room around it, not a toolbar or a dense form.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The pill, the wavy sense lines that pulse out of the edge (longest on the pointer's side), the shiver that grows as the pointer comes closer and the flash out and calm when it lands are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Sneak up on me" label and the dotted card behind it.

${PETER_TINGLE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PeterTingleButton } from "@/components/ui/peter-tingle-button";

export function HeroAction() {
  return <PeterTingleButton onClick={() => router.push("/signup")}>Get started</PeterTingleButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- By default the fill is the text color around it, so place it where my normal text color applies. \`className\` and \`style\` go on the button itself (44px tall, 22px sides).
- Leave about 40px of free space around it. A parent with hidden overflow closer than that cuts the lines off.

${PETER_TINGLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Moving the mouse toward the button: from about 120px away wavy lines start to pulse out of its edge, longest on the side the pointer comes from, and grow stronger closer in, with a slight shiver near the edge. Rushing at it makes it stronger. When the pointer lands on the button, the lines flash out once and it goes still; a click works as before.
- It looks right in light and dark mode (check both), and the lines and label switch with the theme.
- On a phone, a tap sets off one short tingle all around and the button still works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the lines only fade in and out, with no shiver, waves or drift.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peter-tingle-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Peter-Tingle-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A button that feels the pointer coming: wavy sense lines pulse out of its edge toward it and the button shivers, stronger the closer and faster the pointer comes. When the pointer lands on it, the lines flash out once and it goes calm. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, how much space they have around them, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, a sign-up or waitlist button, the last step of onboarding).
      *Why: the tingle reacts from 120px away and draws lines about 40px around the button, so it suits one main action with some room around it.*
   2. **The colors?** Keep the default (fill is my normal text color, label black or white, lines the same as the fill), or name which of my existing color variables you'd use for the fill, the label and the sense lines (for example my foreground and background with my brand color for the lines).
      *Why: the sense lines are the only moving color on screen, so their color decides whether the effect feels like my brand.*
   3. **How early should it sense the pointer?** Default at 120px (suggested), calm at 80px for crowded layouts where the pointer passes by often, or eager at 180px for an empty hero.
      *Why: it sets how often the button reacts to a pointer that is only passing by, so it should match how busy the space around it is.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 4 lines: the place, the colors, the range, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The colors: \`color\`, \`textColor\` and \`senseColor\`, as my theme's CSS variables.
- The range: \`range\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The pill, the wavy sense lines that pulse out of the edge (longest on the pointer's side), the shiver that grows as the pointer comes closer and the flash out and calm when it lands stay exactly as in the source, with their sizes and timing. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Sneak up on me" label and the dotted card behind it).

${PETER_TINGLE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { PeterTingleButton } from "@/components/ui/peter-tingle-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <PeterTingleButton
      color="var(--foreground)" // my theme's variables, not hex
      textColor="var(--background)"
      senseColor="var(--primary)"
      range={120}
      onClick={() => router.push("/signup")}
    >
      Get started
    </PeterTingleButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- Check the fill and the lines against both my light and dark backgrounds: both should stand out in each. If my brand color doesn't, say so and suggest my foreground color instead.
- \`className\` and \`style\` go on the button itself (44px tall, 22px sides). Leave about 40px of free space around it.

${PETER_TINGLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The button has my fill and label colors and the lines are in my sense color. Lines start to pulse when the mouse comes within my range, longest on its side, and grow stronger closer in, with a slight shiver near the edge. When the pointer lands on the button, the lines flash out once and it goes still; a click works as before.
- It looks right in light and dark mode (check both), with the fill and the lines standing out in each.
- On a phone, a tap sets off one short tingle all around and the button still works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the lines only fade in and out, with no shiver, waves or drift.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peter-tingle-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
