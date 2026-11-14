# Buttons

The site's own buttons follow the Figma button system ("CTA" set, node `111:13314` in the Impeccable design file). Use `<Button>` from `components/site/button.tsx`. The styles live in `app/globals.css` (`--btn-*` tokens, `.btn` classes).

Library demos and TV channels never use it: their trigger is the secondary pill, and every library item keeps its own look.

## Use

```tsx
<Button href="/docs" size="lg" trailing={<Arrow />}>Browse components</Button>
<Button href={GITHUB} hierarchy="secondary" size="lg" leading={<GitHub />}>Star on GitHub</Button>
<Button hierarchy="tertiary" iconOnly aria-label="Close"><Cancel01Icon /></Button>
<Button loading>Save</Button> // shows "Impeccabling..."
```

`href` renders a Next `Link` (or an `<a>` for external links and downloads, opened in a new tab when external). No `href` renders a `<button type="button">`. For a non-button element that must look like one, use `buttonClass()` instead of writing the classes by hand.

## Look

A raised surface, like a pressed key: a top-to-bottom gradient from one shade to the next, a 1px edge one shade darker, a lit 1px line along the top inside, and a soft drop shadow tinted with brand 900.

## Tokens

Every value the button uses is a `--btn-*` token in `app/globals.css` (`:root` for light, `.dark` for dark). The `.btn` classes only read tokens, so a change happens in one place. Tokens are built from the base scales:

- Colour: `--brand-50` to `--brand-900` and `--gray-25` to `--gray-950` (the Figma neutral scale). `--shadow-ink` is what shadows are made of.
- Size and spacing: Tailwind's 4px step, `calc(var(--spacing) * n)`.
- Text: Tailwind's `--text-sm` / `--text-base` and their line heights, `--font-weight-medium`.
- Shape: `--radius-lg` (8px), `--radius-md` (links' focus ring), `--stroke-1`, `--stroke-2`.
- Motion: `--duration-fast` (150ms), `--ease-out`.

Never write a hex colour, px value or raw shadow in a button class; add or change a token.

## Hierarchy

| Hierarchy | Rest | Hover |
| --- | --- | --- |
| `primary` | Brand 500 to 600 gradient, brand 700 edge, brand 200 top line, white text, brand-tinted soft drop | Brand 600 to 700 (fades) |
| `secondary` | White to gray 50, gray 300 edge, gray 900 text, faint drop | Gray 50 to 100 |
| `tertiary` | No fill, gray 700 text | Gray 50 fill |
| `link` | Brand 500 text, no box | Underline |
| `link-gray` | Gray 900 text, no box | Underline |

Dark theme: primary keeps the same brand gradient; secondary goes panel-2 to panel with a 12% light edge; links use brand 300; shadows use the page frame colour.

## States

- **Focus** (keyboard only): 2px gap in the page colour, then a 2px brand 400 ring (brand 300 in dark). Links get a 2px outline 2px out, plus the underline.
- **Disabled**: flat, no gradient or shadow. Primary goes gray 100 with a gray 200 edge; secondary keeps white with that edge; text and icons gray 400.
- **Loading**: looks like rest, the spinner takes the leading icon's place, the label reads "Impeccabling...", the trailing icon hides, clicks are blocked, `aria-busy` is set.
- **Press**: scales to 0.97 (not links, not with reduced motion).

## Sizes

| Size | Height | Side padding | Text | Icon-only square |
| --- | --- | --- | --- | --- |
| `sm` | 36 | 12 | 14/20 medium | 32 |
| `md` (default) | 40 | 14 | 14/20 medium | 36 |
| `lg` | 44 | 16 | 16/24 medium | 36 |
| `xl` | 48 | 18 | 16/24 medium | 40 |

Icons are 16px at every size, 6px from the label. Links have no height or padding: 20px line at sm/md, 24px at lg/xl.

## Corners

8px (`--radius-lg`) with Figma's 60% corner smoothing. Where the browser supports `corner-shape` (Chrome, Edge), the radius becomes 8 x 1.6 and the corner a squircle, which matches Figma's smoothed curve. Safari and Firefox show a plain 8px round corner.
