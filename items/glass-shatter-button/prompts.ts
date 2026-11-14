/* ---------- Glass-Shatter-button ----------
 * Install: adds the exact button; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const GLASS_SHATTER_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/glass-shatter-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the glass, the glow and the shards are drawn on one canvas around the button and the rest is plain CSS.
- JavaScript project? Name the file \`glass-shatter-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/glass-shatter-button.tsx\`
- Keep these exports and their names: \`GlassShatterButton\`, \`GlassShatterButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`OVER\`, \`TINT\`, \`EDGE\`, \`SHINE\`, \`GLOW_IN_MS\`, \`GLOW_OUT_MS\`, \`GLOW_CURVE\`, \`CRACK_MS\`, \`BURST_MS\`, \`HANG_MS\`, \`RETURN_MS\`, \`RIPPLE\`, \`SEAL_MS\`, \`FLY\`, \`SPIN\`, \`DROP\`, \`CUT_MIN\`, \`CUT_MAX\`, the \`snapBack\` easing and the \`CSS\` block. They are the design and its timing.
- Only the ring is glass. Keep the middle a plain, solid button: no blur, gradient or glass on it. The glow lights the glass only: never add a halo or shadow glow outside the border.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the cracks show and fade and nothing flies. On touch screens, pressing lights the glass under the finger and the tap shatters it. Enter or Space shatters it from the top centre, and focus shows a ring in the text color around it. A disabled button shows no glow and never shatters. A hidden tab stops drawing.`;

const GLASS_SHATTER_HOW = `## How the glass works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **At rest.** A solid pill (\`color\`, near-black by default) with a sharp label, inside a 6px ring of glass (\`ring\`). The glass is a faint tint of \`glassColor\` (the page's text color by default, so it shows on light and dark pages), a soft white shine across its top half, a thin outer and inner edge line, and a glint along the top left. The ring is part of the button, so it is clickable too.
2. **The glow.** The pointer is watched on the whole page while the button is on screen. Within \`range\` px (120) of the button, the part of the ring nearest to the pointer catches \`glowColor\`. Closeness is curved (power 1.8), so the glow grows faster the closer the pointer gets: faint at the edge of the range, bright and about 70px wide once the pointer is on the button. The edges light up brightest. The light stays inside the glass: nothing glows outside the border or over the middle. It rises in about 90ms and fades in about 280ms.
3. **The crack.** A click goes through to \`onClick\` at once. On the press, cracks run out from the exact spot pressed for 90ms, and a soft flash of \`glowColor\` blooms in the glass there. The middle takes a small knock (it scales to 96.5% and back in 420ms).
4. **The burst.** The ring is cut into shards: about 5px apart near the impact and up to 22px apart on the far side, each cut slanted, and longer pieces split into two triangles. Shards fly away from the impact and outward from the button, up to 52px, the ones near the impact furthest and spinning most (up to 2.2 radians). They go out fast and slow down like in air over 520ms, sinking 10px, starting in a ripple from the impact (0.22ms per px of ring). Each shard's shine flickers as it turns, and shards near the pointer catch the glow.
5. **The return.** Shards hang for 80ms, drifting a little further, then pull back in over 540ms with a slow start and a tiny snap at the end. The far ones go back first and the ones at the impact last, so the glass closes toward where it was hit.
6. **The seal.** When the last shard lands, the cracks fade and a line of light runs both ways round the ring from the impact, meeting on the far side, in 320ms. The whole thing takes about a second and a half.
7. **Clicking again.** While it is in pieces, a new click blasts the shards again from where they are, never further than the room around the button. When the glass is whole, a new click breaks it fresh.
8. **Drawing.** One canvas sits behind the middle and reaches 88px past the button above and below, and on the left and right as far as the screen allows (never past it, so the page can't scroll sideways). The page does not move. A loop runs only while something changes and stops when the button is at rest. All motion runs on elapsed time, so it feels the same on slow phones and fast screens. Colors are read from the page on every frame, so theme colors follow light and dark mode.`;

export function installPrompt(tsSource: string) {
  return `# Glass-Shatter-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A solid button inside a thin ring of glass. The glass catches the light as the pointer comes near, brighter the closer it gets, and on click it cracks, bursts into shards, then pulls back together and seals. The click works straight away.

## Before you build: one question

Look through this project first: its landing and hero sections, its main call-to-action buttons and the pages where one action matters most. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example the hero's main call to action, a "Get started" or launch button, or the final step of a sign-up). Keep the button's label, link and click handler. I can pick one or name another, and say whether it needs at least 60px of open space around it.
  *Why: it reacts before anyone clicks and breaks on the click, so it suits one main action with room around it, not every button on the page.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The solid middle in a thin ring of glass, the glow that grows on the side nearest the pointer, and the crack, burst, hang, return and seal on click, with their timing, are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the button and its "Break the glass" label.

${GLASS_SHATTER_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { GlassShatterButton } from "@/components/ui/glass-shatter-button";

export function HeroAction() {
  return <GlassShatterButton onClick={() => router.push("/signup")}>Get started</GlassShatterButton>;
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- \`className\` and \`style\` go on the button itself. It is 56px tall (a 44px middle plus the 6px ring each side). Change \`border-radius\` here and the middle follows, minus the ring.
- Shards fly up to about 60px outside the button. Don't put it right against the edge of a box with \`overflow: hidden\`, or the shards get cut off there.

${GLASS_SHATTER_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a solid pill with a sharp label in a thin, faint ring of glass. Moving the pointer toward it from about 120px away lights the side of the ring nearest the pointer, faint at first and bright once on it. A click works at once, while the ring cracks from the exact spot clicked, bursts into shards that fly up to about 50px, hangs, pulls back in and seals with a line of light, in about 1.5 seconds.
- It looks right in light and dark mode (check both): the glass, its edges and the glow show on both.
- On a phone, pressing lights the glass under the finger, the tap shatters it, the button works on the first tap, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the cracks show and fade and nothing flies.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/glass-shatter-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Glass-Shatter-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A solid button inside a thin ring of glass. The glass catches the light as the pointer comes near, brighter the closer it gets, and on click it cracks, bursts into shards, then pulls back together and seals. The click works straight away. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its main call-to-action buttons, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 buttons it could replace or the spots it fits best (the hero's main call to action, a "Get started" or launch button, the final step of a sign-up), and say whether each has about 60px of open space around it.
      *Why: it reacts before anyone clicks and breaks on the click, so it suits one main action with room around it, not every button on the page.*
   2. **The middle and label colors?** Keep the default (a near-black middle with a white label, suggested), or name which of my existing color variables you'd use for the middle and the label (for example my foreground and background colors, or my primary color).
      *Why: the glass is faint, so the solid middle is what people see first; it should feel like my other main buttons.*
   3. **The glow color?** Keep the default (a soft violet), or name which of my theme colors you'd use (for example my primary or accent color). Suggest one that shows on both my light and dark backgrounds.
      *Why: the glow, the flash and the seal are the only color on the glass, so this is what makes it feel like my brand.*
   4. **How far away should the glass feel the pointer?** Close at 80px, default at 120px (suggested), or far at 200px.
      *Why: close feels like a quiet reaction when you are about to click; far makes the glass wake up as soon as the pointer heads its way.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place, the middle and label, the glow color, the range), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the button is rendered, keeping that spot's label, link and click handler.
- The middle and label: \`color\` and \`textColor\`, as my theme's CSS variables.
- The glow: \`glowColor\`, from my theme.
- The range: \`range\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The solid middle in a thin ring of glass, the glow that grows on the side nearest the pointer, and the crack, burst, hang, return and seal on click stay exactly as in the source, with their sizes and timing. The glass tint follows my text color. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card behind the button and its "Break the glass" label).

${GLASS_SHATTER_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { GlassShatterButton } from "@/components/ui/glass-shatter-button";

// From my brief. Leave out any prop that stays at its default.
export function HeroAction() {
  return (
    <GlassShatterButton
      color="var(--foreground)" // my theme's variables, not hex
      textColor="var(--background)"
      glowColor="var(--primary)"
      range={120}
      onClick={() => router.push("/signup")}
    >
      Get started
    </GlassShatterButton>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my glow color is very dark in dark mode (or very light in light mode), use the shade my theme already switches per mode, or mix one: \`color-mix(in oklab, var(--primary) 70%, var(--foreground))\`.
- Check the middle against both my light and dark backgrounds and the label against the middle, in both themes. The glow should be clearly visible on both.
- \`className\` and \`style\` go on the button itself (56px tall: a 44px middle plus the 6px ring each side). Keep about 60px of open space around it for the shards.

${GLASS_SHATTER_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest it is a solid pill in my middle color with a sharp label in my label color, in a thin, faint ring of glass. Moving the pointer toward it from my range lights the side of the ring nearest the pointer in my glow color, faint at first and bright once on it. A click works at once, while the ring cracks from the exact spot clicked, bursts into shards, hangs, pulls back in and seals with a line of my glow color, in about 1.5 seconds.
- It looks right in light and dark mode (check both): the glass, its edges and the glow show on both.
- On a phone, pressing lights the glass under the finger, the tap shatters it, the button works on the first tap, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the cracks show and fade and nothing flies.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/glass-shatter-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
