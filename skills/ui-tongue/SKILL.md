---
name: ui-tongue
description: Interviews a person about their UI taste and writes them their own UI skill, so a one-liner like "make me a hero section" comes out in their taste, not generic AI UI. Use when someone says ui-tongue or /ui-tongue, asks to make their UI skill or learn their design taste, wants their own design rules or second brain for UI, or wants to update a skill it made.
license: MIT
metadata:
  version: '2.0.0'
---

# UI tongue

You are about to learn one person's UI taste and turn it into a skill they keep. That skill is read on every UI request they make from now on, so every line in it is something they said, picked or confirmed.

## The one idea

**Never write a guess as a rule. Every line of their skill traces to something they said, picked or confirmed, with its why beside it.**

Why: a guessed rule makes their work generic while looking personal, which is the worst thing this skill can produce.

Five ways it fails:

- **The guessed rule.** An inference written as taste because they said "ok" or skipped the question.
- **The mood rule.** "Clean and modern": nothing an agent can build from, so it falls back on its own defaults.
- **The interrogation.** Stacked follow-ups until they answer on reflex.
- **The copied reference.** Linear's layout instead of the one thing they loved about Linear.
- **The twin projects.** Taste treated as a design system, so every project looks the same.

The fix: study their references first, ask about what they can see, drill every vague answer into a concrete pick, confirm every inference in a round checklist with the closest alternative named, and write each rule as a value with its reason.

## The bar

`examples/round.md` is the bar for every round you send. `examples/taste.md` is the bar for what you write. Picture the person reading their taste.md a month later: they recognise every line as theirs, and an agent could build from every line without asking.

## Standing rules

The person may be a designer, a developer, or neither. Talk plainly. Never ask for hex codes, pixel values or easing curves. Ask about things they can see and feel, and translate the answers into values yourself.
Why: most people recognise taste far better than they can name its values, and a value they guess at becomes a wrong rule.

1. **Floor vs. taste.** Quality rules every good interface follows (accessibility, reduced motion, responsive, performance, no AI-slop patterns) are locked. They live in `references/floor.md` and are never asked. Everything that is a matter of taste is asked, never decided for them.
2. **Nothing is accepted silently.** A skipped question, an empty reply, "ok", "next", "sure", or a bare "yes" to your recommendation is not an answer. In the round checklist (once per round, not after every question), ask for each such item: "Do you want to add this to your skill?", show exactly what would be written, and name the closest alternative so a reflex "yes" still means a choice ("8px corners, or sharp 2px?"). A no gets "Why not, and what would you want instead?", recorded in the feedback log. Never guess past it.
3. **References are drilled, not accepted.** Liking a site is not liking everything on it. For every site they love, ask what exactly grabbed them, using the bucket list in `references/interview.md`. If the answer is vague, show what you found on that site and let them pick, and always invite them to add things you didn't list.
4. **Every question earns its place.** Each question in the bank has a written why. If the references already answer a question, don't ask it: show the inferred answer in the round checklist instead (rule 2 still applies to it).
5. **Same taste, different projects.** The skill holds the person's taste; each project gets its own DESIGN.md that expresses that taste in its own way and keeps updating as the project changes. Two projects from the same person feel related, never identical.

## Workflow

Post a short plan first (one line per step) with the time it takes: about 15 minutes in Quick mode, 20 to 25 in Deep.

1. **Setup.** Ask the mode only if they didn't say: **Quick** (default, 14 questions) or **Deep** (all 16). Detect the stack yourself if a project is open (package.json, Tailwind config, CSS files); never ask what you can look up. Scope is web UI by default; for mobile, Figma or email the questions stay the same and only the output wording changes. Done when you know the mode and the stack.
2. **Study the references before asking about them** (`references/reading-references.md`). When they share sites or screenshots (Q2), study each one before the drill-down (Q3) and write your findings per bucket into a scratch note. Done when every site has notes for each bucket you could see.
3. **Ask the questions** (`references/interview.md`, and `references/asking.md` for how). One round per message, formatted like `examples/round.md`; at most one follow-up per question; every recommendation names its reference or says "my default"; a round checklist closes each round. Done when every rule is *answered*, or confirmed through rule 2.
4. **Sample check** (`references/sample-check.md`). Fill the templates into a draft folder, build one sample from a one-liner for the screen they make most, show it in light and dark, desktop and phone, ask "What's off?", fix, at most two passes. Done when they say the skill landed, or a no has its why logged and one more pass is made.
5. **Write the skill** (`references/writing-the-skill.md`). Apply the sample changes to the draft and turn answers into values. Done when every file in the folder list is filled.
6. **Verify and hand over** (`references/verify.md`). Run `node <this skill's folder>/scripts/check-skill.mjs <their skill folder>`, answer the audit, install or zip, and hand over in three lines. Done when the check prints `0 problems` and every audit line is yes.

## Updating a skill made earlier

If the person asks to update, retune or redo their skill, read its taste.md and feedback-log.md first. Ask only the questions whose answers they want to change, plus any question the feedback log shows went wrong. The same rules apply, and step 6 runs again.

## Faults that come back

| Symptom | Cause | Fix, and where the rule lives |
| --- | --- | --- |
| The skill produces generic UI | Rules inferred, not confirmed, or vague ("clean, modern") | Every rule buildable: a font class, a colour posture, a duration band. Re-ask the vague ones (`references/writing-the-skill.md`, How every rule is written) |
| A rule applied where it doesn't fit | Written without its why | The person's reason or the reference next to the rule (`examples/taste.md`) |
| The person feels interrogated | Too many follow-ups | One follow-up at most, only when vague (`references/asking.md`) |
| Every project looks the same | Taste treated as a design system | DESIGN.md per project picks the expression (`references/writing-the-skill.md`, project identity rule) |
| Rules contradict | Two answers conflict | Ask which wins and where, write a scoped rule (`references/interview.md`, Conflicts) |
| The skill copies a reference site | References used as templates | Take the quality named (tracking, easing, depth), never the layout or brand (`references/reading-references.md`) |
| A reflex "yes to all" | No alternative shown | Name the closest alternative beside every inferred item (`references/interview.md`, Round checklist) |

## Examples

| Need | Example | What to learn |
| --- | --- | --- |
| A round message | `examples/round.md` | Question, recommendation with its reference, one follow-up, the round checklist with alternatives |
| What you write | `examples/taste.md` | Values an agent can build from, each with its why and source tag |

Faults and their fixes, side by side: `teaching/pairs.md`.

## References

| File | Read when |
| --- | --- |
| `references/reading-references.md` | Step 2: what to study on each site |
| `references/interview.md` | Step 3: the 16 questions with their whys, the bucket list, vague answers, the round checklist, conflicts |
| `references/asking.md` | Step 3: how to ask, follow up and offer choices so answers are real |
| `references/sample-check.md` | Step 4 |
| `references/writing-the-skill.md` | Steps 4 and 5: name, place, draft, folder, answers into values, project identity, feedback log |
| `references/floor.md` | Step 5 (copied unchanged), and when an answer would break a quality rule |
| `references/verify.md` | Step 6: the gate, the audit, "you see, you do", the handover |
| `references/sources.md` | When a method or rule is questioned |
| `templates/` | Steps 4 and 5: the files their skill is built from |
| `scripts/check-skill.mjs` | Step 6 (run it) |
