# Typography

The site's own text (header, sidebar, docs pages, search, home, 404) is set from one small type scale. Library items keep their own type; this is only for the site around them.

Every string has one job, and the job decides its style. A style is the whole set: size, line height, letter spacing and (for headings) weight. Each one is a Tailwind token in `app/globals.css` (`@theme`), so `text-heading-24` gives you all of it at once.

## The tokens

| Token | Size / line height | Spacing | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-heading-48` | 48 / 56 | -0.05em | 600 | Home hero, desktop only |
| `text-heading-40` | 40 / 48 | -0.05em | 600 | Page titles on desktop; home hero on phones |
| `text-heading-32` | 32 / 40 | -0.04em | 600 | Page titles on phones |
| `text-heading-24` | 24 / 32 | -0.04em | 600 | Docs section titles (Prompts, Usage, Props) |
| `text-heading-20` | 20 / 26 | -0.02em | 600 | Sub-sections, dialog titles |
| `text-heading-16` | 16 / 24 | -0.02em | 600 | Card titles, small headings, the wordmark |
| `text-copy-18` | 18 / 28 | 0 | 400 | The lead under a page title, desktop |
| `text-copy-16` | 16 / 24 | 0 | 400 | Docs paragraphs. Add `max-w-prose` so lines stay under about 75 characters |
| `text-copy-14` | 14 / 20 | 0 | 400 | Card text, hints, table cells |
| `text-copy-13` | 13 / 18 | 0 | 400 | Short lines where room is tight (card blurbs) |
| `text-label-18` / `16` / `14` / `13` / `12` | one line | 0 | 400, 500 when it matters | Menus, sidebar, tabs, meta, buttons in the tab bar |
| `text-label-11` | 11 / 16 | +0.02em | 400 or 500 | The floor: New chips, counts, keycaps only |
| `text-code-13` / `text-code-12` | 13 / 20, 12 / 16 | 0 | 400 | Code blocks, install command, prop names |
| `text-code-inline` | 0.875em | 0 | 400 | Code inside a sentence: one step smaller than the words around it |

Rules that come with it:

- **No other sizes.** No 15px, 12.5px or 10px. A size one pixel off a step looks like a mistake, not a level.
- **Two text colours.** `--fg` for what people read and act on, `--muted` for what supports it. `--faint` is too light to read: use it only for icons and placeholders.
- **Hierarchy comes from size first, then weight, then colour.** Emphasis never changes the size.
- **Headings** get `text-balance`, **paragraphs** get `text-pretty`.
- **Numbers that sit in a column or change** (counts, timers) get `tabular-nums`.
- **Words:** sentence case for buttons and messages ("Go home", "Browse components"), curly quotes and apostrophes (’) in visible copy.
- **Inputs** are 16px or larger, so phones don't zoom in on focus.

Buttons have their own sizes in the button system (`docs/BUTTONS.md`); don't set type on a `<Button>` by hand.
