/** Prompts for Burning-Screen. Both carry the full source.
 * Install: adds the exact component; asks only where it should burn.
 * Blend: asks four short questions, then fits it to the brand through the
 * component's own props and options (the component file stays as written). */

export function burningScreenInstallPrompt(tsSource: string) {
  return `# Burning-Screen

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

When I click a button that changes the page (for example "Create account" going to a welcome page), the current screen burns away from the click point and the next page shows through the burned hole.

## Before you build: one question

Look through this project first: its router, its pages, and the buttons that move the user to another page. Then ask me this in one message and wait for my answer:

- **Where should it burn?** Suggest the 1–3 buttons in my code that fit best (for example a sign-up or "Get started" button) and the page each one goes to. I can pick one of them or name another.
  *Why: the burn is the one moment people remember, so it belongs on the step that matters most, like sign-up.*

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
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it burn?** Suggest the 1–3 buttons that fit best and the page each goes to.
      *Why: the burn is the one moment people remember, so it belongs on the step that matters most, like sign-up.*
   2. **Colors?** Keep the black, white and gray default, or match my brand. If you suggest brand colors, name which of my existing color variables you'd use for the char, the glow, the smoke and the ash. If you found no theme, offer the default or let me paste 1–3 colors.
      *Why: the burning edge is the only color on screen, so it decides whether the burn feels like part of my brand.*
   3. **Speed?** 2 seconds (default), quicker (1.5s) or slower (2.5s).
      *Why: it sets how long people wait for the next page. Quicker suits busy flows; slower suits a big moment.*
   4. **Rising ash after the burn?** Keep it (default) or turn it off.
      *Why: the ash keeps rising over the new page for about 1.5 seconds. Turn it off if that page needs attention right away.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: where it's wired, the colors (by my variable names), the speed, ash on or off, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- Where it burns: the button I picked and the page it goes to.
- The colors: \`char\`, \`glow\`, \`smoke\` and \`ember\` in the \`colors\` option, read from my theme variables.
- The speed: \`duration\` on \`<BurningScreen>\`.
- The rising ash: \`embers\` on \`<BurningScreen>\`.

**Locked**

- The burn is the design. The ragged edge shape and how it grows in surges, the charred band and inner shadow, the flames, and the ash rising upward stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

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
  *Why: it only makes sense where data really loads. On a screen that is already instant, it just delays the content.*

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
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which screen should load with it?** Suggest the 1–3 screens or sections that fit best and the loading state you'd pass in.
      *Why: it only makes sense where data really loads. On a screen that is already instant, it just delays the content.*
   2. **Cursor names?** Keep the default (Vraj, Sensei, Impeccable, then Agent 4, Agent 5…), or suggest names that fit my product (for example my product's name, or my team's first names).
      *Why: the name tags are the most visible words while it loads, so they can carry my product's personality.*
   3. **Cursor colors?** Keep the 10 default light colors, or use light tints of my brand colors. If you suggest brand colors, name which of my color variables you'd use. They must stay light, because the name tags use dark text.
      *Why: the cursors are the only color while it draws, so they decide whether it feels like my brand.*
   4. **Speed?** 3.5 seconds (default), quicker (2.5s) or slower (4.5s).
      *Why: it is the shortest time before the content shows, even when the data is already there.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the screen and loading state, the names, the colors (by my variable names), the speed, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- The screen: which part of it is wrapped, and the \`loading\` state passed in.
- The cursor names: \`names\`.
- The cursor colors: \`colors\`, as light tints from my theme variables.
- The speed: \`duration\`.

**Locked**

- The drawing is the design. The shapes (only rectangles and circles), the order (top to bottom, one cursor per shape), the cursor count (8 on desktop, 4 on phones, never 10 or more), the size tags, the drag motion and the shimmer stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

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

/** Prompts for brain.txt. Same shape as the others.
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const BRAIN_TXT_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/brain-txt.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it only uses SVG, pointer events and \`requestAnimationFrame\`.
- JavaScript project? Name the file \`brain-txt.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/brain-txt.tsx\`
- Keep these exports and their names: \`BrainTxt\`, \`BrainTxtProps\`, \`Thought\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top (\`MAX_LINKS\`, \`SPRING\`, \`ANCHOR\`, \`DAMP\`, \`ENTER_MS\`, \`FADE\`), the layout (\`homes\`) and the linking rule (\`linkDots\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` nothing wobbles or grows in, and the loop stops whenever the web is still.`;

const BRAIN_TXT_HOW = `## How the map works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Place the dots.** The dots sit on a loose sunflower spiral around the brain, with a little seeded jitter so it never looks like a pattern. Same \`seed\`, same map. Dots differ slightly in size and gray.
2. **Link them.** All dot pairs are sorted by distance, shortest first. A link is added only if both dots have fewer than 3 links and it doesn't cross a link already drawn. So each dot links to at most 3 nearby dots (never more), and lines don't cross.
3. **Link the brain.** The dots closest to the brain get a direct line to it, unless \`brainLinks\` is false. Each thought can force it on or off with \`brain: true\` or \`brain: false\`.
4. **Enter.** On first view the dots burst out of the brain and grow to size in under a second.
5. **Hover and click.** Hovering a dot draws it a little bigger and lights it, its links and its neighbours in the accent color; everything else fades to about 14%. Hovering the brain lights all of its links. Clicking a dot opens a small card beside it with the thought, an optional tag and a close button. Escape, the close button or a click on empty space closes it.
6. **Drag.** Dragging empty space moves the whole web; the dots lag a touch and wobble into place. Dragging a dot or the brain pulls it, and its links pull the neighbours along like springs. On release, everything springs back home. Keyboard: Tab to a dot, Enter opens it.

Lines and dots take their color from the text color around the map, so they follow light and dark mode on their own. The card is white in light mode and near-black in dark mode.`;

export function brainTxtInstallPrompt(tsSource: string) {
  return `# brain.txt

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A brain sits in the middle of a web of dots, and each dot holds one thought. Hover a dot to light up its links, click it to read it, and drag anything to play with the web. Every dot links to at most 3 nearby dots.

## Before you build: one question

Look through this project first: its pages and sections. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 places that fit best (for example an about page, a "thoughts" or notes page, or a section of the home page). I can pick one of them or name another.
  *Why: it needs room (about 420px tall) and a reason to explore, so it fits a page people visit to get to know me.*

Ask nothing else. If I say *skip*, use the best suggestion. Use the thoughts from the example below as placeholders and tell me where to write my own.

## Keep it as it is

The motion is the design. Keep the brain in the middle, the 3-link limit, the spring feel, the hover highlight, the card and the colors exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo controls (sliders, toggles or "shuffle" buttons) from the Impeccable website.

${BRAIN_TXT_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { BrainTxt, type Thought } from "@/components/ui/brain-txt";

const THOUGHTS: Thought[] = [
  { text: "Boredom is the waiting room for ideas." },
  { text: "If it's worth thinking twice, it's worth writing once.", tag: "writing" },
  { text: "Copy first, then make it yours.", featured: true },
  // 8 to 20 thoughts look best.
];

export function Thoughts() {
  return <BrainTxt thoughts={THOUGHTS} />;
}
\`\`\`

- Put the thoughts in a plain array next to where it's used (or wherever this project keeps content). Each is \`{ text, tag?, featured?, brain? }\`.
- Give it room: it's 420px tall by default (\`height\` prop) and fills the width of its parent.

${BRAIN_TXT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The dots burst out of the brain. No dot has more than 3 lines to other dots, and lines don't cross.
- Hovering a dot lights it and its neighbours; clicking opens its card next to it, inside the box. Escape closes it.
- Dragging empty space moves the web; dragging a dot or the brain pulls its neighbours; everything springs back.
- It looks right in light and dark mode, and works with a finger on a phone.
- With \`prefers-reduced-motion: reduce\`, nothing wobbles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/brain-txt.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function brainTxtBlendPrompt(tsSource: string) {
  return `# brain.txt, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A brain sits in the middle of a web of dots, and each dot holds one thought. Hover a dot to light up its links, click it to read it, and drag anything to play with the web. Every dot links to at most 3 nearby dots. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and sections, any existing notes or quotes content, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 places that fit best (an about page, a thoughts page, a home section).
      *Why: it needs room (about 420px tall) and a reason to explore, so it fits a page people visit to get to know me.*
   2. **Which thoughts?** Use content you found in the project (name it), or I paste my own, or start with placeholders I'll replace.
      *Why: the thoughts are the content. Real ones make it worth exploring; placeholders make it a toy.*
   3. **What sits in the middle?** The 🧠 emoji (default), another emoji, or my logo or avatar (name the file you'd use).
      *Why: the center is the first thing people see, and it stands for me or my product.*
   4. **Accent color?** The default blue, or one of my color variables (name it). It colors lit lines, featured dots and tags, so it must be readable in light and dark mode.
      *Why: it is the only color in the map, so it decides whether the map feels like my brand.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the thoughts, the center, the accent (by my variable name), and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- Where it goes: the page or section I picked.
- The thoughts: \`thoughts\`.
- The center: \`center\`.
- The accent color: \`accent\`, as one of my theme variables.
- The help text: \`hint\`, only to match my voice.

**Locked**

- The motion is the design. The layout, the 3-link limit, the spring feel, the hover highlight, the fade and the card shape stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, and no demo controls on my site.

${BRAIN_TXT_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { BrainTxt, type Thought } from "@/components/ui/brain-txt";

// From my brief. Leave out any prop that stays at its default.
const THOUGHTS: Thought[] = [
  { text: "…", tag: "…" },
];

export function Thoughts() {
  return (
    <BrainTxt
      thoughts={THOUGHTS}
      accent="var(--primary)"
      center={<img src="/logo.svg" alt="" width={26} height={26} />}
    />
  );
}
\`\`\`

- Pass the accent as my CSS variable (\`var(--name)\`) or Tailwind color variable, not a hex code, so it follows my theme. If a variable holds bare channels (for example \`222 47% 11%\`), wrap it as \`hsl(...)\`.
- The map takes its text color from its parent, so place it where my normal text color applies. Use \`hint\` to reword the help text in my voice, or \`null\` to hide it.

${BRAIN_TXT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My thoughts, center and accent show. No dot has more than 3 lines to other dots, and lines don't cross.
- Hovering lights a dot and its neighbours in my accent; clicking opens its card inside the box; dragging pulls the web and it springs back.
- It looks right in light and dark mode, and works with a finger on a phone.
- With \`prefers-reduced-motion: reduce\`, nothing wobbles.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/brain-txt.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/** Prompts for Scratch-me. Same shape as the others.
 * Install: adds the exact component; asks only where it goes and which code it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const SCRATCH_ME_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/scratch-me.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it only uses two canvases, pointer events and \`requestAnimationFrame\`.
- JavaScript project? Name the file \`scratch-me.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/scratch-me.tsx\`
- Keep these exports and their names: \`ScratchMe\`, \`ScratchMeProps\`. The \`react-dom\` import (for the "Code copied" pop) comes with React.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the foil painting (\`paintFoil\`), the brush, the shavings, the progress check and the tuning values at the top (\`SAMPLE_STEP\`, \`CLEAR_MS\`, \`GRAVITY\`, \`MAX_SHAVINGS\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` there are no shavings and the foil just fades; Enter or Space on the focused card reveals it; if the Clipboard API is blocked, it falls back to a hidden textarea copy.`;

const SCRATCH_ME_HOW = `## How the scratch works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Pill and foil.** The code sits in a soft gray rounded pill with a copy icon on the right, like a code field. A canvas over the pill is painted like a scratch-off: flat metallic gray with fine grain, a soft diagonal sheen, a dashed guide and "SCRATCH HERE". Darker foil in dark mode.
2. **Brush.** On a mouse, a thin ring follows the pointer instead of the cursor. Pressing and moving erases the foil along the path with a round brush (26px), with a few tiny bites at the edge so it looks ragged, not like a clean stroke.
3. **Shavings.** Moving fast throws more of them. Each is a tiny gray flake that spins, falls with gravity and lands just below the hint line, a little unevenly, so they pile up. After the reveal the pile fades away.
4. **Progress.** While scratching, the foil is checked every 120ms on a grid (one pixel every 6px). The line under the card shows the percentage toward the goal.
5. **Reveal.** When you let go with at least half the foil gone (\`threshold\`, 0.5), the rest of the foil fades and blurs away in about half a second, the code settles to full size and it is copied to the clipboard. Let go before half and nothing happens: keep scratching.
6. **Copied.** On every copy the copy icon blurs and shrinks away while a check draws itself in its place, the line under the code says "Copied", and a small dark pill saying "Code copied" pops up from the bottom center of the screen, stays about 1.5 seconds and drops away. After 2 seconds the check animates back into the copy icon, so it's clear the code can be copied again.
7. **Copy again.** Clicking (or Enter on) the revealed code copies it again. That is the only way to copy it: nothing in the component can be selected as text, and copy shortcuts on it do nothing.

The pill, foil, text and shavings read the text color around the component, so they follow light and dark mode on their own. The code is in the page, so it is not a secret.`;

export function scratchMeInstallPrompt(tsSource: string) {
  return `# Scratch-me

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A promo code hidden under a scratch-off foil. Scratch at least half, let go, and the rest flakes away, the code is copied to the clipboard and the card says so.

## Before you build: one question

Look through this project first: its pages, upgrade or pricing screens, and any promo or discount codes it already uses. Then ask me this in one message and wait for my answer:

- **Where should it go, and which code should it show?** Suggest the 1–3 places that fit best (for example the upgrade screen, the pricing page or an onboarding step) and the code you found, if any. I can pick one of them or name another, and give the code.
  *Why: a reward works best at the moment someone is deciding, like upgrading or checking out, and the code is copied straight to their clipboard, so it must be real.*

Ask nothing else. If I say *skip*, use the best suggestion and a placeholder code I can find easily.

## Keep it as it is

The scratch is the design. Keep the code pill with its copy icon, the foil look, the brush ring, the falling shavings, the 50% rule and the copy on reveal exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo controls ("Scratch again" buttons or sliders) from the Impeccable website.

${SCRATCH_ME_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { ScratchMe } from "@/components/ui/scratch-me";

export function UpgradeOffer() {
  return <ScratchMe code="SAVE20" />;
}
\`\`\`

- Put the code where this project keeps its other promo codes or settings, if it has such a place. Otherwise write it inline.
- Wire \`onReveal\` only if the project already tracks events, to record the reveal the same way.

${SCRATCH_ME_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Scratching erases the foil under the ring and shavings fall and pile at the bottom.
- Letting go under half does nothing; over half, the rest of the foil flakes away and the code is in the clipboard (paste it to check). "Code copied" pops up at the bottom center, and after 2 seconds the check turns back into the copy icon.
- Scratching never selects the code or any text, and the code can't be copied by selecting it.
- It works with a finger on a phone without scrolling the page while scratching, and looks right in light and dark mode.
- With \`prefers-reduced-motion: reduce\`, there are no shavings.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/scratch-me.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function scratchMeBlendPrompt(tsSource: string) {
  return `# Scratch-me, fitted to your product

A 1-file React component from Impeccable. Add it to this project and fit it to the product like a missing puzzle piece: it should look like it was always part of it. It goes in the one place I choose, and nothing else changes.

A promo code hidden under a scratch-off foil. Scratch at least half, let go, and the rest flakes away, the code is copied to the clipboard and the card says so. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages, upgrade or pricing screens, any promo codes it already uses, the way it writes short UI text, and its theme (light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 places that fit best (upgrade screen, pricing page, onboarding step, a thank-you page).
      *Why: a reward works best at the moment someone is deciding, like upgrading or checking out.*
   2. **Which code?** The code you found (name where), or I give one.
      *Why: the code is copied straight to the clipboard, so it must be a real, working code.*
   3. **The words?** Suggest an optional label above the code (default none), the hint below it (default "Scratch to reveal your code."), the copied message (default "Copied. Paste it at checkout.") and the pop text (default "Code copied"), written in my product's voice.
      *Why: these are the only words on the card, so they should sound like my product, not like Impeccable.*
   4. **How much to scratch?** 40% (easy), 50% (default) or 60% (more play).
      *Why: it sets how much play it takes before the code shows. Too much starts to feel like work.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the code, the three lines of text, the amount, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the component already has, so the component file itself stays as written.

**You may change**

- Where it goes: the place I picked.
- The code: \`code\`.
- The words: \`label\`, \`hint\`, \`copiedText\` and \`toast\`.
- How much to scratch: \`threshold\`.

**Locked**

- The scratch is the design. The code pill with its copy icon, the foil, the brush ring, the shavings, the reveal and the copy on reveal stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, and no demo controls on my site.

${SCRATCH_ME_SHARED_BUILD}

## Fit it to the product

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { ScratchMe } from "@/components/ui/scratch-me";

// From my brief. Leave out any prop that stays at its default.
export function UpgradeOffer() {
  return (
    <ScratchMe
      code="SAVE20"
      label="A little thank-you: 20% off Pro" // optional
      hint="Scratch to see your code."
      copiedText="Copied. Paste it when you upgrade."
      threshold={0.5}
    />
  );
}
\`\`\`

- The card takes its text color from its parent, so place it where my normal text color applies. The pill is at least 260px wide and grows with the code; place it with \`className\` or \`style\`.
- Wire \`onReveal\` only if the project already tracks events.

${SCRATCH_ME_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My code and text show. Scratching erases the foil and shavings fall and pile at the bottom.
- Letting go before my threshold does nothing; after it, the foil flakes away and the code is in the clipboard (paste it to check). "Code copied" pops up at the bottom center, and after 2 seconds the check turns back into the copy icon.
- Scratching never selects the code or any text, and the code can't be copied by selecting it.
- It works with a finger on a phone without scrolling the page while scratching, and looks right in light and dark mode.
- With \`prefers-reduced-motion: reduce\`, there are no shavings.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/scratch-me.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/* ---------- Password-Strength ----------
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PASSWORD_STRENGTH_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/password-strength.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the eye icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`password-strength.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/password-strength.tsx\`
- Keep these exports and their names: \`PasswordStrength\`, \`PasswordStrengthProps\`, \`PasswordLevel\`, \`checkPassword\`, \`passwordLevel\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the checks (\`checkPassword\`, \`passwordLevel\`), the CSS block and the tuning values at the top (\`EASE\`, \`BAR_MS\`, \`BAR_STAGGER\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the bars, eye and boxes only fade; the eye keeps focus and the cursor in the field; screen readers hear the level and which checkpoints are done.`;

const PASSWORD_STRENGTH_HOW = `## How it works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Field.** "Password" above a 52px rounded field with a hairline border. While hidden, the dots are soft gray and slightly spaced. The eye on the right is closed with lashes (hidden) or open (shown).
2. **Eye.** Clicking it swaps the icons: the one leaving squashes flat and blurs out, the one coming in opens up from a thin line, in about a quarter second. Focus, the cursor position and the phone keyboard stay in the field.
3. **Checkpoints.** Three lines under the meter: at least 12 characters; at least 2 upper and 2 lower case letters; at least one number and one special character. When one is met its box fills, pops from 82% to full size with a tiny overshoot and the check mark draws itself.
4. **Levels.** Empty: no bars, no name. 0 checkpoints: no bars, "No". 1: one red bar, "AI". 2: two amber bars, "AI agent". 3: three green bars, "Human". Bars fill left to right and empty right to left, 45ms apart, each in 380ms with a fast start and soft landing. The name slides up 4px out of a light blur.
5. **Human.** When the password turns Human, a soft white shine runs once across the three bars.

Borders, tracks and gray text are mixed from the text color around the field, so it follows light and dark mode on its own.`;

export function passwordStrengthInstallPrompt(tsSource: string) {
  return `# Password-Strength

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A password field with a show/hide eye that rates the password as No, AI, AI agent or Human, from three checkpoints.

## Before you build: one question

Look through this project first: its sign-up, reset-password and account settings screens, and the password fields it already has. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 password fields that fit best (for example the sign-up form or the change-password screen). I can pick one of them or name another.
  *Why: it replaces one password input, so it must sit where people make a new password, not where they log in.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The look and the motion are the design. Keep the field, the eye swap, the three-bar meter with AI / AI agent / Human, the three checkpoints and their animations exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing password input, keep that input's \`name\`, form wiring and validation. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the prefilled example password and the "Are you human?" screen title.

${PASSWORD_STRENGTH_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PasswordStrength } from "@/components/ui/password-strength";

export function SignUpPassword() {
  return <PasswordStrength name="password" />;
}
\`\`\`

- If the form already holds the password in state, pass \`value\` and \`onChange\`.
- Wire \`onLevelChange\` only if the form already blocks weak passwords, to keep that rule working.
- It takes its text color from its parent, so place it where my normal text color applies. It is full width up to 480px and needs about 230px of height.

${PASSWORD_STRENGTH_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Typing fills the bars: "No" with no bars (0 checkpoints), one red "AI" (1), two amber "AI agent" (2), three green "Human" (3) with one shine across the bars. Each checkpoint box ticks the moment it is met. The eye shows and hides the password without losing the cursor position, and the form still submits the password as before.
- It looks right in light and dark mode (check both).
- It works with a finger on a phone: the eye keeps the keyboard open and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the bars, eye and boxes only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/password-strength.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function passwordStrengthBlendPrompt(tsSource: string) {
  return `# Password-Strength, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A password field with a show/hide eye that rates the password as No, AI, AI agent or Human, from three checkpoints. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its sign-up and password screens, the password rules it already has, the way it writes short UI text, its theme colors and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 password fields that fit best (sign-up form, change-password screen, invite acceptance).
      *Why: it replaces one password input, so it belongs where people make a new password, not where they log in.*
   2. **The words?** Keep "No", "AI", "AI agent", "Human" (suggested), or level names in my product's voice. Same for the label above the field and the three checkpoint lines; the checks themselves stay.
      *Why: the level name is the one line people read, so it should sound like the rest of my product.*
   3. **The colors?** Keep red, amber, green (suggested if my theme has no status colors), or name which of my existing color variables you'd use for the three levels (for example my danger, warning and success colors).
      *Why: the bars are the only color in the field, so they decide whether it looks like part of my brand.*
   4. **What does each level allow?** Just show it (suggested), or keep the submit button disabled until Human.
      *Why: a meter alone guides people; blocking the button enforces it, which some products want and some don't.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the words, the colors, the rule, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered.
- The words: \`label\`, \`levels\` and \`rules\`.
- The colors: \`colors\`, as my theme's CSS variables.
- The submit rule: \`onLevelChange\`, wired to my submit button only if I asked for it.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The look and the motion are the design. The field, the eye swap, the three-bar meter and the three checkpoints, with their checks, sizes and animations, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked (plus the submit button, only if I asked for the rule), no restyling, and none of the website's demo parts (the prefilled example password and the "Are you human?" screen title).

${PASSWORD_STRENGTH_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { useState } from "react";
import { PasswordStrength, type PasswordLevel } from "@/components/ui/password-strength";

// From my brief. Leave out any prop that stays at its default.
export function SignUpPassword() {
  const [level, setLevel] = useState<PasswordLevel>(0);
  return (
    <>
      <PasswordStrength
        name="password"
        colors={["var(--danger)", "var(--warning)", "var(--success)"]} // my theme's variables, not hex
        onLevelChange={setLevel}
      />
      <button type="submit" disabled={level < 3}>Create account</button>
    </>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values.
- The field takes its text color from its parent, so place it where my normal text color applies. It is full width up to 480px; place it with \`className\` or \`style\`.

${PASSWORD_STRENGTH_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My words and colors show. Typing fills the bars level by level (no bars at 0 checkpoints, then 1, 2, 3), each checkpoint box ticks the moment it is met, and the last level gets one shine. The eye shows and hides the password without losing the cursor position, the form still submits the password as before, and my submit rule works if I asked for one.
- It looks right in light and dark mode (check both), with my colors readable in each.
- It works with a finger on a phone: the eye keeps the keyboard open and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the bars, eye and boxes only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/password-strength.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/* ---------- Framed-Upload ----------
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const FRAMED_UPLOAD_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/framed-upload.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the icons are inline SVG and every animation is CSS or the browser's own \`element.animate\`.
- JavaScript project? Name the file \`framed-upload.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/framed-upload.tsx\`
- Keep these exports and their names: \`FramedUpload\`, \`FramedUploadProps\`, \`FramedUploadLabels\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the CSS block, the \`SHADOW\` and \`WOOD\` values and the tuning values at the top (\`EASE\`, \`SETTLE_MS\`, \`HANG_MS\`, \`LIFT_PX\`, \`NOTE_MS\`, \`MOULDING\`, \`MAT\`, \`RESHAPE_MS\`, \`MIN_RATIO\`, \`MAX_RATIO\`) exactly as written. They are the design.
- Keep the corner rule: every inner corner is the corner outside it minus the padding between them (mat = frame radius - moulding; picture = mat radius - lip - mat), never below 0. Don't set inner radii by hand.
- Keep \`DEFAULT_RADIUS\` and \`DEFAULT_STROKE\` as token references (\`var(--radius-lg, 0.5rem)\` and \`var(--stroke-2, 2px)\`). Never swap them for fixed pixel values: the frame must follow the design tokens.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the image only fades in and the frame doesn't lift or swing; the empty frame is a real button (Tab, Enter, Space); Replace and Remove show on hover, on keyboard focus, and always on touch screens; the picked file stays in the browser (an object URL, freed when replaced or removed).`;

const FRAMED_UPLOAD_HOW = `## How the frame works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Frame.** Three layers, like a real picture frame: a moulding (5.5% of the width, white on a light page, graphite on a dark one, with a light top edge and a darker bottom edge so it looks bevelled), then a thin lip and a slim mat (4% of the width, a shade off the moulding, shaded along its top where the moulding overhangs it), then the picture window. Empty, the window is portrait (4 / 5). With a picture, it takes the picture's own shape (width / height, kept between 1:3 and 3:1), so a wide photo gets a wide frame and nothing is cropped; the frame eases into the new shape in 420ms. The frame's corners come from the \`--radius-lg\` token and the lip from \`--stroke-2\`; 8px and 2px are only fallbacks for a project without them. Inner corners follow one rule: inner radius = outer radius - the padding between them, never below 0, so at normal sizes the mat and picture corners are square, like a real frame.
2. **Shadow.** Four layered shadows: a tight contact shadow at the edge plus a wide, soft one that falls downward, like a frame hanging on a wall. In dark mode the same shadows are deeper so they still read on a dark page. The picture window has its own inner shadow, darkest along the top, so the picture sits recessed behind the mat.
3. **Empty.** A faint tint, an upload icon, "Drop an image here" and a small line with the size limit. The whole frame is one button that opens the file picker.
4. **Drag over.** The frame lifts 3px, its shadow grows, the icon rises and the text says "Let go to frame it".
5. **Landing.** The picture comes in from a 6% zoom and a light blur to sharp in 560ms, and the frame gives one small swing (a few pixels and half a degree) in 620ms, like it was just hung.
6. **Filled.** Replace and Remove sit in a dark glass pill in the bottom right corner. A wrong file type or a file over the limit shows a short note at the bottom of the frame for 3 seconds and changes nothing else.

Light or dark is read from the text color around the frame, so it switches with the theme with no setup.`;

export function framedUploadInstallPrompt(tsSource: string) {
  return `# Framed-Upload

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall.

## Before you build: one question

Look through this project first: its forms and settings screens that take an image (cover, avatar, product photo, portfolio), and any file inputs it already has. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 image fields that fit best (for example a cover image on a profile form, or a project photo in a portfolio editor). I can pick one of them or name another.
  *Why: it replaces one image field, and the frame reads best where a picture is the main thing, not a tiny icon.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The frame is the design: a bevelled moulding, a mat with a thin lip, a recessed picture window with an inner shadow, corners and lip from the design tokens, the layered wall shadow, and the way a picture settles into the frame with one small swing. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing file input, keep that input's \`name\` and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the sample violet poster and the second, empty frame next to it.

${FRAMED_UPLOAD_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { useState } from "react";
import { FramedUpload } from "@/components/ui/framed-upload";

export function CoverField() {
  const [cover, setCover] = useState<File | null>(null); // the picked file, or null
  return <FramedUpload name="cover" onChange={setCover} />;
}
\`\`\`

- If the form already uploads the file somewhere, keep that code and feed it from \`onChange\` (a \`File\`, or \`null\` after Remove), or let the form send it through \`name\`.
- If there is a current image (an existing cover), pass its URL as \`defaultSrc\`.
- It reads light or dark mode from its parent's text color, so place it where my normal text color applies. It is full width up to 320px; size it with \`className\` or \`style\`.

${FRAMED_UPLOAD_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Clicking the empty frame opens the file picker; dropping or picking an image fills the frame, the frame takes the picture's shape (a landscape photo gets a landscape frame, nothing cropped), the picture comes in from a light blur in about half a second and the frame swings once. Replace and Remove work. A file that isn't an image, or is over 10 MB, shows a note for 3 seconds and nothing else changes. The form still gets the file.
- It looks right in light and dark mode (check both): the frame is white with a light mat on a light page and graphite on a dark page, and the wall shadow and the window's inner shadow show on both.
- It works with a finger on a phone: tapping opens the photo picker and Replace and Remove are always visible.
- With \`prefers-reduced-motion: reduce\`, the picture only fades in and the frame doesn't lift or swing.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/framed-upload.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function framedUploadBlendPrompt(tsSource: string) {
  return `# Framed-Upload, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: the forms and screens that take an image, the shape of the images it already shows (covers, avatars, product photos), the way it writes short UI text, and its design tokens: radius and border-width tokens, color variables, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 image fields that fit best (cover image, portfolio photo, product shot).
      *Why: it replaces one image field, and the frame reads best where a picture is the main thing.*
   2. **The frame shape?** Let the frame take each picture's own shape (suggested), or keep one fixed shape and crop to it (portrait 4 / 5, square 1 / 1 or landscape 3 / 2; suggest the one this field's images already use, for example square for avatars). Also the empty frame's shape.
      *Why: fitting the picture crops nothing; a fixed shape keeps a grid of frames even, which some layouts need.*
   3. **The frame look?** Keep \`--radius-lg\` and \`--stroke-2\` with a white frame and mat (graphite in dark mode) (suggested if my project has those tokens or none), or name which of my existing radius, border-width and color tokens you'd use for the corners, the lip, the frame and the mat. Also: with the mat (suggested) or without it.
      *Why: the frame is the whole look, so its corners, lip and colors should come from the same tokens as the rest of my product, never from fixed numbers.*
   4. **The words?** Keep "Drop an image here" and the size line (suggested), or text in my product's voice for the empty frame and the error notes. Also the size limit: keep 10 MB, or match my upload limit.
      *Why: the empty frame is the only text people read before they pick, so it should sound like my product.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the shape, the tokens, the words and limit, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered, and \`name\`, \`onChange\` and \`defaultSrc\` to wire it to my form.
- The shape: \`fitToImage\` and \`aspectRatio\`.
- The frame look: \`radius\`, \`stroke\`, \`frameColor\`, \`matColor\` as my design tokens, and \`mat\`.
- The words and limit: \`title\`, \`hint\`, \`labels\` and \`maxSize\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The frame is the design: a bevelled moulding, a mat with a thin lip, a recessed picture window with an inner shadow, the layered wall shadow, and a picture that settles in from a light blur while the frame swings once. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the sample violet poster and the second, empty frame next to it).

${FRAMED_UPLOAD_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { FramedUpload } from "@/components/ui/framed-upload";

// From my brief. Leave out any prop that stays at its default.
export function CoverField() {
  return (
    <FramedUpload
      name="cover"
      fitToImage={false} // a fixed shape, from my brief
      aspectRatio="1 / 1"
      radius="var(--radius-md)" // my tokens, not pixel values
      stroke="var(--border-width-2)"
      frameColor="var(--card)"
      matColor="var(--muted)"
      title="Add a cover"
      maxSize={5 * 1024 * 1024}
    />
  );
}
\`\`\`

- Read the corners, stroke and color from my design tokens (CSS variables, or the variables behind my Tailwind or shadcn theme). Never write a pixel value or hex code for them. If my project has no radius or stroke token, leave \`radius\` and \`stroke\` out: the defaults read \`--radius-lg\` and \`--stroke-2\` and only fall back to 8px and 2px.
- If a color variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Without \`frameColor\` and \`matColor\` the frame is white on a light page and graphite on a dark one, read from its parent's text color. It is full width up to 320px; size it with \`className\` or \`style\`.

${FRAMED_UPLOAD_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My shape, tokens and words show. Clicking the empty frame opens the file picker; dropping or picking an image fills the frame (taking the picture's shape, unless I chose a fixed one), the picture comes in from a light blur in about half a second and the frame swings once. Replace and Remove work. A wrong file, or one over my limit, shows my note for 3 seconds and nothing else changes. The form still gets the file.
- It looks right in light and dark mode (check both): my frame and mat colors, the wall shadow and the window's inner shadow read on both.
- It works with a finger on a phone: tapping opens the photo picker and Replace and Remove are always visible.
- With \`prefers-reduced-motion: reduce\`, the picture only fades in and the frame doesn't lift or swing.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/framed-upload.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/* ---------- Hex-Login ----------
 * A section (a whole login page).
 * Install: adds the exact page; asks only which route and which logo.
 * Blend: asks four short questions, then fits it through the section's own props. */

const HEX_LOGIN_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/hex-login.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the rings and icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`hex-login.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/hex-login.tsx\`
- Keep these exports and their names: \`HexLogin\`, \`HexLoginProps\`, \`HexLoginLabels\`, \`isEmail\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A Next.js page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`EASE\`, \`TOAST_MS\`, \`RINGS\`, \`RING_BOX\`) exactly as written. They are the design: four rings of 64, 110, 165 and 232px turned -4, -8, -15 and -20 degrees, a 380px column, a 44px Google button, a 40px field and a 36px Continue button, with 40, 40, 32, 32, 16 and 20px between them.
- Keep the colors as theme variables: text and fills read \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), the error reads \`--destructive\`, and the field's corners read \`--radius-lg\`. Never swap them for fixed hex or pixel values.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the rings only fade in and nothing slides or turns; Enter in the field submits; an error moves focus back to the field and is read out; the field has a hidden label for screen readers and \`autocomplete="email"\`; the field text is 16px so phones don't zoom in.`;

const HEX_LOGIN_HOW = `## How the page works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Layout.** One centred 380px column, centred top to bottom in a page at least as tall as the screen: logo, title, Google button, the OR line, the email field, Continue, then the small print. On a narrow screen the title drops from 30px to 24px and the rings shrink to 90%, measured on the section's own width (a container query), not the window.
2. **Rings.** Four thin hexagons around the logo, each a little bigger and turned a little further, like a slow spiral. They take 10% of the text color and fade out toward the bottom (a mask from 40% to 77% of their height), so they never cross the buttons. On load they turn into place from 14 degrees off, one after another, 70ms apart, in one second.
3. **Continue.** Nothing is sent until the email passes a simple check (something@something.something, no spaces, trimmed). Empty: "Enter your email address to continue." Not an email: "That doesn't look like an email. Try name@example.com." The message slides open under the field, the field turns red and gets focus, and the message goes as soon as you type. A good email calls \`onContinue(email)\`. If it returns a promise, Continue shows a spinner and ignores clicks until it settles.
4. **Sign in with Google.** Calls \`onGoogle\`, with the same spinner while its promise runs. With no \`onGoogle\` (login not connected yet), a small toast at the bottom of the page says "Google sign-in isn't connected yet. Use your email for now." for 3 seconds; clicking again starts the 3 seconds over. \`google={false}\` hides the button and the OR line.
5. **Theme.** Everything is drawn from the page's text and background colors, so it follows light and dark mode with no setup: Continue and the toast are the text color with background-colored text, the field is a 4.5% tint of the text color.`;

export function hexLoginInstallPrompt(tsSource: string) {
  return `# Hex-Login

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A calm login page: your logo inside four thin hexagon rings, a welcome line, Sign in with Google, an email field and a Continue button.

## Before you build: one question

Look through this project first: its routes (is there already a \`/login\` or \`/sign-in\` page?), its auth setup (Auth.js, Supabase, Clerk, Firebase or its own), and its logo files or logo component. Then ask me this in one message and wait for my answer:

- **Which page should it be, and which logo should it show?** Suggest the 1–3 best routes (for example replace the current \`/login\` page, or add a new \`/login\`), and name the logo you found that you'd put in the middle.
  *Why: it is a whole page, so it replaces or adds one route, and the logo is the one thing in it that has to be mine.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The page is the design: the four turning hexagon rings that fade out toward the bottom, the single 380px column with its exact sizes and spacing, the pill-shaped Google and Continue buttons, the email check with its message under the field, and the toast when Google isn't connected. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one page I picked. If it replaces an existing login page, keep that page's route and auth wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: Continue opening the author's X profile, the preview frame and its size buttons.

${HEX_LOGIN_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/login/page.tsx
"use client";
import { HexLogin } from "@/components/ui/hex-login";
import { Logo } from "@/components/logo"; // my logo

export default function LoginPage() {
  return (
    <HexLogin
      logo={<Logo className="h-20 w-auto" />}
      brand="Acme"
      termsHref="/terms"
      privacyHref="/privacy"
      onContinue={async (email) => {
        // my email sign-in, for example a magic link
      }}
    />
  );
}
\`\`\`

- If this project already signs people in by email, call that from \`onContinue\`; if it already has Google sign-in, call it from \`onGoogle\`. Return the promise so the button shows its spinner. If there is no auth yet, leave \`onGoogle\` out (the toast says it isn't connected) and tell me \`onContinue\` still needs wiring.
- The logo sits in an 80px-tall slot in the middle of the rings; size it to about 70 by 80px.
- It fills the screen (\`min-height: 100dvh\`) and paints its own background, so render it as the whole page, outside any header, footer or padded layout. If the route shares a layout with a header, tell me.
- Set \`brand\`, \`termsHref\` and \`privacyHref\` from what the project already has.

## Check

- It type-checks and the page renders with no console errors.
- The page shows my logo inside the rings and the rings turn into place on load in about a second. Continue with an empty field or a bad email shows the message under the field and focuses it; typing clears it. A real email calls my sign-in, with a spinner while it runs. Sign in with Google calls my Google sign-in, or shows the toast for 3 seconds if there is none.
- It looks right in light and dark mode (check both): dark text and a black Continue on a light page, light text and a white Continue on a dark page, rings faint on both.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, the field doesn't zoom in when tapped, the keyboard shows the @ key.
- With \`prefers-reduced-motion: reduce\`, the rings only fade in and nothing slides or turns.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/hex-login.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function hexLoginBlendPrompt(tsSource: string) {
  return `# Hex-Login, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A calm login page: your logo inside four thin hexagon rings, a welcome line, Sign in with Google, an email field and a Continue button. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its routes (is there already a \`/login\` or \`/sign-in\` page?), its auth setup (Auth.js, Supabase, Clerk, Firebase or its own) and which sign-in methods it has, its logo files or logo component, its terms and privacy pages, the way it writes short UI text, and its theme: \`--foreground\`, \`--background\`, \`--destructive\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it be?** Suggest the 1–3 best routes (replace my current login page, or add a new \`/login\`).
      *Why: it is a whole page, so it takes over one route.*
   2. **Which logo?** Name the logo file or component you found and suggest it (suggested), or a simpler mark of it (an icon-only version) if my full logo is a wide wordmark.
      *Why: the logo is the centre of the rings, so it has to be mine, and a wide wordmark looks lost in a hexagon.*
   3. **How do people sign in?** Wire Continue to my email sign-in and Google to my Google sign-in (suggested when I have both), keep Google with the "not connected yet" toast until I add it, or hide Google.
      *Why: the buttons should do what my product really supports, and a Google button that does nothing loses trust.*
   4. **The words?** Keep "Welcome back, Buddy" and the default texts, or text in my product's voice for the title, the buttons and the error messages (suggest two titles). Also my product name in the small print.
      *Why: the title is the first thing people read on the page, so it should sound like my product, not like a template.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the route, the logo, the sign-in wiring, the words, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The page: which route renders \`<HexLogin />\`.
- The logo: \`logo\`.
- The sign-in: \`onContinue\`, \`onGoogle\` and \`google\`.
- The words: \`title\`, \`brand\`, \`labels\`, plus \`termsHref\` and \`privacyHref\` from my real pages.

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The page is the design: the four turning hexagon rings that fade out toward the bottom, the single 380px column with its exact sizes and spacing, the pill-shaped Google and Continue buttons, the email check with its message under the field, and the toast when Google isn't connected. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (Continue opening the author's X profile, the preview frame and its size buttons).

${HEX_LOGIN_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/login/page.tsx
"use client";
import { HexLogin } from "@/components/ui/hex-login";
import { LogoMark } from "@/components/logo-mark"; // my logo, from my brief

// From my brief. Leave out any prop that stays at its default.
export default function LoginPage() {
  return (
    <HexLogin
      logo={<LogoMark className="h-20 w-auto" />}
      title="Good to see you again"
      brand="Acme"
      termsHref="/legal/terms"
      privacyHref="/legal/privacy"
      labels={{ continue: "Send me a link", badEmail: "Check that email for a typo." }}
      onContinue={(email) => signIn("email", { email })} // my email sign-in
      onGoogle={() => signIn("google")} // my Google sign-in
    />
  );
}
\`\`\`

- Colors are not props: the section reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--destructive\` for errors, \`--radius-lg\` for the field). If my theme uses other names, map them in my global CSS for this page only (for example \`.ihl { --foreground: var(--text-primary); --background: var(--surface); }\`), never with hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Return the promise from \`onContinue\` and \`onGoogle\` so the buttons show their spinner while sign-in runs.
- The logo sits in an 80px-tall slot; size it to about 70 by 80px.
- It fills the screen (\`min-height: 100dvh\`) and paints its own background, so render it as the whole page, outside any header, footer or padded layout.

${HEX_LOGIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My logo, title, words and small print show. The rings turn into place on load in about a second. Continue with an empty field or a bad email shows my message under the field and focuses it; typing clears it. A real email runs my email sign-in with a spinner. Google runs my Google sign-in, shows the toast for 3 seconds, or is hidden, as I chose.
- It looks right in light and dark mode (check both): my theme's text and background colors, a solid Continue in the text color, faint rings on both.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, the field doesn't zoom in when tapped, the keyboard shows the @ key.
- With \`prefers-reduced-motion: reduce\`, the rings only fade in and nothing slides or turns.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/hex-login.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

/* ---------- Burning-toast ----------
 * Install: adds the exact component; asks only which moments pop a toast.
 * Blend: asks four short questions, then fits it through the component's own props. */

const BURNING_TOAST_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/burning-toast.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the fire is a small WebGL shader, the ash is a 2D canvas, the icons are inline SVG and every other animation is CSS.
- JavaScript project? Name the file \`burning-toast.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/burning-toast.tsx\`
- Keep these exports and their names: \`BurningToaster\`, \`toast\` (with \`toast.success\`, \`toast.info\`, \`toast.warning\`, \`toast.error\`, \`toast.dismiss\`), and the types \`BurningToasterProps\`, \`ToastOptions\`, \`ToastType\`, \`ToastPosition\`, \`ToastColors\`, \`BurnColors\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the CSS block, the shader and the tuning values exactly as written: \`WIDTH\` (356), \`PEEK\` (14), \`GAP\` (12), \`PHONE\` (600), \`SIDE\`, \`TOP\`, \`BOTTOM\`, \`WOBBLE\`, \`MAX_PARTICLES\`, the 45px swipe distance and the default burn colors. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\`, or without WebGL, a toast fades out in 200ms instead of burning. The close button is a real button with a "Close" label, focus spreads the stack and pauses the timers, and screen readers hear each toast (errors right away).`;

const BURNING_TOAST_HOW = `## How the burn works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **One toaster, many toasts.** \`<BurningToaster />\` sits once at the root of the app. \`toast()\` can be called from anywhere, even outside React: it adds the toast to a small shared list and the toaster draws it. When the last toaster unmounts, its toasts go with it.
2. **The stack.** Toasts sit at the bottom of the screen, on the right or in the center, 356px wide and 24px from the edges. The newest is in front. Up to 3 show: each one behind peeks 14px higher and is 5% smaller, with its text hidden. A new toast slides up from below.
3. **Spread and pause.** Hovering the stack (or tapping it on a touch screen, or tabbing into it) spreads every toast out in a column with 12px gaps, and pauses all timers. The timers also pause while the tab is hidden or while a toast is being dragged.
4. **Three ways to burn.** The timer (4 seconds by default) burns the toast from the middle of its top edge. The close button burns it from the X. A swipe sideways or down that passes 45px (or a quick flick) burns it from where the finger let go, right where the toast was dropped. Upward drags barely move.
5. **The fire.** A ragged hole grows from that point in 1.2 seconds, slow to catch and then in uneven surges, until the whole toast is gone. The hole is a clip-path on the toast. A WebGL shader drawn into a canvas around the toast paints the charred edge, a thin glow, a few small flames and the scorch, all clipped to the toast's rounded box so nothing paints the page. A 2D canvas adds a little ash and a few sparks that float up and fade.
6. **Colors that always show.** The edge reads the toast's background and the page behind it and picks black or white from the burn colors so it always contrasts: black char on a light toast, a white-hot edge on a dark one. That is how one set of colors works in light and dark mode.
7. **Close the gap.** When the burn ends, the toast is removed and the ones above slide down to fill its place.
8. **Phones.** When the toaster is less than 600px wide, toasts are always bottom center and full width, with 16px on each side and room for the home bar.`;

export function burningToastInstallPrompt(tsSource: string) {
  return `# Burning-toast

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

Toasts that stack at the bottom of the screen and burn away instead of sliding out: from the X when closed, from the top when time runs out, and from where a swipe lets go.

## Before you build: one question

Look through this project first: its root layout, any toast or notification it already shows, and the actions that would want a short note after them (saving, sending, copying, deleting, undo). Then ask me this in one message and wait for my answer:

- **Which moments should pop a toast?** Suggest the 1–3 moments that fit best, each with the short message and supporting line you'd show. I can pick from them or name others.
  *Why: the toaster always goes once in the root layout, so the only real choice is which actions call \`toast()\`.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The stack and the burn are the design. Keep the bottom stack (3 visible, spread on hover), the 4-second timer that pauses while I read, and the burn from the X, the top or the swipe point, with its charred edge and ash, exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, \`<BurningToaster />\` once in the root layout, and the \`toast()\` calls at the moments I picked. If the project already has a toast library, tell me and leave it in place. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the "Pop my toast" button, the Default / Success / Info / Warning / Error buttons and the "Pop on the right" / "Pop in the center" buttons.

${BURNING_TOAST_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/layout.tsx: once, at the end of <body>
import { BurningToaster } from "@/components/ui/burning-toast";

<BurningToaster />

// Anywhere, at the moment I picked
"use client";
import { toast } from "@/components/ui/burning-toast";

toast.success("Changes saved", { description: "Your profile is up to date." });
\`\`\`

- Use \`toast()\` for plain notes and \`toast.success\`, \`toast.info\`, \`toast.warning\` or \`toast.error\` to match what happened. The type only changes the icon.
- Keep each toast to a short message and one supporting line.
- The toaster is fixed to the bottom of the screen, so it needs no room in the layout. Put it inside the theme provider if the project has one.

${BURNING_TOAST_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Each moment I picked pops a toast from below. Three in a row stack with the older two peeking 14px above. Hovering spreads them out and stops the clock. Left alone, a toast burns from the top after 4 seconds; the X burns it from the X; a swipe of 45px or more burns it where my finger let go. Each burn takes about 1.2 seconds and the toasts above slide down after it.
- It looks right in light and dark mode (check both): a black charred edge on a light toast, a white-hot edge on a dark one.
- It works with a finger on a phone: toasts sit bottom center and full width, a tap spreads the stack, a swipe burns one, and the burn stays smooth.
- With \`prefers-reduced-motion: reduce\`, a toast fades out in 200ms instead of burning.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/burning-toast.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function burningToastBlendPrompt(tsSource: string) {
  return `# Burning-toast, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

Toasts that stack at the bottom of the screen and burn away instead of sliding out: from the X when closed, from the top when time runs out, and from where a swipe lets go. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its root layout, any toast or notification it already shows, the actions that would want a short note after them, the way it writes short UI text, its theme (CSS variables, Tailwind theme, shadcn theme, radius tokens) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which moments should pop a toast?** Suggest the 1–3 that fit best, each with its type and the message and supporting line you'd write in my product's voice.
      *Why: the toaster goes once in the root layout, so this decides where people actually see it, and what it says.*
   2. **Which side?** Bottom right (suggested for apps with a sidebar or dashboard) or bottom center (suggested for simple, centered pages). Phones are always bottom center.
      *Why: toasts should appear where people's eyes already are, without covering my main buttons.*
   3. **The colors?** Name which of my existing variables you'd use for the toast background, text, muted text and hairline, which radius token for the corners, and whether the icons stay in the text color (suggested) or take my success, warning and danger colors. The burn stays black, white and gray (suggested) unless I ask for brand-tinted fire.
      *Why: the toast should look like my other popovers and cards, while the fire keeps its look.*
   4. **The timing?** Burn after 4 seconds (suggested), or after 6 seconds for longer messages. The burn itself takes 1.2 seconds (suggested) or 1.6 seconds for a slower, calmer burn.
      *Why: people need time to read, but a toast that stays too long gets in the way.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the moments, the side, the colors, the timing, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The moments: where \`toast()\` is called, with which type, message and \`description\`.
- The side: \`position\`.
- The colors: \`colors\` (\`surface\`, \`text\`, \`muted\`, \`border\`), \`radius\`, \`iconColors\` and \`burnColors\`, as my theme's CSS variables.
- The timing: \`duration\` and \`burnDuration\`.

All of these are props or options the component already has, so the component file itself stays as written.

**Locked**

- The stack and the burn are the design. The bottom stack (3 visible, 14px peek, spread on hover), the pause while I read, the burn from the X, the top or the swipe point with its charred edge, glow and ash, and the phone layout stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component, the root layout and the places that call \`toast()\`, no restyling, and none of the website's demo parts (the "Pop my toast" button, the Default / Success / Info / Warning / Error buttons and the "Pop on the right" / "Pop in the center" buttons).

${BURNING_TOAST_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
// app/layout.tsx: once, at the end of <body>. From my brief; leave out any prop that stays at its default.
import { BurningToaster } from "@/components/ui/burning-toast";

<BurningToaster
  position="bottom-center"
  duration={6000}
  colors={{
    surface: "var(--popover)", // my theme's variables, not hex
    text: "var(--popover-foreground)",
    muted: "var(--muted-foreground)",
    border: "var(--border)",
  }}
  radius="var(--radius-lg)"
  iconColors={{ success: "var(--success)", error: "var(--destructive)" }}
/>

// At each moment from my brief
toast.success("Changes saved", { description: "Your profile is up to date." });
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (for example \`222 47% 11%\`), wrap it as \`hsl(var(--popover))\`.
- Keep \`burnColors\` at its default unless I asked for brand-tinted fire. If I did, set \`char\` to a dark brand color and \`glow\` to a light one, so the edge still shows on both themes.
- Put the toaster inside the theme provider if the project has one, so it follows light and dark mode.

${BURNING_TOAST_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Each moment from my brief pops my words, on my side, in my colors and corners. Three in a row stack with the older two peeking 14px above. Hovering spreads them and stops the clock. Left alone, a toast burns from the top after the time I chose; the X burns it from the X; a swipe of 45px or more burns it where my finger let go. The toasts above slide down after each burn.
- It looks right in light and dark mode (check both), with my colors readable and the burn edge showing in each.
- It works with a finger on a phone: toasts sit bottom center and full width, a tap spreads the stack, a swipe burns one, and the burn stays smooth.
- With \`prefers-reduced-motion: reduce\`, a toast fades out in 200ms instead of burning.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/burning-toast.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
