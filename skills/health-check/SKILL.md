---
name: health-check
description: Checks a web project before it goes to GitHub or goes live, then hands over the push commands. Covers secrets, packages with known holes, risky code, security headers, a README that still tells the truth, a clean build, and every page in light and dark on desktop and phone. Use when someone says push, commit, ship, deploy, go live, health check or "is this ready".
license: MIT
---

# Health check

Run this before anything leaves the machine. On a front-end project the real risks are small and specific: a secret file slipping into git, a package with a known hole, a page that runs untrusted HTML, an outside resource the security headers block, a page that breaks in dark mode or on a phone, and a README that says something no longer true.

**Scope:** front-end projects and static sites (React, Next.js, Vite, Astro, plain HTML). If the project has its own server code, logins, payments or a database, run this and tell the person that code needs its own security review.
Why: a green health check must never read as "the backend is safe".

**Never run `git push`.** Hand the person the commands, unless they asked you to push in this conversation.
Why: a push publishes the work; the person decides when.

Run every step, even when they asked about one thing. Fix what a small edit can fix, then report. Never stop to ask what you can find out yourself.
Why: a step skipped "because they only asked about the README" ships the others broken.

## 1. Learn the project

Read `package.json` (scripts), the lockfile (it names the package manager: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock`), the README and the framework config.

Done when you can name: the package manager, the build and start commands, where the security headers are set (if anywhere), and every page of the site. Use that package manager in every command below.

## 2. See what is going out

```bash
git status --short
git diff --stat
```

- Every changed file belongs to the work being pushed. When other people or agents work in the same folder, add only your own files by name. Never `git add -A` or `git add .`.
  Why: their unfinished work isn't yours to ship.
- Leave out or remove leftovers: `*.tmp` files, scratch scripts, screenshots, copies like `page copy.tsx`, `.DS_Store`, build output (`.next/`, `dist/`, `out/`).
- Files written by the project's own tools (a regenerated lockfile, generated types the repo already tracks) go out with the work.

Done when you can name every file going out and which work it belongs to.

## 3. Secrets

`.gitignore` blocks `.env*` (with `!.env.example`), `*.pem` and `*.key`. Add any line that is missing.

Anything the person keeps private (local notes, agent instruction files, private skills) is in `.gitignore`, and `git ls-files <those paths>` prints nothing.
Why: in a public repo, everything tracked is readable by anyone.

```bash
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$|id_rsa|secret|credential'
git diff --cached | grep -nE 'sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_|AKIA[0-9A-Z]{16}|xox[bp]-|BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]'
```

- `.env.example` holds placeholder values only, never a real key.
- A key that must reach the browser (a public analytics ID, a publishable key) is named as public by the framework (`NEXT_PUBLIC_`, `VITE_`) and is one the provider says is safe to expose.

Done when both commands print nothing (run the second after staging). If a secret was ever committed, tell the person to rotate (replace) that key at its provider.
Why: deleting it from the repo doesn't remove it from git history or from anyone who cloned it.

## 4. Dependencies

```bash
npm audit        # or: pnpm audit, yarn npm audit, bun audit
```

- **critical** or **high** in a package the site ships (`dependencies` in `package.json`): fix before pushing, by updating to the lowest version the audit lists as patched.
- Install only versions published at least two weeks ago (`npm view <pkg> time --json`).
  Why: hijacked packages show up in brand-new releases and are usually caught within days.
- Dev tools only (`devDependencies` and what they pull in) never reach visitors. Update them when a fix exists; otherwise note it in the hand-over and move on.
- If `package.json` pins exact versions (no `^` or `~`), keep it that way. Write a few lines of code instead of adding a package for one small job.
  Why: every package is code you didn't read running on your site.
- After any update, run the build again and read `git diff` on the lockfile: only the packages you meant to change moved.

## 5. Code review

Read the diff (`git diff`, plus every new file) for each of these. Each is a real way a front-end gets hurt.

- **HTML from strings** (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`, `{@html}`): only for content the project makes itself at build time, or passed through a sanitizer such as DOMPurify. Never for anything a visitor types, a URL parameter, `localStorage` or an outside API.
- **Code from strings:** no `eval`, `new Function` or `setTimeout("string")`.
- **Links built from data** never start with `javascript:`. Check any `href` filled from a visitor, a URL parameter or an API.
- **New-tab links** have `rel="noopener noreferrer"` next to `target="_blank"`.
- **Browser storage** (`localStorage`, `sessionStorage`, cookies set in the browser) holds only harmless settings like theme or a chosen tab. Never passwords, tokens or personal data.
- **Outside resources.** Serve scripts, fonts, images and videos from the project's own folder when you can. If one has to come from another site, add that exact address to the matching line of the Content Security Policy, with a comment saying why.
  Why: a working CSP blocks every outside address not on its list, so a missing line shows up as a broken page after deploy.
