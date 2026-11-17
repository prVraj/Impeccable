/* ---------- Reel Stats ----------
 * A section (a list of headings next to a framed picture that changes on hover).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks three short questions, then fits it through the section's own props. */

const ONE_LINE =
  "A stats section that answers a hover: a short list of headings on the left and a framed picture with a big number on the right. Point at a heading and its line of text opens, its picture rolls into the frame (going down the list the new picture rises from below and pushes the old one up, going up it rolls the other way, as if every picture was always there in one reel), and a soft tab in the frame's own color glides behind the text to the open heading, so the heading and its picture read as one piece. The old line of text eases out before the new one eases in.";

const REEL_STATS_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/reel-stats.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: CSS transitions move the reel, the tab and the rows, and the browser's own animation API drifts the text.
- JavaScript project? Name the file \`reel-stats.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/reel-stats.tsx\`
- Keep these exports and their names: \`ReelStats\`, \`ReelStatsProps\`, \`ReelStatsItem\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`ROLL_MS\`, \`STEP_MS\`, \`MAX_MS\`, \`LAG\`, \`DIM\`, \`INTENT_MS\`, \`TEXT_OUT_MS\`, \`TEXT_IN_MS\`, \`TEXT_IN_DELAY\`, \`TEXT_SHIFT\`, \`TEXT_BLUR\`, \`EASE\`, \`GLIDE\`, \`TEXT_OUT_EASE\`, \`TEXT_IN_EASE\`) exactly as written. They are the design: one step of the reel takes 680ms, plus 110ms for each extra row it passes, never more than 1000ms; each picture trails 36% of the frame's height inside its slot (so it is revealed more than slid) and the one leaving dims 35%; the pointer rests 60ms on a heading before it opens; the tab and the rows glide on a slow-start, slow-end curve (\`cubic-bezier(.45,.05,.25,1)\`) over the same time as the reel, while the reel itself uses \`cubic-bezier(.32,.72,0,1)\`; the old line of text fades, softens 3px and drifts 8px out over 380ms (eased), and the new one comes in over 640ms after 240ms on a soft ease-out, so nothing pops.
- Keep the colors as theme variables: text reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), the corners are three times \`--radius-lg\` (24px with an 8px theme radius) with the picture inside at that minus the 8px rim, and the frame and tab share one tint that never changes, 8% of the text color mixed into the page color with \`color-mix\` (or the \`tint\` prop), so it works in light and dark mode. The only fixed colors are the white number and its soft dark shade, because they sit on photos in both themes.
- Keep the speed rules: pictures load only when the section comes within 300px of the screen, the open one first and the rest right after it loads (or the moment someone chooses a row), and until a picture arrives its slot shows the tint. Only \`transform\`, \`opacity\` and the \`height\` of the open text change. So it adds nothing to the page's load time.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the pictures cross-fade in place, the rows open at once and the text doesn't drift; a picture that fails to load leaves its tinted slot with the number still readable; pictures can't be selected or dragged; the headings are real buttons (\`aria-expanded\`), arrow keys and Home/End move between them and focus opens them, and the number is also in the open row's text for screen readers.`;

