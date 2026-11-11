# Writing the skill

## Name and place

- Skill name: what they chose, else `{first-name}-ui`, lowercase with hyphens (`maya-ui`). At most 64 characters, letters, digits and hyphens only.
- Where to write it:
  - **Claude Code:** `~/.claude/skills/{name}/` (works in every project). If that isn't writable, write it to `./{name}/` and tell them to move it there.
  - **claude.ai or the desktop app:** build the folder in your working space, zip it (the zip contains the `{name}/` folder), and tell them to upload the zip in Claude's Skills settings.
- Never overwrite an existing skill folder without asking. If one exists, this is an update (SKILL.md, "Updating a skill made earlier").

## Draft

Before the sample check, fill the templates into a draft folder: `./ui-tongue-draft/{name}/`. The sample is built from this draft and its fixes go back into it. Step 5 validates the draft and installs it.

## Folder

```
{name}/
  SKILL.md                 from templates/SKILL.template.md
  references/
    taste.md               from templates/taste.md
    DESIGN.md              from templates/DESIGN.md (the starting point for each project's own DESIGN.md)
    tokens.css             from templates/tokens.css
    motion.md              from templates/motion.md
    references.md          from templates/references.md
    never.md               from templates/never.md
    floor.md               copy of this skill's references/floor.md, unchanged
    feedback-log.md        from templates/feedback-log.md, with every "why not" from the interview
```

Fill every `{{placeholder}}`. Delete template lines that don't apply rather than leaving them empty. `[[placeholder]]` slots are different: they belong to a future project and stay as they are in references/DESIGN.md; the generated skill fills them when it starts a project.

`{{vague-request-behaviour}}` in SKILL.template.md comes from Q16: either "Ask {{Person}} one question first, then write the brief." or "Decide, show the brief, then build. {{Person}} will redirect if needed." Write rules in plain, specific words; each line must be buildable ("Headlines: tight grotesk, -0.03em, sentence case"), never a mood alone ("clean and modern").

How every rule is written:

- **Strict.** A value, a name, or always / never. Never "reasonably", "where appropriate", "try to", "tasteful", "nice". Why: soft words give the agent nothing to act on, so it falls back on its own generic defaults.
- **With its why.** Every rule in taste.md carries the person's reason, or the reference it came from ("like Linear's headlines"). Why: a rule with its reason stretches to cases the file never names; a bare rule gets applied in places it doesn't fit.
- **Only what changes the output.** Never explain what a coding agent already knows (what a hero or a shadow is). Why: every extra line thins the attention the person's real rules get.

## Translating answers into values

Use these as starting points, then adjust to what you saw in their references.

**Motion feel (Q12)**

| Feel | CSS easing (goes in tokens.css) | Small (press, hover) | Medium (menus, cards) | Large (modals, hero) | Overshoot |
| --- | --- | --- | --- | --- | --- |
| Snappy | cubic-bezier(0.23, 1, 0.32, 1) | 120ms | 200ms | 300ms | none |
| Smooth and elegant | cubic-bezier(0.4, 0, 0.2, 1) | 180ms | 350ms | 600ms | none |
| Bouncy | cubic-bezier(0.34, 1.56, 0.64, 1) | 150ms | 250ms | 400ms | 10 to 20% |
| Heavy and physical | cubic-bezier(0.33, 1, 0.68, 1) | 160ms | 320ms | 500ms | under 3% |

The CSS column is always what goes in tokens.css. If the project uses a motion library, motion.md may add a spring as well (Bouncy: bounce 0.3; Heavy: bounce 0 to 0.1), but never write "spring" into CSS.

Exits take about 70% of the entrance time. On phones, about 80% of desktop durations.

**Motion amount (Q11):** none = state feedback only. Subtle = feedback plus small hovers, no entrances. Polished = one authored entrance per page plus hovers. Cinematic = staged hero choreography and scroll moments, still calm everywhere else.

**Density (Q9):** airy = spacing scale 8, 16, 24, 40, 64, 96, 144 and about 40 to 80 words per screen. Rich = 4, 8, 12, 16, 24, 40, 64 and longer copy.

**Edges and depth (Q8):** hairline = 1px borders at 8 to 12% contrast, no shadows. Soft shadows = one or two layered shadows with offset and blur, borders only for inputs. Glass = backdrop blur on floating surfaces only (nav, menus, sheets), never on content cards. Flat = tonal steps between surfaces, no borders or shadows.

**Dark mode (Q7):** near-black = background around #0a0a0b. Soft grey = around #1a1a1d. Tinted = the brand hue at 6 to 10% chroma, very dark.

**Brand colour (Q5):** taste.md stores the person's own brand colour and their colour posture. Each project's DESIGN.md sets its own brand colour: their own colour for their own products, the client's for client work. The posture travels; the hex doesn't have to.

**Colour posture (Q5):** main action only = brand under 5% of the screen. Accents = brand on links, highlights and one element per section. Carrying sections = whole bands in the brand colour, with text colours tested on them.

## The project identity rule

The taste file is the constant. Each project's DESIGN.md is one expression of it. The generated SKILL.md tells the skill, on a new project, to choose and write down:

- how the accent is used in this project (within the colour posture),
- the hero type for this project (from the layouts their references favour),
- one signature detail or motion for this project,
- any project-specific tokens (a second accent, a display size).

These choices come from the "Hero types and signatures I'd accept" list in taste.md, which you build from the person's Q3 picks. The generated skill shows the identity and asks for a yes before writing it.

So two projects share type, feel, depth and voice, but each has its own signature. The DESIGN.md then keeps a dated decisions log as the project changes.

## Feedback log

Every "no" and "why not" from the interview goes in feedback-log.md, with the date and question. Later tuning ("I don't like that") is logged there too. When the person updates their skill, read this first: it shows where the interview read them wrong.

## Validate before handing over

- Frontmatter has only `name` and `description` (plus optional `license`). Keep the description wrapped in double quotes, with no double quotes inside it (the name or a colon can break the YAML otherwise). Name matches the folder. Description under 1024 characters, no angle brackets, and says plainly that it is for any UI work for this person, including one-liners.
- SKILL.md under 200 lines. No `{{` placeholder left anywhere. `[[` slots remain only in references/DESIGN.md.
- tokens.css is valid CSS: easing is a cubic-bezier, durations in ms, no words like "spring".
- No two rules contradict each other.
- Every rule in taste.md traces to an answer, a pick, or a confirmed inference, and has its why filled in.
- No soft words left in any rule (search for: reasonably, appropriate, try to, tasteful, nice, clean, modern).

Then tell them in three lines: where it is installed (or the zip), how to use it ("just ask for UI as usual"), and how to tune it ("say 'update my taste' or just tell it what you don't like").
