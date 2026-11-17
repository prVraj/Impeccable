/* ---------- Window Stats ----------
 * A section (a stats block you scroll through).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks four short questions, then fits it through the section's own props. */

const ONE_LINE =
  "A stats section you scroll through: a short statement stays in the middle of the screen while photo cards with your numbers slide up over it. Above the statement sits a row of little drawn faces with a star rating, and below it a strip of logos slides slowly sideways. The statement softens into a blur behind the cards and stays blurred, each photo moves up inside its own frame, and the section scrolls away right after the last card, ending with a small Back to the start pill that glides you back up.";

const WINDOW_STATS_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/window-stats.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the page's own scrolling moves everything, and the script only nudges pictures and fades the blur.
- JavaScript project? Name the file \`window-stats.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/window-stats.tsx\`
- Keep these exports and their names: \`WindowStats\`, \`WindowStatsProps\`, \`WindowStatsCard\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`PARALLAX\`, \`BLUR\`, \`SINK_SCALE\`, \`SINK_DIM\`, \`TOP_GAP\`, \`END_GAP\`, \`IN_FROM\`, \`IN_TO\`, \`SHOW_MS\`, \`BACK_MS\`, \`LOGO_S\`, \`easeOut\`) exactly as written. They are the design: pictures travel 12% of their card's height each way inside it, the statement blurs 10px, shrinks 6% and fades 40% behind the cards, the first card starts 85% of a screen below the statement, the statement lets go 15% of a screen after the last card (so it leaves with the cards, still blurred), the back pill rises in over 500ms, the glide back takes 0.7 to 1.5s on an ease-out curve (longer for longer trips), and each logo takes 4s to slide past.
- Keep the colors as theme variables: everything reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), and the corners are three times \`--radius-lg\` (24px with an 8px theme radius), soft and calm. Never swap them for fixed hex or pixel values. The only fixed colors are the white numbers on the dark mask, because they sit on photos in both themes.
- Keep the speed rules: only \`transform\` and \`opacity\` change while scrolling, the script listens to scrolling only while the section is on screen, the logo strip moves only while the section is on screen and the statement is sharp, the faces and stars are drawn in code (nothing extra to load), and pictures keep \`loading="lazy"\` and \`decoding="async"\`. So it adds nothing to the page's load time.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the pictures stand still in their frames, the logo strip stands still, the back pill jumps instead of gliding, and the statement doesn't shrink (it still fades to its blur, so it never fights the cards); a picture that fails to load leaves a soft tinted frame with its number still readable; pictures can't be selected or dragged; only the sharp statement is a real heading, the blurred copy is hidden from screen readers.`;

const WINDOW_STATS_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Two layers in one place.** The section is a stage with two layers on top of each other: the statement (the faces and rating row, the statement, the logo strip) and a list of picture cards. The statement layer is \`position: sticky\` and exactly one screen tall, so its text sits in the middle of the screen and stays there while the stage scrolls past. The cards are a normal list above it, so the page's own scrolling slides them up over the statement.
2. **The rhythm.** The cards start 85% of a screen below the top of the section. On a section 640px wide or more (measured on the section's own width with a container query), they go in a repeating rhythm of five: a big square on the left and a smaller one lower on the right, a wide card in the middle, then a smaller pair again. Narrower, one card per row, swinging left and right, with the wide card full width.
3. **Going behind.** The statement is drawn twice: a sharp copy and a copy blurred 10px. While the first card climbs from 80% to 45% of the screen, the sharp copy fades out and the blurred one fades in, and the whole statement shrinks 6% and dims 40%, so it reads as sinking behind the cards. It stays that way to the end: the statement never comes back sharp. Once the last card has passed, the stage ends and the blurred statement scrolls away with the last cards. Crossfading two copies is much cheaper than animating a blur.
4. **The window parallax.** Each picture is taller than its card and moves up inside it as you scroll: from showing its top as the card enters at the bottom of the screen, to showing its bottom as the card leaves at the top. The travel is \`parallax\` (12%) of the card's height each way.
5. **The numbers.** Each card has a dark layer over its lower 65%, faded with a gradient mask from solid at the bottom to clear at the top (no box, no frosted glass). On it: the big number on the left, a thin white line, and the label on the right.
6. **The little things.** Above the statement: four small faces drawn in code (each with its own mood), five stars, the score and a line (\`proof\`). Below it: the \`logos\` strip, two copies side by side sliding left forever so it loops without a seam, faded out at both ends with a mask (never an overlay). It slides only while the section is on screen and the statement is sharp, so nothing moves under the blur, and it rests while a pointer is on it.
7. **Back to the start.** After the last card comes a small pill, "Back to the start" with an up arrow. It rises in (500ms) when it comes into view. A click glides back to the top of the section on an ease-out curve (fast start, soft landing, 0.7 to 1.5s depending on the distance), where the statement is sharp in the middle again, and moves keyboard focus to the statement. Scrolling, touching or pressing a key during the glide stops it. With reduced motion it jumps. \`backLabel={null}\` hides it.
8. **Where it scrolls.** It finds the nearest parent that really scrolls, else the page. In a scrolling box, the statement is as tall as that box. A parent with \`overflow: hidden\` between the section and the scroller stops \`position: sticky\` from working; use \`overflow-x: clip\` there instead.`;

