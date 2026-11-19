# Packages

Read this at step 4.

## Audit

```bash
npm audit        # or: pnpm audit, yarn npm audit, bun audit
```

- **critical** or **high** in a package the site ships (`dependencies` in `package.json`): fix before pushing, by updating to the lowest version the audit lists as patched.
- Dev tools only (`devDependencies` and what they pull in) never reach visitors. Update them when a fix exists; otherwise note it in the handover and move on.
- After any update, run the build again and read `git diff` on the lockfile: only the packages you meant to change moved.

## The two-week rule

Install only versions published at least two weeks ago (`npm view <pkg> time --json`).
Why: hijacked packages show up as brand-new releases and are usually caught and pulled within hours or days. In September 2025 `chalk`, `debug` and 16 other packages were hijacked and pulled in about 2.5 hours; in November 2025 the Shai-Hulud 2.0 worm reached 796 packages before removal about 12 hours later.

If the lowest patched version is newer than two weeks, tell the person and let them choose: wait, or take that one version knowingly.

Each package manager can enforce the rule. If the project has no setting, offer the one line below; add it only with the person's yes.

| Manager | File | Setting for two weeks | Note |
| --- | --- | --- | --- |
| pnpm (10.16+) | `pnpm-workspace.yaml` | `minimumReleaseAge: 20160` | Minutes. pnpm 11 defaults to 1440 (one day) |
| npm (11.10+) | `.npmrc` | `min-release-age=14` | Days |
| Yarn (4.10+) | `.yarnrc.yml` | `npmMinimalAgeGate: 14d` | A bare number means minutes |
| Bun | `bunfig.toml` | `[install]` then `minimumReleaseAge = 1209600` | Seconds |

The same number means different things in each tool (7 is a week in npm, seven minutes in pnpm), so copy the value from this table.

## Fewer packages

- If `package.json` pins exact versions (no `^` or `~`), keep it that way.
- Write a few lines of code instead of adding a package for one small job.
  Why: every package is code you didn't read running on your site.
- A new package with an install script (`postinstall`) is worth a second look: that script runs on the machine at install time. pnpm can require approval for these (`strictDepBuilds: true`, then `onlyBuiltDependencies` for the ones you trust).
