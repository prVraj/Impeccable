---
name: pre-push-check
description: Runs the check before anything from Impeccable goes to GitHub, then hands the person push commands. A security review (secrets, dependencies, risky code, security headers), README kept in step with the site, a build, and a look in light and dark on desktop and phone. Use when someone says push, commit, ship, deploy or "is this ready", and before you give push commands.
---

# Pre-push check

Impeccable is a static Next.js docs site: no server code, no logins, no database, no environment variables. So the real risks are small and specific: a secret file slipping into git, a package with a known hole, a page that runs untrusted HTML, a new outside resource the security headers block, and a README that no longer matches the site.

The person is a designer and pushes themselves. **Never run `git push`;** hand them the commands. Run every step, even when they asked about one thing. Fix what a small edit can fix, then report. Don't stop to ask what you can find out yourself.
Why: a step skipped "because they only asked about the README" ships the others broken.

## 1. See what is going out

```bash
git status --short
git diff --stat
```

- Every changed file belongs to the work being pushed. When other threads or people work in this folder, add only your own files by name. Never `git add -A`.
  Why: several threads share this folder, and their unfinished work isn't yours to ship.
- Leave out or remove leftovers: `*.tmp` files, scratch scripts, screenshots, copies like `page copy.tsx`, `.DS_Store`.
- `AGENTS.md` is written by `next dev`. Commit it with the work.

Done when you can name every file going out and which work it belongs to.

## 2. Secrets

`.gitignore` blocks `.env*`, `*.pem`, `*.key` and `*.tmp`; check it still does.

```bash
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$|id_rsa|secret|credential'
git diff --cached | grep -nE 'sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_|AKIA[0-9A-Z]{16}|xox[bp]-|BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]'
```

Done when both print nothing (run the second after staging). If a secret was ever committed, tell the person to rotate (replace) that key at its provider.
Why: deleting it from the repo doesn't remove it from git history or from anyone who cloned it.

## 3. Dependencies

```bash
pnpm audit
```

- **critical** or **high** in a package the site ships (`dependencies` in `package.json`): fix before pushing, by updating to the lowest version `pnpm audit` lists as patched.
- Install only versions published at least two weeks ago (`pnpm view <pkg> time --json`).
  Why: hijacked packages show up in brand-new releases.
- Dev tools only (`shadcn`, `prettier`, `typescript` and what they pull in) never reach visitors. Update them when a fix exists; otherwise note it and move on.
- Pin exact versions (no `^`), as `package.json` already does. Write a few lines of code instead of adding a package.
  Why: Impeccable promises "no extra packages beyond React".
- After any update: `pnpm build`. If `shadcn` changed, also `pnpm registry:build`, and check `git diff public/r` shows only expected changes.

## 4. Code review

Read the diff (`git diff`, plus new files) for each of these. Each is a real way a static site gets hurt.

- **HTML from strings.** `dangerouslySetInnerHTML` only for text the site makes at build time: the Shiki code blocks in `components/site/html.tsx` and the theme script in `app/layout.tsx`. Never for anything a visitor types, a URL parameter or `localStorage`.
- **Code from strings.** No `eval`, `new Function` or `setTimeout("string")`.
- **New-tab links** have `rel="noopener noreferrer"` next to `target="_blank"`.
- **Browser storage** (`localStorage`, `sessionStorage`) holds only harmless settings like theme or a chosen tab. Never passwords, tokens or personal data. Password-Strength never stores or sends what is typed.
- **Outside resources.** Put any new script, font, image, video or iframe file in `public/`. Only if it has to come from another site, add that exact address to the matching line of `csp` in `next.config.ts`, with a comment saying why.
  Why: the Content Security Policy blocks every outside address not on its list.
- **Prompts and skills** (`lib/prompts.ts`, `skills/`, `.agents/skills/`, `public/downloads/`). People paste these into AI tools that can run commands. They never tell an agent to run a downloaded script (`curl ... | sh`), fetch from any address other than `impeccable-rust.vercel.app` or the official shadcn CLI, read secrets, or change settings outside the project. A skill zip contains only the skill's own files.
- **Downloads.** Each zip in `public/downloads/` matches its source in `skills/<name>/`. Rebuild it when the source changed.

Done when every bullet is checked against the whole diff.

## 5. Security headers still in place

`next.config.ts` sets these on every page, following the OWASP HTTP Headers Cheat Sheet and the Next.js CSP guide's "Without Nonces" setup (which keeps the site static): `Content-Security-Policy` (with `frame-ancestors 'none'`), `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone and location off), `Cross-Origin-Opener-Policy`, and `poweredByHeader: false`.

- Never remove or loosen a header to make something work. Find the one outside address that is needed and add only that.
- Never add `X-XSS-Protection`.
  Why: OWASP says it does more harm than good.

To confirm on a running build, run this in the browser console on any page:

```js
const r = await fetch(location.href, { method: "HEAD" }); [...r.headers].filter(([k]) => /security|frame|nosniff|referrer|permissions|opener/.test(k))
```

## 6. README matches the site

`README.md` is the front page on GitHub. Check it against the code, line by line:

- Every item in `COMPONENTS` in `lib/site.ts` appears in the README table for its group (Components, Sections, Skills, Animations), with the same name, a link to `https://impeccable-rust.vercel.app/docs/<slug>`, and a one-line description that says the same thing as its `blurb`. Removed or renamed items are gone. A group with no items says "Coming soon."
- The "How to add" steps match the docs pages (install command, copy the code, Install and Blend prompts, skill zip).
- The paths table matches real folders: run `ls` on each one.
- Redirects in `next.config.ts` (old links that still work) are mentioned.
- The "Promises" hold for the new work: original, light and dark, phones, reduced motion, no extra packages.
- Same voice as the site: short, plain sentences, no jargon.

Done when every `COMPONENTS` item and every path has been checked.

## 7. Build and look

```bash
pnpm build
```

It finishes with no errors. Then start it (`pnpm start`) and open every page under `/` and `/docs/` in light and dark mode, at 1280px and 375px wide. Check that:

- nothing looks broken and every demo moves the way it did,
- the browser console has no red errors and no "Refused to load" or "Content Security Policy" messages,
- copy buttons and the install bar work.

Stop the server when done.
Why: the person checks every change in both themes and on a phone (vrajsensei, 2026-11-09).

## 8. Hand over

Lead with the verdict, in plain words:

- **Ready to push**, or **Not yet** with the one thing that blocks it.
- What you checked and what you fixed, in a few sentences.
- What is left, and why it's safe to leave.
- What needs a real device (for example Safari, a real phone), if anything.

Then the commands, one per block, adding only this work's files:

```bash
git add <the files>
```
```bash
git commit -m "<what changed, in plain words>"
```
```bash
git push origin main
```
