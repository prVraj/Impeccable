/* ---------- Tumble Gallery ----------
 * Install: adds the exact gallery; asks only where it goes and which pictures it shows.
 * Blend: asks three short questions, then fits it through the component's own props. */

const TUMBLE_ONE_LINE = `A picture gallery that works like a split flap board, the kind with cards that turn round a hinge. The picture in view sits flat, whole and facing me, with no line or gap across its middle. Every 2 seconds one flap falls forward toward me over the middle hinge, slow at first and faster and faster, and lands flat on the next picture. It never skips a picture. Hovering with a mouse pauses it, and dragging up or down (with a finger too) flips it by hand. It needs at least 4 pictures. The pictures are only pictures: they can't be selected, dragged out or clicked through to anywhere. There are no words on it.`;

const TUMBLE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/tumble-gallery.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it moves plain \`<div>\`s and \`<img>\`s with CSS 3D transforms, and its few styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`tumble-gallery.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/tumble-gallery.tsx\`
- Keep these exports and their names: \`TumbleGallery\` (also the default export), \`TumbleGalleryProps\`, \`TumbleImage\`, \`TumbleImages\`, \`TUMBLE_MIN\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`TUMBLE_MIN\`, \`ASPECT\`, \`MAX_W\`, \`FILL_W\`, \`ROOM_H\`, \`VIEW\`, \`LEAN\`, \`FLIP_MS\`, \`SETTLE_MS\`, \`REST_MS\`, \`SHADE\`, \`SEAL\`, \`DRAG_START\`, \`FLICK\`, the easing functions and the \`CSS\` block. They are the design and its timing.
- Keep the 4 picture minimum: the \`TumbleImages\` type makes fewer than 4 a type error, and at runtime fewer than 4 shows a small notice instead of the board and logs an error. Never pad, repeat or drop pictures to get round it.
- Keep the picture rules: every \`<img>\` has \`draggable={false}\`, and the CSS turns off selecting, the long-press menu on phones and pointer events on pictures. There are no links: a picture never goes anywhere when clicked.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` it never flips on its own and only moves when dragged. Screen readers hear the picture in view as \"2 of 5\" plus its \`alt\`, from one hidden line; the flaps themselves are hidden from them. A picture that fails to load keeps a soft placeholder.`;

const TUMBLE_HOW = `## How the gallery works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The board.** Every picture is cut across the middle into a top half and a bottom half. Each flap is half a picture tall and hangs on one hinge across the middle: its front shows the top half of one picture and its back shows the bottom half of the next. So when a flap falls over the hinge, it uncovers the next top half behind it and lands showing the matching bottom half, and the picture in view is always whole, flat and facing me. The two halves in view overlap by 2px at the hinge (showing the same pixels), so no line or gap shows across it; only those two flat halves overlap, never a leaning flap.
2. **The wheel.** The flaps go round the hinge like the cards of a card file. Flaps waiting on top stand behind the one in view, each leaning 7 degrees further back; fallen flaps hang below, each leaning 7 degrees further back; one at a time swings round the back from the bottom stack to the top one, out of sight. That flap is why it needs at least 4 pictures. A deep perspective (2.2 picture heights) makes a flap swinging at me look big, like the reference.
3. **The flip.** Every 2 seconds (\`interval\`) exactly one flap falls, so it moves to the next picture and never skips one. The flip takes 0.8 seconds with a cubic ease in: slow at the start and faster and faster until it lands.
4. **Light.** A flap's front darkens as it tips toward me and its back lightens as it lands (up to 42%), so each flap reads as a turning card.
5. **The pause.** A mouse over it pauses it after the flip in progress lands, and a fresh 2 second rest starts when the mouse leaves. It also rests while it is off screen or the tab is hidden.
6. **The hand.** A press becomes a drag after 4px. Dragging down pulls the top flaps toward me over the hinge, half a picture's height for each flap; dragging up turns them back. Letting go lands on the nearest picture, and a flick moves one more, but one drag never goes more than one picture away. This works with a finger too, so on a phone a swipe that starts on the gallery flips it instead of scrolling the page.
7. **Size.** It fills its width. Without \`height\` it keeps a 3:2 shape (at most 560px tall), and each picture is at most 580px wide and 72% of the width, so a flap swinging toward me never gets cut off. Only transforms and opacity change while it moves.`;

