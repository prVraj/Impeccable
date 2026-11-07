/** Prompts for Burning-Screen. Both carry the full source.
 * Install: adds the exact component; asks only where it should burn.
 * Blend: asks four short questions, then fits it to the brand through the
 * component's own props and options (the component file stays as written). */

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

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/burning-screen.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Check**. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the effect uses the browser's View Transitions API, WebGL and a 2D canvas.
- JavaScript project? Name the file \`burning-screen.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/burning-screen.tsx\`
- Keep these exports and their names: \`BurningScreen\`, \`useBurningScreen\`, \`BurningScreenProps\`, \`BurnOptions\`, \`BurnColors\`, \`BurnOrigin\`. Other code imports them.
- Imports that start with \`@/\` use the shadcn alias. Rewrite them to this project's alias, and keep the file layout consistent with its conventions (location, naming, formatting).
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

function SignUpButton() {
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

export function burningScreenBlendPrompt(tsSource: string) {
  return `# Burning-Screen, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

When I click a button that changes the page (for example "Create account" going to a welcome page), the current screen burns away from the click point and the next page shows through the burned hole. The full source is at the end of this prompt.

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

The burn is the design. Keep the ragged edge shape and how it grows in surges, the charred band and inner shadow, the flames, and the ash rising upward exactly as in the source. Only my answers above may change it: the button and page, the four colors, the duration and the rising ash. All of them are props or options the component already has, so the component file itself stays as written. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component, the root layout wrapper and the button I picked, and no demo controls (sliders, color pickers or theme toggles) on my site.

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/burning-screen.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Fit it to the brand**. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the effect uses the browser's View Transitions API, WebGL and a 2D canvas.
- JavaScript project? Name the file \`burning-screen.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/burning-screen.tsx\`
- Keep these exports and their names: \`BurningScreen\`, \`useBurningScreen\`, \`BurningScreenProps\`, \`BurnOptions\`, \`BurnColors\`, \`BurnOrigin\`. Other code imports them.
- Imports that start with \`@/\` use the shadcn alias. Rewrite them to this project's alias, and keep the file layout consistent with its conventions (location, naming, formatting).
- Keep \`"use client"\` at the top in Next.js App Router projects (it uses state, effects and browser APIs). In other setups it is harmless.
- Wrap the app once, as high as possible so it survives page changes (in Next.js App Router: \`app/layout.tsx\`, around \`{children}\` inside \`<body>\`).
- Do not enable Next.js's own \`experimental.viewTransition\` flag or React's \`<ViewTransition>\` alongside it; both start their own view transitions.
- Keep the timings, the edge shape (the WOBBLE table and \`baseRadius\`), the shader and the particle numbers exactly as written. They are the design.
- Keep the fallbacks: no View Transitions, no WebGL, or \`prefers-reduced-motion: reduce\` all give a short fade instead of the burn.

## Fit it to the brand

Apply my answers through the component's own props and options:

- **Speed and ash** go on the wrapper in the root layout: \`<BurningScreen duration={1500} embers={false}>\`. Leave out whatever stays at its default.
- **Colors** are read from my theme each time the burn starts, so the burn follows my light and dark modes and any later rebrand. Don't copy hex codes in.
  - \`char\` is used on light pages and \`glow\` on dark pages; the edge picks whichever contrasts with the page. So map a dark brand color to \`char\` and a light or bright one to \`glow\`.
  - If a variable holds bare channels (for example \`222 47% 11%\`), wrap it as \`hsl(...)\` before passing it.

## Use it

Wire it to the button I picked, the way this example does (the variable names are examples; use the ones from my brief):

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";
import { useBurningScreen, type BurnColors } from "@/components/ui/burning-screen";

// Which of my theme variables feeds each part of the burn.
const BRAND = {
  char: "--foreground",
  glow: "--primary",
  smoke: "--muted-foreground",
  ember: "--primary",
} as const;

function brandColors(): Partial<BurnColors> {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(BRAND)
      .map(([key, name]) => [key, css.getPropertyValue(name).trim()])
      .filter(([, value]) => value), // a missing variable keeps the default color
  );
}

function SignUpButton() {
  const router = useRouter();
  const { burn } = useBurningScreen();
  return (
    <button
      onClick={(e) => burn(() => router.push("/welcome"), { origin: e, colors: brandColors() })}
    >
      Create account
    </button>
  );
}
\`\`\`

Other routers work the same way, for example \`burn(() => navigate("/welcome"), { origin: e, colors: brandColors() })\` with React Router.

\`burn(update, options)\` runs \`update\` (a route change or any state change) and burns from the click to the new screen. If \`update\` returns a promise it waits for it; otherwise it waits for the page to change.

## How the burn works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Ignite (first ~8%)**: a tiny hole, about 10px, opens at the click point. The rim fades in.
2. **Burn**: the hole grows outward until it covers the screen, in uneven surges rather than at a steady rate. The edge is never a circle and never the same shape twice: 7 drifting sine waves around the angle, a slow "spread" so some sides race ahead while others stall, and a few pixels of flickering noise so it looks ragged. The clip-path and the shader use the same formula, so they line up.
3. **Edge, with depth** (kept subtle):
   - Outside, on the old page: a soft scorch haze, a thick charred band whose width and texture shift, a few glinting embers inside the char, and a faint lighter lip at the edge, like paper curling.
   - Inside, on the new page: an inner shadow and an uneven soot band so the page looks freshly burned rather than simply revealed, then a thin flickering glow and a hot core line. Flames are soft tongues rising from the lower part of the hole.
4. **Ash**: ash rises bottom to top, never falls. Irregular flakes, mostly 1–3px, spin and tumble as heat lifts them with a sideways flutter; about a third start with a hot edge that cools.
5. **Settle**: once the screen is covered, the fire is gone. Only the last ash keeps rising for about 1.5 seconds and fades.

Color: the default palette is black, white and gray (char \`#0a0a0a\`, glow \`#ffffff\`, smoke \`#737373\`, ember \`#8a8a8a\`). The edge must always be visible: it samples the background on the old and new page and uses whichever of char or glow contrasts (at least 3:1).

## Check

- It type-checks and the page renders with no console errors.
- Clicking the button I picked burns a ragged hole outward from the click point and reveals the right page, at the speed I chose; ash rises (unless I turned it off).
- The edge is visible and in my colors going light to dark, dark to light, and in both themes.
- It stays smooth on a phone.
- With \`prefers-reduced-motion: reduce\`, it is a short fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/burning-screen.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/** Prompts for Agent-Draw. Same shape as Burning-Screen's.
 * Install: adds the exact component; asks only which screen should load with it.
 * Blend: asks four short questions, then fits it through the component's own props. */

const AGENT_DRAW_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/agent-draw.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it only uses the DOM, \`requestAnimationFrame\` and an IntersectionObserver.
- JavaScript project? Name the file \`agent-draw.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/agent-draw.tsx\`
- Keep these exports and their names: \`AgentDraw\`, \`AgentDrawProps\`, \`AGENT_NAMES\`, \`AGENT_COLORS\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the timings, the easing, the shape reading (\`measure\`), the shared cursor pool and the cap of 9 cursors exactly as written. They are the design.
- Keep the fallbacks: \`prefers-reduced-motion: reduce\` gets a plain fade (or a still skeleton while loading), and \`once\` skips the cursors on later visits.`;

