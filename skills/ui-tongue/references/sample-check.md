# Sample check

The sample shows the person whether their answers became the taste they meant. People react to a picture far better than to a question, so this step catches what the interview missed.

## Build it

- One-liner for the screen they make most: "A hero section for {Q1}" for landing pages, "An overview screen for {Q1}" for dashboards or apps. Don't make it more detailed: the point is to test how the draft taste expands a short request.
- First write the brief the generated skill would write (4 to 6 lines, see templates/SKILL.template.md) and show it above the sample. The brief is part of what's being checked.
- One self-contained HTML file, `ui-tongue-sample.html`, in the current folder (or the scratch folder if there's no project). Inline CSS from the draft's tokens.css; load fonts from Google Fonts or Fontshare only; no other dependencies.
- Include: nav, headline, one line of supporting copy, primary and secondary button, one visual in their imagery style (a placeholder box is fine if they picked screenshots or photos), and their entrance and hover motion.
- A visible light/dark toggle, defaulting to the theme most of their references use. Both themes must pass the floor.
- Copy written in their chosen voice, about their kind of product. No lorem ipsum, no invented metrics.

## Show it

- Open it in a browser tool if you have one and take screenshots at 1280 and 375 wide, in both themes. Show those.
- If you can't open a browser, give the file path and ask them to open it.

## Ask

"What's off? Point at anything: type, colour, spacing, depth, motion, copy."

- Turn each comment into a change in the draft folder (taste.md, tokens.css, motion.md), not just a fix to this page. Say which rule changed ("Headlines now one step smaller, everywhere").
- Rebuild and show again. At most two passes.
- Then ask: "Did the skill land the way you want?" A no gets "Why not?", logged, and one more pass.
- Remind them this is practice: the skill keeps learning while they work.

Delete nothing they made. Leave the sample file in place; they may want it.
