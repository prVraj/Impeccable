/** Prompts for Puzzle Refresh. Both carry the full source.
 * Install: adds the exact animation; asks only which refresh it takes over.
 * Blend: asks four short questions, then fits it to the brand through the
 * animation's own props and options (the file stays as written). */

const ONE_LINE = `When someone refreshes the page, it doesn't just blink. Cracks run across the screen from where they clicked, cutting it into real jigsaw pieces (round tabs and holes, a new random cut every time). The whole page starts to drop and breaks apart on the way down: each piece comes loose at its own moment, tumbles and lands in a loose heap along the bottom of the screen with a small bounce. The page refreshes while the pieces lie there. Then they lift off one by one in random order, fly back up and click into place, and the page is whole and fresh. About 4 seconds in all, with sound: a crack, a wooden clatter as the pieces land and a small click as each one snaps back.`;

const LIMIT = `Good to know before you start: a browser never runs page code once a real reload has begun. So with a full reload, the animation plays first and reloads at the end, asking for the fresh page in the background meanwhile. With a refresh that doesn't reload the page (for example Next.js \`router.refresh()\` or refetching data), the refresh runs while the pieces fall, and the fresh page is what flies back together. It can catch F5, Ctrl+R and Cmd+R and any refresh button in my own UI. The browser's own reload button and pull-to-refresh on phones can't be caught; they still reload straight away. Don't try to work around that.`;

const BUILD = `## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: each piece is a copy of what is on screen cut to its jigsaw outline with a CSS clip-path and moved with CSS transforms, and the sounds are made in the browser with the Web Audio API (no sound files).
- JavaScript project? Name the file \`puzzle-refresh.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/puzzle-refresh.tsx\`
- Keep these exports and their names: \`PuzzleRefresh\`, \`puzzleRefresh\`, \`isPuzzleRunning\`, \`PuzzleRefreshProps\`, \`PuzzleOptions\`, \`PuzzleColors\`, \`PuzzleOrigin\`. Other code imports them.
- Imports that start with \`@/\` use the shadcn alias. Rewrite them to this project's alias, and keep the file layout consistent with its conventions (location, naming, formatting).
- Keep \`"use client"\` at the top in Next.js App Router projects (it uses effects and browser APIs). In other setups it is harmless.
- \`<PuzzleRefresh />\` renders nothing. Put it once, as high as possible (in Next.js App Router: \`app/layout.tsx\`, inside \`<body>\`), so the reload keys work on every page.
- Keep the timeline exactly as written: \`CRACK\` (320ms), \`CRACK_FADE\`, \`FALL\` (880ms), \`BREAK\`, \`HOP\`, \`HOP2\`, \`TURN\`, \`PAUSE\` (420ms), \`LIFT_SPREAD\` (560ms), \`FLIGHT\` (900ms), \`EDGE_OUT\` and \`MAX_WAIT\`, the 4000ms default, the piece counts (56 on wide screens, 46 on tablets, 28 on phones), the tab shape (\`TAB\` 0.1, \`JITTER\` 0.04), the heap (\`STACK\` 0.08) and the sounds (\`LOUDNESS\` 0.7). They are the design: the user asked for motion that is never snappy and never drags.
- Keep the fallbacks: \`prefers-reduced-motion: reduce\` gives a short fade to the page color, then the refresh, with no pieces and no sound. A second press of the reload key while it plays reloads at once.`;

const HOW = `## How the puzzle works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Cut.** When it starts, it cuts the screen into a grid of real jigsaw pieces: every inner edge gets one round tab, on a random side, with a little random wander, so each run is a new puzzle. Pieces along the screen edges have straight outer sides.
2. **Copy what is on screen, light.** It copies the page once, keeping in full only what is on screen (anything off screen becomes an empty box of the same size), and checks that the copy lines up with the page; if trimming moved anything, it copies again with less trimmed. Each piece then gets its own copy, holding in full only what shows inside that piece, cut to its outline with \`clip-path\`. Sticky headers, scrolled boxes, canvases and running CSS animations are put back as they are on screen. Until the page drops, the real page still shows between the pieces, so there are no seams.
3. **The refresh starts at once.** With \`refresh\`, it runs right away, while the pieces fall. Without it, the fresh page is fetched in the background and the page reloads at the end.
4. **Crack (first 320ms).** Thin lines appear around the pieces, spreading out from where you clicked (\`origin\`), with a crack and a crackle.
5. **Drop and break (about 0.9s, then a bounce).** The whole page drops as one sheet under one gravity; each piece comes loose at its own moment in the first half of its fall, turns and drifts towards where it will lie, and gains a soft shadow. Lower pieces land first; each lands on whatever already lies below it, bounces twice (a small hop and a smaller one) and settles at its angle, so the heap fills the bottom of the screen with the later pieces on top. Each landing makes a wooden clack.
6. **Lie there (420ms), or wait.** If \`refresh\` is still loading, the pieces keep lying in the heap for up to 10 seconds. With \`refresh\`, the fresh page is copied into the pieces before they lift.
7. **Fly home (about 1.5s).** The pieces lift off in random order over 0.56s. Each flight takes 0.9s: straight up off the heap first, then a curve that comes in from just below its place, unwinding to straight, a touch larger mid air as if lifted towards you, easing in and out so it never snaps. It clicks into place with a small click, its shadow and line fade, and when the last one is home the page is whole. With \`refresh\` the real fresh page is underneath; without it the page reloads.

Every wait follows the animations' own clock and the motion runs on the GPU, so it stays smooth on phones. Color: the empty screen behind the pieces is the page's own background, and each piece has a thin line (soft black on light pages, soft white on dark ones) and a soft shadow while it moves.`;

