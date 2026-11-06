/** Prompts for Burning-Screen. The Install prompt carries the source; the
 * Recreate prompt describes the motion in words, with no code. */

export function burningScreenInstallPrompt(tsSource: string) {
  return `# Burning-Screen

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

## Before you build: one question

Look through this project first: its router, its pages, and the buttons that move the user to another page. Then ask me this in one message and wait for my answer:

- **Where should it burn?** Suggest the 1–3 buttons in my code that fit best (for example a sign-up or "Get started" button) and the page each one goes to. I can pick one of them or name another.

Ask nothing else. If I say *skip*, wire it to the best suggestion.

## Keep it as it is

The burn is the design. Keep the ragged edge shape and how it grows in surges, the charred band and inner shadow, the flames, the rising ash, the timings and the colors exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, the wrapper in the root layout and the wiring for the button I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo controls (sliders, color pickers, theme toggles or "Try it" buttons) from the Impeccable website. My users only ever see the burn.

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add @impeccable/burning-screen\`.
If the command succeeds, only fix import paths to match this project and skip to **Check**. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the effect uses the browser's View Transitions API, WebGL and a 2D canvas.
- JavaScript project? Name the file \`burning-screen.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/burning-screen.tsx\`
- Keep these exports and their names: \`BurningScreen\`, \`useBurningScreen\`, \`BurningScreenProps\`, \`BurnOptions\`, \`BurnColors\`, \`BurnOrigin\`. Other code imports them.
- Keep \`"use client"\` at the top in Next.js App Router projects (it uses state, effects and browser APIs). In other setups it is harmless.
- Wrap the app once, as high as possible so it survives page changes (in Next.js App Router: \`app/layout.tsx\`, around \`{children}\` inside \`<body>\`).
- Do not enable Next.js's own \`experimental.viewTransition\` flag or React's \`<ViewTransition>\` alongside it; both start their own view transitions.
- Keep the timings, the edge shape (the WOBBLE table and \`baseRadius\`), the shader and the particle numbers exactly as written. They are the design.
- Keep the fallbacks: no View Transitions, no WebGL, or \`prefers-reduced-motion: reduce\` all give a short fade instead of the burn.

## Use it

Wire it to the button I picked, the way this example does:

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";
import { useBurningScreen } from "@/components/ui/burning-screen";

export function SignUpButton() {
  const router = useRouter();
  const { burn } = useBurningScreen();
  return (
    <button onClick={(e) => burn(() => router.push("/welcome"), { origin: e })}>
      Create account
    </button>
  );
}
\`\`\`

Other routers work the same way, for example \`burn(() => navigate("/welcome"), { origin: e })\` with React Router.

\`burn(update, options)\` runs \`update\` (a route change or any state change) and burns from the click to the new screen. If \`update\` returns a promise it waits for it; otherwise it waits for the page to change.

## Check

- It type-checks and the page renders with no console errors.
- Clicking burns a ragged hole outward from the click point in about 2 seconds and reveals the next page; ash lifts off the upper edge, then the last ash keeps rising for about 1.5 seconds with no fire.
- On a light page the edge is charred black; on a dark page it glows white. Check both themes.
- It stays smooth on a phone.
- With \`prefers-reduced-motion: reduce\`, it is a short fade.
- The button I picked burns to the right page, and nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where the burn is wired, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/burning-screen.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export const burningScreenRecreatePrompt = `# Recreate: Burning-Screen

Build a React page transition called Burning-Screen. When the user clicks a button that changes the page (for example "Create account" going to a welcome page), the current screen burns away from the click point and the next page shows through the burned hole. Attach your reference video or image here: [reference]

Fit it to my product like a missing puzzle piece: it should look like it was always part of my site, without changing anything else.

## First: look, ask once, then build

1. Look through this project first: its router, the buttons that move to another page, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options and mark your suggestion. Ask nothing else:
   1. **Where should it burn?** Suggest the 1–3 buttons that fit best and the page each goes to.
   2. **Colors?** Keep the black, white and gray default, or match my brand. If you suggest brand colors, name which of my existing color variables you'd use for the char, the glow, the smoke and the ash. If you found no theme, offer the default or let me paste 1–3 colors.
   3. **Speed?** 2 seconds (default), quicker (1.5s) or slower (2.5s).
   4. **Rising ash after the burn?** Keep it (default) or turn it off.
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: where it's wired, the colors (by my variable names), the speed, ash on or off, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

The burn is the design. Keep the ragged edge shape and how it grows in surges, the charred band and inner shadow, the flames, and the ash rising upward exactly as described below. Only my answers above may change it: the button and page, the four colors, the duration and the rising ash. If something doesn't fit my product, tell me instead of changing it.

- Brand colors: read my variables when the burn starts (for example \`getComputedStyle(document.documentElement).getPropertyValue("--primary")\`) and pass the values in \`colors\`, so the burn follows my light and dark themes. Don't copy hex codes in.
- No new packages, no changes to files other than the component, the root layout wrapper and the button I picked, and no demo controls (sliders, color pickers or theme toggles) on my site.

## Stack

- React with TypeScript, written as one client component file: \`components/ui/burning-screen.tsx\`.
- No animation library. Use the browser's View Transitions API to capture the old page, a clip-path on \`::view-transition-new(root)\` to reveal the new one, one full-screen WebGL fragment shader for the edge and flames, and one 2D canvas for ash and embers.
- Expose a provider \`<BurningScreen>\` placed once in the root layout, and a hook \`useBurningScreen()\` returning \`burn(update, { origin, duration, colors, embers, emberDuration })\`.

## Motion, in order (2 seconds by default)

1. **Ignite (first ~8%)**: a tiny hole, about 10px, opens at the click point. The rim fades in.
2. **Burn**: the hole grows outward until it covers the screen, in uneven surges rather than at a steady rate: radius \`r0 + (rMax - r0) * q^1.45\` with \`q = p + 0.12 * sin(23p) * p * (1 - p)\`. The edge is never a circle and never the same shape twice: modulate the radius by 7 sine waves around the angle (frequencies 3, 5, 8, 13, 21, 34, 55; weights 0.5, 0.3, 0.24, 0.16, 0.1, 0.06, 0.035; overall amplitude 16%), each drifting at its own speed, faster for the fine ones. Multiply by a slow "spread" term so some sides race ahead while others stall (two low-frequency lobes that grow with progress). Add a few pixels of flickering noise on top so the edge looks ragged. Use the same formula for the clip-path polygon (220 points, one keyframe every ~33ms, linear) and the shader, so they line up.
3. **Edge, with depth** (keep it subtle):
   - Outside, on the old page: a soft scorch haze (~40px falloff), then a thick charred band 10–34px wide whose width and texture shift with noise, a few glinting embers inside the char, and a faint lighter lip right at the edge, like the paper curling.
   - Inside, on the new page: an inner shadow (a light dark falloff plus an uneven soot band ~15–35px) so the page looks freshly burned rather than simply revealed, then a thin flickering glow and a hot core line on the edge. Flames are soft noise tongues rising from the lower part of the hole. Scale the inside effects down while the hole is small.
4. **Ash**: ash rises bottom to top, never falls. While burning, spawn ~260 particles per second along the edge (mostly the upper half, lifting off as a cloud over the old page) and ~520 per second across the whole burned area (favoring the lower half, where the fire is), all rising through the hole. Every flake is an irregular polygon (4–8 points at random radii), mostly 1–3px with a few up to ~5px, spinning and tumbling (squash its height with |cos| over time); about a third start with a hot edge that cools. Heat lifts them (upward acceleration) with a sideways flutter; they fade over 0.7–2 seconds. Colors are gray plus whichever of char or glow contrasts with the page. Cap at about 1100, or one per 600 square pixels on small screens.
5. **Settle**: once the screen is covered, the fire is gone. Only the last ash keeps rising from the lower half for about 1.5 seconds and fades. No flames on the new page, no twinkling stars.

## Color

- Default palette is black, white and gray: char \`#0a0a0a\`, glow \`#ffffff\`, smoke \`#737373\`, ember (rising ash) \`#8a8a8a\`. All overridable.
- The edge must always be visible. Sample the background color under the click on the old page and on the new page. Outside the hole, use whichever of char or glow contrasts with the old page (at least 3:1); inside, whichever contrasts with the new page. So a light page burns with a charred black edge and a dark page burns with a glowing white edge.

## Behavior

- \`origin\` accepts a click event, an element or a point; keyboard clicks (0,0) use the element's center; no origin means screen center.
- \`update\` can be a route change (\`router.push\`) or a state change. If it returns a promise, await it; otherwise resolve when the DOM changes (MutationObserver), with a 2.5s fallback.
- Only one burn at a time. Pointer events never blocked.
- Phones: cap the WebGL resolution at 1x on narrow screens and 1.5x elsewhere.
- Fallbacks: without View Transitions just run the update; without WebGL or with \`prefers-reduced-motion: reduce\`, do a 220ms crossfade.

## Check

- It type-checks and renders with no console errors.
- It looks right going light to dark, dark to light, and in both themes.
- It stays smooth on a phone and respects reduced motion.
- The button I picked burns to the right page, in my colors, and nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you changed from the default because of my answers, and anything you had to do differently, and why.
`;
