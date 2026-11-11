---
name: impeccable-prompts
description: Writes and audits the Install prompt and Blend prompt that every Impeccable component, section, animation and skill ships with (lib/prompts.ts). Use whenever you add a new item to Impeccable, change one, or touch any prompt, so every prompt has the same shape and quality.
---

# Impeccable prompts

Every item on the Impeccable site (component, section, animation or skill) ships exactly two prompts that a person pastes into their AI coding tool:

- **Install prompt**: adds the item exactly as it is on the website, in the one place the person picks. It asks one question (where), nothing else.
- **Blend prompt**: adds the same item and fits it to the person's brand like a missing puzzle piece. It asks one round of short questions, shows a brief, then builds.

The person pasting the prompt may be a designer with little code. The agent reading it is a stranger to Impeccable. So each prompt must carry all the context the agent needs: what the item is, what must never change, how it works, how to build it, and how to check it. Nothing may depend on the Impeccable website or on this repo.

Burning-Screen is the reference: `burningScreenInstallPrompt` and `burningScreenBlendPrompt` in `lib/prompts.ts`. When in doubt, copy its wording.

## Workflow

1. Read the item's source, its props, its docs page and the prompts of one existing item of the same kind in `lib/prompts.ts`.
2. Fill in the **item sheet** below. Most of the work is here; the prompts are mostly assembly.
3. Write both prompts with the skeletons below, as two exported functions in `lib/prompts.ts` named `<camelName>InstallPrompt` and `<camelName>BlendPrompt`. Text shared by both goes in `<NAME>_SHARED_BUILD` and `<NAME>_HOW` constants, the way Agent-Draw does it. Other threads edit this file too: add your block at the end, and change other items' prompts only with small, exact edits.
4. Wire them into the item's docs page: a **Prompts** section with `Tabs` labelled `Install prompt` and `Blend prompt`, each with `copy` set to the prompt and `<PromptBody text={...} />` as body. Its lede names what Blend asks, for example "Blend asks four short questions (where, names, colors, speed)".
5. Run the **audit** at the end of this file on both prompts. Fix anything that fails.
6. Run `pnpm build`, open the page in light and dark mode, and copy each prompt once to check it pastes clean.

## The item sheet

Write this down before the prompts. Each line feeds a part of both prompts.

- **Name** as shown on the site, and the file path it installs to (`components/ui/<name>.tsx`).
- **One line**: what the person sees it do, in plain words. Both prompts open with it.
- **Placement**: what "where" means for this item (see kinds below), and the 1–3 kinds of places that fit best.
- **The design**: the 3–6 things that make it this item (shape, motion, timing, feel). These become the locked lines.
- **Allowed changes**: every prop or option a person may set, and its default. Blend may only change these. If something is not a prop, it is locked.
- **Blend questions**: 2–5 (never more than 8), drafted below.
- **Demo-only parts** of the website (sliders, toggles, Replay, "Try it"): never shipped.
- **Fallbacks**: reduced motion, missing browser features, keyboard.
- **Checks**: what a person can see to know it works.

## Kinds

The skeleton is the same for every kind. What changes is what the placement question means and what "source" is.

| Kind | What it is | The placement question | Source |
| --- | --- | --- | --- |
| Component | A self-contained piece of UI (Scratch-me, brain.txt) or behaviour (Burning-Screen, Agent-Draw). | Where should it go? Which button, screen or section it belongs to. | Full file in a code block. |
| Section | A full page block (hero, pricing, footer). | Which page, and between which existing sections? Placeholder content unless the project has real content. | Full file in a code block. |
| Animation | Motion applied to the person's own elements (a text reveal, a scroll effect). | Which existing element(s) should move? Their markup and styles stay; the animation only wraps or targets them. | Full file in a code block. |
| Skill | An agent skill folder (UI-tongue). | This project only, or every project? | Download link and file tree. The folder is copied unchanged, never rewritten or merged into other rules. |

### Skills are a little different

A skill has no props and no code to wire, so its prompts keep the same order but swap three parts (see `uiTongueInstallPrompt` and `uiTongueBlendPrompt`):

- Opening: "An agent skill from Impeccable (a folder of instructions your AI tool reads)." instead of "A 1-file React component".
- `## Fastest path` and `## Build it` become `## Install it`: download the zip from the site, unzip it so the folder sits at `<skills folder>/<name>/SKILL.md`, and say where that folder is for each tool (Claude Code, the Claude app, other tools that read SKILL.md folders).
- Blend fits the skill to the person's **setup**, not their brand: where it lives, which tools get it, and which of their existing design files (DESIGN.md, Tailwind theme, design rules) it should read first. The skill's own files stay exactly as shipped.

## Install prompt skeleton

Use these headings, in this order:

1. `# <Name>`
2. Opening (swap "component" for section or animation when that is the kind): "A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else." Then the **one line** of what it does.
3. `## Before you build: one question`: the agent looks through the project first (name what to look at for this item), then asks only the placement question, with its one-line *why*, suggesting the 1–3 best places from the person's own code. "Ask nothing else. If I say *skip*, use the best suggestion." If the item needs one piece of content to work at all (Scratch-me's code), it may be asked in the same question.
4. `## Keep it as it is`: 2–3 lines naming the design and saying it stays exactly as in the source; "If something doesn't fit my project, tell me instead of changing it." Then two bullets: only the item's file plus the wiring in the place I picked, no packages, no other files, no restyling; no demo controls from the Impeccable website (name this item's demo controls).
5. `## Fastest path`: the shadcn command with the full registry URL `https://impeccable-rust.vercel.app/r/<name>.json`, and what to do if it fails.
6. `## Build it`: stack, JS variant, file path, exports to keep, `"use client"`, the exact tuning values that must not change (by name), and the fallbacks.
7. `## Use it`: a short, real usage example and the few rules the agent must know to wire it (what goes in `className`, data attributes, room it needs).
8. `## How the <thing> works`: optional in Install, required in Blend (see below). Include it when the agent could break the design by "tidying" the code.
9. `## Check`: see the check list below.
10. `## Source`: "The reference implementation. Copy it as-is, then apply only the changes listed above." and the full source.