export function installPrompt(tsSource: string) {
  return `# Puzzle Refresh

A 1-file React animation from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

${LIMIT}

## Before you build: one question

Look through this project first: its root layout and any refresh, reload or "try again" buttons in its UI. Then ask me this in one message and wait for my answer:

- **Which refresh should it take over?** Suggest one of these, based on my code: the reload keys on every page (the component in the root layout), the reload keys plus the 1–2 refresh buttons you found, or only those buttons.
  *Why: phones have no reload keys, so a refresh button is the only way phone users ever see it.*

Ask nothing else. If I say *skip*, use the reload keys plus any refresh button you found.

## Keep it as it is

The way the page breaks and comes back is the design: cracks from the click, real jigsaw pieces with a new cut every time, the page dropping as one sheet and breaking apart on the way down, a loose heap along the bottom with a small bounce, then the pieces lifting off in random order and flying home with a click. Keep the timeline, the cut, the heap, the flight, the sounds and the colors exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, the line in the root layout and the wiring for the buttons I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo pieces from the Impeccable website (the "Puzzle this page" button and the dotted card behind it). My users only ever see the puzzle.

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/puzzle-refresh.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Use it**. If it fails or there is no \`components.json\`, build it by hand as below.

${BUILD}

## Use it

For the reload keys, put it once in the root layout:

\`\`\`tsx
// app/layout.tsx
import { PuzzleRefresh } from "@/components/ui/puzzle-refresh";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PuzzleRefresh />
        {children}
      </body>
    </html>
  );
}
\`\`\`

For a refresh button I picked, call \`puzzleRefresh()\` in its click handler instead of \`location.reload()\`, and pass the click so the cracks start at the button:

\`\`\`tsx
"use client";
import { puzzleRefresh } from "@/components/ui/puzzle-refresh";

export function RefreshButton() {
  return <button onClick={(e) => puzzleRefresh({ origin: e })}>Refresh</button>;
}
\`\`\`

- It breaks whatever is on screen, so nothing needs a class or a wrapper.
- Clicks and scrolling are paused while it plays; that's on purpose.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pressing Cmd+R (Mac) or Ctrl+R / F5 (Windows, Linux), or clicking a button I picked, cracks the page into jigsaw pieces from that spot; the page drops, breaks apart, lands in a heap at the bottom with a small bounce, then the pieces fly back in random order, click into place and the page reloads, about 4 seconds in all. Each run cuts a different puzzle. Pressing the key again while it plays reloads at once.
- At the moment of the crack, the pieces line up with the page exactly, also when the page is scrolled down (sticky headers and sidebars included).
- It looks right in light and dark mode (check both): the lines around the pieces show on both, and the empty screen is the page's own background.
- You hear a crack, a clatter as the pieces land and a click as each one snaps back.
- On a phone, the refresh button plays it smoothly with about 28 pieces.
- With \`prefers-reduced-motion: reduce\`, the page fades to its background color in about 0.3 seconds, then reloads, with no pieces and no sound.
- Nothing else on the site looks or behaves differently, and Shift+Cmd+R / Shift+Ctrl+R still does a plain hard reload.
- Finish with a short report: the files you added or changed, which refresh it took over, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/puzzle-refresh.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Puzzle Refresh, fitted to your brand

A 1-file React animation from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

${LIMIT}

## First: look, ask once, then build

1. Look through this project first: its root layout, any refresh, reload or "try again" buttons, its router (whether it has a soft refresh like Next.js \`router.refresh()\`), and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which refresh should it take over?** The reload keys on every page, the reload keys plus the 1–2 refresh buttons you found, or only those buttons.
      *Why: phones have no reload keys, so a refresh button is the only way phone users ever see it.*
   2. **Colors?** Keep the page's own background behind the pieces and the soft default line around each piece (default), or use my brand: name which of my existing color variables you'd use for the line (\`edge\`) and, only if my page background isn't already a variable the page uses, for the empty screen (\`background\`). If you found no theme, offer the default or let me paste 1–2 colors.
      *Why: the line around each piece and the empty screen are the only colors it adds, so they decide whether the puzzle feels like my brand.*
   3. **Speed and sound?** 4 seconds with sound (default), quicker (3s) or slower (5.5s), and sound on or off.
      *Why: people wait this long for their page. Quicker suits a tool people refresh often; slower suits a portfolio that wants to show off. Sound suits a playful site; a quiet office tool may want it off.*
   4. **How should it refresh?** A full page reload at the end (default), or my app's own refresh (for example \`router.refresh()\` or refetching data) running while the pieces fall. Suggest the second if my site is slow or has one.
      *Why: a full reload can only start after the animation; a refresh while it plays uses those 4 seconds to load, so a slow site feels fast, the fresh page is what flies back, and it keeps what people typed.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: which refresh it takes over, the colors (by my variable names), the speed and sound, the ending, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the animation already has, so the component file itself stays as written.

**You may change**

- Which refresh it takes over: \`<PuzzleRefresh />\` in the root layout (and \`keys\`), and \`puzzleRefresh({ origin: e })\` on the buttons I picked.
- The colors: \`edge\` and \`background\` in the \`colors\` option, read from my theme variables.
- The speed and sound: \`duration\` and \`sound\`.
- How it refreshes: \`refresh\` on \`<PuzzleRefresh />\` and on \`puzzleRefresh()\`.

**Locked**

- Cracks from the click, real jigsaw pieces with a new cut every time, the page dropping as one sheet and breaking apart on the way down, the loose heap with its small bounce, the random lift off and the flight home with a click. The timeline, the piece counts, the cut, the heap, the flight and the sounds stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component, the root layout and the buttons I picked, and no demo pieces from the Impeccable website (the "Puzzle this page" button and the dotted card behind it).

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/puzzle-refresh.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Fit it to the brand**. If it fails or there is no \`components.json\`, build it by hand as below.

${BUILD}

## Fit it to the brand

Apply my answers through the animation's own props and options. Leave out whatever stays at its default.

- **Colors** accept any CSS color, including \`var(--name)\`, and are read when the page cracks, so they follow my light and dark modes and any later rebrand. Pass variable names, never hex codes. If a variable holds bare channels (for example \`222 47% 11%\`), pass \`hsl(var(--name))\`.
- **Speed, sound and colors** go on the layout component and on each \`puzzleRefresh()\` call, so keys and buttons match.
- **A refresh while it plays** goes in \`refresh\`, on the layout component (a small client wrapper in Next.js, since it needs the router) and on the buttons. It starts as the page cracks; if it is slow, the pieces wait in the heap until it's done (up to 10s).

\`\`\`tsx
"use client";
// components/puzzle.tsx, placed in the root layout (the variable names are examples; use the ones from my brief)
import { useRouter } from "next/navigation";
import { PuzzleRefresh } from "@/components/ui/puzzle-refresh";

export function Puzzle() {
  const router = useRouter();
  return (
    <PuzzleRefresh
      duration={5500}
      colors={{ edge: "var(--border)" }}
      refresh={() => router.refresh()} // only if I chose a refresh while it plays
    />
  );
}
\`\`\`

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";
import { puzzleRefresh } from "@/components/ui/puzzle-refresh";

export function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={(e) =>
        puzzleRefresh({
          origin: e, // the cracks start at the button
          duration: 5500,
          colors: { edge: "var(--border)" },
          refresh: () => router.refresh(), // only if I chose a refresh while it plays
        })
      }
    >
      Refresh
    </button>
  );
}
\`\`\`

- It breaks whatever is on screen, so nothing needs a class or a wrapper.
- Clicks and scrolling are paused while it plays; that's on purpose.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- The refresh I picked cracks the page into jigsaw pieces from that spot; the page drops, breaks apart, lands in a heap at the bottom with a small bounce, then the pieces fly back in random order and click into place, at the speed I chose. With a full reload the page reloads at the end; with a refresh while it plays, the fresh content is what flies back.
- At the moment of the crack, the pieces line up with the page exactly, also when the page is scrolled down.
- It looks right in light and dark mode (check both): the lines in my colors show on both, and the empty screen matches my background.
- With sound on, you hear a crack, a clatter as the pieces land and a click as each one snaps back; with sound off, nothing.
- On a phone, the refresh button plays it smoothly with about 28 pieces.
- With \`prefers-reduced-motion: reduce\`, the page fades to its background color in about 0.3 seconds, then refreshes, with no pieces and no sound.
- Nothing else on the site looks or behaves differently, and Shift+Cmd+R / Shift+Ctrl+R still does a plain hard reload.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/puzzle-refresh.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
