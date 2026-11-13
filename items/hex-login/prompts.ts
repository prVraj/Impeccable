/* ---------- Hex-Login ----------
 * A section (a whole login page).
 * Install: adds the exact page; asks only which route and which logo.
 * Blend: asks four short questions, then fits it through the section's own props. */

const HEX_LOGIN_SHARED_BUILD = `## Fastest path

If this project has a \`components.json\` (shadcn), run \`npx shadcn@latest add https://impeccableui.vercel.app/r/hex-login.json\`.
If the command succeeds, only fix import paths to match this project and skip ahead. If it fails or there is no \`components.json\`, build it by hand as below.

## Build it

- Stack: React 18 or 19 with TypeScript. No other packages: the rings and icons are inline SVG and every animation is CSS.
- JavaScript project? Name the file \`hex-login.jsx\` and remove the type annotations; nothing else changes.
- Create this file, in this project's usual place for components:
  - \`components/ui/hex-login.tsx\`
- Keep these exports and their names: \`HexLogin\`, \`HexLoginProps\`, \`HexLoginLabels\`, \`isEmail\`.
- Keep \`"use client"\` at the top in Next.js App Router projects. In other setups it is harmless. A Next.js page that renders it can stay a server component; only the section itself is client code.
- Keep the CSS block and the tuning values at the top (\`EASE\`, \`TOAST_MS\`, \`RINGS\`, \`RING_BOX\`) exactly as written. They are the design: four rings of 64, 110, 165 and 232px turned -4, -8, -15 and -20 degrees, a 380px column, a 44px Google button, a 40px field and a 36px Continue button, with 40, 40, 32, 32, 16 and 20px between them.
- Keep the colors as theme variables: text and fills read \`--foreground\` and \`--background\` (or \`--fg\` and \`--bg\`), the error reads \`--destructive\`, and the field's corners read \`--radius-lg\`. Never swap them for fixed hex or pixel values.
- Keep the fallbacks: with \`prefers-reduced-motion: reduce\` the rings only fade in and nothing slides or turns; Enter in the field submits; an error moves focus back to the field and is read out; the field has a hidden label for screen readers and \`autocomplete="email"\`; the field text is 16px so phones don't zoom in.`;

const HEX_LOGIN_HOW = `## How the page works

Read this before you touch anything, so you know what the code does and why it must stay as it is.

1. **Layout.** One centred 380px column, centred top to bottom in a page at least as tall as the screen: logo, title, Google button, the OR line, the email field, Continue, then the small print. On a narrow screen the title drops from 30px to 24px and the rings shrink to 90%, measured on the section's own width (a container query), not the window.
2. **Rings.** Four thin hexagons around the logo, each a little bigger and turned a little further, like a slow spiral. They take 10% of the text color and fade out toward the bottom (a mask from 40% to 77% of their height), so they never cross the buttons. On load they turn into place from 14 degrees off, one after another, 70ms apart, in one second.
3. **Continue.** Nothing is sent until the email passes a simple check (something@something.something, no spaces, trimmed). Empty: "Enter your email address to continue." Not an email: "That doesn't look like an email. Try name@example.com." The message slides open under the field, the field turns red and gets focus, and the message goes as soon as you type. A good email calls \`onContinue(email)\`. If it returns a promise, Continue shows a spinner and ignores clicks until it settles.
4. **Sign in with Google.** Calls \`onGoogle\`, with the same spinner while its promise runs. With no \`onGoogle\` (login not connected yet), a small toast at the bottom of the page says "Google sign-in isn't connected yet. Use your email for now." for 3 seconds; clicking again starts the 3 seconds over. \`google={false}\` hides the button and the OR line.
5. **Theme.** Everything is drawn from the page's text and background colors, so it follows light and dark mode with no setup: Continue and the toast are the text color with background-colored text, the field is a 4.5% tint of the text color.`;

