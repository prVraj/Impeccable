/** Prompts for Black-Hole-Refresh. Both carry the full source.
 * Install: adds the exact animation; asks only which refresh it takes over.
 * Blend: asks four short questions, then fits it to the brand through the
 * animation's own props and options (the file stays as written). */

const ONE_LINE = `When someone refreshes the page, it doesn't just blink. A black hole opens in the middle of the screen and starts to spin. Everything on the page spirals in along its swirl and, in one smooth motion, is stretched into a long, thin, curved thread the closer it gets (the way a real black hole tears things apart), until it crosses the edge. The hole grows and spins faster with everything it eats, then collapses into a neutron star and blasts; the shockwave pushes the dark away and throws every piece back into its place, and the page is fresh. About 5 seconds in all.`;

const LIMIT = `Good to know before you start: a browser never runs page code once a real reload has begun. So with a full reload, the animation plays first and reloads at the end, asking for the fresh page in the background meanwhile. With a refresh that doesn't reload the page (for example Next.js \`router.refresh()\` or refetching data), the refresh runs while the hole eats, and the blast throws the fresh page back. It can catch F5, Ctrl+R and Cmd+R and any refresh button in my own UI. The browser's own reload button and pull-to-refresh on phones can't be caught; they still reload straight away. Don't try to work around that.`;

const BUILD = `## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the page's own elements move with CSS transforms, and one 2D canvas draws the hole, its disk and the blast.
- JavaScript project? Name the file \`black-hole-refresh.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/black-hole-refresh.tsx\`
- Keep these exports and their names: \`BlackHoleRefresh\`, \`blackHoleRefresh\`, \`isBlackHoleRunning\`, \`BlackHoleRefreshProps\`, \`BlackHoleOptions\`, \`BlackHoleColors\`. Other code imports them.
- Imports that start with \`@/\` use the shadcn alias. Rewrite them to this project's alias, and keep the file layout consistent with its conventions (location, naming, formatting).
- Keep \`"use client"\` at the top in Next.js App Router projects (it uses effects and browser APIs). In other setups it is harmless.
- \`<BlackHoleRefresh />\` renders nothing. Put it once, as high as possible (in Next.js App Router: \`app/layout.tsx\`, inside \`<body>\`), so the reload keys work on every page.
- Keep the timeline exactly as written: \`OPEN\`, \`FEED_FROM\`, \`FEED_SPREAD\`, \`FALL\`, \`SWIRL\`, \`STRETCH\`, \`FADE_FROM\`, \`NIGHT\`, \`COLLAPSE\`, \`STAR\`, \`BLAST\`, \`FLASH\`, \`RETURN_FROM\`, \`RETURN_SPREAD\`, \`RETURN_LEN\`, \`HOLD\` and \`MAX_WAIT\`, the 5200ms default, the hole size (3.2% of the shorter side, 8 to 26px, growing up to 2.4x), the disk (8 rings of streaks, 3 spiral arms, tilted), the 84 sparks and the 2x canvas cap. They are the design.
- Keep the fallbacks: \`prefers-reduced-motion: reduce\` gives a short fade to the page color, then the refresh. A second press of the reload key while it plays reloads at once.`;

const HOW = `## How the black hole works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Find the pieces.** When it starts, it walks the page once and splits it into pieces that can fall on their own: each block of text, image, button, small card, code box or scroll area. Big painted areas (page panels) aren't moved; their fill and border fade, and their contents fall piece by piece. It moves the page's real elements with CSS transforms (no copies, no screenshots), so it works on any page and costs little.
2. **The refresh starts at once.** With \`refresh\`, it runs right away, while the page is eaten; anything it adds stays hidden until the blast. Without it, the fresh page is fetched in the background and the page reloads at the end.
3. **Open and spin (first 8%).** A small hole opens in the middle with a ring of light and a tilted disk of streaks and three spiral arms, spinning; the inner rings turn faster, like real orbits.
4. **Spiral in, stretching all the way (4% to 64%).** The nearest pieces go first; the farthest start about 1.8 seconds later. Each piece falls for 26% of the time along a spiral that matches the spin, slow at first, then faster and faster. There are no separate steps: the whole way in, it is stretched along the way it is moving (up to 10x longer) and squeezed across it only as much as it is stretched, never longer than the way left to go. Nothing turns or flips; it only stretches. The canvas draws the rest of the thread as a curved tail behind it, in the piece's own color, back along the spiral it came in on. Each swallowed piece feeds bright grains into the disk; the hole grows up to 2.4x and spins faster as it eats.
5. **Wait, if needed (at 64%).** If \`refresh\` is still loading, the story waits here, the hole still spinning, for up to 10 seconds.
6. **Collapse and blast (46% to 93%).** The dark floods the screen, the full hole implodes to a point, a neutron star spins up with two sweeping beams, then it blasts: one bright flash, a shockwave ring that pushes the dark away, a softer second ring and 84 sparks.
7. **Back into place (78% to 100%).** Right behind the shockwave every piece is thrown back out of the centre, unwinding and streaking, and lands in its place with a small overshoot. With \`refresh\`, the fresh page is measured first, so the fresh content is what lands. Without it, the page reloads at the end.

Color: the default is a black hole (\`#000000\`) with white light (\`#ffffff\`). A tight shadow behind the hole makes the light visible on light pages; the dark floods the screen only once nearly everything is gone.`;

