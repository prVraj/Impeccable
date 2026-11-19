# Secrets

Read this at step 3, and whenever the scan prints a `[secrets]` line.

## Rules

- `.gitignore` blocks `.env*` (with `!.env.example`), `*.pem` and `*.key`. Add any line that is missing.
- Anything the person keeps private (local notes, agent instruction files, private skills) is in `.gitignore`, and `git ls-files <those paths>` prints nothing.
  Why: in a public repo, everything tracked is readable by anyone.
- `.env.example` holds placeholder values only, never a real key.
- A key that must reach the browser (a public analytics ID, a publishable key) is named as public by the framework (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`) and is one the provider says is safe to expose. Everything with "secret", "service" or "private" in its provider's name never gets a public prefix.
  Why: a public prefix copies the value into the JavaScript every visitor downloads.

## The searches

```bash
git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$|id_rsa|id_ed25519|secret|credential'
git diff --cached | grep -nE 'sk-ant-|sk-(proj-)?[A-Za-z0-9_-]{32,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[abposr]-|(sk|rk)_live_|npm_[A-Za-z0-9]{36}|BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]'
```

Done when both print nothing (run the second after staging). The scan runs the same patterns on unstaged and new files too; `--all` runs them on every tracked file.

If `gitleaks` is installed, also run `gitleaks git --staged` (or `gitleaks detect` on older versions). Never install it just for this check without asking.

## Where keys hide

| Place | Why it gets missed |
| --- | --- |
| `.env.local`, `.env.production` | `.env` is ignored but a rule like `.env` alone doesn't cover `.env.local` |
| A config file (`next.config.*`, `vite.config.*`) | Keys pasted "for a quick test" |
| A test or script file | Real keys used once, never removed |
| A screenshot or recording | A dashboard with a key on screen; text search can't see it |
| A prompt, `SKILL.md` or `AGENTS.md` | Example commands with a real token |
| Git history | Deleted in a later commit, still in every clone |

## When a secret was committed

1. Tell the person, in the first line of the handover: **Not yet**.
2. They rotate (replace) the key at its provider first. Deleting it from the repo doesn't remove it from git history or from anyone who cloned it.
3. Then remove the file from git (`git rm --cached <file>`), add it to `.gitignore`, and commit.
4. Rewriting history (`git filter-repo`) is the person's choice, and only after the key is rotated.
