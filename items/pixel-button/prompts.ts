/* ---------- Pixel-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PIXEL_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/pixel-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the pixels, the glow, the wave and the edge light are drawn on one small canvas inside the button and the rest is plain CSS.
- JavaScript project? Name the file \`pixel-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/pixel-button.tsx\`
- Keep these exports and their names: \`PixelButton\`, \`PixelButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`DOT\`, \`PITCH\`, \`NUDGE\`, \`GAPS\`, \`REST\`, \`LIT\`, \`EDGE\`, \`TWINKLE\`, \`BREATHE\`, \`SPARKLE\`, \`SPARKLES\`, \`SPARK\`, \`SPOT\`, \`HOVER_IN_MS\`, \`HOVER_OUT_MS\`, \`SPREAD\`, \`RAGGED\`, \`SPEED\`, \`WIDTH\`, \`WAVE\`, \`MAX_WAVES\`, \`TRAIL_MS\`, \`TRAIL\`, \`TRAIL_ALPHA\`, \`TRAIL_W\`, \`TRAIL_BLUR\`, \`RIM\`, \`GLOW\`, \`GLOW_DEPTH\` and the \`CSS\` block. They are the design.
- Keep the light going round the edge as written: one bright head with a fading tail, never a full bright border at rest. No gradient border, no glow outside the button, no extra colors. The only color besides the fill and the label is \`glowColor\`.
- Keep the theme defaults: the pill is white in light mode and near-black in dark mode, following a \`.dark\` class or \`data-theme="dark"\` on the page. Label, edge and pixel color follow the fill.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the pixels and the edge light hold still and only the click wave passes. On touch screens, pressing lights the button up and the tap sends the wave from the finger. Enter or Space sends the wave from the centre, and focus shows a ring in the text color around it. A disabled button shows no pixels, no light and no wave. Off screen or in a hidden tab, nothing is drawn.`;

const PIXEL_HOW = `## How the pixels work

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A plain pill in \`color\` (white in light mode, near-black in dark mode by default) with a hairline inner edge and a soft shadow. A light in \`glowColor\` travels round the edge once every 4.2 seconds: a bright 1.5px head with a small halo and a tail fading over about a third of the edge.
2. **The pixels.** Behind the label sit tiny 2px pixels in \`glowColor\` (a deeper violet on a light fill, a lighter one on a dark fill). They start from a 4px grid, but each one is nudged up to 1px off it at random and about one spot in five stays empty, so the spacing is never exact and it feels hand-made, not printed. Each pixel has its own brightness (most soft, a few bright), gently breathes at its own uneven pace (about 20% up and down), and about one in five now and then lights up brighter and fades back. They are brighter toward the edge and dimmer in the middle, so the label always reads first.
3. **The two types.** With \`mode="hover"\` (the default) the pixels are hidden at rest and only show while the pointer is on the button. With \`mode="always"\` they show dimly all the time (42% bright, before each pixel's own brightness).
4. **Hover.** When the pointer arrives, the pixels light up outward from the exact spot it came in, spreading at 0.4px per ms with a ragged, pixel-by-pixel edge, so the whole button lights up in about a third of a second. As they spread, a soft light comes in evenly from every side (top, bottom and both ends) and fades toward the middle, and the whole edge lights up softly. The pixels within 56px of the pointer stay a little brighter. When the pointer leaves, the pixels go dark one by one, each at its own random moment, in about 380ms. Coming back while they are still lit doesn't restart the spread.
5. **The wave.** A click starts a wave at the exact spot pressed. It rolls out at 0.2px per ms as a soft 12px band: the pixels it passes get brighter (by up to 72%) and the ones in its middle grow by one px. It loses about half its strength by the far edge and ends once it has crossed the whole button. Quick clicks overlap, up to 3 waves at once.
6. **The label.** Normal text above the canvas. It never moves, so it is always easy to read. It is black or white, whichever reads best on the fill, unless \`textColor\` is set.
7. **Drawing.** The canvas fills the button exactly; the button clips it. One loop draws everything while the button is on screen and pauses when it is off screen or the tab is hidden. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. The pixel color is read from the page a few times a second, so theme colors follow light and dark mode, and the pixels and the edge light follow the button's own border-radius.`;

export function installPrompt(tsSource: string) {
  return `# Pixel-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A button, white in light mode and dark in dark mode, with tiny twinkling pixels behind its label and a light going round its edge. Hover makes the pixels glow, and a click sends a wave of light out from the exact spot clicked. The label stays sharp the whole time.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, a "Get started" or waitlist button, or an upgrade button). Keep the button's label, link and click handler. I can pick one or name another.
  *Why: it rewards the moment someone reaches for it, so it suits one main action, not every button on the page.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The pill (white in light mode, dark in dark mode), the light going round the edge, the twinkling pixels (shown only on hover, the default type), the glow on hover and the wave from the click point are the design. Keep them exactly as in the source, with no gradient border or outer glow. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Make a wave" label and the dotted card behind it.

${PIXEL_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PixelButton } from "@/components/ui/pixel-button";

export function HeroAction() {
  return <PixelButton onClick={() => router.push("/signup")}>Get started</PixelButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- \`mode="always"\` keeps the pixels on at rest; leave it out for the default, pixels only on hover.
- \`className\` and \`style\` go on the button itself (44px tall, 24px sides). Everything happens inside the button, so it needs no extra room around it.

${PIXEL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a white pill in light mode and a dark pill in dark mode, with a sharp label and a light clearly going round its edge. Moving the pointer onto it brings up tiny twinkling pixels behind the label, brighter toward the edge, with a soft glow inside the edge; they sink away after the pointer leaves. A click sends a wave of bright pixels from the exact spot clicked across the whole button; quick clicks overlap. The click still works as before.
- It looks right in light and dark mode (check both): the pill, its edge and the pixels show on both.
- On a phone, pressing lights it up, the tap sends the wave from the finger, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the pixels and the edge light hold still and only the wave passes.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/pixel-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Pixel-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A button, white in light mode and dark in dark mode, with tiny twinkling pixels behind its label and a light going round its edge. Hover makes the pixels glow, and a click sends a wave of light out from the exact spot clicked. The label stays sharp the whole time. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, a "Get started" or waitlist button, an upgrade button).
      *Why: it rewards the moment someone reaches for it, so it suits one main action, not every button on the page.*
   2. **Which type?** Only on hover (suggested: plain until someone reaches for it), or always on (the pixels twinkle softly at rest and glow on hover).
      *Why: hover keeps a calm page calm; always on draws a little attention to the one button that should get it.*
   3. **The fill and label colors?** Keep the default (white in light mode and dark in dark mode, suggested), or name which of my existing color variables you'd use for the fill and the label (for example my foreground and background colors).
      *Why: by default it matches the page's theme; a fixed color makes it stand out the same way in both.*
   4. **The pixel color?** Keep the default (a violet that suits the fill), or name a shade from my theme (for example a 400 or 500 step of my brand color on a light fill, a 200 or 300 step on a dark fill).
      *Why: it colors the pixels, the glow, the wave and the edge light, so it is the button's one color moment.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place, the type, the fill and label, the pixel color), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The type: \`mode\`.
- The fill and label: \`color\` and \`textColor\`, as my theme's CSS variables.
- The pixel color: \`glowColor\`, a light shade from my theme.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The pill, the light going round the edge, the twinkling pixels brighter toward the edge, the glow on hover and the wave from the click point stay exactly as in the source, with their sizes and timing, and with no gradient border or outer glow. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the "Make a wave" label and the dotted card).

${PIXEL_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { PixelButton } from "@/components/ui/pixel-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <PixelButton
      mode="always" // or leave it out for "hover"
      color="var(--foreground)" // my theme's variables, not hex
      textColor="var(--background)"
      glowColor="var(--brand-400)" // a shade that reads on the fill
      onClick={() => router.push("/signup")}
    >
      Get started
    </PixelButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my theme has no light shade of the brand color, mix one: \`color-mix(in oklab, var(--primary) 45%, white)\`.
- Check the fill against both my light and dark backgrounds and the label against the fill, in both themes. The pixels and the edge light should read clearly on the fill in both themes.
- \`className\` and \`style\` go on the button itself (44px tall, 24px sides).

${PIXEL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a pill in my fill color with a sharp label in my label color and a light clearly going round its edge, with the pixels showing dimly only if I picked always on. Hovering brings up or brightens the pixels in my pixel color, with a soft glow inside the edge. A click sends a wave from the exact spot clicked across the whole button. The click still works as before.
- It looks right in light and dark mode (check both), with the pill and the label standing out in each.
- On a phone, pressing lights it up, the tap sends the wave from the finger, and the button works on the first tap, with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the pixels and the edge light hold still and only the wave passes.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/pixel-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
