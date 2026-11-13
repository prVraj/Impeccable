/* ---------- Burning-toast ----------
 * Install: adds the exact component; asks only which moments pop a toast.
 * Blend: asks four short questions, then fits it through the component's own props. */

const BURNING_TOAST_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/burning-toast.json\`.
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

export function installPrompt(tsSource: string) {
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

export function blendPrompt(tsSource: string) {
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
