---
name: health-check
description: Checks a web project before it goes to GitHub or goes live, then hands over the push commands. Covers secrets, packages with known holes or brand-new releases, risky code, security headers, a README that still tells the truth, a clean build, and every page in light and dark on desktop and phone. Use when someone says push, commit, ship, deploy, go live, health check or "is this ready".
license: MIT
metadata:
  version: '2.0.0'
---

# Health check

Run this before anything leaves the machine. On a front-end project the real risks are small and specific: a secret file slipping into git, a package with a known hole or a hijacked new release, a page that runs untrusted HTML, an outside resource the security headers block, a page that breaks in dark mode or on a phone, and a README that says something no longer true.

## The one idea

**Prove each risk is absent from what is actually going out, from evidence you looked at, then hand over a verdict the person can act on in one glance.**

Five ways it fails:

- **The partial check.** Only the step the person asked about ("just check the README"), so the others ship broken.
- **The memory check.** "No secrets, I didn't add any": answered from what you remember writing, not from the diff.
- **The dev-server look.** Pages checked on the dev server, which hides some production errors and shows others that never ship.
- **The loose fix.** A header removed or a policy loosened to make a page work, or a package bumped to a release from yesterday.
- **The buried verdict.** A long report where "Not yet" sits in paragraph four, or push commands that add every file in the folder.

The fix: run every step on every check, answer each from a command's output or a page you opened, fix what a small edit can fix, and lead the handover with **Ready to push** or **Not yet** and the one thing that blocks it.

## The bar

`examples/report.md` is the bar for the handover. Picture the person reading only its first line on a phone: they know whether to push. Then picture a security reviewer reading the rest: every "checked" has the command or page behind it.

## Scope

Front-end projects and static sites (React, Next.js, Vite, Astro, plain HTML). If the project has its own server code, logins, payments or a database, run this and tell the person that code needs its own security review.
Why: a green health check must never read as "the backend is safe".

**Never run `git push`.** Hand the person the commands, unless they asked you to push in this conversation.
Why: a push publishes the work; the person decides when.

Run every step, even when they asked about one thing. Fix what a small edit can fix, then report. Never stop to ask what you can find out yourself.
Why: a step skipped "because they only asked about the README" ships the others broken.

## Workflow

1. **Learn the project, then run the scan.** Read `package.json` (scripts), the lockfile (it names the package manager: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock`), the README and the framework config. Then, from the project root, run `node <this skill's folder>/scripts/scan.mjs`: it lists the files going out and flags leftovers, secrets, risky code, missing headers and new outside addresses. Done when you can name the package manager, the build and start commands, where security headers are set (if anywhere) and every page of the site, and you have read every line the scan printed. Use that package manager in every command below. The scan is a first pass; steps 2 to 8 still run in full.
2. **See what is going out** (`references/going-out.md`). Done when you can name every file going out and which work it belongs to.
3. **Secrets** (`references/secrets.md`). Done when the tracked-files and staged-diff searches print nothing and `.gitignore` covers `.env*`, `*.pem` and `*.key`.
4. **Packages** (`references/packages.md`). Done when no critical or high advisory remains in a shipped package and every new or updated package is at least two weeks old.
5. **Risky code** (`references/code.md`). Done when every row of its table is checked against the whole diff.
6. **Security headers** (`references/headers.md`). Done when every page sends the seven headers, or the person has said no to adding them.
7. **README still tells the truth** (`references/readme.md`). Done when every claim is checked. Usually that means no change at all.
8. **Build and look** (`references/build-and-look.md`). Done when the build passes and you have opened every page in both themes at 1280px and 375px on the built site.
9. **Hand over** with `references/verify.md`: answer its audit, then write the report in the shape of `examples/report.md`.

## Faults that come back

- **`git add -A` in the push commands** when other people or agents share the folder (`references/going-out.md`).
- **A secret "removed" in a new commit** but still in history: it needs rotating at the provider (`references/secrets.md`).
- **A package update to a release a few days old** to clear an advisory (`references/packages.md`, The two-week rule).
- **A new font, script or embed** that the Content Security Policy blocks after deploy (`references/code.md`, Outside resources).
- **`X-XSS-Protection` added** because an old guide said so (`references/headers.md`).
- **A README that grew a feature list** (`references/readme.md`).
- **"Looks fine" from the dev server** (`references/build-and-look.md`).

## Examples

| Need | Example | What to learn |
| --- | --- | --- |
| The handover | `examples/report.md` | Verdict first, what was checked with its evidence, what was fixed, what is left and why it's safe, then one command per block |
| A blocked push | `examples/report-not-yet.md` | "Not yet" with the one blocker, the fix offered, nothing else buried above it |

Faults and their fixes, side by side: `teaching/pairs.md`.

## References

| File | Read when |
| --- | --- |
| `references/going-out.md` | Step 2: what belongs in the push, leftovers, shared folders |
| `references/secrets.md` | Step 3: where secrets hide, the searches, what to do when one was committed |
| `references/packages.md` | Step 4: audits, the two-week rule and the setting for each package manager, known attacks |
| `references/code.md` | Step 5: the risky-code table |
| `references/headers.md` | Step 6: the seven headers, the starter set for Next.js, Vercel, Netlify and Cloudflare Pages |
| `references/readme.md` | Step 7: which README claims to check |
| `references/build-and-look.md` | Step 8: building, serving the built site, what to look at |
| `references/verify.md` | Step 9: the audit, "you see, you do", the handover template |
| `references/sources.md` | When a rule is questioned: OWASP, the package managers, the attacks |
| `scripts/scan.mjs` | Step 1 (run it) |
