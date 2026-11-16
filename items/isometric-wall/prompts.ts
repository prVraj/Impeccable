/* ---------- Isometric Wall ----------
 * Install: adds the exact background; asks where it goes and which pictures it shows.
 * Blend: asks five short questions, then fits it through the component's own props. */

const ISOMETRIC_WALL_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/isometric-wall.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the floor is plain elements turned with one CSS transform, and the drift is one Web Animations call.
- JavaScript project? Name the file \`isometric-wall.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/isometric-wall.tsx\`
- Keep these exports and their names: \`IsometricWall\`, \`IsometricWallProps\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`TILT\`, \`TURN\`, \`ASPECT\`, \`GAP\`, \`LOOP_ROWS\`, \`LIFT_MS\`, \`DROP_MS\`, \`LIFT_EASE\`, \`DROP_EASE\`, \`ENTER_MS\`, \`ENTER_SPREAD_MS\`, \`ENTER_EASE\`, \`READY_WAIT_MS\`, \`FADE\`, \`FADE_MIN\`, \`PATTERN\`, the \`EDGE_MASK\` and the \`CSS\` block. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the wall stands still, the cards only fade in and a hovered card only deepens its shadow. Touch screens get the drift without the lift. Off screen the drift pauses, and the pictures load only when the wall comes within 300px of the screen.
- Keep the wall out of the way: \`pointer-events: none\`, \`user-select: none\` and \`aria-hidden\` on its layer, and \`alt=""\` on its pictures. It must never catch a click, a text selection or a screen reader.
- Pictures: use small files, about 480px wide (WebP if the project can), because up to 16 of them load at once. They are cropped to 3:2 cards, so landscape photos work best.`;

const ISOMETRIC_WALL_HOW = `## How the wall works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The floor.** All the cards sit on one flat layer that is tipped back 56° and turned 45°, with no perspective, like an isometric drawing of prints on a table. The cards are 3:2, with a gap of 10% of a card's width between them.
2. **The columns.** The cards stand in columns along the floor's depth, so on screen each column runs diagonally, down and to the right. Every other column sits half a card further along, like bricks. The card width comes from the box: about 7 columns on a wide box, 5 from 640px to 1024px, 3 below 640px (or \`columns\`).
3. **The drift.** Every column slides along itself, up and to the left, \`speed\` px a second (12), in one linear compositor animation on the floor. After 4 cards it is back where it started, picture for picture, because the pictures follow a fixed 4 x 4 pattern (\`PATTERN\`). So it loops forever with no seam and no script running each frame. It fills the box plus one loop and one card all round, and no more.
4. **The lift.** A hovered card rises \`lift\` px (8) straight up the screen in 320ms with a quick start and a long soft finish, and settles back in 480ms, a touch slower. Its shadow sits on the floor and crossfades from a close, small shadow to a wider, softer one further out, so the gap under the card reads as height. The shadow starts from a smaller box under the card, so a lifted card never shows a hard shadow edge. The drift never stops: the hovered card is worked out from the pointer and the current drift, so when a card drifts out from under a still mouse the next one takes over. Hover only runs for a real mouse.
5. **The look.** The floor is the page color (\`--background\`, else \`--bg\`), and each card is filled with it, so the pictures can be faded: 45% in light mode and 18% in dark mode (\`opacity\`, \`darkOpacity\`), with a hairline edge so dark cards keep their shape. Dark mode follows a \`.dark\` class or \`data-theme="dark"\` on any parent. The edges fade out through a mask (12% of the box's short side), measured from the nearest edge so the corners never fade twice.
6. **Coming in.** When the pictures are ready (or after 1.5s at most) the cards fade in and settle onto the floor over 900ms, from the middle outward over 600ms.`;

const ISOMETRIC_WALL_CHECK_COMMON = `- On a phone the wall drifts with 3 columns, nothing lifts, and the page still scrolls normally with no sideways scroll.
- With \`prefers-reduced-motion: reduce\`, the wall stands still, the cards only fade in, and a hovered card only deepens its shadow.
- Nothing else on the site looks or behaves differently.`;

