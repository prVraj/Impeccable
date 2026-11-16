/* ---------- Coffee FAQ ----------
 * A section (an FAQ block with a chat box at the end).
 * Install: adds the exact section; asks only which page and where on it.
 * Blend: asks four short questions, then fits it through the section's own props. */

const COFFEE_FAQ_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/coffee-faq.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`coffee-faq.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/coffee-faq.tsx\`
- Keep these exports and their names: \`CoffeeFaq\`, \`CoffeeFaqProps\`, \`CoffeeFaqItem\`, \`CoffeeFaqLabels\`, \`COFFEE_FAQ_ITEMS\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`EASE\`, \`OPEN_EASE\`, \`OPEN_MS\`, \`REPLY_MS\`, \`JITTER_MS\`, \`WORD_STAGGER_MS\`, \`MAX_QUESTION\`) exactly as written. They are the design: a 640px column, 56px rows 12px apart, rows that open in 420ms like a drawer, dots that type for 1.5 seconds give or take 250ms, reply words 45ms apart, and questions up to 280 characters.
- Keep the colors as theme variables: everything reads \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), and the corners read \`--radius-lg\`. Never swap them for fixed hex or pixel values.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` rows open at once, nothing slides or blurs, the dots stand still (the wait stays) and the reply shows whole; every row is a real button with \`aria-expanded\` that Tab, Enter and Space reach; Enter in the box sends; each reply is read out by screen readers; the box's text is 16px so phones don't zoom in.`;

const COFFEE_FAQ_HOW = `## How the section works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Layout.** A centred 640px column: a small pill label, the title, a short line, then the rows 12px apart. On a narrow section (560px or less, measured on the section's own width with a container query, not the window) the title drops from 40px to 30px and the side padding from 24px to 16px.
2. **Rows.** Each row is a 56px question button with a chevron, on a 2.5% tint of the text color with a 1px edge. Only one row is open at a time: opening one closes the other. The answer opens like a drawer in 420ms (its height grows from 0 with \`grid-template-rows\`), and its text fades in from a 3px blur and 6px up, a moment after the height starts. The open row turns to the page color with a soft shadow, and its chevron turns over.
3. **The chat box.** The last row is a chat box in the same style: a round face, two lines, and a text box with a round send arrow where the chevron would be. The arrow is grey and does nothing while the box is empty or a reply is still coming.
4. **Asking.** Enter or the arrow sends. The typed text floats up and fades out of the box, and the question appears as a new row above the box (tagged "You"), growing in over half a second, already open. Any other open row closes. Only my latest question stays: a question I asked before folds away (up, fading, in under half a second) while the new one grows in its place, so the section never keeps growing. The page scrolls just enough to keep the box in view.
5. **The reply.** Three dots bounce next to the face for \`replyDelay\` (1.5 seconds by default, plus or minus up to 250ms so it feels human). Then the dots blur away and the reply arrives word by word, 45ms apart, each word rising out of a small blur. With no \`onAsk\` the reply is always \`reply\`; with \`onAsk\`, its returned string is the reply, and the dots stay for at least \`replyDelay\` even if the answer comes sooner. If \`onAsk\` fails, the reply is the \`error\` label. While the dots type, the default reply is already laid out but hidden, so the row doesn't jump when it arrives.
6. **Theme.** Everything is drawn from the page's text and background colors, so it follows light and dark mode with no setup: the "You" tag, the face and the send arrow are the text color with background-colored marks.`;