const REEL_STATS_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Two columns, one shape.** On a section 600px wide or more (measured on the section's own width with a container query) the list sits on the left (5 parts) and the frame on the right (7 parts), with no gap. The frame is a tinted rim (8px) around a 4:3 window with the picture. Narrower, the frame sits on top and the list below it.
2. **The tab.** One tinted shape slides behind the open row. On wide layouts it reaches 8px into the frame's rim and has two small curved inside corners (16px, cut with a CSS mask) where it meets the frame, so the tab and the frame read as one piece of the same color. The list has room above and below (the corner radius plus the curve) so those curves never meet the frame's own rounded corners. On narrow layouts the tab is a plain rounded card.
3. **Measured, then glided.** The script measures each row's heading and each line of text, then writes the open row's text height and the tab's place and height straight to the page. CSS transitions on one slow-start, slow-end curve move all of them together, so the tab glides behind the text and never drifts from its row. It measures again when the width or the fonts change (without sliding), and divides by any scale on a parent so it also works inside a scaled preview.
4. **The reel.** Every picture has a slot, stacked in a column: the open one at 0, the rest above or below at their distance (\`--o\`, in frames). Changing the open row moves every slot at once, so going down the list the next picture rises from below and pushes the current one up, and going up the reverse; skipping rows rolls past the ones between. Each picture also moves the other way inside its slot by 36% of \`--o\` (so it is revealed more than slid, with no gaps), and a dark layer fades in on the picture leaving.
5. **The text.** The open row's text area grows to its text's height while the old one shrinks, on the same curve as the tab. The old line fades, softens and drifts 8px the way the reel moves (380ms, eased, so it is gone before its space closes); the new one fades in from the other side once the old one is mostly gone (640ms after 240ms, soft ease-out).
6. **One color.** The frame, the tab and any empty slot while its picture loads share one tint (\`--irs-tint\`, from the \`tint\` prop or 8% of the text color in the page color). It never changes between rows: only the tab moves.
7. **Hover, touch, keys.** A mouse opens a row after it rests 60ms on it (a fast sweep doesn't flicker); the whole row is the target, so the rows moving under a still pointer never open another one. A tap or click opens it at once. Focus opens it, arrows and Home/End move between rows. \`autoplay\` moves on by itself, only while the section is on screen and nobody is pointing at it or tabbing through it.
8. **Loading.** Nothing loads with the page. When the section comes within 300px of the screen, the open picture loads, then the rest. Each fades in when it arrives.`;

export function installPrompt(tsSource: string) {
  return `# Reel Stats

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its pages and their sections (is there a landing, services, about or product page with room for a short list of points?), any lists of steps, services or features it already has, the numbers it shows and its photos. Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (it works best on a landing or services page, where 3 to 6 points each deserve a picture).
  *Why: it needs a spot where people stop and explore a few points, each with its own picture and number.*

Ask nothing else. If I say *skip*, use the best suggestion. The section needs rows to show: use my real points, numbers and photos if you found them, otherwise placeholder rows with photos already in the project, and tell me which ones need replacing.

## Keep it as it is

The section is the design: the list next to the framed picture, the tinted tab that grows out of the frame with curved inside corners and glides behind the text in one unchanging color, the reel that rolls pictures in from the direction you move, and the text that eases out and in, with its soft 24px corners and timing. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the preview box, the preview size buttons and fullscreen, the hint text, and the self-playing TV on the home page.

${REEL_STATS_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/services/page.tsx (the page I picked)
import { ReelStats } from "@/components/ui/reel-stats";

const ITEMS = [
  {
    title: "Spatial planning",
    description: "We rework the flow of your floor plan for everyday comfort.",
    src: "/services/plan.jpg",
    alt: "A bright living room with an open plan",
    value: "240+",
    label: "Homes replanned",
  },
  {
    title: "Material curation",
    description: "We pick finishes and textures that age well and feel warm to the touch.",
    src: "/services/materials.jpg",
    alt: "Oak, linen and stone samples on a table",
    value: "1,800",
    label: "Samples in our library",
  },
  // ...3 to 6 rows read best
];

export default function ServicesPage() {
  return (
    <main>
      {/* ...my existing sections... */}
      <ReelStats title="Four steps from a plan to a home." items={ITEMS} />
      {/* ...the next section... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It centres its own 1152px stage with 16px sides and 64px above and below, so don't wrap it in extra padding.
- \`items\` takes \`{ title, description, src, alt, value, label }\`; 3 to 6 rows read best. Any picture size works: each is cropped to 4:3.
- Leave \`tint\` out: the frame and tab take a soft tint of my text color on their own.
- \`value\` and \`label\` (the number on the picture) are optional. If I have no real numbers, leave them out rather than inventing any.

## Check

- It type-checks and the page renders with no console errors.
- Pointing at a heading opens its line of text and rolls its picture into the frame in about 0.7s: down the list it rises from below and pushes the old one up, up the list the reverse, and skipping rows rolls past the ones between. The old text eases out before the new one eases in, never popping. The tab glides behind the text to the open row (slow start, slow end), stays joined to the frame and keeps the same color for every row. A fast sweep over the list doesn't flicker, and a still pointer never opens another row as the rows move. Nothing loads before the section is near the screen, and the page loads as fast as before.
- It looks right in light and dark mode (check both): my text colors on the list, a soft tint behind the open row and around the picture, white numbers readable on every picture.
- On a phone at 375px wide: the picture sits on top and the list below, a tap opens a row, nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the pictures cross-fade in place, the rows open at once and the text doesn't drift.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/reel-stats.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Reel Stats, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (landing, services, about, product), the lists of steps, services or features it already has, the numbers it shows (customers, years, projects), its photos and their alt text, the way it writes headings, and its theme: \`--foreground\`, \`--background\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (a landing or services page is usual).
      *Why: it needs a spot where people stop and explore a few points, each with its own picture and number.*
   2. **Which rows, on which photos?** Use a list of steps, services or features you found (suggested when you found 3 or more), draft 3–6 for me to approve, or keep placeholders for now. Each row gets a heading of a few words, one or two sentences, one photo and, if I have a real one, a number. Also the heading above the section (draft one in my voice, or none).
      *Why: the rows are the content of the section, and a number on the right photo is what people remember.*
   3. **Should it play by itself?** Off, so it only moves when someone points or taps (suggested), or on, moving to the next row every 4 seconds until someone takes over.
      *Why: off feels calmer and lets people explore; on helps when visitors scroll past without pointing, like on phones.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 4 lines: the place, the rows (headings, photos and numbers), autoplay, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<ReelStats />\`, and between which sections.
- The rows: \`items\` (\`{ title, description, src, alt, value, label }\` each) and \`title\` (the heading above, \`null\` for none).
- Autoplay: \`autoplay\` (0 for off, or the time per row in ms, 1500 or more).
- The frame and tab color: \`tint\`, one color for every row, only set to a soft surface variable of my theme if you found one (say so in the brief); otherwise leave it out.

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The section is the design: the list next to the framed picture, the tinted tab that grows out of the frame with curved inside corners and glides behind the text in one unchanging color, the reel that rolls pictures in from the direction you move, and the text that eases out and in, with their sizes, 24px corners and timing. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (the preview box, the preview size buttons and fullscreen, the hint text, the self-playing home TV).

${REEL_STATS_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/services/page.tsx (the page I picked)
import { ReelStats } from "@/components/ui/reel-stats";

// From my brief: my rows on my photos.
const ITEMS = [
  { title: "Discovery", description: "Two weeks with your team to learn what matters.", src: "/services/discovery.jpg", alt: "A workshop wall full of notes", value: "2 weeks", label: "To a clear plan" },
  { title: "Design", description: "Screens your customers understand at first glance.", src: "/services/design.jpg", alt: "Sketches next to a laptop", value: "120+", label: "Products designed" },
  { title: "Launch", description: "We ship with you and stay for the first month.", src: "/services/launch.jpg", alt: "The team celebrating a launch", value: "98%", label: "Clients who come back" },
];

// Leave out any prop that stays at its default.
export function Services() {
  return <ReelStats title="How we work with you." items={ITEMS} />;
}
\`\`\`

- Text colors are not props: the section reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--radius-lg\` for the corners). If my theme uses other names, map them in my global CSS for this section only (for example \`.irs { --foreground: var(--text-primary); --background: var(--surface); }\`), never with hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- The frame and tab color: leave \`tint\` out to use a soft tint of my text color. If my theme has a soft surface color (like \`--muted\` or \`--secondary\`), you may pass it as \`tint="var(--muted)"\` so it matches my cards. Never a hex code.
- Photos: use the project's own image files and write real \`alt\` text for each. Keep them a sensible size (about 1200px on the long side is plenty) so the page stays light.
- If I have no real numbers, leave \`value\` and \`label\` out of a row rather than inventing any.

${REEL_STATS_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My heading and rows show. Pointing at a heading opens my line of text and rolls my photo into the frame in about 0.7s, from below going down the list and from above going up. The old text eases out before the new one eases in, and the tab glides behind the text, joined to the frame, in one color. Autoplay is on or off as I chose. Nothing loads before the section is near the screen, and the page loads as fast as before.
- It looks right in light and dark mode (check both): my theme's text colors, the soft tint behind the open row and around the photo, white numbers readable on every photo.
- On a phone at 375px wide: the photo sits on top and the list below, a tap opens a row, nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the photos cross-fade in place, the rows open at once and the text doesn't drift.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/reel-stats.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
