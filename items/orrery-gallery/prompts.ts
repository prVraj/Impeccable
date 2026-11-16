/* ---------- Orrery Gallery ----------
 * Install: adds the exact gallery; asks only where it goes and which pictures and links it shows.
 * Blend: asks four short questions, then fits it through the component's own props. */

const ORRERY_ONE_LINE = `A picture gallery that opens with a small show: round pictures orbit my brand name like planets, fall into one stack in the middle, then open into a curved strip that fills the width. The strip can be dragged (or swiped on a phone) and loops forever. It works like a rubber band held at both sides: dragging right to left pinches the middle in from top and bottom, dragging left to right pushes the middle out a little, while both ends keep their height. When I let go it glides, wobbles back into shape and settles on the nearest picture. A soft blur at the left and right edges makes pictures drift out of focus as they leave. Clicking a picture opens its link; a drag never counts as a click. The only words on it are the brand name, in the middle of the orbit and then small in one corner.`;

const ORRERY_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/orrery-gallery.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: it draws on one \`<canvas>\` with plain JavaScript, and its few styles sit in a \`<style>\` tag inside the file.
- JavaScript project? Name the file \`orrery-gallery.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/orrery-gallery.tsx\`
- Keep these exports and their names: \`OrreryGallery\` (also the default export), \`OrreryGalleryProps\`, \`OrreryImage\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the tuning values at the top exactly as written: \`WORD_IN\`, \`DISC_START\`, \`DISC_STAGGER\`, \`DISC_POP\`, \`ORBIT_HOLD\`, \`MERGE_MS\`, \`STACK_MS\`, \`UNFURL_MS\`, \`UNFURL_STAGGER\`, \`SPIN\`, \`SPIN_MAX\`, \`TILT\`, \`DEPTH\`, \`SKIP_SPEED\`, \`DRAG_START\`, \`MOMENTUM\`, \`SNAP_K\`, \`SNAP_C\`, \`SQUEEZE_MAX\`, \`STRETCH_MAX\`, \`SQUEEZE_K\`, \`SQUEEZE_C\`, \`LEAN_K\`, \`LEAN_C\`, \`WARP_K\`, \`WARP_C\`, \`LIFT\`, the easing functions and the \`CSS\` block. They are the design and its timing.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` there is no orbit (the strip shows at once) and dragging moves the strip without the rubber-band pinch. Each linked picture is also a real, visually hidden \`<a>\`, so Tab reaches every picture: the strip slides it to the middle and draws a ring round it, Enter opens it, and the arrow keys move one picture at a time. Screen readers hear each picture's \`alt\` as the link name. A picture that fails to load keeps a soft placeholder. Links that start with \`javascript:\` or \`data:\` are dropped.`;

