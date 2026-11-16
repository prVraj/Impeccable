/* ---------- Capsule Testimonials ----------
 * A section (a row of reviews that open one at a time).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks four short questions, then fits it through the section's own props. */

const ONE_LINE =
  "A testimonial section where every review waits as a slim, rounded capsule: the person's photo at the bottom and their name written up the side. Hovering a capsule makes it a little taller and wider and stretches the round photo into a tall portrait. Clicking it opens it smoothly into a wide card while the card that was open eases back into a capsule at the same pace, so nothing snaps. As a card opens, its top part (quote mark, words, date) settles from 60% opacity and 90% size to full, and the rating stars pop in one after another.";

const CAPSULE_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/capsule-testimonials.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the motion is CSS transitions, and the script only measures the row and remembers which review is open.
- JavaScript project? Name the file \`capsule-testimonials.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/capsule-testimonials.tsx\`
- Keep these exports and their names: \`CapsuleTestimonials\`, \`CapsuleTestimonialsProps\`, \`CapsuleTestimonial\`, \`CAPSULE_TESTIMONIALS\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component.
- Keep the CSS block and the tuning values at the top (\`CAP\`, \`CAP_HOVER\`, \`GAP\`, \`ROW_H\`, \`OPEN_H\`, \`OPEN_MS\`, \`EASE\`, \`TEXT_FROM\`, \`STAR_STEP\`, \`STAR_DELAY\`, \`PALETTE\`) exactly as written. They are the design: capsules are 56px wide and grow to 64px under the pointer, 8px apart, in a 400px tall row; a capsule sits 22px shorter than the open card at the top and bottom (8px on hover); opening takes 720ms on \`cubic-bezier(.32,.72,0,1)\` for both the card that opens and the one that closes; the top part of the card settles from 60% opacity and 90% size; the stars start 380ms after opening, 90ms apart, with a small overshoot.
- Keep the corners: capsules are fully round (half their width), the photo inside keeps a 6px ring of the capsule color (its radius is the capsule's minus 6px), and the open card's corners are 3.5 times \`--radius-lg\` (28px with an 8px theme radius), rounder than a usual card.
- Keep the colors as written: the page text reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), and each card has its own color from \`PALETTE\` (six soft colors that read on a light page and a dark one) unless a review sets \`color\` and \`ink\`.
- Keep the speed and layout rules: the open card's content is laid out at the full open size (measured by the script), so its words never re-wrap while the card grows; only one card is open at a time; photos keep \`loading="lazy"\` and \`decoding="async"\` and can't be selected or dragged.
- Keep the fallbacks: hover effects only on devices with a real pointer (\`@media (hover: hover)\`); under 560px of section width the capsules lie down and stack with the open card growing downward; with \`prefers-reduced-motion: reduce\` the cards swap at once and the words and stars only fade in; a missing or broken photo shows the person's initials; the arrow keys, Home and End move between reviews, and keyboard users land on the card they opened; closed cards are hidden from screen readers and the stars read as "Rated 5 out of 5".`;

