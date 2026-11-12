/* ---------- Password-Strength ----------
 * Install: adds the exact component; asks only where it goes.
 * Blend: asks four short questions, then fits it through the component's own props. */

const PASSWORD_STRENGTH_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccable-rust.vercel.app/r/password-strength.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the eye icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`password-strength.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/password-strength.tsx\`
- Keep these exports and their names: \`PasswordStrength\`, \`PasswordStrengthProps\`, \`PasswordLevel\`, \`checkPassword\`, \`passwordLevel\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless.
- Keep the checks (\`checkPassword\`, \`passwordLevel\`), the CSS block and the tuning values at the top (\`EASE\`, \`BAR_MS\`, \`BAR_STAGGER\`) exactly as written. They are the design.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the bars, eye and boxes only fade; the eye keeps focus and the cursor in the field; screen readers hear the level and which checkpoints are done.`;

const PASSWORD_STRENGTH_HOW = `## How it works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Field.** "Password" above a 52px rounded field with a hairline border. While hidden, the dots are soft gray and slightly spaced. The eye on the right is closed with lashes (hidden) or open (shown).
2. **Eye.** Clicking it swaps the icons: the one leaving squashes flat and blurs out, the one coming in opens up from a thin line, in about a quarter second. Focus, the cursor position and the phone keyboard stay in the field.
3. **Checkpoints.** Three lines under the meter: at least 12 characters; at least 2 upper and 2 lower case letters; at least one number and one special character. When one is met its box fills, pops from 82% to full size with a tiny overshoot and the check mark draws itself.
4. **Levels.** Empty: no bars, no name. 0 checkpoints: no bars, "No". 1: one red bar, "AI". 2: two amber bars, "AI agent". 3: three green bars, "Human". Bars fill left to right and empty right to left, 45ms apart, each in 380ms with a fast start and soft landing. The name slides up 4px out of a light blur.
5. **Human.** When the password turns Human, a soft white shine runs once across the three bars.

Borders, tracks and gray text are mixed from the text color around the field, so it follows light and dark mode on its own.`;

export function installPrompt(tsSource: string) {
  return `# Password-Strength

A 1-file React component from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A password field with a show/hide eye that rates the password as No, AI, AI agent or Human, from three checkpoints.

## Before you build: one question

Look through this project first: its sign-up, reset-password and account settings screens, and the password fields it already has. Then ask me this in one message and wait for my answer:

- **Where should it go?** Suggest the 1–3 password fields that fit best (for example the sign-up form or the change-password screen). I can pick one of them or name another.
  *Why: it replaces one password input, so it must sit where people make a new password, not where they log in.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The look and the motion are the design. Keep the field, the eye swap, the three-bar meter with AI / AI agent / Human, the three checkpoints and their animations exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the component file and the one place I picked. If it replaces an existing password input, keep that input's \`name\`, form wiring and validation. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: the prefilled example password and the "Are you human?" screen title.

${PASSWORD_STRENGTH_SHARED_BUILD}

## Use it

\`\`\`tsx
"use client";
import { PasswordStrength } from "@/components/ui/password-strength";

export function SignUpPassword() {
  return <PasswordStrength name="password" />;
}
\`\`\`

- If the form already holds the password in state, pass \`value\` and \`onChange\`.
- Wire \`onLevelChange\` only if the form already blocks weak passwords, to keep that rule working.
- It takes its text color from its parent, so place it where my normal text color applies. It is full width up to 480px and needs about 230px of height.

${PASSWORD_STRENGTH_HOW}

## Check

- It type-checks and the page renders with no console errors.
- Typing fills the bars: "No" with no bars (0 checkpoints), one red "AI" (1), two amber "AI agent" (2), three green "Human" (3) with one shine across the bars. Each checkpoint box ticks the moment it is met. The eye shows and hides the password without losing the cursor position, and the form still submits the password as before.
- It looks right in light and dark mode (check both).
- It works with a finger on a phone: the eye keeps the keyboard open and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the bars, eye and boxes only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/password-strength.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Password-Strength, fitted to your brand

A 1-file React component from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A password field with a show/hide eye that rates the password as No, AI, AI agent or Human, from three checkpoints. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its sign-up and password screens, the password rules it already has, the way it writes short UI text, its theme colors and its light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Where should it go?** Suggest the 1–3 password fields that fit best (sign-up form, change-password screen, invite acceptance).
      *Why: it replaces one password input, so it belongs where people make a new password, not where they log in.*
   2. **The words?** Keep "No", "AI", "AI agent", "Human" (suggested), or level names in my product's voice. Same for the label above the field and the three checkpoint lines; the checks themselves stay.
      *Why: the level name is the one line people read, so it should sound like the rest of my product.*
   3. **The colors?** Keep red, amber, green (suggested if my theme has no status colors), or name which of my existing color variables you'd use for the three levels (for example my danger, warning and success colors).
      *Why: the bars are the only color in the field, so they decide whether it looks like part of my brand.*
   4. **What does each level allow?** Just show it (suggested), or keep the submit button disabled until Human.
      *Why: a meter alone guides people; blocking the button enforces it, which some products want and some don't.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the place, the words, the colors, the rule, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The place: where the component is rendered.
- The words: \`label\`, \`levels\` and \`rules\`.
- The colors: \`colors\`, as my theme's CSS variables.
- The submit rule: \`onLevelChange\`, wired to my submit button only if I asked for it.

All of these are props the component already has, so the component file itself stays as written.

**Locked**

- The look and the motion are the design. The field, the eye swap, the three-bar meter and the three checkpoints, with their checks, sizes and animations, stay exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the component and the place I picked (plus the submit button, only if I asked for the rule), no restyling, and none of the website's demo parts (the prefilled example password and the "Are you human?" screen title).

${PASSWORD_STRENGTH_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the component's own props:

\`\`\`tsx
"use client";
import { useState } from "react";
import { PasswordStrength, type PasswordLevel } from "@/components/ui/password-strength";

// From my brief. Leave out any prop that stays at its default.
export function SignUpPassword() {
  const [level, setLevel] = useState<PasswordLevel>(0);
  return (
    <>
      <PasswordStrength
        name="password"
        colors={["var(--danger)", "var(--warning)", "var(--success)"]} // my theme's variables, not hex
        onLevelChange={setLevel}
      />
      <button type="submit" disabled={level < 3}>Create account</button>
    </>
  );
}
\`\`\`

- Read colors from my theme's CSS variables or Tailwind tokens; never copy hex values.
- The field takes its text color from its parent, so place it where my normal text color applies. It is full width up to 480px; place it with \`className\` or \`style\`.

${PASSWORD_STRENGTH_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My words and colors show. Typing fills the bars level by level (no bars at 0 checkpoints, then 1, 2, 3), each checkpoint box ticks the moment it is met, and the last level gets one shine. The eye shows and hides the password without losing the cursor position, the form still submits the password as before, and my submit rule works if I asked for one.
- It looks right in light and dark mode (check both), with my colors readable in each.
- It works with a finger on a phone: the eye keeps the keyboard open and nothing scrolls sideways.
- With \`prefers-reduced-motion: reduce\`, the bars, eye and boxes only fade.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/password-strength.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
