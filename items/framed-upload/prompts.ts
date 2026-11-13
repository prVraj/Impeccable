/* ---------- Framed-Upload ----------
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const FRAMED_UPLOAD_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/framed-upload.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the icons are inline SVG and every animation is CSS or the browser's own \`element.animate\`.
- JavaScript project? Name the file \`framed-upload.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/framed-upload.tsx\`
- Keep these exports and their names: \`FramedUpload\`, \`FramedUploadProps\`, \`FramedUploadLabels\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the CSS block, the \`SHADOW\` and \`WOOD\` values and the tuning values at the top (\`EASE\`, \`SETTLE_MS\`, \`HANG_MS\`, \`LIFT_PX\`, \`NOTE_MS\`, \`MOULDING\`, \`MAT\`, \`RESHAPE_MS\`, \`MIN_RATIO\`, \`MAX_RATIO\`) exactly as written. They are the design.
- Keep the corner rule: every inner corner is the corner outside it minus the padding between them (mat = frame radius - moulding; picture = mat radius - lip - mat), never below 0. Don't set inner radii by hand.
- Keep \`DEFAULT_RADIUS\` and \`DEFAULT_STROKE\` as token references (\`var(--radius-lg, 0.5rem)\` and \`var(--stroke-2, 2px)\`). Never swap them for fixed pixel values: the frame must follow the design tokens.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the image only fades in and the frame doesn't lift or swing; the empty frame is a real button (Tab, Enter, Space); Replace and Remove show on hover, on keyboard focus, and always on touch screens; the picked file stays in the browser (an object URL, freed when replaced or removed).`;

const FRAMED_UPLOAD_HOW = `## How the frame works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Frame.** Three layers, like a real picture frame: a moulding (5.5% of the width, white on a light page, graphite on a dark one, with a light top edge and a darker bottom edge so it looks bevelled), then a thin lip and a slim mat (4% of the width, a shade off the moulding, shaded along its top where the moulding overhangs it), then the picture window. Empty, the window is portrait (4 / 5). With a picture, it takes the picture's own shape (width / height, kept between 1:3 and 3:1), so a wide photo gets a wide frame and nothing is cropped; the frame eases into the new shape in 420ms. The frame's corners come from the \`--radius-lg\` token and the lip from \`--stroke-2\`; 8px and 2px are only fallbacks for a project without them. Inner corners follow one rule: inner radius = outer radius - the padding between them, never below 0, so at normal sizes the mat and picture corners are square, like a real frame.
2. **Shadow.** Four layered shadows: a tight contact shadow at the edge plus a wide, soft one that falls downward, like a frame hanging on a wall. In dark mode the same shadows are deeper so they still read on a dark page. The picture window has its own inner shadow, darkest along the top, so the picture sits recessed behind the mat.
3. **Empty.** A faint tint, an upload icon, "Drop an image here" and a small line with the size limit. The whole frame is one button that opens the file picker.
4. **Drag over.** The frame lifts 3px, its shadow grows, the icon rises and the text says "Let go to frame it".
5. **Landing.** The picture comes in from a 6% zoom and a light blur to sharp in 560ms, and the frame gives one small swing (a few pixels and half a degree) in 620ms, like it was just hung.
6. **Filled.** Replace and Remove sit in a dark glass pill in the bottom right corner. A wrong file type or a file over the limit shows a short note at the bottom of the frame for 3 seconds and changes nothing else.

Light or dark is read from the text color around the frame, so it switches with the theme with no setup.`;

export function installPrompt(tsSource: string) {
  return `# Framed-Upload

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall.

## Before you build: one question

Look through this project first: its forms and settings screens that take an image (cover, avatar, product photo, portfolio), and any file inputs it already has. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 image fields that fit best (for example a cover image on a profile form, or a project photo in a portfolio editor). I can pick one of them or name another.
  *Why: it replaces one image field, and the frame reads best where a picture is the main thing, not a tiny icon.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The frame is the design: a bevelled moulding, a mat with a thin lip, a recessed picture window with an inner shadow, corners and lip from the design tokens, the layered wall shadow, and the way a picture settles into the frame with one small swing. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing file input, keep that input's \`name\` and form wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the sample violet poster and the second, empty frame next to it.

${FRAMED_UPLOAD_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { useState } from "react";
import { FramedUpload } from "@/components/ui/framed-upload";

export function CoverField() {
  const [cover, setCover] = useState<File | null>(null); // the picked file, or null
  return <FramedUpload name="cover" onChange={setCover} />;
}
\`\`\`

- If the form already uploads the file somewhere, keep that code and feed it from \`onChange\` (a \`File\`, or \`null\` after Remove), or let the form send it through \`name\`.
- If there is a current image (an existing cover), pass its URL as \`defaultSrc\`.
- It reads light or dark mode from its parent's text color, so place it where my normal text color applies. It is full width up to 320px; size it with \`className\` or \`style\`.

${FRAMED_UPLOAD_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Clicking the empty frame opens the file picker; dropping or picking an image fills the frame, the frame takes the picture's shape (a landscape photo gets a landscape frame, nothing cropped), the picture comes in from a light blur in about half a second and the frame swings once. Replace and Remove work. A file that isn't an image, or is over 10 MB, shows a note for 3 seconds and nothing else changes. The form still gets the file.
- It looks right in light and dark mode (check both): the frame is white with a light mat on a light page and graphite on a dark page, and the wall shadow and the window's inner shadow show on both.
- It works with a finger on a phone: tapping opens the photo picker and Replace and Remove are always visible.
- With \`prefers-reduced-motion: reduce\`, the picture only fades in and the frame doesn't lift or swing.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/framed-upload.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Framed-Upload, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: the forms and screens that take an image, the shape of the images it already shows (covers, avatars, product photos), the way it writes short UI text, and its design tokens: radius and border-width tokens, color variables, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 image fields that fit best (cover image, portfolio photo, product shot).
      *Why: it replaces one image field, and the frame reads best where a picture is the main thing.*
   2. **The frame shape?** Let the frame take each picture's own shape (suggested), or keep one fixed shape and crop to it (portrait 4 / 5, square 1 / 1 or landscape 3 / 2; suggest the one this field's images already use, for example square for avatars). Also the empty frame's shape.
      *Why: fitting the picture crops nothing; a fixed shape keeps a grid of frames even, which some layouts need.*
   3. **The frame look?** Keep \`--radius-lg\` and \`--stroke-2\` with a white frame and mat (graphite in dark mode) (suggested if my project has those tokens or none), or name which of my existing radius, border-width and color tokens you'd use for the corners, the lip, the frame and the mat. Also: with the mat (suggested) or without it.
      *Why: the frame is the whole look, so its corners, lip and colors should come from the same tokens as the rest of my product, never from fixed numbers.*
   4. **The words?** Keep "Drop an image here" and the size line (suggested), or text in my product's voice for the empty frame and the error notes. Also the size limit: keep 10 MB, or match my upload limit.
      *Why: the empty frame is the only text people read before they pick, so it should sound like my product.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the shape, the tokens, the words and limit, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered, and \`name\`, \`onChange\` and \`defaultSrc\` to wire it to my form.
- The shape: \`fitToImage\` and \`aspectRatio\`.
- The frame look: \`radius\`, \`stroke\`, \`frameColor\`, \`matColor\` as my design tokens, and \`mat\`.
- The words and limit: \`title\`, \`hint\`, \`labels\` and \`maxSize\`.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The frame is the design: a bevelled moulding, a mat with a thin lip, a recessed picture window with an inner shadow, the layered wall shadow, and a picture that settles in from a light blur while the frame swings once. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked, no restyling, and none of the website's demo parts (the sample violet poster and the second, empty frame next to it).

${FRAMED_UPLOAD_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { FramedUpload } from "@/components/ui/framed-upload";

// From my brief. Leave out any prop that stays at its default.
export function CoverField() {
  return (
    <FramedUpload
      name="cover"
      fitToImage={false} // a fixed shape, from my brief
      aspectRatio="1 / 1"
      radius="var(--radius-md)" // my tokens, not pixel values
      stroke="var(--border-width-2)"
      frameColor="var(--card)"
      matColor="var(--muted)"
      title="Add a cover"
      maxSize={5 * 1024 * 1024}
    />
  );
}
\`\`\`

- Read the corners, stroke and color from my design tokens (CSS variables, or the variables behind my Tailwind or shadcn theme). Never write a pixel value or hex code for them. If my project has no radius or stroke token, leave \`radius\` and \`stroke\` out: the defaults read \`--radius-lg\` and \`--stroke-2\` and only fall back to 8px and 2px.
- If a color variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Without \`frameColor\` and \`matColor\` the frame is white on a light page and graphite on a dark one, read from its parent's text color. It is full width up to 320px; size it with \`className\` or \`style\`.

${FRAMED_UPLOAD_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My shape, tokens and words show. Clicking the empty frame opens the file picker; dropping or picking an image fills the frame (taking the picture's shape, unless I chose a fixed one), the picture comes in from a light blur in about half a second and the frame swings once. Replace and Remove work. A wrong file, or one over my limit, shows my note for 3 seconds and nothing else changes. The form still gets the file.
- It looks right in light and dark mode (check both): my frame and mat colors, the wall shadow and the window's inner shadow read on both.
- It works with a finger on a phone: tapping opens the photo picker and Replace and Remove are always visible.
- With \`prefers-reduced-motion: reduce\`, the picture only fades in and the frame doesn't lift or swing.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/framed-upload.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
