---
name: ui-tongue
description: Interviews a person about their UI taste and writes them their own personal UI skill, so a one-liner like "make me a hero section" comes out in their taste instead of generic AI UI. Use when someone says ui-tongue or /ui-tongue, asks to make their UI skill, learn their design taste or build a skill from their taste, or wants their own design rules, style or second brain for UI. Also use to update or retune a skill it made earlier.
license: MIT
---

# UI-tongue

You are about to learn one person's UI taste and turn it into a skill they keep. That skill is read on every UI request they make from now on, so every line in it is something they said, picked or confirmed. Never write a guess as a rule.
Why: a guessed rule makes their work generic while looking personal, which is the worst thing this skill can produce.

The person may be a designer, a developer, or neither. Talk plainly. Never ask for hex codes, pixel values or easing curves. Ask about things they can see and feel, and translate their answers into values yourself.
Why: most people recognise taste far better than they can name its values, and a value they guess at becomes a wrong rule.

## The five rules

1. **Floor vs. taste.** Quality rules every good interface follows (accessibility, reduced motion, responsive, performance, no AI-slop patterns) are locked. They live in [references/floor.md](references/floor.md) and are never asked. Everything that is a matter of taste is asked, never decided for them.
2. **Nothing is accepted silently.** A skipped question, an empty reply, "ok", "next", "sure", or a bare "yes" to your recommendation is not an answer. People press through quizzes without reading. In the round checklist (once per round, not after every question), ask for each such item: "Do you want to add this to your skill?", show exactly what would be written, and name the closest alternative so a reflex "yes" still means a choice ("8px corners, or sharp 2px?"). If they say no, ask "Why not, and what would you want instead?" and record the reason in the feedback log. The reason tells you where you read them wrong; never guess past it.
3. **References are drilled, not accepted.** Liking a site is not liking everything on it. For every site they love, ask what exactly grabbed them, using the bucket list in [references/interview.md](references/interview.md). If the answer is vague, show what you found on that site and let them pick, and always invite them to add things you didn't list.
4. **Every question earns its place.** Each question in the bank has a written why. If the references already answer a question, don't ask it: show the inferred answer in the round checklist instead (rule 2 still applies to it).
5. **Same taste, different projects.** The skill holds the person's taste; each project gets its own DESIGN.md that expresses that taste in its own way and keeps updating as the project changes. Two projects from the same person feel related, never identical.

## Workflow

Post a short plan first (one line per step) with the time it takes: about 15 minutes in Quick mode, 20 to 25 in Deep.

### 1. Setup

- Ask the mode only if they didn't say: **Quick** (default, 14 questions) or **Deep** (all 16).
- Detect the stack yourself if a project is open (package.json, tailwind config, CSS files). Never ask what you can look up.
- Scope is web UI by default. If they want more (mobile, Figma, email), follow the conversation; the questions stay the same, only the output wording changes.

### 2. Study the references before asking about them

When they share sites or screenshots (question 2), study each one before the drill-down (question 3), following [references/reading-references.md](references/reading-references.md). Write your findings per bucket into a scratch note. Every recommendation you make later comes from these findings, and so do the candidates you offer when an answer is vague.

### 3. Ask the questions

Run the rounds in [references/interview.md](references/interview.md). Format every question like this:

```
**Q5. Brand colour.** What's your brand colour, and where should it show: only on the main action, as accents in each section, or carrying whole sections?
Recommended: only on the main action. Linear and Vercel, the two sites you picked for colour, keep theirs to one button per screen.
```

- One round per message. Wait for the answers before the next round. Round 1 is split in two: Q1, Q2 and Q4 first, then Q3 after you've studied the sites.
- At most one follow-up per question (in Q3, at most one per site).
  Why: stacked follow-ups make people feel interrogated, and they start answering on reflex.
- Every recommendation names the reference it came from. If no reference supports one, say "my default" so they know it's a guess.
- At the end of each round, show the **round checklist**: every rule you are about to write from that round, numbered, each marked *answered*, *inferred* or *accepted without comment*. Apply rule 2 to every item that isn't *answered*.

Done when every rule for the skill is *answered*, or confirmed through rule 2.

### 4. Sample check

Fill the templates into a draft folder first (writing-the-skill.md, Draft). Then build one sample from a one-liner for the screen they make most (a hero for landing pages, an overview screen for dashboards) using that draft, following [references/sample-check.md](references/sample-check.md). Show it in light and dark, desktop and phone. Ask "What's off?" Fix and show again, at most two passes. Then ask: "Did the skill land the way you want?" A no gets "Why not?" and one more pass.

Tell them this sample is practice, not a final exam: they can keep tuning the skill while they work on real projects.

### 5. Write the skill

Follow [references/writing-the-skill.md](references/writing-the-skill.md): apply the sample-check changes to the draft, validate it, then install it or hand over the zip.

## Updating a skill made earlier

If the person asks to update, retune or redo their skill, read its taste.md and feedback-log.md first. Ask only the questions whose answers they want to change, plus any question the feedback log shows went wrong. The same rules apply.

## What goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| The generated skill produces generic UI | Rules were inferred, not confirmed, or are vague ("clean, modern") | Every rule is specific enough to build from: a font class, a colour posture, a duration band. Re-ask the vague ones. |
| A rule gets applied where it doesn't fit | The rule was written without its why | Write the person's reason, or the reference it came from, next to the rule. |
| The person feels interrogated | Too many follow-ups per question | One follow-up at most per question, and only when the answer is vague. |
| Every project looks the same | The taste file was treated as a design system | Taste is the constant; DESIGN.md per project picks the expression (see writing-the-skill.md). |
| Rules contradict each other | Two answers conflict (e.g. "cinematic motion" and "nothing moves") | Ask which one wins, in which context, before writing. |
| The skill copies a reference site | References were used as templates | Take the quality the person named (tracking, easing, depth), never the layout or brand. |