## Blend prompt skeleton

Same as Install, with these differences:

1. Title: `# <Name>, fitted to your brand` (or "your product" when it has no colors to fit, only words and content; "your setup" for a skill).
2. Opening: "...fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes." Then the one line, and "The full source is at the end of this prompt."
3. `## First: look, ask once, then build`, as four numbered steps:
   1. Look through the project first: what to look at for this item, plus its theme (CSS variables, Tailwind theme, shadcn theme, light and dark mode).
   2. Say in two or three lines what you found, then ask the questions in **one message**, each with options, a marked suggestion and its one-line why. "Ask nothing else. If I say *skip*, use your suggestions."
   3. After the answers, show a brief of about 5 lines (one line per answer, plus "everything else is kept as designed"). Ask whether to save the brief to `impeccable.md` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
   4. Build only after I say go.
4. `## What you may change, and what you may not`, as two short lists:
   - **You may change** (only through my answers): one bullet per answer, naming the prop or option it sets. End with "All of these are props the component already has, so the component file itself stays as written."
   - **Locked**: the 2–3 line summary of the design, then "If something doesn't fit my product, tell me instead of changing it." and the no packages / no other files / no demo controls line.
5. `## Fit it to the brand` (replaces Use it): how each answer is applied, with an example that uses theme variable names, never hex.
6. `## How the <thing> works`: required. Numbered steps in plain words, starting with "Read this before you touch anything, so you know what the code does and why it must stay as it is."
7. `## Check`: as Install, but checks what I chose (my colors, my speed, my words) and the report lists what was set from my answers.

## Writing the Blend questions

- The first question is always the placement question.
- Every other question must change the output through an existing prop. If no prop changes, cut it.
- Every question has a one-line *why*: what it changes, and why it matters for this item. If you can't write the why, cut the question.
- Never ask what the agent can find by reading the project (the router, the framework, the theme, the existing copy). Ask it to suggest from what it found instead.
- Every question has 2–3 options and one marked suggestion, so *skip* always works.
- Colors: the agent names which of the person's existing color variables it would use. Never ask for or paste hex codes.
- 2–5 questions. Never more than 8. Fewer is better: people leave when asked too much.

Format each question like this in the prompt:

```
   2. **Colors?** Keep the black, white and gray default, or match my brand. If you suggest brand colors, name which of my existing color variables you'd use for the char, the glow, the smoke and the ash. If you found no theme, offer the default or let me paste 1–3 colors.
      *Why: the burn edge is the only color on screen, so it is what makes it feel like part of my brand.*
```

## Colors and theme

- Colors come from the person's theme at runtime: `var(--name)` or Tailwind color variables, or read with `getComputedStyle` when the component needs a real color value. Never copy hex codes into their project.
- If a variable holds bare channels (for example `222 47% 11%`), wrap it as `hsl(...)`.
- Every item must look right in light and dark mode, and the prompt says how it follows the theme (for example "lines take their color from the text color around the map").

## The check list

Every `## Check` has these lines, in this order, written for this item:

1. It type-checks and the page renders with no console errors.
2. One to three lines on what a person sees when it works (the core behaviour, with numbers: seconds, counts, limits).
3. It looks right in light and dark mode (check both).
4. It stays smooth on a phone, or works with a finger on a phone.
5. What `prefers-reduced-motion: reduce` gives.
6. Nothing else on the site looks or behaves differently.
7. "Finish with a short report: the files you added or changed, where it's placed (Blend: what you set from my answers), and every place where you had to do something differently from the source, and why."

For a skill, lines 1 and 3–5 become: the folder is complete and unchanged from the zip, and the tool lists the skill in a new session.

## Voice

- Written as the person speaking to their agent: "I", "my project", "ask me".
- Short, plain sentences. No jargon the person couldn't explain to a friend. Code names in backticks only where the agent needs them.
- No marketing words. Say what it does.

## Audit

Run this on both prompts before you're done. Every line must be yes.

- [ ] Both open with the same one line of what the item does.
- [ ] Install asks one question only (placement, plus required content if any), with its *why*, suggestions from the person's code and a *skip* default.
- [ ] Blend asks 2–5 questions (max 8) in one message, the first is placement, each has options, a marked suggestion and a *why*, and each maps to an existing prop.
- [ ] Blend shows a ~5 line brief, offers `impeccable.md` or chat (chat default), and waits for "go".
- [ ] Blend has the two lists: "You may change" (by prop) and "Locked" (2–3 lines).
- [ ] Install has "Keep it as it is" with the 2–3 locked lines.
- [ ] Both say: no new packages, no other files, no restyling, and name this item's demo controls as never shipped.
- [ ] Fastest path uses the full registry URL, and Build it names the tuning values that must stay.
- [ ] Colors are theme variables, never hex.
- [ ] Blend has "How it works" in plain numbered steps.
- [ ] Check has all 7 lines, including both themes, phone, reduced motion and the final report.
- [ ] Source is complete (full code, or for a skill the download link and file tree).
- [ ] The docs page has the Prompts section with both tabs, and its lede names what Blend asks.
