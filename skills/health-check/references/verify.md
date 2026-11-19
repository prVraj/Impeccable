# Verify and hand over

Read this at step 9. Answer every line from a command's output or a page you opened in this session, never from memory.

## Gate

```bash
node <this skill's folder>/scripts/scan.mjs
```

Done when it ends `0 problems` and you have read every `look:` line. A `look:` line needs your judgment; it never fails the scan on its own.

## Audit

Answer yes or no. The first "no" in this list is the blocker you name in the handover's first line.

**Secrets (a "no" here is always Not yet)**
- [ ] The tracked-files search and the staged-diff search from `references/secrets.md` both print nothing.
- [ ] No secret was ever committed, or the person knows to rotate it first.

**Packages**
- [ ] `audit` shows no critical or high advisory in `dependencies`.
- [ ] Every package added or updated in this work was published at least two weeks ago.

**What is going out**
- [ ] Every file in the push belongs to this work, and the add command names them one by one.
- [ ] No leftovers (copies, scratch files, build output, stray screenshots).

**Code**
- [ ] Every row of the table in `references/code.md` was checked against the whole diff.
- [ ] Every outside address the site loads is on the matching Content Security Policy line.

**Headers**
- [ ] Every page sends the seven headers, or the person said no to adding them.

**Build and look**
- [ ] The build passed with no new warnings.
- [ ] Every page was opened on the built site, in light and dark, at 1280px and 375px, with a clean console.

**README**
- [ ] Every claim was checked against the code; anything untrue was fixed.

## You see, you do

| You see | You do |
| --- | --- |
| `[secrets] .env.local is tracked by git` | Not yet. Tell the person to rotate the keys inside first, then `git rm --cached .env.local` and add the line to `.gitignore` |
| `audit` high in a dev tool only | Update if a fix exists; otherwise note it under "Left" with "dev tool, never reaches visitors" |
| The only patched version is five days old | Tell the person: wait until it is two weeks old, or take that one version knowingly. Their choice |
| `Refused to load the font ... because it violates the Content Security Policy` | Serve the font from the project, or add that one host to `font-src` with a comment. Never loosen `default-src` |
| A page fine on the dev server, broken on the built site | That is the real bug. Fix it and look again on the built site |
| `look: [going out] hero.png: a picture or video` | Open it. A screenshot stays out; an image the site uses moves to the public folder |
| A changed file you can't place | Leave it out and list it under "Left out, ask" |
| The person asked only about the README | Run all nine steps anyway; say so in one line |

## Handover template

Lead with the verdict. Keep it short; the person reads the first line first.

````md
**Ready to push.** (or: **Not yet:** <the one thing that blocks it>.)

Checked: <steps, in a sentence or two, each with its evidence: "scan 0 problems", "pnpm audit: 0 high", "built site, 6 pages, light and dark, 1280 and 375">.
Fixed: <what you changed, by file>.
Left: <what remains and why it is safe>. Left out, ask: <files you couldn't place>.
Needs a real device: <Safari or a phone, only when the work touches it>.

```bash
git add <file> <file>
```
```bash
git commit -m "<what changed, in plain words>"
```
```bash
git push
```
````

Rules for the commands:
- One command per block, so each copies with one click.
- `git add` names this work's files. Never `-A` or `.` in a shared folder.
- The commit message says what changed for a visitor, in plain words.
- On **Not yet**, give the fix first and the commands only after it, or leave them out.
