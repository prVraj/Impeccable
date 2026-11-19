# Example: a handover that is ready

The bar for step 9. A Next.js portfolio, pnpm, headers set in `next.config.ts`. The work added a contact page and a new project card. Notes in the margin explain each choice; the handover itself is inside the box.

---

**Ready to push.**

Checked: scan 0 problems. Secrets searches print nothing and `.gitignore` covers `.env*`, `*.pem` and `*.key`. `pnpm audit` has no high or critical. No package changed. The diff has no HTML from strings, and the one new-tab link has `rel="noopener noreferrer"`. All seven headers are on every page (checked in the console on `/` and `/contact`). Built with `pnpm build` (no warnings), served with `pnpm start`, and opened all 5 pages in light and dark at 1280px and 375px: console clean, menu and form work by keyboard.
Fixed: the README said "Node 18 or newer", but `package.json` needs 20. Changed that one line.
Left: `pnpm audit` lists one moderate advisory in `eslint`'s dependencies. It's a dev tool and never reaches visitors; no fix is out yet.
Left out, ask: `notes/ideas.md` is new and isn't part of this work.
Needs a real device: the contact form's copy-email button on Safari and an iPhone (clipboard).

```bash
git add app/contact/page.tsx components/project-card.tsx public/projects/tide.webp README.md
```
```bash
git commit -m "Add a contact page and the Tide project card"
```
```bash
git push
```

---

## Why it reads this way

| Line | What to learn |
| --- | --- |
| **Ready to push.** | The verdict is the first two words. On a phone, that's all they need |
| Checked | Every step has its evidence: a command and its result, or the pages and sizes opened. "Looked fine" never appears |
| Fixed | Names the file and the change. Small fixes are made, then reported, not asked about |
| Left | Says why the leftover is safe (dev tool, no fix yet), so the person doesn't have to look it up |
| Left out, ask | A file you couldn't place stays out and is named, never silently added |
| Needs a real device | Only the risk the work touches (clipboard), not a generic Safari warning |
| `git add` with names | Shared folders stay safe; no `-A` |
| One command per block | Each copies with one click |
