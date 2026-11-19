# Verify and hand over

Read this at step 6. Answer from the files in their skill folder as they are now.

## Gate

```bash
node <this skill's folder>/scripts/check-skill.mjs <their skill folder>
```

It checks the folder has every file, the frontmatter (only `name` and `description`, plus optional `license`; name matches the folder; description in double quotes, no quotes or angle brackets inside, under 1024 characters), SKILL.md under 200 lines, no `{{placeholder}}` left and `[[slots]]` only in references/DESIGN.md, tokens.css (easing is a cubic-bezier, durations in ms, no "spring"), soft words in rules, a why and a source tag (said, picked, confirmed) on every taste.md row, and floor.md copied unchanged.

Done when it prints `0 problems` and every `look:` line is fixed or explained.

## Audit

Answer yes or no from the files.

- [ ] Every rule in taste.md traces to an answer, a pick, or a confirmed inference, and its why is filled in.
- [ ] Every "no" from the interview is in feedback-log.md with its why.
- [ ] No two rules contradict; any conflict is written as a scoped rule ("cinematic in the hero only").
- [ ] Every rule is buildable: a font class, a value, a band, a posture, or always and never.
- [ ] Nothing copies a reference's layout or brand; each reference line names the quality taken.
- [ ] "Hero types and signatures I'd accept" holds at least two of each, from their Q3 picks.
- [ ] The description says it's for any UI work for this person, including one-liners.
- [ ] The sample check happened, and its changes are in the draft, not only in the sample page.

## You see, you do

| You see | You do |
| --- | --- |
| `soft word "clean"` in a rule | Replace it with what they picked when you drilled "clean": the values, not the mood |
| A row with source "inferred" | It was never confirmed. Ask it now, with its alternative, or delete the row |
| `tokens.css duration "0.2s"` | Write `200ms` |
| `name "Maya UI" ...` | `maya-ui`, and rename the folder to match |
| Two rules that fight | One question: which wins, and where |
| The person says "just make it, I trust you" | Write only what they confirmed; list the rest as "ask me later" in feedback-log.md, never as rules |

## Handover

Three lines:

```md
Your skill **<name>** is installed at `<path>` (or: here's the zip; upload it in Claude's Skills settings).
Use it by asking for UI as usual, even one line: "a pricing section for my app".
Tune it any time: say "update my taste", or just tell it what you don't like.
```
