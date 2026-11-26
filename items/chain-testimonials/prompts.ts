/* ---------- Chain Testimonials ----------
 * A section (a row of picture cards joined like a chain; the middle one is an open review).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks four short questions, then fits it through the section's own props. */

const ONE_LINE =
  "A testimonial section where the reviews sit in one row of picture cards, joined to each other by small curved links, like a chain. The card in the middle is open: a short result line on top, the quote and the person's name and role at the bottom, and the picture on the right. The cards beside it show only their picture and get smaller toward the edges: 5 cards on desktop (a row up to 1240px), 3 on tablets (up to 820px), and 1 on phones (up to 420px), where the next card slides in from the side and only its link peeks in at the edges. Every 6 seconds (or on a click, a tap, a swipe or an arrow key) the whole chain shifts by one: the open card folds into a picture card while the next one opens, on the same curve, and the new words come in line by line. Under the row, a pill fills up to show the time left on this review and slides to the next dot when it changes.";

const CHAIN_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-ui.com/r/chain-testimonials.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the motion is CSS transitions, and the script only measures the section and counts which review is open.
- JavaScript project? Name the file \`chain-testimonials.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/chain-testimonials.tsx\`
- Keep these exports and their names: \`ChainTestimonials\`, \`ChainTestimonialsProps\`, \`ChainTestimonial\`, \`CHAIN_TESTIMONIALS\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component.
- Keep the CSS block, the \`measure\` function and the tuning values at the top (\`MOVE_MS\`, \`EASE\`, \`TEXT_IN\`, \`TEXT_OUT_MS\`, \`INTERVAL\`, \`ROW\`, \`TABLET_AT\`, \`DESKTOP_AT\`, \`EDGE\`, \`PAD\`, \`RADIUS\`, \`DOT\`, \`DOT_GAP\`, \`PILL\`) exactly as written. They are the design: the chain moves in 640ms on \`cubic-bezier(.45,0,.2,1)\`; the old words leave in 160ms and the new ones come in from 260ms, 70ms apart, rising 8px out of a light blur; each review stays 6s; the row is at most 1240px wide with 5 cards (from 1000px of room), 820px with 3 cards (from 600px) and 420px with 1 card below that, with a 16px soft edge on phones; every picture sits in an 8px frame; the open card's corners are 24px and the picture's 16px (24 minus 8); side cards are as round as half their width.
- Keep the colors as written: everything reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`). The cards and the links between them are a 6% tint of the text color, the quote is the text color at 82%, the role and the description at 62%, and the timer pill fills with the text color. No brand color anywhere: the pictures bring the color.
- Keep the text order and sizes: the result line is the biggest (28px, semibold, up to 3 lines), the quote is quieter (17px, up to 4 to 6 lines depending on the card's height), then the name (14px, semibold) and the role (13px, muted). Long words are shortened with an ellipsis, never cut mid line.
- Keep the speed and layout rules: the open card's words are laid out at its full size, so they never re-wrap while it opens; the cards that leave stay on the page until they have folded away, so nothing pops out; pictures keep \`loading="lazy"\` and \`decoding="async"\` and can't be selected or dragged.
- Keep the fallbacks: the timer waits while the pointer is over the row, while keyboard focus is inside it, while it is off screen and while the tab is hidden; with fewer than 5 reviews it shows fewer cards so nobody shows twice; more than 12 reviews show a count instead of dots; a missing or broken picture shows the person's initials on the open card; a finger swipe moves the chain and a vertical scroll is left alone; with \`prefers-reduced-motion: reduce\` there is no timer, the cards swap at once and the words only fade in.`;

const CHAIN_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **One count, many cards.** The section keeps one number that goes up or down by one on every move and never wraps. Each card on the page is that number plus or minus a few, and shows review number (that) modulo the list. So when the chain moves, every card keeps its identity and simply gets a new size: nothing is rebuilt, and the browser eases from the old size to the new one.
2. **Sizes from the section's width.** \`measure\` reads the section's own width (not the screen's) and returns the open card's width and height, the cards beside it, the cards at the ends, the gap and the link. From 1000px of room there are 5 cards (row up to 1240px), from 600px there are 3 (row up to 820px), and below that 1 card (up to 420px). With 3 or 5 cards the open card shows the words on the left and the picture on the right; on phones the picture sits above the words, the cards beside it are full size just out of view, so a move slides the next one in, and the row is clipped with a 16px soft edge where the links peek in.
3. **The move.** Width, height and the gaps all ease on the same 640ms curve at the same time, so the row's total width never changes mid-move: the open card folds while the next one opens. The picture inside slides from the right half (open) to the whole frame (side card), and the corners follow.
4. **The links.** Between two cards that are both on show sits a small bridge in the card color, as wide as the gap, whose top and bottom curve in like a neck. It fades out when one of its cards leaves and in once the new neighbour is mostly in place.
5. **The words.** The open card's words leave quickly as it folds. The new card's words come in after it has mostly opened: the result line first, then the quote, then the person, each rising 8px out of a light blur.
6. **The timer and the dots.** One dot per review. The open review's dot makes room for a pill that fills up over 6 seconds; when the fill ends, the chain moves on and the pill slides to the next dot, on the same curve as the cards. A click on a dot, a side card or an arrow key moves the chain the short way round.
7. **Keyboard and screen readers.** The dots are buttons with each person's name. The arrow keys move the chain while focus is inside it. The side cards are hidden from screen readers, and the open one reads as "slide 2 of 7".`;

export function installPrompt(tsSource: string) {
  return `# Chain Testimonials

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its pages and their sections (is there a landing, pricing or about page with a spot for reviews?), any reviews or quotes it already shows (names, roles, results, pictures) and where they live. Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (it works best after the features or pricing on a landing page, where people want proof).
  *Why: reviews persuade most right after people have seen what they would buy.*

Ask nothing else. If I say *skip*, use the best suggestion. The section needs reviews to show: use my real reviews and pictures if you found them, otherwise keep its made-up samples and tell me they need replacing.

## Keep it as it is

The section is the design: the row of picture cards joined by curved links, 5 cards on desktop, 3 on tablets and 1 on phones, the open card in the middle with the result, the quote and the person, the calm move where one card folds as the next opens, the words coming in line by line, and the pill that fills and slides to the next dot. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the preview card, the preview size buttons and fullscreen, the hint text, the sample portraits, and the self-playing TV on the home page.

${CHAIN_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/page.tsx (the page I picked)
import { ChainTestimonials } from "@/components/ui/chain-testimonials";

const REVIEWS = [
  { heading: "Moved our team over in a week", quote: "The switch took one afternoon of setup.", name: "Lena Fischer", role: "COO, Northwind", image: "/reviews/northwind.jpg" },
  { heading: "Support before I finish typing", quote: "Every question answered in minutes.", name: "Omar Haddad", role: "Founder, Globex", image: "/reviews/globex.jpg" },
  { heading: "It finally looks like our brand", quote: "Our designers stopped filing tickets.", name: "Mia Chen", role: "Designer, Initech", image: "/reviews/initech.jpg" },
  { heading: "Our fastest setup this year", quote: "Live before the coffee got cold.", name: "Sam Ortiz", role: "CTO, Umbrella", image: "/reviews/umbrella.jpg" },
  { heading: "Half the emails we used to get", quote: "People find the answer on the page now.", name: "Ana Lima", role: "Head of Support, Hooli", image: "/reviews/hooli.jpg" },
];

export default function Home() {
  return (
    <main>
      {/* ...my existing sections... */}
      <ChainTestimonials title="What our customers say" description="Real words from real teams." items={REVIEWS} />
      {/* ...the next section... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It centres its own 1288px column (a row up to 1240px) with 24px sides (16px on phones), so don't wrap it in extra padding.
- \`items\` takes \`{ heading, quote, name, role, image, alt }\`; 5 to 9 reviews read best. Square or portrait pictures crop best: a portrait of the person, or their work. A review without a picture shows initials.
- The default reviews and the default heading are made-up samples. If you found no real reviews, keep them but tell me clearly, so nothing fake ships on my page.

${CHAIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- At 1280px wide it shows 5 cards joined by links (3 at 768px), the open one in the middle with its words on the left and its picture on the right. After 6 seconds the chain moves by one in about 0.64s: the open card folds into a picture card while the next one opens, with no jump in the row's width, and the new words come in line by line. The pill under the row fills, then slides to the next dot. Pointing at the row pauses the fill.
- Clicking a side card, a dot or pressing the arrow keys moves the chain the short way round. The words never re-wrap while a card opens.
- It looks right in light and dark mode (check both): cards and links a faint tint of my text color, the result line clearly the biggest, the quote quieter, the role the quietest.
- It works with a finger on a phone at 375px wide: 1 card with the picture above the words, the links peeking in at the edges, a swipe slides in the next card, a vertical scroll still scrolls the page, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no timer, the cards swap at once and the words only fade in.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/chain-testimonials.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Chain Testimonials, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (landing, pricing, about), the reviews or quotes it already shows (names, roles, results, pictures) and where they come from, the pictures it has (product shots, customer logos, portraits), the way it writes headings, and its theme: \`--foreground\` and \`--background\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (after the features or pricing on a landing page is usual).
      *Why: reviews persuade most right after people have seen what they would buy.*
   2. **Which reviews, and what result line on each?** Use the reviews you found and draft a short result line for each from their words (suggested when you found 5 or more), draft 5–7 from what my customers already say for me to approve, or keep the samples for now.
      *Why: the result line is the biggest text on the card, so it should be a real, concrete outcome, not a slogan.*
   3. **Which pictures?** Portraits of the people (suggested when I have them), their work or product shots, or screens of my own product.
      *Why: the pictures are the only color in the section, and they are what people see first on the side cards.*
   4. **What do the heading and line above it say?** Draft them in my voice from my pages (suggested), use words I already have, or no heading.
      *Why: it is the first thing people read before the chain starts to move.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the reviews and their result lines, the pictures, the heading words, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<ChainTestimonials />\`, and between which sections.
- The reviews: \`items\` (\`{ heading, quote, name, role, image, alt }\` each), and \`defaultIndex\` if another review should start open.
- The words: \`title\` and \`description\` (\`null\` hides them).
- The timer: \`interval\`, only if I ask for a different pace (6000ms is the design; 0 turns it off).

All of these are props the section already has, so the section file itself stays as written.

**Locked:** the row of picture cards joined by curved links, 5 cards on desktop, 3 on tablets and 1 on phones, the open card's layout (result on top, quote and person at the bottom, picture on the right or on top on phones), the 640ms move where one card folds as the next opens, the words coming in line by line, the pill that fills and slides to the next dot, the 8px frames and 24px corners, and the colors taken from my text and background colors with no brand color. If something doesn't fit my product, tell me instead of changing it. No new packages, no other files, and none of the Impeccable website's demo parts (the preview card, size buttons and fullscreen, the hint, the sample portraits, the self-playing TV).

${CHAIN_SHARED_BUILD}

## Fit it to the brand

- **Place:** render it between the two sections I picked, full width. It centres its own 1288px column (a row up to 1240px).
- **Reviews:** map my reviews to \`items\`. The \`heading\` is a short, concrete result in their words ("Half the support emails"), up to 3 lines; keep quotes to one or two sentences and shorten long ones only with my OK. Write \`alt\` to say what the picture shows.
- **Pictures:** square or portrait work best, at least 800px on the long side, compressed (WebP when the project uses it). They crop to fit, so keep the subject in the middle.
- **Colors:** nothing to set. The section reads my \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`). If my theme uses other names, map them at the top of the CSS block (\`--ich-fg\` and \`--ich-bg\`) and change nothing else. Check it in light and dark mode.
- **Words:** set \`title\` and \`description\`, or \`null\` to hide either.

${CHAIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My reviews show with my pictures: 5 cards joined by links at 1280px wide (3 at 768px, 1 on a phone), the open one in the middle with my result line, quote and person. After 6 seconds the chain moves by one in about 0.64s with no jump in the row's width, the new words come in line by line, and the pill under the row fills and then slides to the next dot. Pointing at the row pauses it.
- It looks right in light and dark mode (check both): cards and links a faint tint of my text color, the result line clearly the biggest, the quote quieter, the role the quietest.
- It works with a finger on a phone at 375px wide: 1 card with the picture above the words, the links peeking in at the edges, a swipe slides in the next card, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, there is no timer, the cards swap at once and the words only fade in.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/chain-testimonials.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
