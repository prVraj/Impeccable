# Reading references

Study every site or screenshot the person shares before you ask about it. Your notes become (a) the recommendation on each later question and (b) the candidate list when an answer is vague.

## How to look

Use the best tool you have, in this order:

1. **A browser tool** (built-in browser, Chrome, Playwright): open the page at desktop width, take a screenshot of the first screen and one further down, hover a button and a card, scroll once. This is the only way to see motion and hover.
2. **A web fetch**: read the HTML and CSS for font families, CSS variables, colours, radius, shadow and transition values. Fonts and tokens are often named outright (`--font-geist`, `--radius-md`).
3. **A screenshot from the person**: if you can't open the site, ask for one or two screenshots. Say plainly that you can't see motion from a screenshot, so motion questions will rely on their answers.

Never claim you saw something you didn't. If you couldn't open a site, say so and work from what they told you.

## What to note, per bucket

Keep notes short and concrete: things you could build from.

| Bucket | Note |
| --- | --- |
| Components | The two or three most distinctive ones and what makes them distinctive (e.g. "pill nav floating on blur", "pricing cards with one highlighted by border, not colour") |
| Sections and layout | Hero type (centred, split, product-first, bento, full-bleed), grid, alignment, how sections are separated |
| Animation | What moves on its own; how often; how big |
| Transitions | Hover, press, open and close, page changes; fast or slow |
| Gradients | None, shade-to-shade, glow behind hero, bold |
| Shadows and depth | Borders vs shadows vs blur; how strong |
| Gaps and padding | Airy or tight; section spacing; card padding |
| Typography | Font class (grotesk, geometric, serif, mono, rounded), headline size and tracking, case of labels |
| Colours | Neutral temperature, how much accent, dark mode style |
| Easing and feel | Snappy, elegant, bouncy, heavy |
| Icons | Outline or filled, thin or bold, which set if you can tell |
| Effects | Grain, blur, masks, glow, cursor effects |

Also note radius and texture: these two are never asked, only inferred, so your notes are their only source.

## Using the notes

- **Recommendations** cite the site: "Recommended: hairline borders. Linear and Raycast, the sites you picked for depth, both use them."
- **Patterns across sites** are the strongest signal. One site with a glow is a detail; three are a taste.
- **Disliked sites** sharpen the never list: name the specific thing ("the purple-to-blue hero gradient on X"), not the whole site.
- **Take qualities, never layouts or brands.** The skill should give the person Linear's restraint, not Linear's homepage.
