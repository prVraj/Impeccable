/* ---------- Deck Features ----------
 * A section (a features block you scroll through).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks four short questions, then fits it through the section's own props. */

const ONE_LINE =
  "A features section you scroll through: a small chip and a heading, then one card per feature with a picture on one side and a heading and a line of text on the other, swapping sides from card to card. As you scroll, each card sticks a little lower than the one before, so they pile up like a deck with the top edge of every earlier card still in view, and the cards underneath lean back and dim. A small number on each card's top edge keeps count. The last card does not stop: it slides up through the whole deck, covering it, and the deck leaves the screen with it.";

const DECK_FEATURES_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/deck-features.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: \`position: sticky\` and the page's own scrolling move everything, and the script only sets a few numbers.
- JavaScript project? Name the file \`deck-features.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/deck-features.tsx\`
- Keep these exports and their names: \`DeckFeatures\`, \`DeckFeaturesProps\`, \`DeckFeaturesItem\`. \`DECK_FEATURES\` holds the sample cards; it can stay or go.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`OFFSET\`, \`STEP\`, \`PHONE_STEP\`, \`WIDE_RATIO\`, \`NARROW_RATIO\`, \`SHRINK\`, \`MAX_DEPTH\`, \`DIM\`, \`SETTLE_SCALE\`, \`SETTLE_RISE\`, \`SETTLE_FADE\`, \`GAP\`, \`BADGE_MS\`, \`easeOut\`, \`smooth\`) exactly as written. They are the design: the deck sticks 96px from the top, each card shows 20px of the one under it (70% of that on narrow sections), a card is at most half as tall as it is wide (1.4 times on narrow sections), a card under the top one shrinks 2.5% per card above it (counting up to three) and dims up to 14%, an arriving picture eases from 6% bigger to its size while its words drift up 24px and fade in from 45%, cards start 32px apart, and the numbers change color over 360ms.
- Keep the colors as theme variables: everything reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), the number on the top card uses \`--primary\` (else \`--accent\`), and the corners are three times \`--radius-lg\` (24px with an 8px theme radius) with the pictures inside at that minus the 8px padding. Never swap them for fixed hex or pixel values.
- Keep the speed rules: only \`transform\` and \`opacity\` change while scrolling, the script listens to scrolling only while the section is on screen and reads every card before it writes anything, and pictures keep \`loading="lazy"\` and \`decoding="async"\`. So it adds nothing to the page's load time.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the cards still stack (that is the page scrolling), but nothing shrinks, dims, grows or drifts, and the numbers change color at once; a picture that fails to load leaves a soft tinted panel with the words still readable; pictures can't be selected or dragged; the cards are a numbered list (\`<ol>\`) with a real heading on each, and the drawn numbers are hidden from screen readers; an empty \`items\` list shows nothing.`;

const DECK_FEATURES_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **The deck is plain sticky.** Every card is \`position: sticky\` with its own \`top\`: \`offset\` plus its place in the list times \`step\` (96px, 116px, 136px...). So each card stops a little lower than the one before, and the top 20px of every earlier card stays in view. Later cards sit above earlier ones (\`z-index\`).
2. **The last card goes through.** All cards are the same height, and the list ends with the last card. A sticky card can never leave the list, so once the last card reaches its place, the list's end starts pushing: the last card keeps moving up, covering the deck card by card, and each card in the deck starts moving the moment the last card lines up with it. That is why the last card seems to slide through the whole deck and carry it away. Nothing in the script does this; it comes from equal heights, so keep them equal.
3. **The height.** Each card is as tall as the screen (or the scrolling box) has room for once the whole deck is in place: screen height minus \`offset\`, minus one \`step\` per card, minus 24px, but at most half its width (1.4 times its width on narrow sections, where the picture sits on top), kept between 300 and 560px.
4. **Settling in.** For each card the script measures how close it is to its place (0 a screen away, 1 in place) and puts it through an ease-out curve (fast start, soft landing). The picture eases from 6% bigger to its size, and the words drift up 24px and fade in from 45%.
5. **Leaning back.** For each card the script also measures how much of the deck it covers (0 to 1, on a slow-start, slow-end curve). Every card under it adds that up: it shrinks 2.5% per card above it (from its top edge, so the strip in view stays put), counting up to three, and a shade over it rises to 14%. So the newest card always reads as the one on top.
6. **The numbers.** A small pill sits in the middle of each card's top edge. The card on top has it filled with the accent color, the cards under it filled with the text color, and the cards still coming only outlined. In the deck, the pills line up in a short column that counts how far you are.
7. **Narrow sections.** Under 640px (measured on the section's own width with a container query), the picture sits on top and the words below, and the step is 70% as tall.
8. **Where it scrolls.** It finds the nearest parent that really scrolls, else the page. A parent with \`overflow: hidden\` between the section and the scroller stops \`position: sticky\` from working; use \`overflow-x: clip\` there instead. The script reads sizes against the section's own size, so it also works inside a scaled box.`;