const ORRERY_HOW = `## How the gallery works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **It waits to be seen.** Nothing moves until a third of the gallery is on screen and the pictures have loaded (or 1.2 seconds have passed). The orbit only ever plays once.
2. **The orbit.** The brand name fades in from a soft blur in the middle (0.7 seconds). From 0.28 seconds, the pictures pop in one after another, 70ms apart, as circles on a tilted ring round the name, each with a small overshoot. The ring is an ellipse 78% as tall as it is wide, and pictures at the front are 10% bigger and drawn over the ones at the back, so it reads like planets on an orrery. It turns slowly (0.55 radians a second).
3. **The fall.** 0.75 seconds after the last picture is in, the ring falls into the middle in 0.86 seconds, faster and faster like gravity. It spins faster as it shrinks, like a skater pulling in their arms. The name blurs, shrinks and fades as the pictures cover it.
4. **The stack.** The pictures land in one loose stack, each tilted a little, with a small squash, grow a little and square off into a loose deck of rounded cards (0.42 seconds). The first picture is on top.
5. **The unfurl.** Each card flies from the stack to its place in the strip, the middle one first and the others 60ms later for each place away from the middle (0.98 seconds each). The width leads and the height follows a beat later, and the circle turns into a card with \`radius\` corners on the way. Then the curve settles in with a small bounce. A tap, drag, wheel or key during the intro plays the rest 3.2 times faster instead of jumping.
6. **The strip.** About 3 pictures show on a wide screen, 2.4 on a tablet and 1.3 on a phone, with a small gap between them. The strip is shorter in the middle and taller at the sides (\`bend\`), like the inside of a cylinder; each picture is drawn as thin columns stretched to that curve. It loops forever. Both sides carry a soft blur (three layers, 1.5px, 4px and 9px, strongest at the edge, about 13% of the width each), which fades in as the strip opens, so the middle picture is the one in focus.
7. **The rubber.** The strip behaves like a rubber band pinned at the left and right edges of the box: the ends always keep their height and only the middle moves. Moving it right to left pinches the middle in from top and bottom (up to 24% shorter); left to right pushes the middle out a little (up to 12% taller). The deepest point leans a little with the movement. Both follow springs, so the band wobbles back when the strip stops. After a flick the strip glides on (0.22 seconds of momentum), then a spring settles it on the nearest picture with a hint of overshoot. The mouse wheel only scrolls it sideways (a trackpad swipe or Shift + wheel); a normal vertical scroll stays with the page.
8. **Clicks.** A press becomes a drag after 6px of movement, and a drag never opens a link. A plain click or tap opens the picture's link. On a phone, a mostly vertical swipe scrolls the page. Hovering a linked picture shows a pointer and lifts it 3.5% taller.
9. **The mark.** As the strip opens, the brand name fades up in the corner (\`markPosition\`), 13px and semibold.
10. **Colors and theme.** The gallery has no background of its own. The name, the mark and the keyboard ring take the text color around it, so they follow light and dark mode. The drawing stops when the gallery is off screen or still, so it costs nothing at rest.`;