const CAPSULE_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **One row, one open card.** Every review is a flex item in one row. A closed review keeps its 56px capsule width; the open one takes all the space left over (\`flex-grow: 1\`). When you open another, the old one's grow eases from 1 to 0 and the new one's from 0 to 1 over the same 720ms on the same curve, so one closes exactly as fast as the other opens and the row's width never changes. That is why nothing snaps.
2. **The shape.** Inside each item a colored shape sits 22px in from the top and bottom, fully round. When it opens, it reaches the full height and its corners settle to 28px, on the same curve.
3. **The capsule face.** A button fills the capsule: the name written upward (vertical text, turned to read bottom to top) and the round photo at the bottom with a 6px ring. On hover (pointer devices only) the capsule grows to 64px wide and 8px from the top and bottom, and the photo stretches from a circle into a tall portrait, from soft color to full color. It fades out as the capsule opens and back in once it has closed.
4. **The open card.** Its content is laid out at the full open width (the row width minus the other capsules), so the words never re-wrap as the card grows; the card simply uncovers them. The top part (quote mark, words, date) starts at 60% opacity and 90% size from its top left corner and settles to 100% and 100%. The name, role, photo and stars come in just after.
5. **The stars.** Five stars, the earned ones solid and the rest faint. They pop in one after another (90ms apart) with a little overshoot. The first card plays this when the section first scrolls into view.
6. **Narrow screens.** Under 560px of section width (a container query, so it follows the section's own width), the row turns into a column: capsules lie down as 56px tall pills with the photo on the left and the name beside it, and the open card grows downward.
7. **Keyboard.** Each capsule is a button. Enter or Space opens it and moves focus to the card. The arrow keys, Home and End open the next, previous, first or last review.`;

export function installPrompt(tsSource: string) {
  return `# Capsule Testimonials

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

${ONE_LINE}

## Before you build: one question

Look through this project first: its pages and their sections (is there a landing, pricing or about page with a spot for reviews?), any reviews or quotes it already shows (names, roles, photos, ratings) and where they live. Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (it works best after the features or pricing on a landing page, where people want proof).
  *Why: reviews persuade most right after people have seen what they would buy.*

Ask nothing else. If I say *skip*, use the best suggestion. The section needs reviews to show: use my real reviews and photos if you found them, otherwise keep its made-up samples and tell me they need replacing.

## Keep it as it is

The section is the design: slim round capsules with the photo at the bottom and the name written up the side, the hover that grows the capsule and stretches the photo into a portrait, the smooth open where the old card eases back into a capsule at the same pace, the words settling from 60% opacity and 90% size, the rounder 28px corners on the open card, and the stars popping in one by one. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the preview card, the preview size buttons and fullscreen, the hint text, the drawn sample faces, and the self-playing TV on the home page.

${CAPSULE_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/page.tsx (the page I picked)
import { CapsuleTestimonials } from "@/components/ui/capsule-testimonials";

const REVIEWS = [
  { name: "Lena Fischer", role: "COO, Northwind", quote: "We moved our whole team over in a week.", date: "Oct 2026", rating: 5, photo: "/people/lena.jpg" },
  { name: "Omar Haddad", role: "Founder, Globex", quote: "Support answers before I finish typing.", date: "Sep 2026", rating: 5, photo: "/people/omar.jpg" },
  { name: "Mia Chen", role: "Designer, Initech", quote: "It finally looks like our brand.", date: "Aug 2026", rating: 4, photo: "/people/mia.jpg" },
];

export default function Home() {
  return (
    <main>
      {/* ...my existing sections... */}
      <CapsuleTestimonials title="What our customers say" description="Open a capsule to read one." items={REVIEWS} />
      {/* ...the next section... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It centres its own 896px column with 24px sides (16px on phones), so don't wrap it in extra padding.
- \`items\` takes \`{ name, role, quote, date, rating, photo, alt, color, ink }\`; 4 to 7 reviews read best. Portrait photos work best: the capsule shows the face, the hover shows more. A review without a photo shows initials.
- The default reviews and the default heading are made-up samples. If you found no real reviews, keep them but tell me clearly, so nothing fake ships on my page.

${CAPSULE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- The first review is open and its words settle in and its stars pop in one by one when the section scrolls into view. Hovering another capsule makes it taller and wider and stretches its photo into a portrait. Clicking it opens it over 0.72s while the open card eases back into a capsule, with no jump in the row's width. The words never re-wrap while a card grows. Only one card is open at a time.
- It looks right in light and dark mode (check both): page text in my text colors, each card's words readable on its own color.
- It works with a finger on a phone at 375px wide: the capsules lie down and stack, a tap opens one, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, cards swap at once and the words and stars only fade in.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/capsule-testimonials.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Capsule Testimonials, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

${ONE_LINE} The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (landing, pricing, about), the reviews or quotes it already shows (names, roles, photos, ratings, dates) and where they come from, the way it writes headings, and its theme: \`--foreground\`, \`--background\`, \`--radius-lg\` and its brand color variables, or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (after the features or pricing on a landing page is usual).
      *Why: reviews persuade most right after people have seen what they would buy.*
   2. **Which reviews?** Use the reviews you found (suggested when you found 4 or more, with their photos), draft 4–6 from what my customers already say for me to approve, or keep the samples for now.
      *Why: the reviews are the content of the section, and a real face next to a real name is what makes people believe it.*
   3. **Card colors?** Keep the built-in soft palette, use my brand colors (name which of my existing color variables you'd use, and whether the text on each is light or dark), or one brand color for every card.
      *Why: six open cards in a row are the most color on the page, so they decide whether it feels like my brand.*
   4. **What do the heading and line above it say?** Draft them in my voice from my pages (suggested), use words I already have, or no heading.
      *Why: it is the first thing people read before they open a capsule.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the reviews, the card colors, the heading words, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<CapsuleTestimonials />\`, and between which sections.
- The reviews: \`items\` (\`{ name, role, quote, date, rating, photo, alt }\` each), and \`defaultOpen\` if one review should start open.
- The card colors: \`color\` and \`ink\` on each review.
- The words: \`title\` and \`description\` (\`null\` hides them).

All of these are props the section already has, so the section file itself stays as written.

**Locked:** the slim round capsules with the photo at the bottom and the name written up the side, the hover that grows the capsule and stretches the photo, the smooth open where the old card eases back at the same pace, the words settling from 60% opacity and 90% size, the 28px corners on the open card and the stars popping in one by one. If something doesn't fit my product, tell me instead of changing it. No new packages, no other files, and none of the Impeccable website's demo parts (the preview card, size buttons and fullscreen, the hint, the drawn sample faces, the self-playing TV).

${CAPSULE_SHARED_BUILD}

## Fit it to the brand

- **Place:** render it between the two sections I picked, full width. It centres its own 896px column.
- **Reviews:** map my reviews to \`items\`. Keep quotes to one to three sentences; shorten long ones only with my OK. Use portrait photos where I have them; without one, the capsule shows initials. Write \`alt\` as the person's name.
- **Colors:** set them through each review's \`color\` and \`ink\` with my theme variables, never hex, for example:

\`\`\`tsx
const REVIEWS = [
  { name: "Lena Fischer", role: "COO, Northwind", quote: "We moved our whole team over in a week.", date: "Oct 2026", rating: 5, photo: "/people/lena.jpg", color: "var(--primary)", ink: "light" },
  { name: "Omar Haddad", role: "Founder, Globex", quote: "Support answers before I finish typing.", date: "Sep 2026", rating: 5, photo: "/people/omar.jpg", color: "var(--secondary)", ink: "dark" },
];
\`\`\`

  If a variable holds bare channels (like \`222 47% 11%\`), wrap it: \`color: "hsl(var(--primary))"\`. Pick \`ink\` so the words read clearly on that color, and check each color in light and dark mode.
- **Words:** set \`title\` and \`description\`, or \`null\` to hide either.

${CAPSULE_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My reviews show as capsules with my photos and names. The first one is open, and its words settle in and its stars pop in one by one when the section scrolls into view. Hovering a capsule makes it taller and wider and stretches the photo. Clicking one opens it over 0.72s while the open card eases back into a capsule, with no jump. The words never re-wrap while a card grows.
- It looks right in light and dark mode (check both): my card colors, and every card's words readable on its color.
- It works with a finger on a phone at 375px wide: the capsules lie down and stack, a tap opens one, and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, cards swap at once and the words and stars only fade in.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/capsule-testimonials.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