export function installPrompt(tsSource: string) {
  return `# Tumble Gallery

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${TUMBLE_ONE_LINE}

## Before you build: one question

Look through this project first: pages that show work, places or products (a hero, a portfolio or case study, a gallery or about page), any image slider it already has, and where its pictures live. Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the 4 or more pictures you would use (5 is the default).
  *Why: it shows one picture at a time, big, so it belongs where my product has strong wide pictures worth looking at one by one.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The split flap board with the picture in view flat and whole, one flip every 2 seconds with its slow to fast easing, the hover pause and the drag up or down are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing slider there, keep that spot's data and remove only the old slider. Don't add packages, change other files, or restyle anything. Never wrap the pictures in links.
- Don't add the demo parts from the Impeccable website: its five travel photos, the card around it, and the home page's TV.

${TUMBLE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { TumbleGallery, type TumbleImages } from "@/components/ui/tumble-gallery";

const shots: TumbleImages = [
  { src: "/work/studio.jpg", alt: "The studio desk with the new prototype" },
  { src: "/work/launch.jpg", alt: "Launch day, the team on stage" },
  { src: "/work/app.jpg", alt: "The app's home screen on a phone" },
  { src: "/work/sketch.jpg", alt: "First sketches of the logo" },
  { src: "/work/print.jpg", alt: "The printed poster on a wall" },
];

export function Work() {
  return <TumbleGallery images={shots} aria-label="Our work" />;
}
\`\`\`

- Use at least 4 pictures (5 is a good default) with real \`alt\` text. Wide pictures fit best: each one is cropped to the middle at 4:3. Keep each file small (about 700px wide, WebP).
- Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`), or they stay as placeholders.
- Leave out \`height\` to keep its own shape, or give one. It fills the width it is given and has no background, so put it on a section that already has my page background.

${TUMBLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The picture in view is flat and whole, with no line across its middle. Every 2 seconds one flap falls toward me, slow at first and faster at the end, and lands on the next picture in under a second, never skipping one. Hovering pauses it, dragging up or down flips it, and clicking a picture does nothing. Passing 3 pictures shows the notice instead of the board.
- It looks right in light and dark mode (check both): the pictures, the darkening flaps and the placeholders read well on each background.
- It works with a finger on a phone: a swipe up or down on it flips it, a long press shows no picture menu, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, it never flips on its own and only moves when dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tumble-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Tumble Gallery, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${TUMBLE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that show work, places or products, any image slider it already has, where its pictures live, its corner radius tokens, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best, naming the 4 or more pictures you'd use (5 is the default).
      *Why: it shows one picture at a time, big, so it belongs where my product has strong wide pictures worth looking at one by one.*
   2. **The pace?** The default: a 2 second rest between flips (suggested); a calmer 4 second rest; or no auto flip at all, so it only moves when dragged.
      *Why: the rest between flips sets the mood of the section: lively, calm, or fully in the visitor's hands.*
   3. **The corners?** The default calm 20px corners (suggested), or my theme's corner radius so the pictures match my other cards.
      *Why: the corners are the only shape detail on it, so they decide whether it looks native to my product.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the pace, the corners, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, its \`height\` and \`aria-label\`, and \`images\` (at least 4, each \`src\` and \`alt\`).
- The pace: \`interval\` (ms between flips, 300 to 60000, default 2000) and \`autoPlay\` (default on).
- The corners: \`radius\` (px, default 20).

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The split flap board with the picture in view flat and whole, the single flip with its slow to fast easing, the flap shading, the hover pause, the drag up or down and the 4 picture minimum stay exactly as in the source. Pictures are never links. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its five travel photos, the card around it and the home page's TV).

${TUMBLE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { TumbleGallery, type TumbleImage, type TumbleImages } from "@/components/ui/tumble-gallery";

// From my brief. Leave out any prop that stays at its default.
export function Work({ shots }: { shots: { url: string; caption: string }[] }) {
  const images = shots.map((s): TumbleImage => ({ src: s.url, alt: s.caption }));
  if (images.length < 4) return null; // the gallery needs at least 4
  return (
    <TumbleGallery
      images={images as TumbleImages}
      interval={4000}
      radius={12} // my theme's radius in px
      aria-label="Our work"
      className="text-foreground" // the placeholders take this text color
    />
  );
}
\`\`\`

- Colors come from the text color around it (\`color\` on the gallery or its parent, from my theme's variables): the placeholders mix it in . Never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- \`radius\` is a number of pixels: read my theme's radius token and use its pixel value.
- Pictures from another domain must be allowed by my Content-Security-Policy (\`img-src\`). Keep each file small (about 700px wide, WebP).

${TUMBLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My pictures sit flat in view and flip over the middle hinge onto the next one at my pace (or only when dragged if I turned auto flip off), with my corners. Hovering pauses it, dragging up or down flips it, and clicking a picture does nothing.
- It looks right in light and dark mode (check both): the pictures, the darkening flaps and the placeholders read well on each background.
- It works with a finger on a phone: a swipe up or down on it flips it, a long press shows no picture menu, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, it never flips on its own and only moves when dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/tumble-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
