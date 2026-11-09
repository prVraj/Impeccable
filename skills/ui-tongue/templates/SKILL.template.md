---
name: {{skill-name}}
description: "{{Person}}'s personal UI taste, made with UI-tongue. Use for ANY UI or frontend work for {{Person}}, even a one-line request: pages, sections, heroes, landing pages, dashboards, components, forms, styling, colours, fonts, animations or redesigns. It expands short requests into a brief in their taste, builds, checks quality, and keeps each project's DESIGN.md up to date. Also use when they say 'update my taste' or react to a design ('I don't like that', 'more like this')."
---

# {{Person}}'s UI

This skill is {{Person}}'s taste. Every rule in it came from their own answers, so follow it over your habits. Read [references/taste.md](references/taste.md) before any UI work.

Priority when things conflict: what {{Person}} says in the conversation, then the project's DESIGN.md, then taste.md. [references/floor.md](references/floor.md) always holds; break a floor rule only if {{Person}} explicitly insists, and say once what it costs.

## On every UI request

### 1. Find this project's DESIGN.md

Look for DESIGN.md at the project root.

- **It exists:** follow it. It is this project's version of the taste.
- **It doesn't (new project):** create it from [references/DESIGN.md](references/DESIGN.md) and fill its `[[ ]]` slots. Give the project its own identity within the taste: the brand colour (theirs by default, the client's for client work), how the accent is used here, a hero type and a signature from the accepted lists in taste.md, and any project-only tokens. Show {{Person}} the identity in two lines and ask for a yes before writing it. Never overwrite an existing DESIGN.md.

### 2. Expand the request into a brief

Turn the request, however short, into a brief of 4 to 6 lines, and show it before building:

- Layout: structure and hero type
- Type: fonts, sizes, case
- Colour and depth: which surfaces, where the accent goes, borders or shadows
- Motion: entrance, hover, anything on scroll (from [references/motion.md](references/motion.md))
- Signature: the one detail that makes it this project's
- Left out: what you deliberately won't add (from [references/never.md](references/never.md))

When the request is vague: {{vague-request-behaviour}}

### 3. Build

Use the tokens in the project's DESIGN.md (start from [references/tokens.css](references/tokens.css) if the project has none). Use the project's stack. Take qualities from [references/references.md](references/references.md), never layouts or branding.

### 4. Check before showing

- Every item in floor.md and never.md.
- Both themes, at 375, 768 and 1280 wide.
- Motion matches motion.md, with reduced motion handled.
- It reads as {{Person}}'s taste and as this project, not as a generic template.

### 5. Keep DESIGN.md current

When something is added, removed or changed (a new colour, a component, a decision undone), update the matching section of DESIGN.md and add a dated line to its Decisions log. Keep it short.

## Learning

When {{Person}} reacts to a design ("I don't like that", "more like this", "too much", "update my taste"):

1. Ask once: "For every project, or just this one?"
2. Propose the exact one-line change: to taste.md for every project, to DESIGN.md for this one.
3. Write it only after a yes. If they say no, ask why and add the reason to [references/feedback-log.md](references/feedback-log.md).

Never change taste.md silently, and never turn a one-off request into a lasting rule without asking.

After a change to taste.md, if the open project has a DESIGN.md, offer to apply the same change there too. Existing projects keep their own identity unless {{Person}} says yes.
