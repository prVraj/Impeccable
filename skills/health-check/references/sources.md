# Sources

Read this when a rule is questioned, or before changing a number in this skill.

| Rule | Source | What it says |
| --- | --- | --- |
| The seven headers, never `X-XSS-Protection` | OWASP HTTP Headers Cheat Sheet (cheatsheetseries.owasp.org) | Recommended values for CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP; X-XSS-Protection should be off or absent because it can create holes |
| `frame-ancestors 'none'` with `X-Frame-Options` | OWASP Clickjacking Defense Cheat Sheet | CSP frame-ancestors replaces X-Frame-Options; send both for older browsers |
| HTML from strings needs a sanitizer | OWASP Cross Site Scripting Prevention Cheat Sheet; DOMPurify docs | Untrusted HTML must be sanitized before it reaches `innerHTML` |
| `rel="noopener"` on new tabs | MDN, `rel=noopener` | Without it the opened page gets `window.opener` and can navigate the opener |
| Secret patterns | gitleaks default rule set (github.com/gitleaks/gitleaks) | Prefixes for Anthropic, OpenAI, GitHub, AWS, Google, Slack, Stripe and npm tokens, and private key blocks |
| Rotate before deleting | GitHub Docs, "Removing sensitive data from a repository" | A committed secret stays in history and in every clone; revoke it at the provider first |
| Public prefixes reach the browser | Next.js docs (`NEXT_PUBLIC_`), Vite docs (`VITE_`), Astro docs (`PUBLIC_`) | Prefixed values are inlined into the client bundle |
| The two-week rule | September 2025 hijack of `chalk`, `debug` and 16 more (pulled in about 2.5 hours); November 2025 Shai-Hulud 2.0 worm (796 packages, about 12 hours) | Hijacked releases are new and are pulled within hours or days |
| pnpm `minimumReleaseAge` | pnpm docs, settings (pnpm 10.16+); pnpm 11 release notes (default 1440) | Value in minutes |
| npm `min-release-age` | npm docs, config (npm 11.10+) | Value in days |
| Yarn `npmMinimalAgeGate` | Yarn docs, `.yarnrc.yml` (Yarn 4.10+) | Takes a duration such as `14d`; a bare number is minutes |
| Bun `minimumReleaseAge` | Bun docs, `bunfig.toml` `[install]` | Value in seconds |
| `strictDepBuilds`, `onlyBuiltDependencies` | pnpm docs, settings | Install scripts run only for packages you approve |
| Built site, not dev server | Next.js, Vite and Astro docs on `start` / `preview` | Dev mode adds overlays and checks that production doesn't, and skips optimizations that can break production |

When a source changes (a new package manager version, a new OWASP value), update the rule, this table and the changelog in `README.md` together.
