# Floor

These rules hold for every build, whatever the taste. They are where respected design and motion guidance agrees. The person's taste never relaxes them; if the person explicitly insists on breaking one, do it only where they said, and say once what it costs (for example, lower contrast fails some readers).

## Accessibility

- Text contrast at least 4.5:1 for body, 3:1 for large text, in both themes.
- Every interactive element has hover, active, focus-visible and disabled states. Focus rings are visible and appear instantly.
- Touch targets at least 44px on touch screens; hit areas never overlap.
- Semantic HTML first: real buttons, links, labels, headings in order. Images have alt text; decorative ones have empty alt.
- Motion is never the only cue for a state change, and colour is never the only cue for meaning.

## Both themes, every size

- Light and dark both work and both are checked. Colours come from tokens, never hard-coded per component.
- Layouts work at 375, 768 and 1280 px wide with no horizontal scroll. Containers are fluid; nothing fixed in px wider than the screen.
- Body text at least 16px, line length about 65 to 75 characters.

## Motion

- Respect prefers-reduced-motion: movement becomes a fade or nothing; feedback (colour, opacity) stays.
- Animate transform and opacity (plus filter or clip-path when smooth). Never width, height, top or left. Never `transition: all`.
- Everything is interruptible: a new interaction starts from where things are on screen now, never waits for an animation to finish, never blocks input.
- No ease-in on things entering or responding. Linear only for progress and loaders.
- Nothing scales up from 0; start from about 0.95 with opacity.
- Popovers and menus grow from the element that opened them. Things leave the way they came.
- Frequent actions (typing, shortcuts, things done many times a day) get little or no animation. Press feedback appears within about 100ms.
- Staggers stay short (whole sequence under about half a second) and never block clicking.
- Loops pause when off screen or when the tab is hidden.
- Hover effects only on devices that can hover (`@media (hover: hover)`).

## Craft

- Spacing follows one scale. More space above a heading than below it. Nested corners are concentric (outer radius = inner radius + padding).
- Numbers that change use tabular figures. Headings use balanced wrapping.
- Icons come from one real icon set or drawn SVG, one stroke weight, matched to the text weight. Never emoji or unicode as icons.
- Every list, table or feed has an empty state, a loading state shaped like the real content, and an error state that says what happened and how to recover.
- Images and media never shift the layout while loading.

## Never, whatever the taste

These are the patterns that make UI look AI-generated. The person's own never list adds to this one.

- A small label or "eyebrow" above every heading.
- The template page: hero, three equal icon cards, call to action, footer.
- Cards inside cards.
- Invented numbers, testimonials, customer logos or reviews. Use clearly marked placeholders.
- Gradient text, and the default purple-to-blue gradient.
- Glow blobs and orbs as decoration.
- Buzzword copy: seamless, robust, empower, elevate, unlock, revolutionary, next-generation.
- Framework default colours used as the brand (the stock indigo or slate).
- A fake browser or phone frame around a fake dashboard.