export function installPrompt(tsSource: string) {
  return `# Deck Features

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its pages and their sections (is there a landing, home or product page with room for a features block?), any list of features or services it already has, its pictures and screenshots, and whether it has a fixed header (and how tall it is). Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (it works best on a landing page, after the hero, where 3 to 6 features each deserve a picture).
  *Why: it takes a few screens of scrolling to play, so it needs a page long enough to scroll and a spot where people want the details.*

Ask nothing else. If I say *skip*, use the best suggestion. The section needs cards to show: use my real features and pictures if you found them, otherwise placeholder text and any pictures already in the project, and tell me which ones need replacing.

## Keep it as it is

The section is the design: the chip and heading, the cards with the picture and words swapping sides, the deck that piles up with 20px of every earlier card in view, the cards underneath leaning back and dimming, the pictures and words settling as each card lands, the counting numbers on the top edges, and the last card sliding through the whole deck and carrying it away, with soft 24px corners. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the scrolling preview box, the preview size buttons and fullscreen, the hint text, the sample pictures and the self-scrolling TV on the home page.

${DECK_FEATURES_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/page.tsx (the page I picked)
import { DeckFeatures } from "@/components/ui/deck-features";

const FEATURES = [
  { title: "Plan in minutes", description: "Drag tasks onto the week and the plan fills itself in.", src: "/features/plan.jpg", alt: "The weekly planner" },
  { title: "See where time goes", description: "Every hour lands in a simple chart you can share.", src: "/features/chart.jpg", alt: "The time chart" },
  { title: "Works where you work", description: "Slack, Linear and your calendar, all in one place.", src: "/features/apps.jpg", alt: "App connections" },
];

export default function HomePage() {
  return (
    <main>
      {/* ...my existing sections... */}
      <DeckFeatures eyebrow="Features" title="Everything your week needs, in one calm place." items={FEATURES} offset={88} />
      {/* ...the next section... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It centres its own 1152px stage with 16px sides, so don't wrap it in extra padding.
- \`items\` takes \`{ title, description, src, alt }\`; any number works, 3 to 6 read best. Any picture size works: each is cropped to its side of the card.
- If my site has a fixed header, set \`offset\` to its height plus 16px, so the deck never slides under it. Without one, keep the default (96).
- No parent between the section and the page's scroller may have \`overflow: hidden\` (it stops the cards from sticking). If one does, tell me and suggest \`overflow-x: clip\` there; don't change it without asking.

## Check

- It type-checks and the page renders with no console errors.
- Scrolling down, the first card sticks \`offset\` px from the top, and each next card slides up over it and stops 20px lower, so the deck shows a strip of every earlier card with its number. The cards underneath shrink a little and dim as each new card covers them, and each new card's picture and words settle as it lands. The last card keeps going: it slides through the deck, covering it, and the deck scrolls away with it. Nothing jumps, and the page loads as fast as before.
- It looks right in light and dark mode (check both): the cards, chip, numbers and words in my theme colors, the top card's number in my accent color.
- It stays smooth on a phone at 375px wide: picture on top and words below, the whole deck fits on the screen, nothing scrolls sideways, and long words wrap inside their card.
- With \`prefers-reduced-motion: reduce\`, the cards still stack, but nothing shrinks, dims, grows or drifts.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/deck-features.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Deck Features, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (landing, home, product), the features or services it already lists, its pictures and screenshots and their alt text, the way it writes headlines, whether it has a fixed header (and how tall it is), and its theme: \`--foreground\`, \`--background\`, \`--primary\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (a landing page, right after the hero, is usual).
      *Why: it takes a few screens of scrolling to play, so it needs a long page and a spot where people want the details.*
   2. **Which features, with which pictures?** Use the features and pictures you found (suggested when you found 3 or more), draft 3–6 for me to approve, or keep placeholders for now. One picture per feature.
      *Why: the cards are the content of the section, and a feature next to the right picture is what people remember.*
   3. **What do the chip and heading say?** Draft them in my voice from my home page (suggested), use lines I already have, or keep "Features" and the placeholder heading. The chip can also be hidden.
      *Why: they are the first thing people read before the deck starts.*
   4. **How tight should the deck be, and which side starts?** Tight (12px of each card in view), the default (20px, suggested) or loose (32px), and the first picture on the left (suggested) or the right.
      *Why: a tighter deck feels calmer and leaves more room for the cards, a looser one shows the stack more clearly.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the cards, the chip and heading, the deck (step, first side, and the \`offset\` you set from my header), and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<DeckFeatures />\`, and between which sections.
- The cards: \`items\` (\`{ title, description, src, alt }\` each).
- The words: \`eyebrow\` and \`title\` (\`null\` hides either).
- The deck: \`step\` (8 to 40) and \`start\` (\`"left"\` or \`"right"\`), plus \`offset\`, which you set from my header's height (not a question).

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The section is the design: the chip and heading, the cards with picture and words swapping sides, the deck that piles up, the cards underneath leaning back and dimming, the pictures and words settling as each card lands, the counting numbers on the top edges, and the last card sliding through the deck and carrying it away, with its sizes, spacing, curves and timing. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (the scrolling preview box, the preview size buttons and fullscreen, the hint text, the sample pictures, the self-scrolling home TV).

${DECK_FEATURES_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/page.tsx (the page I picked)
import { DeckFeatures } from "@/components/ui/deck-features";

// From my brief: my features with my pictures.
const FEATURES = [
  { title: "Plan in minutes", description: "Drag tasks onto the week and the plan fills itself in.", src: "/features/plan.jpg", alt: "The weekly planner" },
  { title: "See where time goes", description: "Every hour lands in a simple chart you can share.", src: "/features/chart.jpg", alt: "The time chart" },
  { title: "Works where you work", description: "Slack, Linear and your calendar, all in one place.", src: "/features/apps.jpg", alt: "App connections" },
  { title: "Private by default", description: "Your data stays yours, encrypted from end to end.", src: "/features/lock.jpg", alt: "The privacy screen" },
];

// Leave out any prop that stays at its default.
export function HomeFeatures() {
  return (
    <DeckFeatures
      eyebrow="Why teams switch"
      title="Everything your week needs, in one calm place."
      items={FEATURES}
      offset={88} // my 72px fixed header + 16px
      step={12} // tight
    />
  );
}
\`\`\`

- Colors are props only for the number on the top card (\`accent\`); the rest reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--primary\` for the number, \`--radius-lg\` for the corners). If my theme uses other names, map them in my global CSS for this section only (for example \`.idf { --foreground: var(--text-primary); --background: var(--surface); }\`) or pass \`accent="var(--brand)"\`, never hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Pictures: use the project's own image files and write real \`alt\` text for each. Keep them a sensible size (about 1200px on the long side is plenty) so the page stays light.
- It centres its own stage, so place it full width between my sections. No parent between it and the page's scroller may have \`overflow: hidden\`; if one does, tell me and suggest \`overflow-x: clip\`.

${DECK_FEATURES_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My chip, heading and features show. Scrolling down, the first card sticks just under my header, and each next card slides over it and stops one step lower (the step I chose), with my first picture on the side I chose. The cards underneath lean back and dim, and each new card's picture and words settle as it lands. The last card slides through the deck and carries it away. The page loads as fast as before.
- It looks right in light and dark mode (check both): my theme colors on the cards and words, my accent color on the top card's number.
- It stays smooth on a phone at 375px wide: picture on top and words below, the whole deck fits on the screen, nothing scrolls sideways, and long words wrap inside their card.
- With \`prefers-reduced-motion: reduce\`, the cards still stack, but nothing shrinks, dims, grows or drifts.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/deck-features.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
