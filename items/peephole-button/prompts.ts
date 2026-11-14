/* ---------- Peephole-button ----------
 * Install: adds the exact button; asks only where it goes and which picture it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PEEPHOLE_ONE_LINE = `A glassy button with a small window (the slot) that shows a picture. On hover the window stretches open across the whole button. In the "reveal" type the whole picture shows through the glass; in the "fill" type my avatar or logo stays in the slot while my brand color pours out of it, and the label turns white exactly where the color has reached.`;

const PEEPHOLE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/peephole-button.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages and no animation loop: the opening is one CSS \`clip-path\` transition, and the rest is plain CSS in the component.
- JavaScript project? Name the file \`peephole-button.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/peephole-button.tsx\`
- Keep these exports and their names: \`PeepholeButton\`, \`PeepholeButtonProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`MIN_H\` (44px), \`GAP\` (6px round the slot), \`SLOT_MIN\` and \`SLOT_MAX\` (20 to 80px), \`LINGER_MS\` (700ms), and the whole \`CSS\` block: open 560ms on \`cubic-bezier(.22,1,.36,1)\`, close 420ms on \`cubic-bezier(.4,0,.2,1)\`, the 16px blur of the frosted glass, the picture's 1.12 zoom that settles to 1, and the shade that fades in under the label. They are the design and its timing.
- Keep the nested corners: the slot's corner radius is the button's radius minus the space around the slot, so the two always nest.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` it switches open and closed with no stretch. On touch screens, pressing opens it and it closes 700ms after the finger lifts. Keyboard focus opens it and shows a ring in the page's text color. A disabled button stays closed. A picture that is missing or fails to load leaves plain glass and an empty slot, never a broken image.`;

const PEEPHOLE_HOW = `## How the button works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The shape.** The button is 44px tall (more if the slot is bigger than 32px, always keeping 6px round it). The slot sits at the \`side\` I chose. With \`shape="circle"\` it is a round slot in a pill; with \`shape="square"\` it is a rounded square in a button with \`radius\` corners (12px), and the slot's corners are that radius minus the 6px gap. The label gets extra padding on the slot's side so it never sits under the slot.
2. **Reveal at rest.** The glass is a heavily blurred, slightly zoomed copy of the same picture, under a light shade (darker in dark mode), so it always takes the picture's colors. A soft white sheen covers its top half and a thin bright edge runs round it; both are much fainter in dark mode, so the button looks the same in both themes. Inside the slot the same picture shows sharp. The label is white with a soft shadow.
3. **Fill at rest.** The glass is clear: a frosted white in light mode and a faint white in dark mode, over whatever is behind it. My avatar or logo fills the slot. The label is black in light mode and white in dark mode.
4. **Opening.** One layer holds the sharp picture (reveal) or the fill color plus a white copy of the label (fill). It is clipped to the slot's exact shape at rest. On hover, touch press or keyboard focus, the clip widens from the slot to the whole button in 560ms with a soft ease out, so the window looks like it stretches open from where it sits. In reveal, the picture settles from a 1.12 zoom to its real size and a shade fades in under the label. In fill, the white label copy sits in exactly the same place as the normal label, so the label turns white exactly where the color has reached.
5. **Closing.** Moving away shrinks the window back into the slot in 420ms. On touch screens it closes 700ms after the finger lifts, so a quick tap still shows it.
6. **Glass on top.** The sheen and the edge sit above everything, so the button still reads as glass when it is open.`;

export function installPrompt(tsSource: string) {
  return `# Peephole-button

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${PEEPHOLE_ONE_LINE}

## Before you build: one question

Look through this project first: its buttons and calls to action, its profile, team, contact and gallery areas, and the pictures it already has (avatars, product shots, cover images). Then ask me this in one message and wait for my answer:

- **Where should it go, and which picture should it show?** Suggest the 1–3 buttons it could replace or the spots it fits best (for example a "Talk to us" button with a team member's avatar, a "View gallery" or "See the work" button with a cover image, or a profile action with the person's photo), each with a picture you found in my project. Keep the button's label, link and click handler. I can pick one, name another, or give you a different picture.
  *Why: the picture is the whole point of this button, so it belongs where a real picture says something about what the click opens.*

Ask nothing else. If I say *skip*, use the best suggestion. Use the \`"reveal"\` type for a big picture (a photo, a cover) and \`"fill"\` for an avatar or logo, with the slot on the left and every other prop at its default.

## Keep it as it is

The glass button with a small picture window, the window stretching open from the slot to the whole button on hover, and its sizes and timing are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing button, keep that button's label, link, click handler and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the dotted card behind the button, the "Use my picture" and "Reset" buttons, the eye icon in the slot and the captions under the buttons. The website's sample pictures are not part of it either: use a picture from my project.

${PEEPHOLE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PeepholeButton } from "@/components/ui/peephole-button";

export function TalkToUs() {
  return (
    <PeepholeButton variant="fill" image="/team/ava.jpg" side="right" onClick={() => openChat()}>
      Talk to Ava
    </PeepholeButton>
  );
}
\`\`\`

- It is a real \`<button>\` and takes every button prop (\`onClick\`, \`type\`, \`disabled\`, \`aria-*\`). For a link, put it inside the link or call the router in \`onClick\`.
- \`image\` is any image URL the page can load (a file in \`public/\`, an imported image's \`.src\`, or a remote URL the project already allows). Use a picture at least twice the button's size so it stays sharp when open.
- \`className\` and \`style\` go on the button itself. Its width follows the label; everything happens inside it, so it needs no extra room.

${PEEPHOLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest the button is glass with the picture showing only inside the slot. Hovering stretches the window open across the whole button in about half a second (reveal: the whole picture shows; fill: the brand color pours in and the label turns white as it passes). Moving away closes it in about 0.4 seconds.
- It looks right in light and dark mode (check both): the glass, its edge and the label read on both.
- On a phone, pressing opens it, it closes a moment after the finger lifts, the button works on the first tap, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, it switches open and closed with no stretch.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed and which picture it shows, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peephole-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Peephole-button, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${PEEPHOLE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its buttons and calls to action, its profile, team, contact and gallery areas, the pictures it already has (avatars, product shots, cover images), its theme colors (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which picture should it show?** Suggest the 1–3 buttons it could replace or the spots it fits best (a "Talk to us" button with a team avatar, a "View gallery" button with a cover image, a profile action with the person's photo), each with a picture you found in my project.
      *Why: the picture is the whole point of this button, so it belongs where a real picture says something about what the click opens.*
   2. **Which type?** Reveal (the whole picture opens on hover, best for a photo or cover) or Fill (my avatar or logo stays in the slot and my brand color pours in, best for a person or a brand). Suggest the one that suits the picture from question 1.
      *Why: reveal shows off the picture itself; fill keeps a face or logo visible and makes the button feel like my brand.*
   3. **The slot?** Circle or square, left or right, and its size: small (28px), default (32px, suggested) or big (40px). With a square slot, suggest a corner radius that matches my other buttons.
      *Why: a circle reads as a person or a lens, a square as a product or a photo; matching my button corners makes it feel native.*
   4. **The colors?** For Fill: name which of my existing color variables you'd use for the color that pours in (my primary color, suggested) and the label on it. For Reveal: keep the white label (suggested) or name my text color variable. Suggest ones that read in both light and dark mode.
      *Why: the fill is the only flat color on the button, so it is what makes it feel like my brand.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of one line per answer (the place and picture, the type, the slot, the colors), plus "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and picture: where the button is rendered, keeping that spot's label, link and click handler, and \`image\`.
- The type: \`variant\`.
- The slot: \`shape\`, \`side\`, \`slotSize\` and, with a square slot, \`radius\`.
- The colors: \`fillColor\` and \`fillTextColor\` for Fill, \`textColor\` for Reveal, as my theme's CSS variables.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The glass button with a small picture window, the window stretching open from the slot to the whole button on hover (560ms open, 420ms close), the frosted glass made from the picture, and the nested slot corners stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the dotted card, the "Use my picture" and "Reset" buttons, the eye icon, the captions and the sample pictures).

${PEEPHOLE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { PeepholeButton } from "@/components/ui/peephole-button";

// From my brief. Leave out any prop that stays at its default.
export function TalkToUs() {
  return (
    <PeepholeButton
      variant="fill"                          // question 2
      image="/team/ava.jpg"                   // question 1: a picture from my project
      shape="circle"                          // question 3
      side="right"                            // question 3
      slotSize={32}                           // question 3
      fillColor="var(--primary)"              // question 4: my theme variable, never a hex code
      fillTextColor="var(--primary-foreground)"
      onClick={() => openChat()}
    >
      Talk to Ava
    </PeepholeButton>
  );
}
\`\`\`

- If a color variable holds bare channels (for example \`222 47% 11%\`), wrap it: \`fillColor="hsl(var(--primary))"\`.
- \`image\` is any image URL the page can load. Use a picture at least twice the button's size so it stays sharp when open.

${PEEPHOLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At rest the button is glass with my picture showing only inside the slot I chose (shape, side, size). Hovering stretches the window open across the whole button in about half a second (reveal: the whole picture shows; fill: my brand color pours in and the label turns to my chosen color as it passes). Moving away closes it in about 0.4 seconds.
- It looks right in light and dark mode (check both): the glass, its edge, my colors and the label read on both.
- On a phone, pressing opens it, it closes a moment after the finger lifts, the button works on the first tap, and there is no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, it switches open and closed with no stretch.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/peephole-button.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