- **Prompts, agent files and skills** the project ships (copy-paste prompts, `SKILL.md`, `AGENTS.md`): people paste these into AI tools that can run commands. They never tell an agent to run a downloaded script (`curl ... | sh`), fetch from an address the project doesn't own, read secrets, or change settings outside the project.
- **Downloads** (zips, PDFs) in the public folder match their source. Rebuild any whose source changed.

Done when every bullet is checked against the whole diff.

## 6. Security headers

Every page sends: `Content-Security-Policy` (with `frame-ancestors 'none'`), `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone and location off unless used), and `Cross-Origin-Opener-Policy`. These follow the OWASP HTTP Headers Cheat Sheet.

- If the project sets none, tell the person and offer the starter set in `references/headers.md` (it has the setup for Next.js, Vercel, Netlify and Cloudflare Pages). Add it only with their yes, then repeat step 8 on every page.
  Why: a new CSP can block things the site already loads, so it needs a full look before it ships.
- Never remove or loosen a header to make something work. Find the one outside address that is needed and add only that.
- Never add `X-XSS-Protection`.
  Why: OWASP says it does more harm than good in today's browsers.

To confirm on a running build, run this in the browser console on any page:

```js
const r = await fetch(location.href, { method: "HEAD" }); [...r.headers].filter(([k]) => /security|frame|nosniff|referrer|permissions|opener/.test(k))
```

## 7. README still tells the truth

The README is the project's front page. Edit it only where something it says stopped being true. Check each claim against the code:

- What the project says it does and has still exists.
- Install and setup steps, and the "run it locally" commands, still work as written.
- Version numbers, requirements and supported platforms are current.
- Every link opens: the live site, docs, the license, profiles.

Never turn the README into a changelog or a list that grows with every feature.
Why: a hand-kept list always drifts from the real project, and then the README lies.

Done when every claim is checked. Usually that means no change at all.

## 8. Build and look

Run the build command. It finishes with no errors and no new warnings. Then start the built site (not the dev server) and open every page in light and dark mode (if the site has both), at 1280px and 375px wide. Check that:

- nothing looks broken, nothing scrolls sideways on the phone width, and every animation moves the way it did,
- the browser console has no red errors and no "Refused to load" or "Content Security Policy" messages,
- buttons, forms, copy buttons and menus still work, by mouse and by keyboard (Tab and Enter).

Stop the server when done.
Why: the built site is what visitors get; the dev server hides some errors and shows others that never ship.

## 9. Hand over

Lead with the verdict, in plain words:

- **Ready to push**, or **Not yet** with the one thing that blocks it.
- What you checked and what you fixed, in a few sentences.
- What is left, and why it's safe to leave.
- What needs a real device (Safari, a real iPhone or Android phone), if anything.

Then the commands, one per block, adding only this work's files:

```bash
git add <the files>
```
```bash
git commit -m "<what changed, in plain words>"
```
```bash
git push
```
