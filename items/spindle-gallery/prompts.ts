/* ---------- Spindle Gallery ----------
 * Install: adds the exact gallery; asks only where it goes and which pictures it shows.
 * Blend: asks three short questions, then fits it through the component's own props. */

const SPINDLE_ONE_LINE = `A picture gallery that opens with a small show: round pictures orbit like planets, fall into one stack in the middle, then open into a ring of tall flat cards round an open middle, each card set at an angle with space between them, and the ring turns slowly in 3D. I can drag it sideways (or swipe on a phone) to spin it and flick it to throw it; with a mouse, dragging up or down also tilts it a little and it springs back. The pictures are only pictures: they can't be selected, dragged out of the page or clicked through to anywhere. There are no words on it.`;

const SPINDLE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/spindle-gallery.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it moves plain \`<div>\`s and \`<img>\`s with CSS 3D transforms, and its few styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`spindle-gallery.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/spindle-gallery.tsx\`
- Keep these exports and their names: \`SpindleGallery\` (also the default export), \`SpindleGalleryProps\`, \`SpindleImage\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`DISC_START\`, \`DISC_STAGGER\`, \`DISC_POP\`, \`ORBIT_HOLD\`, \`MERGE_MS\`, \`STACK_MS\`, \`SPIN\`, \`SPIN_MAX\`, \`STACK_CORNER\`, \`TILT\`, \`DEPTH\`, \`SKIP_SPEED\`, \`FAN_MS\`, \`FAN_STAGGER\`, \`ASPECT\`, \`CORE\`, \`ANGLE\`, \`VIEW_X\`, \`VIEW_Z\`, \`SPEED\`, \`HOVER_SLOW\`, \`SETTLE\`, \`THROW_MAX\`, \`DRAG_START\`, \`TILT_MAX\`, \`TILT_K\`, \`TILT_C\`, \`KEY_EASE\`, \`SHADE\`, the easing functions and the \`CSS\` block. They are the design and its timing.
- Keep the picture rules: every \`<img>\` has \`draggable={false}\`, and the CSS turns off selecting, the long-press menu on phones and pointer events on pictures. There are no links: a picture never goes anywhere when clicked.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` there is no orbit, the ring shows at once and stands still until dragged, without the tilt. The gallery is one focusable region: the arrow keys turn it one page at a time and Space pauses or resumes the turning. Screen readers hear each picture's \`alt\`. A picture that fails to load keeps a soft placeholder.`;

const SPINDLE_HOW = `## How the gallery works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **It waits to be seen.** Nothing moves until a third of the gallery is on screen and the pictures have loaded (or 1.2 seconds have passed). The intro only ever plays once.
2. **The orbit.** From 0.12 seconds, the pictures pop in one after another, 70ms apart, as circles on a tilted ring, each with a small overshoot. The ring is an ellipse 78% as tall as it is wide, and pictures at the front are 10% bigger and drawn over the ones at the back. It turns slowly (0.55 radians a second). There is no text in the middle.
3. **The fall.** 0.75 seconds after the last picture is in, the ring falls into the middle in 0.86 seconds, faster and faster like gravity, spinning faster as it shrinks.
4. **The stack.** The pictures land in one loose stack, each tilted a little, with a small squash, grow a little and square off into a loose deck of rounded cards (0.42 seconds). The first picture is on top.
5. **The ring opens.** Each card grows into a tall page and swings out to its place round the ring, half of them one way and half the other, the first picture first and the others 45ms later for each place away from it (1.25 seconds each). The pages don't meet in one point: each one starts a fifth of a page width from the centre, leaving an open middle, and is turned 32 degrees off the line from the centre, like the blades of a fan. While it opens, the whole ring tips back 16 degrees so you look down on it a little, and leans 7 degrees to the right. A tap, drag, wheel or key during the orbit plays the rest 3.2 times faster instead of jumping.
6. **The cards.** Each page is one flat picture card with space between it and the next. A card turned edge-on darkens a little (up to 45%), like light from the front, which shows the depth. The back of each card shows its picture the right way round.
7. **The turn.** The ring turns on its own at \`speed\` degrees a second (30 by default, one turn in 12 seconds), right to left at the front. A mouse over it slows it to 35% so people can look closer. Pages are 1.3 times as tall as they are wide, about a third of the gallery's width on a wide screen and never taller than 54% of its height, so the turning ring never touches the edges.
8. **The hand.** A press becomes a drag after 5px. Dragging sideways spins it with the page under the pointer following it; with a mouse, dragging up or down also tilts it up to 16 degrees and it springs back with a small bounce when you let go. A flick throws it (up to 900 degrees a second), then it eases back to its own speed over about 0.7 seconds, turning the way you threw it. A sideways trackpad swipe or Shift + wheel turns it too; a normal vertical scroll stays with the page. On a phone, a mostly vertical swipe scrolls the page.
9. **Colors and speed.** The gallery has no background and no words of its own. The focus ring and the soft placeholder take the text color around it, so they follow light and dark mode. Only transforms and opacity change while it moves, and it only draws while it is on screen; with \`speed={0}\` it stops drawing once it is still.`;