export function installPrompt(tsSource: string) {
  return `# Coffee FAQ

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

An FAQ section: question rows that open one at a time, and a chat box at the end where your question becomes a new row, three dots type for a moment, then a reply writes itself in.

## Before you build: one question

Look through this project first: its pages and their sections (is there a landing, pricing or help page, and a footer?), and any FAQ content it already has. Then ask me this in one message and wait for my answer:

- **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (an FAQ usually sits near the end of a landing or pricing page, just above the footer or final call to action).
  *Why: it is a whole block of a page, so it needs one clear spot, and near the end is where visitors look for answers before they decide.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The section is the design: the rows that open one at a time like a drawer, the chat box drawn as the last row, a question becoming a new open row that replaces the one asked before, the three typing dots and the reply arriving word by word. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one place I picked. If the project already has FAQ text, pass it in \`items\`; if not, keep the default questions (they are about Impeccable UI) and tell me they need replacing. Keep the default reply. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the preview frame, its size buttons and fullscreen, and the hint text under it.

${COFFEE_FAQ_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/pricing/page.tsx (the page I picked)
import { CoffeeFaq } from "@/components/ui/coffee-faq";

export default function PricingPage() {
  return (
    <main>
      {/* ...my existing sections... */}
      <CoffeeFaq />
      {/* ...my footer... */}
    </main>
  );
}
\`\`\`

- Put it between the two sections I picked, full width. It paints the page background and pads itself (96px top and bottom, 64px on narrow screens), so don't wrap it in extra padding.
- \`items\` takes \`{ question, answer }\` objects; an answer can be text or markup with links.
- With no \`onAsk\`, nothing leaves the page: every question gets \`reply\` after the dots.

## Check

- It type-checks and the page renders with no console errors.
- Clicking a question opens its answer in under half a second and closes any other open row; clicking it again closes it. Typing a question and pressing Enter adds it as a new open row above the box (replacing any question I asked before, so only one stays), three dots type for about 1.5 seconds, then "My credits are over. Buy me a coffee." writes itself in word by word. The arrow does nothing while the box is empty or the dots are typing.
- It looks right in light and dark mode (check both): faint rows with a thin edge, the open row lifted in the page color, a solid send arrow in the text color.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, long questions wrap, the box doesn't zoom in when tapped and the keyboard's Send key sends.
- With \`prefers-reduced-motion: reduce\`, rows open at once, the dots stand still for the same wait, and the reply shows whole.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/coffee-faq.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Coffee FAQ, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

An FAQ section: question rows that open one at a time, and a chat box at the end where your question becomes a new row, three dots type for a moment, then a reply writes itself in. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its pages and their sections (landing, pricing, help, footer), any FAQ text it already has (an FAQ page, pricing notes, docs, a help center), whether it already has a chat, AI or support endpoint, its logo files or a founder or support photo, the way it writes short UI text, and its theme: \`--foreground\`, \`--background\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it go on, and between which sections?** Suggest the 1–3 best places from my pages (near the end of a landing or pricing page, above the footer, is usual).
      *Why: it is a whole block of a page, and near the end is where visitors look for answers before they decide.*
   2. **Which questions?** Use my existing FAQ text (suggested when you found some), draft 4–6 from my pricing and product pages for me to approve, or keep the Impeccable placeholders for now. Also the title and the line under it.
      *Why: the rows are the content of the section, so they have to answer what my visitors really ask.*
   3. **What should the chat answer?** Keep "My credits are over. Buy me a coffee." as a joke, a fixed reply in my voice (like "Thanks! We'll email you within a day."), or wire it to my chat, AI or support endpoint (suggested only if you found one).
      *Why: every question in the box gets this reply, so it decides whether the box is a joke, a promise or a real answer.*
   4. **Whose face and words in the chat box?** My logo mark (suggested), a founder or support photo you found, or the default mark; plus its two lines and placeholder in my voice.
      *Why: the face sits next to every reply, so it tells visitors who is answering them.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the questions, the reply, the face and words, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: which page renders \`<CoffeeFaq />\`, and between which sections.
- The questions: \`items\`, plus \`eyebrow\`, \`title\`, \`description\` and \`defaultOpen\`.
- The reply: \`reply\`, \`replyDelay\` (300 to 10000ms) and \`onAsk\`.
- The face and words: \`avatar\`, \`chatTitle\`, \`chatDescription\` and \`labels\`.

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The section is the design: the rows that open one at a time like a drawer, the chat box drawn as the last row, a question becoming a new open row that replaces the one asked before, the three typing dots and the reply arriving word by word, with its sizes, spacing and timing. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (the preview frame, its size buttons and fullscreen, the hint text under it).

${COFFEE_FAQ_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/pricing/page.tsx (the page I picked)
import { CoffeeFaq } from "@/components/ui/coffee-faq";
import { LogoMark } from "@/components/logo-mark"; // my logo, from my brief

const FAQS = [
  { question: "How long is the free trial?", answer: "14 days, no card needed." },
  { question: "Can I cancel any time?", answer: "Yes, from Settings, in one click." },
];

// From my brief. Leave out any prop that stays at its default.
export function PricingFaq() {
  return (
    <CoffeeFaq
      eyebrow="FAQ"
      title="Questions about Acme"
      description="Can't find yours? Ask it at the bottom."
      items={FAQS}
      avatar={<LogoMark />}
      chatTitle="Ask the Acme team"
      reply="Thanks! We'll email you an answer within a day."
      // Or answer for real: onAsk={(q) => askSupport(q)} returning the answer text.
    />
  );
}
\`\`\`

- Colors are not props: the section reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--radius-lg\` for the corners). If my theme uses other names, map them in my global CSS for this section only (for example \`.icf { --foreground: var(--text-primary); --background: var(--surface); }\`), never with hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- \`onAsk\` gets the question and returns the answer text, or a promise of it. Return nothing to fall back to \`reply\`. Never send questions anywhere unless I chose that in question 3.
- The face is a 40px circle in the box and 24px next to replies, filled with the text color; an \`<img>\` fills it, an SVG mark sits in the middle.
- It paints the page background and pads itself, so place it full width between my sections.

${COFFEE_FAQ_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My questions, title and words show. Clicking a question opens its answer in under half a second and closes any other open row. A question typed in the box becomes a new open row above it (replacing the one I asked before, so only one stays), the dots type for my chosen time (1.5 seconds by default), then my reply writes itself in word by word next to my face. The arrow does nothing while the box is empty or the dots are typing.
- It looks right in light and dark mode (check both): my theme's text and background colors, faint rows with a thin edge, the open row lifted, a solid send arrow.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, long questions wrap, the box doesn't zoom in when tapped and the keyboard's Send key sends.
- With \`prefers-reduced-motion: reduce\`, rows open at once, the dots stand still for the same wait, and the reply shows whole.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/coffee-faq.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
