/* ---------- Liquid Orbit loader ----------
 * Install: adds the exact loader; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const ORBIT_ONE_LINE = `A loading animation made of a drop of liquid floating inside a ring of the same liquid, in a very light violet. Nothing sits still: the drop drifts around on its own and jiggles, the ring bobs on a different beat, and bulges of liquid flow round the ring. Every 3.5 seconds the ring turns over in 3D round the drop, passing behind it and in front of it, then pulls apart into two shrinking streams, and the drop shrinks and fades with it. Then the ring pours itself back in from the bottom, a pool gathers there, and a new drop rises out of it on a stretchy neck, lets go with a wobble and floats off again. A short line, "Loading", sits under it.`;

const ORBIT_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/liquid-orbit-loader.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it is one small SVG moved by one animation loop.
- JavaScript project? Name the file \`liquid-orbit-loader.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/liquid-orbit-loader.tsx\`
- Keep these exports and their names: \`LiquidOrbitLoader\`, \`LiquidOrbitLoaderProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the design values at the top exactly as written: \`R\`, \`BAND\`, \`BULGES\`, \`DROP_R\`, \`JIGGLE\`, \`SPLASH\`, \`DRIFT\`, \`BOB\`, \`HALO\`, \`HOLD_MS\`, \`TURN_MS\`, \`GAP_MS\`, \`DRAW_MS\`, \`RISE_AT\`, \`RISE_MS\`, \`TILT\`, \`AXIS_FROM\`, \`AXIS_TO\`, \`APART_AT\`, \`SLIDE\`, \`SNAP_AT\`, \`POOL\`, the easing curves, \`frameAt\`, \`ringShape\`, \`frontBox\`, \`dropPath\` and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the ring and the drop rest and only the glow slowly breathes. When the tab is hidden or the loader is scrolled out of view, drawing stops and picks up where it left off. It is a \`role="progressbar"\` with \`aria-busy\` and no \`aria-valuenow\` (there is no real progress), named by its label or "Loading".`;

const ORBIT_HOW = `## How the loader works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The pieces.** In a 100 by 100 box: a ring of liquid (radius 34, about 4 thick) and a drop of the same liquid (radius 13.5) inside it. The liquid is lit from the top: \`color\` where the light hits it, easing to \`glow\` toward the bottom, like it has weight. The drop has a soft window of light at the top left, a sharp glint and light bounced up into its bottom. The ring has a soft glow round it.
2. **Always moving.** The drop floats on its own slow path (4.2 across, 3.4 up and down, on 2.3 and 1.7 second beats) and its outline jiggles with two slow wobbles. The ring bobs on a different beat (2.9 and 2.1 seconds) and two sets of bulges (3 and 5 round the ring) flow round it in opposite directions, so it swells and thins as you watch. The floating runs on the loader's own clock, not the loop's, so the drop and the ring never move in step and no two loops look the same.
3. **The turn (1.5 seconds).** After a 0.42 second rest, the ring turns over in 3D by 240 degrees, on an axis that starts near upright and lies flat as it turns, slow at both ends. The drop hides the part of the ring behind it; the part facing you is drawn again over the drop. Seen edge on, a rounded core keeps the ring a full tube.
4. **Pulling apart.** Halfway through the turn, the ring pulls apart into two streams that taper to points, slide round and shrink to nothing. The drop shrinks and fades at the same time, and a faint ripple spreads from its edge and fades.
5. **Pouring back (0.48 seconds).** After a 0.14 second breath, the ring pours back in face on, from the bottom, both ends tapering as they race up to meet at the top, and liquid gathers in a pool at the bottom.
6. **The new drop (1 second).** 0.3 seconds into the pour, a drop is born in the pool and rises toward where it floats: it fades in, grows, and stays joined to the ring by a neck that thins as it pulls away while the pool drains into it. At 55% of the rise the neck lets go; the drop's short tail pulls back in, it rises a touch past its spot and settles, and it jiggles harder for a moment before calming down. Then the loop starts again.
7. **Light and dark.** On a dark page the liquid glows. The lightest shade would melt into a white page, so on a light page (dark text) a thin \`glow\` edge holds the ring's and the drop's shape and the glow softens. The text color is checked every 20 frames, so this follows theme switches.
8. **Drawing.** It is one SVG: the ring is a filled band built from its 3D position each frame, and the drop is one path (a jiggling round drop, a drop with a tail, or a drop on a neck). One loop moves them on elapsed time, so it feels the same on slow phones and fast screens, and it stops when the loader is off screen or the tab is hidden. Colors come from CSS (\`color\` and \`glow\`), so they need no redraw.`;

const ORBIT_LOCKED = `The liquid drop in the liquid ring, both always moving on their own (the drop floating and jiggling, the ring bobbing with bulges flowing round it), the 3D turn with the ring passing behind and in front of the drop, the ring pulling apart into two tapering streams while the drop fades with it, and the ring pouring back in from the bottom while a new drop rises out of the pool on a neck and lets go with a wobble, with their timing, are the design.`;

const ORBIT_DEMO = `the dotted card behind the loader and the home page's TV`;

export function installPrompt(tsSource: string) {
  return `# Liquid Orbit loader

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ORBIT_ONE_LINE}

## Before you build: one question

Look through this project first: its first load, any screen or dialog that waits on data, empty states while something fetches, and any spinner it already shows. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 spots it fits best from my code (for example a full screen first load, a dashboard waiting for its data, or a dialog that fetches before it shows). I can pick one or name another.
  *Why: it is a calm, centered loader made for a wait people look at, not a tiny inline spinner, so it belongs where there is room around it.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

${ORBIT_LOCKED} Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing spinner there, keep that spot's logic and remove only the old spinner. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: ${ORBIT_DEMO}.

${ORBIT_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { LiquidOrbitLoader } from "@/components/ui/liquid-orbit-loader";

export function DashboardLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <LiquidOrbitLoader />
    </div>
  );
}
\`\`\`

- It is 64px square by default plus the line under it, and centers that line under the ring. Give it a little room: the ring's glow reaches slightly past the box.
- Show it only while the wait lasts; it has no end state of its own.

${ORBIT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- A light violet drop of liquid inside a liquid ring, "Loading" under it. The drop never sits still: it drifts and jiggles while the ring bobs and swells. Every 3.5 seconds the ring turns over round the drop (behind it, then in front), pulls apart into two streams while the drop fades, pours back in from the bottom, and a new drop rises out of the pool on a thin neck, lets go with a wobble and floats off.
- It looks right in light and dark mode (check both): on dark it glows; on light a thin violet edge keeps the ring and the drop clearly visible.
- It stays smooth on a phone (375px wide), with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the ring and the drop rest and only the glow slowly fades in and out.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/liquid-orbit-loader.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Liquid Orbit loader, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ORBIT_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its first load, any screen or dialog that waits on data, empty states while something fetches, any spinner it already shows, the tone of its copy, its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 spots it fits best from my code (a full screen first load, a dashboard waiting for its data, a dialog that fetches before it shows).
      *Why: it is a calm, centered loader made for a wait people look at, so it belongs where there is room around it.*
   2. **The line under it?** Keep "Loading" (suggested), write a short one in my product's voice that names the wait (for example "Loading your boards"), or hide it.
      *Why: it is the only text, so it tells people what they are waiting for.*
   3. **The liquid colors?** Keep the light violet (suggested only if my brand is violet), or use my brand: the lightest shade of my primary color for the liquid and a light shade of it for its deeper side, edges and glow. Name which of my existing color variables you'd use for each.
      *Why: the liquid is the only color in it, so its tint decides whether it feels like my brand. It stays very light so the shine reads.*
   4. **The size?** Small at 40px, default at 64px (suggested), or large at 96px.
      *Why: small sits inside a card or dialog, large suits a full screen wait where the rising drop is easy to see.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place, the line under it, the liquid colors, the size), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where it is rendered.
- The line under it: \`label\` (or \`null\` to hide it).
- The liquid colors: \`color\` for where the light hits the liquid, \`glow\` for its deeper side, edges and glow, as my theme's CSS variables.
- The size: \`size\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- ${ORBIT_LOCKED} If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (${ORBIT_DEMO}).

${ORBIT_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { LiquidOrbitLoader } from "@/components/ui/liquid-orbit-loader";

// From my brief. Leave out any prop that stays at its default.
export function DashboardLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <LiquidOrbitLoader
        size={64}
        label="Loading your boards"   // my line, or null to hide it
        color="var(--primary-50)"     // the lightest shade of my primary, from my theme, not hex
        glow="var(--primary-300)"     // a light shade of it, for the deeper side, edges and glow
      />
    </div>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--primary))\`.
- If my theme has no shade scale, mix them from my primary: \`color-mix(in oklab, var(--primary) 8%, white)\` for \`color\` and \`color-mix(in oklab, var(--primary) 45%, white)\` for \`glow\`.
- Keep the line short: two to four words, so it stays on one line under the ring.
- If it replaces an existing spinner, keep that spot's logic and remove only the old spinner.

${ORBIT_HOW}

## Check

- It type-checks and the page renders with no console errors.
- A drop of liquid inside a liquid ring in my brand's lightest shade, my line under it. The drop drifts and jiggles while the ring bobs and swells. Every 3.5 seconds the ring turns over round the drop (behind it, then in front), pulls apart into two streams while the drop fades, pours back in from the bottom, and a new drop rises out of the pool on a thin neck, lets go with a wobble and floats off.
- It looks right in light and dark mode (check both): on dark it glows in my colors; on light the edges and tube keep it clearly visible.
- It stays smooth on a phone (375px wide), with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the ring and the drop rest and only the glow slowly fades in and out.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/liquid-orbit-loader.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