export function installPrompt(tsSource: string) {
  return `# Isometric Wall

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

Faded picture cards lie on a tilted floor, fill the whole section in diagonal columns, and every column slides slowly along itself; the card under the mouse lifts gently with a softer shadow. It sits behind the content and never catches a click.

## Before you build: one question

Look through this project first: its landing and hero sections, its root layout, which sections have plain, empty backgrounds, and the images it already has (in \`public/\`, an assets folder or a CMS). Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures should it show?** Suggest the 1–3 sections it fits best behind (for example the hero), or the whole page. For a section, keep its content and wrap it in the wall. For the whole page, it goes once in the root layout, fixed to the screen. For the pictures, suggest 8–16 of my own images that fit, or offer placeholders I can swap later.
  *Why: the wall is calm but full of pictures, so it suits a hero with one short headline, and it can't show anything without pictures.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The tilted floor, the 7, 5 or 3 diagonal columns, the diagonal columns that slide slowly along themselves and never stop, the gentle 8px lift with its softer shadow, the faded pictures (45% light, 18% dark) and the soft edge fade are the design. Keep them exactly as in the source, with the default props. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file, the pictures and the one place I picked. If it wraps an existing section, keep that section's content and spacing. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the Impeccable UI hero (its heading, the button, the stars, the "Loved by" line and the faces), the soft clearing behind it and the demo photos.

${ISOMETRIC_WALL_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { IsometricWall } from "@/components/ui/isometric-wall";

const PHOTOS = ["/wall/01.webp", "/wall/02.webp", "/wall/03.webp" /* up to 16 */];

// Behind one section: wrap its content and give it a size.
export function Hero() {
  return (
    <IsometricWall images={PHOTOS} className="flex min-h-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1>Components that move</h1>
      <a href="/docs">Browse components</a>
    </IsometricWall>
  );
}

// Behind the whole page: once in the root layout, empty, fixed to the screen.
<IsometricWall images={PHOTOS} className="fixed inset-0 -z-10" />
\`\`\`

- It is a \`<div>\` and takes every div prop. \`className\` and \`style\` go on the box: give it a size (or let it fill its parent). The floor is the page color, so it needs no background.
- Everything inside it sits above the wall and works as normal. Keep the section's own tag and landmarks (\`<section>\`, \`<main>\`) inside it, or wrap the wall inside the section.
- If the headline sits on busy pictures, a soft page-colored glow behind the text (a radial gradient from the page color to transparent) keeps it readable. Add it in my section, never in the component.

${ISOMETRIC_WALL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The cards come in from the middle outward, then every column slides up and to the left along its diagonal, about 12px a second, without ever jumping. Resting the mouse on a card lifts it about 8px with a softer, wider shadow; the drift keeps going, and it settles back when the mouse leaves. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both): pictures clearly faded in light, very quiet in dark, and the edges fade out evenly into the page.
${ISOMETRIC_WALL_CHECK_COMMON}
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/isometric-wall.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Isometric Wall, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

Faded picture cards lie on a tilted floor, fill the whole section in diagonal columns, and every column slides slowly along itself; the card under the mouse lifts gently with a softer shadow. It sits behind the content and never catches a click. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its landing and hero sections, its root layout, how busy each section is, the images it already has (in \`public/\`, an assets folder or a CMS), its corner radius tokens, its theme (CSS variables, Tailwind theme, shadcn theme) and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 sections it fits best behind (the hero, a sign-up section, a closing call to action), or the whole page, fixed to the screen.
      *Why: the wall is calm but full of pictures, so it suits a section with one short headline and room around it.*
   2. **Which pictures?** Suggest 8–16 of my own images that tell my product's story (product shots, customer photos, places), or placeholders I can swap later.
      *Why: the pictures are the whole texture of the wall; 16 look best, fewer repeat more often.*
   3. **How calm?** Default (45% in light mode, 18% in dark, suggested), quieter (32% and 12%) for a dense hero, or bolder (60% and 25%) when the wall is the point.
      *Why: it decides whether the wall reads as a soft texture behind the words or as a gallery people look at.*
   4. **How fast?** Default (12px a second, suggested), slower (8) for a very calm brand, or livelier (18).
      *Why: the drift is the only motion until someone hovers, so it sets the mood of the whole section.*
   5. **The corners?** Keep 14px, or match my design's corner radius token for images and cards.
      *Why: matching corners makes the cards feel like my product's own cards.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 6 lines: the place, the pictures, how calm, how fast, the corners, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which section it wraps (keeping that section's content), or the whole page with \`className="fixed inset-0 -z-10"\`.
- The pictures: \`images\`.
- How calm: \`opacity\` and \`darkOpacity\`.
- How fast: \`speed\`.
- The corners: \`radius\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The tilted floor (56° back, 45° turned, no perspective), the 7, 5 or 3 diagonal columns, the diagonal columns and their slide that never stops for a hover, the gentle 8px lift with its 320ms rise and 480ms landing, the shadow that grows wider and softer, the entrance from the middle out and the soft edge fade stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component, the pictures and the place I picked, no restyling, and none of the website's demo parts (the Impeccable UI hero with its heading, button, stars, "Loved by" line and faces, the soft clearing behind it and the demo photos).

${ISOMETRIC_WALL_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { IsometricWall } from "@/components/ui/isometric-wall";

// From my brief. Leave out any prop that stays at its default.
const PHOTOS = ["/wall/01.webp", "/wall/02.webp" /* … up to 16 of my own pictures */];

export function Hero() {
  return (
    <IsometricWall
      images={PHOTOS}
      opacity={0.45}
      darkOpacity={0.12}
      speed={8}
      radius={12} // my design's image radius, in px
      className="flex min-h-[640px] flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <h1>…my headline…</h1>
    </IsometricWall>
  );
}
\`\`\`

- The floor and the card fill come from my theme on their own (\`--background\`, else \`--bg\`), so never set a background color on the cards or copy hex values. If my theme's background variable holds bare channels (like \`0 0% 100%\`), tell me: the component expects a full color there.
- \`radius\` takes a number in px. Read my radius token's value and pass that number.
- Check the faded pictures against my light and dark backgrounds: the headline on top must stay easy to read in both. If it isn't, suggest the quieter setting or a soft page-colored glow behind the text in my section, never a change to the component.

${ISOMETRIC_WALL_HOW}

## Check

- It type-checks and the page renders with no console errors.
- It shows my pictures at the calmness and speed I chose: the cards come in from the middle outward, then every column slides along its diagonal without ever jumping. Resting the mouse on a card lifts it about 8px with a softer, wider shadow; the drift keeps going, and it settles back when the mouse leaves. Text on top can still be selected and every button and link on top still works.
- It looks right in light and dark mode (check both), with my corners, the headline easy to read and the edges fading out evenly into the page.
${ISOMETRIC_WALL_CHECK_COMMON}
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/isometric-wall.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
