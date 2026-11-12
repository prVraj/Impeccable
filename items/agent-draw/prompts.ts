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

export function installPrompt(tsSource: string) {
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

export function blendPrompt(tsSource: string) {
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
