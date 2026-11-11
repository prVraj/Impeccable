---
name: impeccable-descriptions
description: Writes and audits the short descriptions every Impeccable component, section, animation and skill shows on the site (the line under the docs page title, the page's meta description, and the blurb in lib/site.ts). Use when adding, renaming or changing an item, or touching any of these texts, so each stays at two lines and says what it does, where to use it and how to use it best.
---

# Impeccable descriptions

Every item on the Impeccable site has three short texts. They agree with each other and with what the item really does.

| Text | Where it shows | Where it lives | Length |
| --- | --- | --- | --- |
| **Description** | Under the big title on the item's docs page | `description=` on `<PageTitle>` in `app/docs/<slug>/page.tsx` | Two sentences, at most two lines on desktop |
| **Meta description** | Google results and link previews | `metadata.description` in the same file | The same text as the description |
| **Blurb** | Sidebar lists, the "What's inside" list on `/docs`, the README tables | `blurb` in `COMPONENTS` in `lib/site.ts` | One sentence, about 65 characters |

## Workflow

1. Read the item's source, its docs page (hint, Usage, Props) and its Install prompt's one-line intro.
   Why: a description that promises what the code doesn't do is worse than none.
2. Write sentence 1 (what it does) and sentence 2 (where to use it, and the best way).
3. Put the same text in `description=` and `metadata.description`. If sentence 1 changed what it says, update the `blurb` and the item's README row with it.
4. Run the audit. Done when every line passes.

## The two-sentence shape

> [What it is / what happens], [the one thing that makes it special]. Use it on [concrete place] [best-use tip].

**Sentence 1, what it does.** What a person sees or gets, in plain words, as if pointing at it on screen. Start with the thing itself ("A password field that...", "Named cursors draw...", "One click burns..."), never with the item's name.
Why: the name is the title right above it.

**Sentence 2, where and how.** Start with "Use it" (or "Save it", "Run it", "Wrap it"), name one or two concrete places it fits best (a page, a screen, a moment), and add the one tip that most often makes it look right: a count ("8 to 20 short thoughts"), a frequency ("one big moment"), or a pairing ("in place of a plain strength bar").

The description is a first glance, not the manual. Leave out anything the preview hint, Usage, Props or prompts already say (how it moves, edge cases, numbers, props).

## Rules

- **Two lines, hard limit:** at most 150 characters including spaces, aiming for 120 to 145.
  Why: the title area is `max-w-2xl` at 18px, about 75 to 80 characters a line on desktop.
- **Plain words.** Never "component", "prop", "hook", "render", "state", "requestAnimationFrame" or "SVG". Say "field", "page", "button", "loads".
  Why: the reader may be a designer, not a developer.
- **Concrete places.** "On a pricing or thank-you page", never "in many contexts". "Any slow screen, like a dashboard", never "anywhere you need loading".
- **No feature lists**, colons, semicolons, em dashes or exclamation marks. Never "simply", "just", "beautiful", "stunning" or "seamless".
- **Every claim is true in the code.** If it needs a setup step, the tip says so.
- **The site's voice:** short, warm, confident, second person ("your page", "your thoughts").

## Blurb

Sentence 1 of the description, trimmed to about 65 characters. No "Use it" part. The README table for the item's group says the same thing in the same words (`pre-push-check`, step 6).

## Examples

Good:

> A password field that rates what you type as No, AI, AI agent or Human. Use it on sign-up and reset forms in place of a plain strength bar.

> One click burns the screen away from where you clicked and shows the next page through the hole. Save it for one big moment, like finishing sign-up.

Too long (four lines, a feature list, how it works):

> A password field with a show/hide eye and three checkpoints. Meet none and it says No, one reads as AI, two as AI agent, all three as Human: a password only a person would make. The meter fills bar by bar, each checkpoint ticks itself, and a soft shine runs over the bars when it turns Human.

Too vague (no place, no tip):

> A fun, interactive way to show your thoughts. Great for any website.

## Audit

Check every item you touched, and say each line passed:

- [ ] 150 characters or fewer (count it: `node -e 'console.log("...".length)'`).
- [ ] Two lines or fewer on the docs page at 1280px wide (look, or measure: the `<p>` under the `<h1>` is at most `2 × line-height` tall).
- [ ] Sentence 1 says what a person sees or gets. Sentence 2 names a concrete place and one tip.
- [ ] No jargon, colons, semicolons, em dashes or feature lists. Doesn't open with the item's name.
- [ ] `description=` and `metadata.description` are the same text.
- [ ] The blurb and the README row say the same thing as sentence 1.
- [ ] Every claim is true in the code.
