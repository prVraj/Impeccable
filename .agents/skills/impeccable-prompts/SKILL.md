---
name: impeccable-prompts
description: Writes and audits the Install prompt and Blend prompt that every Impeccable component, section and animation ships with, in lib/prompts.ts. Use when adding or changing an item, or touching any prompt, so every prompt has the same shape and quality. Skills ship no prompts.
---

# Impeccable prompts

Every component, section and animation on the Impeccable site ships exactly two prompts that a person pastes into their AI coding tool:

- **Install prompt**: adds the item exactly as it is on the website, in the one place the person picks. It asks one question (where), nothing else.
- **Blend prompt**: adds the same item and fits it to the person's brand like a missing puzzle piece. It asks one round of short questions, shows a brief, then builds.

The person pasting the prompt may be a designer with little code. The agent reading it has never heard of Impeccable. So each prompt carries all the context the agent needs: what the item is, what never changes, how it works, how to build it and how to check it. Nothing may depend on the Impeccable website or this repo, except the registry URL.

Burning-Screen is the reference: `burningScreenInstallPrompt` and `burningScreenBlendPrompt` in `lib/prompts.ts`. For any wording this file doesn't cover, copy Burning-Screen's.

## Workflow

1. Read the item's source, its props, its docs page and the prompts of one existing item of the same kind in `lib/prompts.ts`.
2. Fill in the **item sheet** below. Done when every line has an answer; the prompts are then mostly assembly.
3. Write both prompts with the skeletons below, as two exported functions in `lib/prompts.ts` named `<camelName>InstallPrompt` and `<camelName>BlendPrompt`. Text shared by both goes in `<NAME>_SHARED_BUILD` and `<NAME>_HOW` constants, the way Agent-Draw does it. Add your block at the end of the file, and change other items' prompts only with small, exact edits.
   Why: other threads edit this file at the same time.
4. Wire them into the item's docs page: a **Prompts** section placed right after Installation (on component pages, right after `<Showcase>`), with `Tabs` labelled `Install prompt` and `Blend prompt`, each with `copy` set to the prompt and `<PromptBody text={...} />` as body. Its lede names what Blend asks, for example "Blend asks four short questions (where, names, colors, speed)".
   Why: the prompts are the main reason people come, so they sit high on the page.
5. Run the **audit** at the end of this file on both prompts. Done when every line is yes.
6. Run `pnpm build`, open the page in light and dark mode, and copy each prompt once. Done when both paste in full, with no broken formatting.

## The item sheet

Write this down before the prompts. Each line feeds a part of both prompts.

- **Name** as shown on the site, and the file path it installs to (`components/ui/<name>.tsx`).
- **One line**: what the person sees it do, in plain words. Both prompts open with it.
- **Placement**: what "where" means for this item (see Kinds), and the 1–3 kinds of places that fit best.
- **The design**: the 3–6 things that make it this item (shape, motion, timing, feel). These become the locked lines.
- **Allowed changes**: every prop or option a person may set, and its default. Blend changes only these. Anything that is not a prop is locked.
- **Blend questions**: 2–5, never more than 8, drafted with the rules below.
- **Demo-only parts** of the website (sliders, toggles, Replay, "Try it"). They never ship.
- **Fallbacks**: reduced motion, missing browser features, keyboard.
- **Checks**: what a person can see to know it works.

## Kinds

The skeleton is the same for every kind. Only the placement question and the source change.

| Kind | What it is | The placement question | Source |
| --- | --- | --- | --- |
| Component | A self-contained piece of UI (Scratch-me, brain.txt) or behaviour (Burning-Screen, Agent-Draw). | Where should it go? Which button, screen or section it belongs to. | Full file in a code block. |
| Section | A full page block (hero, pricing, footer). | Which page, and between which existing sections? Placeholder content unless the project has real content. | Full file in a code block. |
| Animation | Motion applied to the person's own elements (a text reveal, a scroll effect). | Which existing element(s) should move? Their markup and styles stay; the animation only wraps or targets them. | Full file in a code block. |

**Skills have no prompts** (vrajsensei, 2026-11-11). Skills (UI-tongue and any later one) ship no Install or Blend prompt, and their docs pages have no Prompts section. People download a skill, read it and install it. A skill page is: Download (with the read-only `SKILL.md` box under the button), Install, then the explainer sections.

## Install prompt skeleton

Use these headings, in this order:

1. `# <Name>`
2. Opening (say section or animation instead of component when that is the kind): "A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else." Then the **one line**.
3. `## Before you build: one question`: the agent looks through the project first (name what to look at for this item), then asks only the placement question, with its one-line *why*, suggesting the 1–3 best places from the person's own code. "Ask nothing else. If I say *skip*, use the best suggestion." If the item can't work without one piece of content (Scratch-me's code), ask for it in the same question.
   Why: Install promises the website version; every extra question invites a change.
4. `## Keep it as it is`: 2–3 lines naming the design and saying it stays exactly as in the source; "If something doesn't fit my project, tell me instead of changing it." Then two bullets: only the item's file plus the wiring in the place I picked, no packages, no other files, no restyling; no demo controls from the Impeccable website (name this item's demo controls).
5. `## Fastest path`: the shadcn command with the full registry URL `https://impeccable-rust.vercel.app/r/<name>.json`, and what to do if it fails.
   Why: the agent doesn't know Impeccable's address, and a short name fails.