const AGENT_DRAW_HOW = `## How the drawing works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Read the layout.** When the wrapped block scrolls into view, it measures what's inside: images, icons, buttons, chips and inputs become one shape each; text becomes one bar per line; cards and panels become an outline. Round things become circles. Only rectangles and circles, like a skeleton.
2. **Hand out shapes.** Shapes are sorted top to bottom. Each goes to the cursor that is free first, so it draws as a wave down the page. One cursor per shape, never two on the same one.
3. **Draw.** A cursor flies to the shape's top-left corner on a slight curve, then drags it out to the bottom-right corner, like a Figma selection: an outline in its own color, a light tint and a "W × H" size tag. When it lets go, the shape settles into a quiet gray skeleton block.
4. **Cursors.** Up to 8 on desktop and 4 on phones, shared by every Agent-Draw on the page, so there are never 10 or more. Each has its own light color and a name tag (Vraj, Sensei, Impeccable, then Agent 4, Agent 5…).
5. **Finish.** After about 3.5 seconds the cursors drift off and fade. If the data has arrived, the real content fades in over the skeleton. If not, the skeleton shimmers until \`loading\` turns false, then the content fades in.

The skeleton gray, outlines and shimmer adapt to the page: lighter on dark pages, darker on light ones. The content stays mounted (just invisible) while it draws, so it's ready the moment the drawing ends.`;

