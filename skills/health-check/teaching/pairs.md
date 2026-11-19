# Teaching pairs

Each pair shows one fault and its fix. Read the bad half to recognise the fault, never as a starting point.

## 1. Answering from memory (step 3)

Bad:
> Secrets: none. I didn't add any keys in this work.

Good:
> Secrets: `git ls-files | grep ...` and `git diff --cached | grep ...` both print nothing; `.gitignore` covers `.env*`, `*.pem`, `*.key`.

Why: a key can come from a pasted config, another agent or an old file. Only the search proves it.

## 2. The partial check (all steps)

Bad:
> You asked about the README, so I checked that. It's up to date.

Good:
> README checked: one line fixed (Node 20). I also ran the rest of the check: scan 0 problems, audit clean, built site looked at in both themes.

Why: the person asked "is this ready", whatever words they used.

## 3. The loose fix (step 6)

Bad:
```js
"Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval'"
```

Good:
```js
// Fonts: served by Google Fonts until we self-host them
"font-src 'self' https://fonts.gstatic.com",
```

Why: the bad line turns the policy off. The good one adds only the address the page needs, with the reason.

## 4. The fresh package (step 4)

Bad:
> `pnpm audit` flagged `next`; updated to 16.4.6 (released yesterday).

Good:
> `pnpm audit` flags `next`; the lowest patched version, 16.4.6, came out yesterday. Wait until it's two weeks old, or take it now knowingly? Your call.

Why: hijacked releases are new. The cure must not be the next attack.

## 5. The sweeping add (step 9)

Bad:
```bash
git add -A && git commit -m "updates" && git push
```

Good:
```bash
git add app/contact/page.tsx README.md
```
```bash
git commit -m "Add a contact page"
```
```bash
git push
```

Why: `-A` ships other people's unfinished work and leftovers; one command per block copies cleanly; the message says what changed.

## 6. The dev-server look (step 8)

Bad:
> Ran `pnpm dev` and clicked through. Looks good.

Good:
> `pnpm build` (no warnings), `pnpm start`, opened 5 pages in light and dark at 1280px and 375px. Console clean.

Why: production builds fail in ways dev mode hides (missing env values, static export errors, CSP).

## 7. The buried verdict (step 9)

Bad:
> I went through the project carefully. First I looked at the package file... (four paragraphs) ...so I'd hold off until the key is rotated.

Good:
> **Not yet:** `.env.local` holds a live key. Rotate it first.

Why: the person reads the first line. Put the decision there.