6. `## Build it`: stack, JS variant, file path, exports to keep, `"use client"`, the exact tuning values that never change (by name), and the fallbacks.
7. `## Use it`: a short, real usage example and the rules the agent needs to wire it (what goes in `className`, data attributes, room it needs).
8. `## How the <thing> works`: include it when the code has timing, drawing or ordering logic an agent might "tidy" (Burning-Screen, Agent-Draw). Leave it out for plain markup. (Blend always has it.)
9. `## Check`: see The check list.
10. `## Source`: "The reference implementation. Copy it as-is, then apply only the changes listed above." and the full source.

## Blend prompt skeleton

Same as Install, with these differences:

1. Title: `# <Name>, fitted to your brand` ("your product" when it has no colors to fit, only words and content).
2. Opening: "...fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes." Then the one line, and "The full source is at the end of this prompt."
3. `## First: look, ask once, then build`, as four numbered steps:
   1. Look through the project first: what to look at for this item, plus its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
   2. Say in two or three lines what you found, then ask the questions in **one message**, each with options, a marked suggestion and its one-line why. "Ask nothing else. If I say *skip*, use your suggestions."
   3. After the answers, show a brief: one line per answer, plus "Everything else is kept as designed." Ask whether to save the brief to `impeccable.md` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
   4. Build only after I say go.
4. `## What you may change, and what you may not`, as two short lists:
   - **You may change** (only through my answers): one bullet per answer, naming the prop or option it sets. End with "All of these are props the component already has, so the component file itself stays as written."
   - **Locked**: the 2–3 line summary of the design, then "If something doesn't fit my product, tell me instead of changing it." and the no packages / no other files / no demo controls line.
5. `## Fit it to the brand` (replaces Use it): how each answer is applied, with an example that uses theme variable names, never hex.
6. `## How the <thing> works`: always. Numbered steps in plain words, starting with "Read this before you touch anything, so you know what the code does and why it must stay as it is."
   Why: Blend invites change, so the agent needs to know which parts carry the design.
7. `## Check`: as Install, but it checks what I chose (my colors, my speed, my words), and the report lists what was set from my answers.

## Writing the Blend questions

- The first question is always the placement question.
- Every other question changes the output through an existing prop. If no prop changes, cut it.
- Every question has a one-line *why*: what it changes, and why that matters for this item. If you can't write the why, cut the question.
- Ask the agent to suggest from what it found in the project. Never ask what it can read there (router, framework, theme, existing copy).
- Every question has 2–3 options and one marked suggestion.
  Why: so *skip* always works.
- Colors: the agent names which of the person's existing color variables it would use. Never ask for or paste hex codes.
- 2–5 questions, never more than 8.
  Why: people leave when asked too much.

Format each question like this in the prompt:

```
   2. **Colors?** Keep the black, white and gray default, or match my brand. If you suggest brand colors, name which of my existing color variables you'd use for the char, the glow, the smoke and the ash. If you found no theme, offer the default or let me paste 1–3 colors.
      *Why: the burn edge is the only color on screen, so it is what makes it feel like part of my brand.*
```

## Colors and theme

- Colors come from the person's theme at runtime: `var(--name)` or Tailwind color variables, or read with `getComputedStyle` when the component needs a real color value. Never copy hex codes into their project.
  Why: hex breaks their dark mode and stops matching when they change their theme.
- If a variable holds bare channels (for example `222 47% 11%`), wrap it as `hsl(...)`.
- Every item works in light and dark mode, and the prompt says how it follows the theme (for example "lines take their color from the text color around the map").

## The check list

Every `## Check` has these lines, in this order, written for this item:

1. It type-checks and the page renders with no console errors.
2. One to three lines on what a person sees when it works (the core behaviour, with numbers: seconds, counts, limits).
3. It looks right in light and dark mode (check both).
4. It stays smooth on a phone, or works with a finger on a phone.
5. What `prefers-reduced-motion: reduce` gives.
6. Nothing else on the site looks or behaves differently.
7. "Finish with a short report: the files you added or changed, where it's placed (Blend: what you set from my answers), and every place where you had to do something differently from the source, and why."

## Voice

- Written as the person speaking to their agent: "I", "my project", "ask me".
- Short, plain sentences. No jargon the person couldn't explain to a friend. Code names in backticks only where the agent needs them.
- No marketing words. Say what it does.

## Audit

Run this on both prompts. Every line must be yes.

- [ ] Both open with the same one line of what the item does.
- [ ] Install asks one question only (placement, plus required content if any), with its *why*, suggestions from the person's code and a *skip* default.
- [ ] Blend asks 2–5 questions (max 8) in one message, the first is placement, each has options, a marked suggestion and a *why*, and each maps to an existing prop.
- [ ] Blend shows a brief (one line per answer, plus the "kept as designed" line), offers `impeccable.md` or chat (chat default), and waits for "go".
- [ ] Blend has the two lists: "You may change" (by prop) and "Locked" (2–3 lines). Install has "Keep it as it is" with the 2–3 locked lines.
- [ ] Both say: no new packages, no other files, no restyling, and name this item's demo controls as never shipped.
- [ ] Fastest path uses the full registry URL, and Build it names the tuning values that stay.
- [ ] Colors are theme variables, never hex.
- [ ] Blend has "How it works" in plain numbered steps.
- [ ] Check has all 7 lines, including both themes, phone, reduced motion and the final report.
- [ ] Source is complete (full code).
- [ ] The docs page has the Prompts section with both tabs, right after Installation, and its lede names what Blend asks.