export function installPrompt(tsSource: string) {
  return `# Black-Hole-Refresh

A 1-file React animation from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

${LIMIT}

## Before you build: one question

Look through this project first: its root layout and any refresh, reload or "try again" buttons in its UI. Then ask me this in one message and wait for my answer:

- **Which refresh should it take over?** Suggest one of these, based on my code: the reload keys on every page (the component in the root layout), the reload keys plus the 1–2 refresh buttons you found, or only those buttons.
  *Why: phones have no reload keys, so a refresh button is the only way phone users ever see it.*

Ask nothing else. If I say *skip*, use the reload keys plus any refresh button you found.

## Keep it as it is

The way the hole eats is the design: things spiral in along the spin, stretching into long thin curved threads the whole way in, nearest first, while the hole grows and spins faster; then the neutron star blast throws every piece back into place. Keep the timeline, the hole, the disk, the blast and the colors exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, the line in the root layout and the wiring for the buttons I picked. Don't add packages, change other files, or restyle anything.
- Don't add demo pieces from the Impeccable website (the "Consume this page" button and the dotted card behind it). My users only ever see the black hole.

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/black-hole-refresh.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Use it**. If it fails or there is no \`components.json\`, build it by hand as below.

${BUILD}

## Use it

For the reload keys, put it once in the root layout:

\`\`\`tsx
// app/layout.tsx
import { BlackHoleRefresh } from "@/components/ui/black-hole-refresh";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BlackHoleRefresh />
        {children}
      </body>
    </html>
  );
}
\`\`\`

For a refresh button I picked, call \`blackHoleRefresh()\` in its click handler instead of \`location.reload()\`:

\`\`\`tsx
"use client";
import { blackHoleRefresh } from "@/components/ui/black-hole-refresh";

export function RefreshButton() {
  return <button onClick={() => blackHoleRefresh()}>Refresh</button>;
}
\`\`\`

- It swallows whatever is on screen, so nothing needs a class or a wrapper. An element with \`data-black-hole="ignore"\` is left alone.
- Clicks and scrolling are paused while it plays; that's on purpose.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- Pressing Cmd+R (Mac) or Ctrl+R / F5 (Windows, Linux), or clicking a button I picked, opens a spinning hole in the middle. Everything spirals in, nearest first, stretching into long thin curved threads the whole way in (nothing flips or turns); the hole grows and spins faster, collapses, blasts, the shockwave throws every piece back into its place and the page reloads, about 5 seconds in all. Pressing the key again while it plays reloads at once.
- It looks right in light and dark mode (check both): the light shows on light pages because of the shadow behind the hole, and the pieces land back on the page's own colors.
- On a phone, the refresh button plays it smoothly.
- With \`prefers-reduced-motion: reduce\`, the page fades to its background color in about 0.3 seconds, then reloads.
- Nothing else on the site looks or behaves differently, and Shift+Cmd+R / Shift+Ctrl+R still does a plain hard reload.
- Finish with a short report: the files you added or changed, which refresh it took over, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/black-hole-refresh.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Black-Hole-Refresh, fitted to your brand

A 1-file React animation from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

${LIMIT}

## First: look, ask once, then build

1. Look through this project first: its root layout, any refresh, reload or "try again" buttons, its router (whether it has a soft refresh like Next.js \`router.refresh()\`), and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which refresh should it take over?** The reload keys on every page, the reload keys plus the 1–2 refresh buttons you found, or only those buttons.
      *Why: phones have no reload keys, so a refresh button is the only way phone users ever see it.*
   2. **Colors?** Keep the black hole with white light (default), or tint the light with my brand. If you suggest brand colors, name which of my existing color variables you'd use for the light (\`glow\`) and, only if it's very dark, for the hole (\`hole\`). If you found no theme, offer the default or let me paste 1–2 colors.
      *Why: the light of the disk and the blast is the only color on screen, so it decides whether the black hole feels like my brand.*
   3. **Speed?** 5.2 seconds (default), quicker (4s) or slower (6.5s).
      *Why: people wait this long for their page. Quicker suits a tool people refresh often; slower suits a portfolio that wants to show off.*
   4. **How should it refresh?** A full page reload at the end (default), or my app's own refresh (for example \`router.refresh()\` or refetching data) running while the hole eats. Suggest the second if my site is slow or has one.
      *Why: a full reload can only start after the animation; a refresh while it eats uses those 5 seconds to load, so a slow site feels fast, and it keeps what people typed.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: which refresh it takes over, the colors (by my variable names), the speed, the ending, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

Only my answers above may change it, and only through props and options the animation already has, so the component file itself stays as written.

**You may change**

- Which refresh it takes over: \`<BlackHoleRefresh />\` in the root layout (and \`keys\`), and \`blackHoleRefresh()\` on the buttons I picked.
- The colors: \`glow\` and \`hole\` in the \`colors\` option, read from my theme variables.
- The speed: \`duration\`.
- How it refreshes: \`refresh\` on \`<BlackHoleRefresh />\` and on \`blackHoleRefresh()\`.

**Locked**

- Things spiral in along the spin, stretching into long thin curved threads the whole way in, nearest first, while the hole grows and spins faster; then the collapse, the neutron star, the blast and every piece thrown back into place. The timeline, the hole, the disk and the blast stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component, the root layout and the buttons I picked, and no demo pieces from the Impeccable website (the "Consume this page" button and the dotted card behind it).

## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/black-hole-refresh.json\`.
If the command succeeds, only fix import paths to match this project and skip to **Fit it to the brand**. If it fails or there is no \`components.json\`, build it by hand as below.

${BUILD}

## Fit it to the brand

Apply my answers through the animation's own props and options. Leave out whatever stays at its default.

- **Colors** accept any CSS color, including \`var(--name)\`, and are read when the hole opens, so they follow my light and dark modes and any later rebrand. Pass variable names, never hex codes. If a variable holds bare channels (for example \`222 47% 11%\`), pass \`hsl(var(--name))\`.
- **Speed and colors** go on the layout component and on each \`blackHoleRefresh()\` call, so keys and buttons match.
- **A refresh while it eats** goes in \`refresh\`, on the layout component (a small client wrapper in Next.js, since it needs the router) and on the buttons. It starts as the hole opens; if it is slow, the hole keeps spinning until it's done (up to 10s).

\`\`\`tsx
"use client";
// components/black-hole.tsx, placed in the root layout (the variable names are examples; use the ones from my brief)
import { useRouter } from "next/navigation";
import { BlackHoleRefresh } from "@/components/ui/black-hole-refresh";

export function BlackHole() {
  const router = useRouter();
  return (
    <BlackHoleRefresh
      duration={6500}
      colors={{ glow: "var(--primary)" }}
      refresh={() => router.refresh()} // only if I chose a refresh while it eats
    />
  );
}
\`\`\`

\`\`\`tsx
"use client";
import { useRouter } from "next/navigation";
import { blackHoleRefresh } from "@/components/ui/black-hole-refresh";

export function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        blackHoleRefresh({
          duration: 6500,
          colors: { glow: "var(--primary)" },
          refresh: () => router.refresh(), // only if I chose a refresh while it eats
        })
      }
    >
      Refresh
    </button>
  );
}
\`\`\`

- It swallows whatever is on screen, so nothing needs a class or a wrapper. An element with \`data-black-hole="ignore"\` is left alone.
- Clicks and scrolling are paused while it plays; that's on purpose.

${HOW}

## Check

- It type-checks and the page renders with no console errors.
- The refresh I picked opens a spinning hole in the middle; everything spirals in stretching into long thin curved threads, nearest first; the hole grows, collapses, blasts in my colors and throws every piece back into place, at the speed I chose. With a full reload the page reloads at the end; with a refresh while it eats, the fresh content is what lands.
- It looks right in light and dark mode (check both): the light shows on light pages because of the shadow behind the hole, and the pieces land back on the page's own colors.
- On a phone, the refresh button plays it smoothly.
- With \`prefers-reduced-motion: reduce\`, the page fades to its background color in about 0.3 seconds, then refreshes.
- Nothing else on the site looks or behaves differently, and Shift+Cmd+R / Shift+Ctrl+R still does a plain hard reload.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/black-hole-refresh.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