export function agentDrawInstallPrompt(tsSource: string) {
  return `# Agent-Draw

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, on the one screen I choose, and change nothing else.

Instead of a spinner or a skeleton, a few named cursors draw the screen's skeleton live (rectangles and circles), top to bottom, while the data loads. Then the real content fades in.

## Before you build: one question

Look through this project first: its pages, and where data is fetched and a loading state is shown. Then ask me this in one message and wait for my answer:

- **Which screen should load with it?** Suggest the 1–3 screens or sections that fit best (ones that fetch data and currently show a spinner, a skeleton or nothing) and name the loading state you'd pass in. I can pick one of them or name another.

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The drawing is the design. Keep the shapes (only rectangles and circles), the order (top to bottom, one cursor per shape), the cursor names, colors and count, the size tags, the 3.5 second timing and the shimmer exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the wrapper on the screen I picked. If that screen already has a spinner or skeleton for the same loading state, remove it so the two don't show together. Don't add packages, change other files, or restyle anything.
- Don't add demo controls (Replay buttons, sliders or "Slow data" toggles) from the Impeccable website. My users only ever see the drawing.

${AGENT_DRAW_SHARED_BUILD}

## Use it

Wrap the part of the screen that loads and pass its loading state:

\`\`\`tsx
"use client";
import { AgentDraw } from "@/components/ui/agent-draw";

function ProfilePage() {
  const { data, isLoading } = useProfile(); // whatever this project uses

  return (
    <AgentDraw loading={isLoading}>
      <ProfileHeader user={data?.user} />
      <Projects items={data?.projects} />
    </AgentDraw>
  );
}
\`\`\`

- The children must render their normal layout while loading (empty or placeholder text is fine), because the shapes are read from that layout. If a component returns \`null\` while loading, render its layout with placeholders instead.
- Layout classes that were on the wrapped element go in \`className\` on \`<AgentDraw>\`.
- Add \`data-agent-draw\` to an element to draw it as one solid shape (good for image placeholders), or \`data-agent-skip\` to leave it out.
- On a long page, wrap each section separately. Each draws when it scrolls into view, and they share the same cursors.

${AGENT_DRAW_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Loading the screen: named cursors fly in and drag out rectangles and circles top to bottom, one cursor per shape, never more than 8 (4 on a phone). After about 3.5 seconds the real content fades in.
- With slow data (throttle the network), the skeleton shimmers after the drawing and the content fades in when the data arrives.
- It looks right in light and dark mode, and stays smooth on a phone.
- With \`prefers-reduced-motion: reduce\`, there are no cursors, just a fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's wired, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/agent-draw.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function agentDrawBlendPrompt(tsSource: string) {
  return `# Agent-Draw, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes on the one screen I choose, and nothing else changes.

Instead of a spinner or a skeleton, a few named cursors draw the screen's skeleton live (rectangles and circles), top to bottom, while the data loads. Then the real content fades in. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages, where data is fetched and a loading state is shown, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options and mark your suggestion. Ask nothing else:
   1. **Which screen should load with it?** Suggest the 1–3 screens or sections that fit best and the loading state you'd pass in.
   2. **Cursor names?** Keep the default (Vraj, Sensei, Impeccable, then Agent 4, Agent 5…), or suggest names that fit my product (for example my product's name, or my team's first names).
   3. **Cursor colors?** Keep the 10 default light colors, or use light tints of my brand colors. If you suggest brand colors, name which of my color variables you'd use. They must stay light, because the name tags use dark text.
   4. **Speed?** 3.5 seconds (default), quicker (2.5s) or slower (4.5s).
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the screen and loading state, the names, the colors (by my variable names), the speed, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

The drawing is the design. Keep the shapes (only rectangles and circles), the order (top to bottom, one cursor per shape), the cursor count (8 on desktop, 4 on phones, never 10 or more), the size tags, the drag motion and the shimmer exactly as in the source. Only my answers above may change it: the screen, the names, the colors and the duration. All of them are props the component already has, so the component file itself stays as written. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the screen I picked (where you may remove an old spinner or skeleton for the same loading state), and no demo controls (Replay buttons, sliders or toggles) on my site.

${AGENT_DRAW_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { AgentDraw } from "@/components/ui/agent-draw";

// From my brief. Leave out any prop that stays at its default.
const NAMES = ["Atlas", "Nova", "Pixel"];
const COLORS = ["var(--brand-100)", "var(--accent-100)", "var(--info-100)"];

function ProfilePage() {
  const { data, isLoading } = useProfile(); // whatever this project uses

  return (
    <AgentDraw loading={isLoading} names={NAMES} colors={COLORS} duration={3500}>
      <ProfileHeader user={data?.user} />
      <Projects items={data?.projects} />
    </AgentDraw>
  );
}
\`\`\`

- Pass colors as my CSS variables (\`var(--name)\`) or Tailwind color variables, not hex codes, so they follow my theme. If a variable holds bare channels (for example \`222 47% 11%\`), wrap it as \`hsl(...)\`.
- Fewer names or colors than cursors is fine: names fall back to "Agent 4", "Agent 5"…, and colors repeat.
- The children must render their normal layout while loading (empty or placeholder text is fine), because the shapes are read from that layout.
- Layout classes that were on the wrapped element go in \`className\` on \`<AgentDraw>\`. Add \`data-agent-draw\` to draw an element as one solid shape, or \`data-agent-skip\` to leave it out. On a long page, wrap each section separately.

${AGENT_DRAW_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Loading the screen I picked: cursors with my names and colors drag out rectangles and circles top to bottom, one cursor per shape, never more than 8 (4 on a phone), at the speed I chose. Then the real content fades in.
- With slow data (throttle the network), the skeleton shimmers after the drawing and the content fades in when the data arrives.
- Name tags are readable and the cursors are visible in light and dark mode. It stays smooth on a phone.
- With \`prefers-reduced-motion: reduce\`, there are no cursors, just a fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/agent-draw.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
