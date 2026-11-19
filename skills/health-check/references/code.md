# Risky code

Read this at step 5. Read the diff (`git diff`, plus every new file) for each row. Each is a real way a front end gets hurt.

| Look for | Rule | Why |
| --- | --- | --- |
| **HTML from strings** (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`, `{@html}`) | Only for content the project makes itself at build time, or passed through a sanitizer such as DOMPurify. Never for anything a visitor types, a URL parameter, `localStorage` or an outside API. | Untrusted HTML runs as the site, with the visitor's session. |
| **Code from strings** (`eval`, `new Function`, `setTimeout("string")`) | None. | Same as above, and the Content Security Policy should block it anyway. |
| **Links built from data** | Never start with `javascript:`. Check every `href` filled from a visitor, a URL parameter or an API. | A `javascript:` link runs code on click. |
| **New-tab links** (`target="_blank"`) | `rel="noopener noreferrer"` beside it. | Without it the opened page can redirect the page that opened it. |
| **Browser storage** (`localStorage`, `sessionStorage`, cookies set in the browser) | Only harmless settings like theme or a chosen tab. Never passwords, tokens or personal data. | Any script on the page can read it. |
| **Outside resources** (scripts, fonts, images, videos, iframes, analytics) | Serve them from the project's own folder when you can. If one has to come from another site, add that exact address to the matching line of the Content Security Policy, with a comment saying why. | A working policy blocks every outside address not on its list, so a missing line shows up as a broken page after deploy. |
| **Prompts, agent files and skills** the project ships (copy-paste prompts, `SKILL.md`, `AGENTS.md`) | Never tell an agent to run a downloaded script (`curl ... \| sh`), fetch from an address the project doesn't own, read secrets, or change settings outside the project. | People paste these into AI tools that can run commands. |
| **Downloads** (zips, PDFs) in the public folder | Each matches its source. Rebuild any whose source changed, and check a zip holds only its own files (`unzip -l`). | A stale zip ships old code; a sloppy one ships private files. |
| **Forms and inputs** | Validation messages show text, never HTML. Password fields never log or store what is typed. | Error messages are a common place for HTML injection. |

Done when every row is checked against the whole diff.