export function installPrompt(tsSource: string) {
  return `# Spindle Gallery

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${SPINDLE_ONE_LINE}

## Before you build: one question

Look through this project first: pages that show work, products or campaigns (a launch or landing page, a portfolio or work section, a collection or lookbook page), any image grid or slider it already has, and where its pictures live. Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the 8–12 pictures you would use. I can pick one or name another.
  *Why: the ring is a showpiece, so it belongs where my product already has strong, tall pictures worth turning round.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The intro (round pictures orbiting, falling into one stack and opening into the ring) with its timing, the ring's open middle and angled cards with space between them, the slow 3D turn with its look-down angle and lean, and the drag, throw and tilt are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing gallery or slider there, keep that spot's data and remove only the old gallery. Don't add packages, change other files, or restyle anything. Never wrap the pictures in links.
- Don't add the demo parts from the Impeccable website: its ten posters, the card around it, and the home page's TV.

${SPINDLE_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { SpindleGallery, type SpindleImage } from "@/components/ui/spindle-gallery";

const posters: SpindleImage[] = [
  { src: "/campaign/spring.jpg", alt: "Spring campaign poster, a runner at sunrise" },
  { src: "/campaign/studio.jpg", alt: "Studio portrait with the new bottle" },
  { src: "/campaign/coast.jpg", alt: "The bottle on a rock in clear water" },
  // 8 to 12 pictures work best
];

export function Campaign() {
  return <SpindleGallery images={posters} height={560} aria-label="Spring campaign" />;
}
\`\`\`

- Use 8 to 12 pictures with real \`alt\` text. Tall pictures (about 3 by 4) fit best: each one is cropped to the middle to fill its page. Keep each file small (about 500px wide, WebP): the browser loads each picture once and reuses it for both sides of its card.
- Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`), or they stay as placeholders.
- Give it a height (\`height\`, default 560px). It fills the width it is given and has no background, so put it on a section that already has my page background.

${SPINDLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- When it scrolls into view, the round pictures orbit, fall into one stack and open into a ring of flat cards round an open middle in about 5 seconds, then the ring turns slowly right to left. Dragging spins it, a flick throws it and it eases back to its slow turn. Clicking a picture does nothing, and pictures can't be selected or dragged out.
- It looks right in light and dark mode (check both): the pages, the focus ring and the placeholders read well on each background.
- It works with a finger on a phone: a sideways swipe spins it, an up-and-down swipe scrolls the page, a long press shows no picture menu, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no orbit, the ring shows at once and stands still until dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/spindle-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Spindle Gallery, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${SPINDLE_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that show work, products or campaigns, any image grid or slider it already has, where its pictures live, its corner radius tokens, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures does it show?** Suggest the 1–3 spots it fits best, naming the 8–12 pictures you'd use.
      *Why: the ring is a showpiece, so it belongs where my product already has strong, tall pictures worth turning round.*
   2. **The pace and corners?** The default slow turn (30 degrees a second) with 14px corners (suggested), a calmer turn (15) with my theme's corner radius, or still until someone drags it (0).
      *Why: the speed sets the mood of the whole section, and the corners make the pages match my other cards.*
   3. **The intro?** Play the orbit the first time it scrolls into view (suggested), or show the ring at once (for a page people visit every day).
      *Why: the orbit is a first impression; on a screen people open daily it can feel slow.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the pace and corners, the intro, and "Everything else is kept as designed." Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, its \`height\` and \`aria-label\`, and \`images\` (each \`src\` and \`alt\`).
- The pace and corners: \`speed\` (degrees a second, 0 to 360, default 30) and \`radius\` (px, default 14).
- The intro: \`intro\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The intro (orbit, fall, stack, ring) with its timing, the ring's open middle and angled cards with space between them, the look-down angle, lean and edge-on shading, and the drag, throw and tilt stay exactly as in the source. Pictures are never links. If something doesn't fit my product, tell me instead of changing it.
- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its ten posters, the card around it and the home page's TV).

${SPINDLE_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { SpindleGallery, type SpindleImage } from "@/components/ui/spindle-gallery";

// From my brief. Leave out any prop that stays at its default.
export function Campaign({ shots }: { shots: { url: string; caption: string }[] }) {
  const images: SpindleImage[] = shots.map((s) => ({ src: s.url, alt: s.caption }));
  return (
    <SpindleGallery
      images={images}
      speed={15}
      radius={12} // my theme's radius in px
      height={560}
      aria-label="Spring campaign"
      className="text-foreground" // the focus ring and placeholders take this text color
    />
  );
}
\`\`\`

- Colors come from the text color around it (\`color\` on the gallery or its parent, from my theme's variables). Never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- \`radius\` is a number of pixels: read my theme's radius token and use its pixel value.
- Pictures from another domain must be allowed by my Content-Security-Policy (\`img-src\`). Keep each file small (about 500px wide, WebP).

${SPINDLE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My pictures orbit, fall into one stack and open into the ring (or show at once if I turned the intro off), and the ring turns at my pace with my corners. Dragging spins it, a flick throws it, and clicking a picture does nothing.
- It looks right in light and dark mode (check both): the pages, the focus ring and the placeholders read well on each background.
- It works with a finger on a phone: a sideways swipe spins it, an up-and-down swipe scrolls the page, a long press shows no picture menu, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no orbit, the ring shows at once and stands still until dragged.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/spindle-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
