---
name: impeccable-writing-skills
description: Writes, sharpens and audits skill files (SKILL.md) for Impeccable, both our own repo skills in .agents/skills and the skills we ship in skills/. Use when creating a skill, turning a brain dump or notes into a skill, improving or trimming a skill, or when a skill isn't changing what the agent does.
---

# Writing skills

A skill can't make the agent give the same answer every time, and it shouldn't: every project is different. It makes the agent walk the same *process* every time, so the reasoning is ours even when the output changes. Write for a reader who is fast and capable but new here: it already knows CSS, React and Next.js, and it knows nothing about our taste, our rules or why we have them.

Sources: Emil Kowalski, "Agents with taste" and his writing-skills lesson; Matt Pocock, "Building Great Agent Skills" and his writing-for-agents skill.

## Workflow: brain dump to skill

1. **Collect.** Take the brain dump as it is (notes, a pasted article, a chat, the person's corrections). Also read the code or files the skill governs, the project memory, CLAUDE.md, and every existing skill on the same topic. Done when you can list every decision the skill has to make.
   Why: rules written without the code drift from what the code does.
2. **Scope.** Write the skill's one job as one line starting with a verb ("Writes and audits the Install and Blend prompts"). If the dump holds two unrelated jobs, make two skills, or move the second job into the skill that already owns it. Done when the line names one job.
   Why: a focused skill gets picked for the right task and followed; a giant one spreads the agent's attention across rules that don't apply.
3. **Extract.** Go through the dump one sentence at a time and turn every line that changes what the agent does into a rule (see Rule shape). Drop everything else: general knowledge, background story, praise, and anything a file already says (package.json scripts, folder names, config values) unless finding it is hard. Done when every kept line is a rule with a why.
4. **Shape.** Pick a format for each part (see Formats). Steps go first, reference after.
5. **Describe.** Write the description and choose auto or by-name (see Description).
6. **Prune.** Run the no-op test on every sentence (see Prune). Done when deleting any line would change what the agent does.
7. **Audit.** Run the audit at the end of this file. Done when every box is yes.
8. **Test by running.** Run the skill on one real task, or read it as the agent would and carry out its first steps. For each line you doubt, compare the result with and without it. Where the agent did something the skill didn't intend, fix the line that let it. Done when you can say what you ran and what it changed.
9. **Wire it in** (see Where skills live), then hand over: in plain words, what the skill does, when it fires, its three most important rules, and what you cut.

## Rule shape

Every rule is a **strict instruction plus a one-line why**.

- **Strict:** a number, a name, a path, or always / never. Never write "reasonably", "tasteful", "where appropriate", "try to", "consider", "if possible", "when in doubt", "should", "nice", "clean", "modern" or "etc." in a rule.
  Why: soft words give the agent nothing to act on, so it falls back on its own defaults and the line does nothing.
- **Why:** what goes wrong without the rule, or what it gives the person, in one line. Rules that explain themselves (no secrets in git) need none.
  Why: a rule with its reason stretches to cases we never wrote down; a bare rule gets applied blindly, even where it doesn't fit.
- **Target first:** say what to do, then the ban if one is needed. "Use the project's theme variables (`var(--brand)`), never hex."
  Why: a ban on its own puts the banned thing in the agent's head and makes it more likely.
- **Heavy words for heavy rules:** "always", "never" and "exactly" are for rules that must hold every run. Use them on purpose, not on every line.
  Why: when everything is "never", nothing stands out.

| Weak | Strict |
| --- | --- |
| Keep animations reasonably short. | UI animations stay under 300ms. Exits run about 20% faster than entrances. |
| Ask a few questions. | Ask 2 to 5 questions in one message. Never more than 8. |
| Make sure it works in dark mode. | Open the page in light and dark at 1280px and 375px wide. |
| Use tasteful colours. | Use the project's theme variables, never hex. |

## Formats

| What the content is | Format |
| --- | --- |
| Ordered actions | Numbered steps, each ending in "Done when ..." |
| A choice that depends on the situation | Decision tree, or an "If ... then ..." table |
| Values to look up (durations, sizes, limits) | Table |
| Rules that hold everywhere | Short bullet list |
| What good and bad look like | One good and one bad example, one or two lines each |
| The final check | Checkbox audit, each line answerable yes or no |

"Done when" names a state the agent can check. "Every item in `COMPONENTS` appears in the README" beats "the README is updated".
Why: a vague finish line lets the agent stop early.

## Description

The description is the only part the agent sees before the skill loads, and it sits in every session. Its wording decides whether the skill fires.

- Sentence 1 says what the skill does, starting with a verb. Sentence 2 starts "Use when" and lists one trigger per situation, in the words the person types ("push", "ship", "blend prompt"). Under 400 characters, no angle brackets.
- **Auto** (the default): the agent loads the skill when the task matches. Use it for skills that guard a kind of work, like prompts, descriptions and pre-push.
- **By name only:** add `disable-model-invocation: true` to the frontmatter for a process the person starts on purpose (grill me, a brainstorm routine). The description becomes a one-line summary for people.
  Why: an auto skill costs attention in every session and can fire by surprise; a skill that only runs on request pays neither.

## Prune

Read every sentence and ask: does the agent do anything differently because of this line? If not, delete the whole sentence. Don't shorten it.

- **Delete:** definitions of things the agent knows (what a modal or HSTS is), pep talks, the description repeated in the body, hedges, and the same rule written twice.
- **Keep:** our taste, our numbers, our gotchas, the why behind each choice, and the person's standing rules with who decided and when ("(vrajsensei, 2026-11-11)").
- **One home per rule.** A rule lives in one skill. Other skills point to it by name ("see `pre-push-check`, step 6").
  Why: two copies drift apart, and the agent can't tell which one wins.
- **Under 200 lines.** Material only some runs need (a long value table, examples for one branch) goes in `references/<topic>.md`, with one line in SKILL.md saying when to read it.
  Why: everything in SKILL.md competes for attention on every run.
- A good edit usually makes the skill shorter.

## Voice

- Write to the agent: imperative, second person, short plain sentences ("Read the source first.").
- Anything the agent says or shows to the person (questions, handovers, reports) is plain words for a designer: no jargon they couldn't explain to a friend.
- Every question a skill tells the agent to ask carries a one-line why. Cut a question that can't justify itself (vrajsensei, 2026-11-09).

## Where skills live

| Kind | Folder | Wiring |
| --- | --- | --- |
| Repo skill (guides our own work) | `.agents/skills/<name>/SKILL.md` | One line in `CLAUDE.md`: "Before you <moment>, read and follow `.agents/skills/<name>/SKILL.md`." Never under `.claude/`: remote tools can't write there. |
| Shipped skill (people download it) | `skills/<name>/`: `SKILL.md`, `LICENSE`, `references/`, `templates/` | No Impeccable paths or our names inside. Rebuild `public/downloads/<name>.zip` from the folder. Its docs page has no Prompts section (vrajsensei, 2026-11-11); its description follows `impeccable-descriptions`. |

- Frontmatter: `name` (lowercase and hyphens, the folder's name, at most 64 characters) and `description` (under 1024 characters). Shipped skills add `license: MIT`.
- The `CLAUDE.md` line is a repo skill's trigger: our tools don't read `.agents/skills` on their own. Name the moment ("Before you write or change any prompt"), not the topic.
- **When you sharpen an existing skill, keep what it decides.** Never change a rule's meaning, a number or a standing user rule unless the person asked. If a rule looks wrong, ask about it instead.

## Audit

- [ ] The skill does one job, named in one line.
- [ ] The description starts with a verb, has "Use when" triggers in the person's words, and auto or by-name was chosen on purpose.
- [ ] Steps come first, and each ends in a checkable "Done when".
- [ ] Every rule that doesn't explain itself has a one-line why.
- [ ] No soft words in rules (search for: reasonably, appropriate, tasteful, try to, consider, should, if possible, when in doubt, nice, clean, modern, etc.).
- [ ] No line explains what the agent already knows.
- [ ] Every rule has one home; other skills point to it.
- [ ] SKILL.md is under 200 lines; material for one branch sits in `references/`.
- [ ] Standing user rules kept, with who decided and when.
- [ ] Repo skill: `CLAUDE.md` line added. Shipped skill: zip rebuilt.
- [ ] Tested on one real task or a dry run, and the result reported.
