# Health check

A skill that checks a web project before it goes to GitHub or goes live, then hands over the push commands. It looks for secrets in git, packages with known holes or brand-new releases, risky code, missing security headers, a README that stopped telling the truth, and pages that break on the built site, in dark mode or on a phone.

Made for front-end projects and static sites (React, Next.js, Vite, Astro, plain HTML). Server code, logins, payments and databases need their own security review.

## When it runs

When someone says push, commit, ship, deploy, go live, health check or "is this ready". It never pushes on its own: it hands over the commands.

## What is inside

```
health-check/
  SKILL.md                   the one idea, the bar, nine steps, faults that come back
  references/
    going-out.md             step 2: what belongs in the push, leftovers, shared folders
    secrets.md               step 3: the searches, where keys hide, what to do when one was committed
    packages.md              step 4: audits, the two-week rule and its setting for each package manager
    code.md                  step 5: the risky-code table
    headers.md               step 6: the seven headers, starter set for Next.js, Vercel, Netlify, Cloudflare
    readme.md                step 7: which README claims to check
    build-and-look.md        step 8: build, serve the built site, what to look at
    verify.md                step 9: the audit, "you see, you do", the handover template
    sources.md               OWASP, package manager docs, the attacks behind the rules
  examples/
    report.md                the bar for a handover that is ready
    report-not-yet.md        a handover that blocks the push
  teaching/pairs.md          seven faults, each with its fix
  scripts/scan.mjs           read-only first pass: files going out, secrets, risky code, headers, cooldown
  evals/evals.json           test scenarios for changes to this skill
  LICENSE                    MIT
```

## Run the scan yourself

From your project's root folder (Node 18+ and git):

```bash
node path/to/health-check/scripts/scan.mjs
```

Add `--all` to search every tracked file for secrets, not only the changes. It never changes a file.

## How to change it

- Each rule lives in one place: the step's reference file. `SKILL.md` only points to it.
- Numbers (the two-week rule, the header values) come from `references/sources.md`. Change the source row, the rule and the changelog together.
- After a change, run the scenarios in `evals/evals.json` and bump the version in `SKILL.md`.

## Changelog

- 2.0.0 (2026-11-19): restructured into references, examples, teaching pairs and a scan script. Kept every step and rule of 1.0. New in this version: `scripts/scan.mjs`; the two-week rule now explains the 2025 attacks and gives the setting for pnpm, npm, Yarn and Bun; install-script approval; more secret patterns; reduced motion in the look step; a "Not yet" example; the "you see, you do" table.
- 1.0.0 (2026-11-17): first version.
