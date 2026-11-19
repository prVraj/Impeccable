# UI tongue

A skill that interviews you about your UI taste, then writes you your own personal UI skill. After that, a one-liner like "make me a hero section" comes out in your taste instead of generic AI UI.

You share a few sites you love; it studies them, asks what exactly grabbed you, and turns your answers into rules with your reasons beside them. Nothing you skip or wave through becomes a rule without your yes. Before it writes the skill, it builds one sample in your taste and asks what's off.

## When it runs

When you say ui-tongue or /ui-tongue, ask to make your UI skill, or ask it to learn your design taste. Also to update or retune a skill it made earlier: "update my taste".

Quick mode asks 14 questions and takes about 15 minutes. Deep mode asks all 16.

## What is inside

```
ui-tongue/
  SKILL.md                     the one idea, the bar, the five rules, six steps, faults that come back
  references/
    reading-references.md      step 2: what to study on each site you share
    interview.md               step 3: the 16 questions with their whys, vague answers, the round checklist
    asking.md                  step 3: how to ask so answers are real (show then ask, one rung down, two alike one different)
    sample-check.md            step 4: the sample built from a one-liner
    writing-the-skill.md       steps 4 and 5: folder, answers into values, project identity, feedback log
    floor.md                   quality rules every build follows, copied into your skill
    verify.md                  step 6: the check, the audit, the handover
    sources.md                 the research behind the methods
  templates/                   the files your skill is built from
  examples/
    round.md                   the bar for one round of questions
    taste.md                   the bar for what gets written
  teaching/pairs.md            seven faults with their fixes
  scripts/check-skill.mjs      checks a generated skill before handover
  evals/evals.json             test scenarios for changes to this skill
  LICENSE                      MIT
```

## Check a generated skill yourself

```bash
node path/to/ui-tongue/scripts/check-skill.mjs path/to/your-name-ui
```

Needs Node 18 or newer. It reads the folder and changes nothing.

## How to change it

- A new question goes in `references/interview.md` with its why, and in the docs page's question list. Keep Quick mode near 15 minutes.
- A new value table (how an answer becomes CSS) goes in `references/writing-the-skill.md`; a new check for it goes in `scripts/check-skill.mjs`.
- After a change, run the scenarios in `evals/evals.json` and bump the version in `SKILL.md`.

## Changelog

- 2.0.0 (2026-11-19): restructured into the house layout. Kept all 16 questions, the five rules, the templates and the value tables. New in this version: `references/asking.md` (recognition over recall, one rung of laddering, the three-reference comparison, words to listen for), `scripts/check-skill.mjs` (the validation list as a script), `references/verify.md` with "you see, you do", examples of a round and a filled taste file, teaching pairs, sources and evals.
- 1.0.0 (2026-11-16): first version.