export function installPrompt(tsSource: string) {
  return `# Orrery Gallery

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ORRERY_ONE_LINE}

## Before you build: one question

Look through this project first: pages that show work, products or people (a portfolio or work section, a launch or landing page, a case-study list, a team or collection page), any image grid or slider it already has, where its pictures live and where each one should link to, and its brand name. Then ask me this in one message and wait for my answer:

- **Where should it go, and which pictures and links does it show?** Suggest the 1–3 spots it fits best from my code. For each one, name the 6–12 pictures you would use (with the page each one opens) and the brand name you'd put in the middle. I can pick one or name another.
  *Why: the orbit only feels special with real pictures that lead somewhere, so it belongs where my product already has work worth opening.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The intro (round pictures orbiting the name, falling into one stack and opening into the strip) with its timing, the curved strip with its rubber-band pinch and bulge (the ends keep their height, only the middle moves) and wobble when dragged, the soft blur on both sides, the snap to the nearest picture and the 6px drag threshold are the design. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing gallery or slider there, keep that spot's data and remove only the old gallery. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: its ten studio pictures and their links to Impeccable pages, the card around it, and the home page's TV.

${ORRERY_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { OrreryGallery, type OrreryImage } from "@/components/ui/orrery-gallery";

const work: OrreryImage[] = [
  { src: "/work/atlas.jpg", alt: "Atlas, a travel app", href: "/work/atlas" },
  { src: "/work/fern.jpg", alt: "Fern, a plant shop", href: "/work/fern" },
  { src: "/work/north.jpg", alt: "North, a winter campaign", href: "https://north.example.com", newTab: true },
  // 6 to 12 pictures work best
];

export function Work() {
  return <OrreryGallery images={work} brand="Studio Name" height={540} aria-label="Selected work" />;
}
\`\`\`

- Use 6 to 12 pictures with real \`alt\` text; each \`alt\` is also the link's name for screen readers. Landscape pictures fit best: each one is cropped to the middle to fill its card.
- Pictures from another domain must be allowed by the project's Content-Security-Policy (\`img-src\`), or they stay as placeholders.
- Give it a height (\`height\`, default 520px). It fills the width it is given and has no background, so put it on a section that already has my page background.

${ORRERY_HOW}

## Check

- It type-checks and the page renders with no console errors.
- When it scrolls into view, the name fades in, the round pictures orbit it, fall into one stack and open into the curved strip in about 4 to 5 seconds, then the name settles small in the corner. The left and right edges are softly blurred so pictures fade out of view. Dragging right to left pinches the middle of the strip like a rubber band while both ends keep their height, left to right bulges it a little, and on release it glides, wobbles and settles on a picture. A click opens the picture's link; a drag never does.
- It looks right in light and dark mode (check both): the name, the corner mark and the keyboard ring are readable in each.
- It works with a finger on a phone: a sideways swipe moves the strip, an up-and-down swipe scrolls the page, a tap opens a link, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no orbit, the strip shows at once and it moves without the rubber-band pinch.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/orrery-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Orrery Gallery, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ORRERY_ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: pages that show work, products or people, any image grid or slider it already has, where its pictures live and where each should link, its brand name and logo text, its corner radius tokens, and its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go, and which pictures and links does it show?** Suggest the 1–3 spots it fits best, naming the 6–12 pictures and the page each one opens.
      *Why: the orbit only feels special with real pictures that lead somewhere, so it belongs where my product already has work worth opening.*
   2. **The name, and where the small mark sits?** My brand name as written in my logo (suggested) or a section name like "Work", with the small mark bottom-left (suggested, it stays clear of a header) or top-right.
      *Why: the name is the only word on the gallery, so it should read exactly like my brand.*
   3. **The shape?** The default curve and 10px corners (suggested), a flatter curve with my theme's corner radius for a calmer page, or a deeper curve for a bolder one.
      *Why: the curve and corners are what make the strip feel like part of my design system or a statement piece.*
   4. **The intro?** Play the orbit the first time it scrolls into view (suggested), or show the strip at once (for a page people visit every day).
      *Why: the orbit is a first impression; on a screen people open daily it can feel slow.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place and pictures, the name and mark corner, the shape, the intro, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place and pictures: where the component is rendered, its \`height\` and \`aria-label\`, and \`images\` (each \`src\`, \`alt\`, \`href\` and \`newTab\`).
- The name and mark corner: \`brand\` and \`markPosition\`.
- The shape: \`bend\` (0 flat to 0.6, default 0.32) and \`radius\` (px, default 10).
- The intro: \`intro\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The intro (orbit, fall, stack, unfurl) with its timing, the curved strip with its rubber-band pinch, bulge and wobble, the soft side blur, the snap to the nearest picture and the 6px drag threshold stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (its ten studio pictures and their links, the card around it and the home page's TV).

${ORRERY_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { OrreryGallery, type OrreryImage } from "@/components/ui/orrery-gallery";

// From my brief. Leave out any prop that stays at its default.
export function Work({ projects }: { projects: { slug: string; title: string; cover: string }[] }) {
  const images: OrreryImage[] = projects.map((p) => ({ src: p.cover, alt: p.title, href: \`/work/\${p.slug}\` }));
  return (
    <OrreryGallery
      images={images}
      brand="Studio Name" // exactly as my logo writes it
      markPosition="bottom-left"
      bend={0.24}
      radius={12} // my theme's radius in px
      height={540}
      aria-label="Selected work"
      className="text-foreground" // the name and mark take this text color
    />
  );
}
\`\`\`

- Colors come from the text color around it (\`color\` on the gallery or its parent, from my theme's variables). Never copy hex values. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- \`radius\` is a number of pixels: read my theme's radius token and use its pixel value.
- Pictures from another domain must be allowed by my Content-Security-Policy (\`img-src\`).

${ORRERY_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My pictures orbit my name, fall into one stack and open into the strip with my curve and corners (or show at once if I turned the intro off), and my name settles in my chosen corner. Both sides are softly blurred. Dragging right to left pinches the middle of the strip like a rubber band while the ends keep their height, left to right bulges it a little, and on release it settles on a picture. A click opens that picture's link; a drag never does.
- It looks right in light and dark mode (check both): my name, the corner mark and the keyboard ring are readable in each.
- It works with a finger on a phone: a sideways swipe moves the strip, an up-and-down swipe scrolls the page, a tap opens a link, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no orbit, the strip shows at once and it moves without the rubber-band pinch.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/orrery-gallery.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
