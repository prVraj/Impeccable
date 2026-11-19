# What is going out

Read this at step 2.

```bash
git status --short
git diff --stat
```

- Every changed file belongs to the work being pushed. When other people or agents work in the same folder, add only your own files by name. Never `git add -A` or `git add .`.
  Why: their unfinished work isn't yours to ship.
- Leave out or remove leftovers: `*.tmp` and `*.bak` files, scratch scripts, screenshots, copies like `page copy.tsx`, `.DS_Store`, `.fuse_hidden*` files, build output (`.next/`, `dist/`, `out/`, `build/`).
- Pictures and videos outside the site's public folder are usually screenshots. Ask before shipping one.
- Files written by the project's own tools (a regenerated lockfile, generated types or registry files the repo already tracks) go out with the work.
- A file you can't place (you don't know which work it belongs to) stays out and goes in the handover as "left out, ask".

Done when you can name every file going out and which work it belongs to.

| You see | You do |
| --- | --- |
| `?? some-file copy.tsx` | Leave it out; mention it in the handover |
| A changed file you didn't touch | It is someone else's work: leave it out of `git add` |
| `M pnpm-lock.yaml` with no `package.json` change | Find what changed it (`git diff pnpm-lock.yaml | head`); ship it only if it belongs to this work |
| A deleted file you didn't delete | Ask before including the deletion |