export function installPrompt(tsSource: string) {
  return `# Hex-Login

A 1-file React section from Impeccable. Add it to this project so it works and looks exactly like the source below, in the one place I choose, and change nothing else.

A calm login page: your logo inside four thin hexagon rings, a welcome line, Sign in with Google, an email field and a Continue button.

## Before you build: one question

Look through this project first: its routes (is there already a \`/login\` or \`/sign-in\` page?), its auth setup (Auth.js, Supabase, Clerk, Firebase or its own), and its logo files or logo component. Then ask me this in one message and wait for my answer:

- **Which page should it be, and which logo should it show?** Suggest the 1–3 best routes (for example replace the current \`/login\` page, or add a new \`/login\`), and name the logo you found that you'd put in the middle.
  *Why: it is a whole page, so it replaces or adds one route, and the logo is the one thing in it that has to be mine.*

Ask nothing else. If I say *skip*, use the best suggestion.

## Keep it as it is

The page is the design: the four turning hexagon rings that fade out toward the bottom, the single 380px column with its exact sizes and spacing, the pill-shaped Google and Continue buttons, the email check with its message under the field, and the toast when Google isn't connected. Keep them exactly as in the source. If something doesn't fit my project, tell me instead of changing it.

- Add only the section file and the one page I picked. If it replaces an existing login page, keep that page's route and auth wiring. Don't add packages, change other files, or restyle anything.
- Don't add the demo parts from the Impeccable website: Continue opening the author's X profile, the preview frame and its size buttons.

${HEX_LOGIN_SHARED_BUILD}

## Use it

\`\`\`tsx
// app/login/page.tsx
"use client";
import { HexLogin } from "@/components/ui/hex-login";
import { Logo } from "@/components/logo"; // my logo

export default function LoginPage() {
  return (
    <HexLogin
      logo={<Logo className="h-20 w-auto" />}
      brand="Acme"
      termsHref="/terms"
      privacyHref="/privacy"
      onContinue={async (email) => {
        // my email sign-in, for example a magic link
      }}
    />
  );
}
\`\`\`

- If this project already signs people in by email, call that from \`onContinue\`; if it already has Google sign-in, call it from \`onGoogle\`. Return the promise so the button shows its spinner. If there is no auth yet, leave \`onGoogle\` out (the toast says it isn't connected) and tell me \`onContinue\` still needs wiring.
- The logo sits in an 80px-tall slot in the middle of the rings; size it to about 70 by 80px.
- It fills the screen (\`min-height: 100dvh\`) and paints its own background, so render it as the whole page, outside any header, footer or padded layout. If the route shares a layout with a header, tell me.
- Set \`brand\`, \`termsHref\` and \`privacyHref\` from what the project already has.

## Check

- It type-checks and the page renders with no console errors.
- The page shows my logo inside the rings and the rings turn into place on load in about a second. Continue with an empty field or a bad email shows the message under the field and focuses it; typing clears it. A real email calls my sign-in, with a spinner while it runs. Sign in with Google calls my Google sign-in, or shows the toast for 3 seconds if there is none.
- It looks right in light and dark mode (check both): dark text and a black Continue on a light page, light text and a white Continue on a dark page, rings faint on both.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, the field doesn't zoom in when tapped, the keyboard shows the @ key.
- With \`prefers-reduced-motion: reduce\`, the rings only fade in and nothing slides or turns.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, where it's placed, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/hex-login.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}

export function blendPrompt(tsSource: string) {
  return `# Hex-Login, fitted to your brand

A 1-file React section from Impeccable. Add it to this project and fit it to the brand like a missing puzzle piece: it should look like it was always part of the product. It goes in the one place I choose, and nothing else changes.

A calm login page: your logo inside four thin hexagon rings, a welcome line, Sign in with Google, an email field and a Continue button. The full source is at the end of this prompt.

## First: look, ask once, then build

1. Look through this project first: its routes (is there already a \`/login\` or \`/sign-in\` page?), its auth setup (Auth.js, Supabase, Clerk, Firebase or its own) and which sign-in methods it has, its logo files or logo component, its terms and privacy pages, the way it writes short UI text, and its theme: \`--foreground\`, \`--background\`, \`--destructive\` and \`--radius-lg\` or their equivalents, Tailwind or shadcn theme, light and dark mode.
2. Tell me in two or three lines what you found, then ask these questions in **one message**. Give each one options, mark your suggestion and keep its one-line why, so I know what each answer changes. Ask nothing else:
   1. **Which page should it be?** Suggest the 1–3 best routes (replace my current login page, or add a new \`/login\`).
      *Why: it is a whole page, so it takes over one route.*
   2. **Which logo?** Name the logo file or component you found and suggest it (suggested), or a simpler mark of it (an icon-only version) if my full logo is a wide wordmark.
      *Why: the logo is the centre of the rings, so it has to be mine, and a wide wordmark looks lost in a hexagon.*
   3. **How do people sign in?** Wire Continue to my email sign-in and Google to my Google sign-in (suggested when I have both), keep Google with the "not connected yet" toast until I add it, or hide Google.
      *Why: the buttons should do what my product really supports, and a Google button that does nothing loses trust.*
   4. **The words?** Keep "Welcome back, Buddy" and the default texts, or text in my product's voice for the title, the buttons and the error messages (suggest two titles). Also my product name in the small print.
      *Why: the title is the first thing people read on the page, so it should sound like my product, not like a template.*
   If I say *skip*, use your suggestions.
3. After I answer, show a brief of about 5 lines: the route, the logo, the sign-in wiring, the words, and "everything else is kept as designed". Ask whether to save the brief to \`impeccable.md\` in the project (add a section if the file exists) or keep it in this chat only. Default: chat only.
4. Build only after I say go.

## What you may change, and what you may not

**You may change** (only through my answers):

- The page: which route renders \`<HexLogin />\`.
- The logo: \`logo\`.
- The sign-in: \`onContinue\`, \`onGoogle\` and \`google\`.
- The words: \`title\`, \`brand\`, \`labels\`, plus \`termsHref\` and \`privacyHref\` from my real pages.

All of these are props the section already has, so the section file itself stays as written.

**Locked**

- The page is the design: the four turning hexagon rings that fade out toward the bottom, the single 380px column with its exact sizes and spacing, the pill-shaped Google and Continue buttons, the email check with its message under the field, and the toast when Google isn't connected. Keep them exactly as in the source. If something doesn't fit my product, tell me instead of changing it.

- No new packages, no changes to files other than the section and the page I picked, no restyling, and none of the website's demo parts (Continue opening the author's X profile, the preview frame and its size buttons).

${HEX_LOGIN_SHARED_BUILD}

## Fit it to the brand

Apply my answers through the section's own props:

\`\`\`tsx
// app/login/page.tsx
"use client";
import { HexLogin } from "@/components/ui/hex-login";
import { LogoMark } from "@/components/logo-mark"; // my logo, from my brief

// From my brief. Leave out any prop that stays at its default.
export default function LoginPage() {
  return (
    <HexLogin
      logo={<LogoMark className="h-20 w-auto" />}
      title="Good to see you again"
      brand="Acme"
      termsHref="/legal/terms"
      privacyHref="/legal/privacy"
      labels={{ continue: "Send me a link", badEmail: "Check that email for a typo." }}
      onContinue={(email) => signIn("email", { email })} // my email sign-in
      onGoogle={() => signIn("google")} // my Google sign-in
    />
  );
}
\`\`\`

- Colors are not props: the section reads my theme on its own (\`--foreground\` and \`--background\`, else \`--fg\` and \`--bg\`, \`--destructive\` for errors, \`--radius-lg\` for the field). If my theme uses other names, map them in my global CSS for this page only (for example \`.ihl { --foreground: var(--text-primary); --background: var(--surface); }\`), never with hex codes. If a variable holds bare channels (like \`222 47% 11%\`), wrap it as \`hsl(var(--name))\`.
- Return the promise from \`onContinue\` and \`onGoogle\` so the buttons show their spinner while sign-in runs.
- The logo sits in an 80px-tall slot; size it to about 70 by 80px.
- It fills the screen (\`min-height: 100dvh\`) and paints its own background, so render it as the whole page, outside any header, footer or padded layout.

${HEX_LOGIN_HOW}

## Check

- It type-checks and the page renders with no console errors.
- My logo, title, words and small print show. The rings turn into place on load in about a second. Continue with an empty field or a bad email shows my message under the field and focuses it; typing clears it. A real email runs my email sign-in with a spinner. Google runs my Google sign-in, shows the toast for 3 seconds, or is hidden, as I chose.
- It looks right in light and dark mode (check both): my theme's text and background colors, a solid Continue in the text color, faint rings on both.
- It works with a finger on a phone at 375px wide: nothing scrolls sideways, the field doesn't zoom in when tapped, the keyboard shows the @ key.
- With \`prefers-reduced-motion: reduce\`, the rings only fade in and nothing slides or turns.
- Nothing else on the site looks or behaves differently.
- Finish with a short report: the files you added or changed, what you set from my answers, and every place where you had to do something differently from the source, and why.

## Source

The reference implementation. Copy it as-is, then apply only the changes listed above.

### \`components/ui/hex-login.tsx\`

\`\`\`tsx
${tsSource.trimEnd()}
\`\`\`
`;
}
