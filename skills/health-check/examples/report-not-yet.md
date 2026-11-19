# Example: a handover that blocks the push

A Vite site where the scan found an environment file in git. Everything else passed, but the blocker comes first and nothing is buried above it.

---

**Not yet:** `.env.local` is tracked by git, and it holds a real Stripe secret key (`sk_live_...`).

Do this first:
1. Rotate the key in the Stripe dashboard (Developers, API keys, roll key). Removing the file doesn't remove it from git history or from anyone who cloned the repo.
2. Then I'll untrack the file and block it. I've already added `.env*` and `!.env.example` to `.gitignore`.

```bash
git rm --cached .env.local
```

Everything else passed: no package problems (`pnpm audit` clean), no risky code in the diff, headers set in `vercel.json`, built site checked on all 4 pages in light and dark at 1280px and 375px.

Whether to rewrite git history to remove the old key is your call, after the key is rotated. I'll give you the push commands once the key is rotated and the file is untracked.

---

## Why it reads this way

| Line | What to learn |
| --- | --- |
| **Not yet:** and the one blocker | The person knows in one line why they can't push |
| Rotate first | The order matters: rotation protects them, deleting the file doesn't |
| What I already did | Small safe fixes (`.gitignore`) are done, not asked about |
| Everything else passed | One line, so the good news doesn't hide the blocker |
| No push commands | Giving them now invites a push with the key still live |
| History rewrite is their call | A destructive step, offered, never done |