export function installPrompt(tsSource: string) {
  return `# Window Stats

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its pages and their sections (is there an about, landing or home page with room in the middle?), any numbers it already shows (customers, years, projects, ratings) and its photos. Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (it works best in the middle of a long about or landing page, after the hero and before the next big block).
  *Why: it takes a few screens of scrolling to play, so it needs a page long enough to scroll and a spot where a pause for a statement makes sense.*

Ask nothing else. If I say *skip*, use the best suggestion. The section needs cards to show: use my real numbers and photos if you found them, otherwise placeholder numbers and any photos already in the project, and tell me which ones need replacing.

## Keep it as it is

The section is the design: the statement that stays in the middle of the screen, the cards that slide over it in a left, right, wide rhythm, the statement softening into a blur behind them and leaving with the last cards still blurred, the pictures moving up inside their frames with soft 24px corners, the numbers on a soft dark mask at the bottom of each card, the faces and rating row above the statement and the sliding logo strip below it, and the Back to the start pill that glides back up. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the scrolling preview box, the preview size buttons and fullscreen, the hint text, and the self-scrolling TV on the home page.

${WINDOW_STATS_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/about/page.tsx (the page I picked)
import { WindowStats } from "@/components/ui/window-stats";

const CARDS = [
  { src: "/about/team.jpg", alt: "Our team at the spring offsite", value: "40+", label: "People on the team" },
  { src: "/about/studio.jpg", alt: "The studio at night", value: "12", label: "Years in business" },
  { src: "/about/launch.jpg", alt: "A launch party", value: "300+", label: "Products shipped" },
];

export default function AboutPage() {
  return (
    <main>
      {/* ...my existing sections... */}
      <WindowStats
        proof={{ score: "4.8/5", text: "Trusted by 300+ teams" }}
        title="We have helped hundreds of teams ship products their customers love to use."
        logos={["Northwind", "Globex", "Initech", "Umbrella"]}
        cards={CARDS}
      />
      {/* ...the next section... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It centres its own 1152px stage with 16px sides, so don't wrap it in extra padding.
- \`cards\` takes \`{ src, alt, value, label }\`; 3 to 7 cards read best. Any picture size works: each is cropped to its card.
- \`proof\` and \`logos\` have playful made-up defaults (a picky mom, studios like "Kerning & Co"). Set them to my real rating and my real client logos if you found them, otherwise set both to \`null\` and tell me, so nothing fake ships on my page.
- No parent between the section and the page's scroller may have \`overflow: hidden\` (it stops the statement from sticking). If one does, tell me and suggest \`overflow-x: clip\` there; don't change it without asking.

## Check

- It type-checks and the page renders with no console errors.
- Scrolling down, the statement reaches the middle of the screen and stays there. As the first cards come up, it softens into a blur and sinks behind them, and the pictures move up inside their frames. It stays blurred: after the last card the section ends and the blurred statement scrolls away with the cards. A Back to the start pill then rises in, and clicking it glides back to the top of the section (fast start, soft landing) with the statement sharp again. The logo strip slides while the statement is sharp and rests once the cards arrive. Nothing jumps, and the page loads as fast as before.
- It looks right in light and dark mode (check both): the statement, faces, stars and logos in my text colors, white numbers readable on every picture.
- It stays smooth on a phone at 375px wide: one card per row, nothing scrolls sideways, and long labels wrap inside their card.
- With \`prefers-reduced-motion: reduce\`, the pictures and the logo strip stand still, the back pill jumps instead of gliding, and the statement only fades to its blur, without shrinking.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/window-stats.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Window Stats, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (about, landing, home), the numbers it already shows (customers, years, projects, ratings, reviews), its photos (team, product, customers, places) and their alt text, the way it writes headlines, and its theme: \`--foreground\`, \`--background\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (the middle of a long about or landing page is usual).
      *Why: it takes a few screens of scrolling to play, so it needs a long page and a spot where a pause for a statement makes sense.*
   2. **Which numbers, on which photos?** Use the numbers and photos you found (suggested when you found 3 or more), draft 3–5 for me to approve, or keep placeholders for now. One photo per number.
      *Why: the cards are the content of the section, and a number on the right photo is what people remember.*
   3. **What does the statement say?** Draft one or two sentences in my voice from my about or home page (suggested), use a line I already have, or keep the placeholder. Also the rating row above it (my real score and a line, or none), the logos that slide under it (my real client logos, or none) and the words on the back button at the end.
      *Why: it stays in the middle of the screen the whole time, so it is the one thing every visitor reads.*
   4. **How deep should the motion feel?** Calm (pictures travel 8%, blur 8px), the default (12%, 10px, suggested), or deep (20%, 14px).
      *Why: calmer suits a serious brand, deeper feels more playful, and both change only how far things move.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the cards, the statement words, the motion depth, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<WindowStats />\`, and between which sections.
- The cards: \`cards\` (\`{ src, alt, value, label }\` each).
- The words: \`title\`, \`proof\` (\`{ score, text }\`), \`caption\`, \`logos\` and \`backLabel\` (\`null\` hides the rating row, the logo strip or the back button).
- The motion depth: \`parallax\` (0 to 0.3) and \`blur\` (0 to 24px).

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The section is the design: the statement that stays in the middle of the screen, the cards that slide over it in a left, right, wide rhythm, the statement softening behind them and leaving with the last cards still blurred, the pictures moving up inside their frames with soft corners, the numbers on a soft dark mask, the drawn faces and stars, the sliding logo strip, and the Back to the start pill with its ease-out glide, with its sizes, spacing and timing. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (the scrolling preview box, the preview size buttons and fullscreen, the hint text, the self-scrolling home TV).

${WINDOW_STATS_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/about/page.tsx (the page I picked)
import { WindowStats } from "@/components/ui/window-stats";

// From my brief: my numbers on my photos.
const CARDS = [
  { src: "/about/team.jpg", alt: "Our team at the spring offsite", value: "40+", label: "People on the team" },
  { src: "/about/studio.jpg", alt: "The studio at night", value: "12", label: "Years in business" },
  { src: "/about/launch.jpg", alt: "A launch party", value: "300+", label: "Products shipped" },
  { src: "/about/client.jpg", alt: "A client workshop", value: "98%", label: "Clients who come back" },
];

// Leave out any prop that stays at its default.
export function AboutStats() {
  return (
    <WindowStats
      proof={{ score: "4.8/5", text: "Trusted by 300+ teams" }}
      title="We have helped hundreds of teams ship products their customers love to use."
      logos={[<img key="nw" src="/logos/northwind.svg" alt="Northwind" height={20} />, <img key="gx" src="/logos/globex.svg" alt="Globex" height={20} />]}
      cards={CARDS}
      parallax={0.08} // calm
      blur={8}
    />
  );
}
\`\`\`

- Colors are not props: the section reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--radius-lg\` for the corners). If my theme uses other names, map them in my global CSS for this section only (for example \`.iws { --foreground: var(--text-primary); --background: var(--surface); }\`), never with hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Photos: use the project's own image files and write real \`alt\` text for each. Keep them a sensible size (about 1000px on the long side is plenty) so the page stays light.
- It centres its own stage, so place it full width between my sections. No parent between it and the page's scroller may have \`overflow: hidden\`; if one does, tell me and suggest \`overflow-x: clip\`.

${WINDOW_STATS_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My statement and words show. Scrolling down, the statement reaches the middle of the screen and stays there; as my first cards come up it softens behind them, and my photos move up inside their frames by the depth I chose. It stays blurred and scrolls away with my last card, then the back pill (in my words) rises in and glides me back to the top of the section. My rating row and my logos show (or are hidden if I said none). The page loads as fast as before.
- It looks right in light and dark mode (check both): my theme's text color for the statement, white numbers readable on every one of my photos.
- It stays smooth on a phone at 375px wide: one card per row, nothing scrolls sideways, and long labels wrap inside their card.
- With \`prefers-reduced-motion: reduce\`, the pictures and the logo strip stand still, the back pill jumps instead of gliding, and the statement only fades to its blur, without shrinking.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/window-stats.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
