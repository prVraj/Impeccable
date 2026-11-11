---
name: pre-push-check
description: The check to run before anything from Impeccable goes to GitHub. A security review (secrets, dependencies, risky code, security headers) plus keeping README.md in step with the site, then a build and a look in light and dark on desktop and phone, then push commands for the person to run. Use whenever someone says push, commit, ship, deploy or "is this ready", and before you hand over push commands.
---

# Pre-push check

Impeccable is a static Next.js docs site. It has no server code, no logins, no database and no environment variables. So the real risks are small and specific: a secret file slipping into git, an outdated package with a known hole, a page that runs untrusted HTML, a new outside resource the security headers block, and a README that no longer matches the site.

The person you work for is a designer. They push themselves. **Never run `git push`.** Hand them the commands. Explain results in plain words, no jargon, and don't stop to ask questions you can answer yourself.

Run every step. Fix what you can, then report.

## 1. See what is going out

```bash
git status --short
git diff --stat
```

- Every changed file should belong to the work being pushed. If another thread or person is still working in this folder, add only your own files by name, never `git add -A`.
- Leftovers to remove or leave out: `*.tmp` files, scratch scripts, screenshots, copies like `page copy.tsx`, `.DS_Store`.
- `AGENTS.md` is written by `next dev`. It is fine to commit it with the work.

## 2. Secrets

Nothing secret ever goes to GitHub. `.gitignore` already blocks `.env*`, `*.pem`, `*.key` and `*.tmp`; check that it still does.

```bash
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$|id_rsa|secret|credential'
git diff --cached | grep -nE 'sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_|AKIA[0-9A-Z]{16}|xox[bp]-|BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]'
```

Both must print nothing (run the second after staging). If a secret was ever committed, removing it is not enough: tell the person to rotate (replace) that key at its provider.

## 3. Dependencies

```bash
pnpm audit
```

- **critical** or **high** in a package the site ships (`dependencies` in `package.json`): fix before pushing. Update to the lowest version that `pnpm audit` lists as patched.
- Only install versions published at least two weeks ago (`pnpm view <pkg> time --json`). Brand-new releases are where hijacked packages show up.
- Dev tools only (`shadcn`, `prettier`, `typescript` and what they pull in) never reach visitors. Update them when a fix exists; otherwise note it and move on.
- Pin exact versions (no `^`), as `package.json` already does. Don't add a package when a few lines of code will do: Impeccable promises "no extra packages beyond React".
- After any update: `pnpm build`, and if `shadcn` changed, `pnpm registry:build` and check `git diff public/r` only shows expected changes.

## 4. Code review

Read the diff (`git diff`, plus new files) for these. Each one is a real way a static site gets hurt.

- **HTML from strings.** `dangerouslySetInnerHTML` is allowed only for text the site itself makes at build time: the Shiki code blocks in `components/site/html.tsx` and the theme script in `app/layout.tsx`. Never for anything a visitor types, a URL parameter, or `localStorage`.
- **Running code from strings.** No `eval`, `new Function`, or `setTimeout("string")`.
- **Links that open a new tab** need `rel="noopener noreferrer"` next to `target="_blank"`.
- **Browser storage** (`localStorage`, `sessionStorage`) holds only harmless settings like theme or a chosen tab. Never passwords, tokens or personal data. The Password-Strength component must never store or send what is typed.
- **Outside resources.** Any new script, font, image, video, iframe or `fetch` from another site will be blocked by the Content Security Policy. Prefer putting the file in `public/`. If it must come from outside, add that exact address to the matching line of `csp` in `next.config.ts`, and say why in a comment.
- **Prompts and skills** (`lib/prompts.ts`, `skills/`, `public/downloads/`). People paste these into AI tools that can run commands. They must never tell an agent to run a downloaded script (`curl ... | sh`), fetch from an address other than `impeccable-rust.vercel.app` or the official shadcn CLI, read secrets, or change settings outside the project. A skill zip must contain only the skill's own files.
- **Downloads.** Each zip in `public/downloads/` must match its source in `skills/<name>/`. Rebuild it if the source changed.

## 5. Security headers still in place

`next.config.ts` sets these on every page. They follow the OWASP HTTP Headers Cheat Sheet and the Next.js Content Security Policy guide ("Without Nonces", which keeps the site static):

| Header | What it does, in plain words |
| --- | --- |
| `Content-Security-Policy` | The browser only runs scripts, styles, images and fonts from this site. Blocks injected code. |
| `Strict-Transport-Security` | Always use HTTPS. |
| `X-Frame-Options` and CSP `frame-ancestors 'none'` | Other sites can't show this site in a hidden frame and trick clicks. |
| `X-Content-Type-Options: nosniff` | The browser doesn't guess file types. |
| `Referrer-Policy` | Other sites only see the domain a visitor came from. |
| `Permissions-Policy` | Camera, microphone and location are switched off. |
| `Cross-Origin-Opener-Policy` | Pages opened from the site can't reach back into it. |
| `poweredByHeader: false` | Doesn't announce "Next.js". |

Don't remove or loosen any of them to make something work. Find the one outside address that is needed and add only that. Don't add `X-XSS-Protection`: OWASP says it does more harm than good.

To confirm on a running build, open any page and run this in the browser console (or the browser tool):

```js
const r = await fetch(location.href, { method: "HEAD" }); [...r.headers].filter(([k]) => /security|frame|nosniff|referrer|permissions|opener/.test(k))
```

## 6. README matches the site

`README.md` is the front page on GitHub. Check it against the code, line by line:

- Every item in `COMPONENTS` in `lib/site.ts` appears in the README table for its group (Components, Sections, Skills, Animations), with the same name, a link to `https://impeccable-rust.vercel.app/docs/<slug>`, and a one-line description that says the same thing as its `blurb`. Removed or renamed items are gone from the README. A group with no items says "Coming soon."
- The "How to add" steps still match the docs pages (install command, copy the code, Install and Blend prompts, skill zip).
- The paths table matches real folders. Run `ls` on each one.
- Redirects in `next.config.ts` (old links that still work) are mentioned.
- "Promises" are still true for the new work: original, light and dark, phones, reduced motion, no extra packages.
- Same voice as the site: short, plain sentences, no jargon.

## 7. Build and look

```bash
pnpm build
```

It must finish with no errors. Then start it (`pnpm start`) and open every page under `/` and `/docs/` in light and dark mode, at desktop width and at phone width (375px). Check that:

- nothing looks broken and every demo still moves the way it did,
- the browser console has no red errors and no "Refused to load" or "Content Security Policy" messages,
- copy buttons and the install bar still work.

Stop the server when done.

## 8. Hand over

Tell the person, in a few plain sentences: what you checked, what you fixed, anything left (with why it is safe to leave). Then give the commands, one per block, adding only this work's files when others are working:

```bash
git add <the files>
```
```bash
git commit -m "<what changed, in plain words>"
```
```bash
git push origin main
```
