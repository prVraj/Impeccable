# Impeccable

Animations and skills that fit your product like the missing piece of a puzzle. Before your AI tool builds anything, it asks you a few questions, so what you get feels made for you.

**[impeccableui.vercel.app](https://impeccableui.vercel.app)** · Docs start at [/docs](https://impeccableui.vercel.app/docs)

Looking for something? Press `⌘K` on a Mac or `Ctrl+K` on Windows on any page, or click Search at the top, to search the whole library.

## What's inside

The library has five parts.

### Components

| Component | What it does |
| --- | --- |
| [Text-mirroring](https://impeccableui.vercel.app/docs/text-mirroring) | Bold header text that echoes into an infinite glass mirror on hover. |
| [Burning-toast](https://impeccableui.vercel.app/docs/burning-toast) | Toasts that stack at the bottom and burn away when they close. |
| [brain.txt](https://impeccableui.vercel.app/docs/brain-txt) | A brain in a web of dots; each dot holds one of your thoughts. |
| [Scratch-me](https://impeccableui.vercel.app/docs/scratch-me) | Scratch off the foil to reveal a promo code; it copies itself. |
| [Password-Strength](https://impeccableui.vercel.app/docs/password-strength) | A password field that rates you as AI, AI agent or Human. |
| [Framed-Upload](https://impeccableui.vercel.app/docs/framed-upload) | Drop in a picture and it hangs in a frame, like a print on a wall. |

### Buttons

Every kind of button has its own place in the library: in the docs, Buttons is a menu of its own.

| Button | What it does |
| --- | --- |
| [Peter-Tingle-button](https://impeccableui.vercel.app/docs/peter-tingle-button) | A button that feels your pointer coming and tingles toward it. |
| [Venom-button](https://impeccableui.vercel.app/docs/venom-button) | A glossy ink button whose tentacles grab your pointer and pull on it. |

### Sections

Whole page blocks. Sections of one kind share a family page that lists them all, like [Login pages](https://impeccableui.vercel.app/docs/login-pages).

| Section | What it does |
| --- | --- |
| [Hex-Login](https://impeccableui.vercel.app/docs/hex-login) | A calm login page with your logo inside turning hexagon rings. |

### Animations

| Animation | What it does |
| --- | --- |
| [Black-Hole-Refresh](https://impeccableui.vercel.app/docs/black-hole-refresh) | A page refresh. A black hole pulls your page into long thin threads, swallows them and blasts the page back fresh. |
| [Agent-Draw](https://impeccableui.vercel.app/docs/agent-draw) | A loader. Named cursors draw the page's skeleton live, top to bottom, while the data loads; then the real content fades in. |
| [Burning-Screen](https://impeccableui.vercel.app/docs/burning-screen) | A page transition. One click burns the current screen away from the click point and reveals the next page through the hole. |

### Skills

| Skill | What it does |
| --- | --- |
| [UI-tongue](https://impeccableui.vercel.app/docs/ui-tongue) | Learns your UI taste in about 15 minutes and writes you your own UI skill, so a one-line prompt comes out in your style. |

## Add a component, button, section or animation to your project

Every component, button, section and animation page gives you three ways in. Above the preview, switch it to desktop, tablet or phone width, drag its right edge to any width, reset it or open it fullscreen.

**1. Install command.** In a project set up with [shadcn](https://ui.shadcn.com):

```bash
npx shadcn@latest add https://impeccableui.vercel.app/r/agent-draw.json
```

**2. Copy the code.** Copy the TypeScript or JavaScript file from the page into your components folder.

**3. Use a prompt.** Paste one into your AI coding tool (Claude Code, Cursor, v0 and others):

- **Install prompt:** adds it exactly as shown on the site. It only asks where it should go.
- **Blend prompt:** your agent asks you a few short questions first, then fits it to your brand with your colors, names and words. The design and motion stay as made.

## Add a skill

Download the zip from the skill's page.

- **Claude on the web or desktop:** Settings, Skills, upload the zip as it is.
- **Claude Code:** `unzip ~/Downloads/ui-tongue.zip -d ~/.claude/skills`

Then say `make my UI skill`.

## Promises

- Everything is original.
- Works in light and dark, and on phones.
- Respects reduced motion: people who turn it on get less movement.
- No extra packages beyond React.
- The Blend prompt changes how an animation looks, never how it moves.
- Free and MIT licensed.

## Run the site locally

You need Node.js 20 or newer and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/prVraj/Impeccable.git
cd Impeccable
pnpm install
pnpm dev
```

### Project map

Everything about one item lives in its own folder under `items/`. Open the folder and you see the whole item.

```
items/
  list.ts                  THE list: one line per item, in sidebar order
  hex-login/
    hex-login.tsx          the component people install
    info.ts                name, group, short blurb, description, tags, date added
    docs.tsx               its docs page: hint, usage, props
    demo.tsx               the live preview on the docs page
    tv.tsx                 its channel on the home iMac
    prompts.ts             its Install and Blend prompts
  login-pages/             a family page (info.ts + docs.tsx)
  ui-tongue/               a skill page (info.ts + docs.tsx)
app/                       the website's pages (home, Introduction, layout)
components/site/           the site's own parts: header, sidebar, search, iMac, bulb
lib/                       small helpers; site.ts reads items/ for the sidebar and search
skills/<name>/             a skill's files; the download lives in public/downloads/
scripts/items.mjs          checks every item has all its pieces, then writes the files below
generated/                 written on every dev and build. Don't edit by hand.
public/r/                  the install files, made by pnpm registry:build
```

| Path | What it is |
| --- | --- |
| `items/<name>/` | One item: component, info, docs page, demo, iMac channel, prompts. |
| `items/list.ts` | Which items exist, in sidebar order. |
| `docs/ADDING-AN-ITEM.md` | Step by step: how to add a new component, button, section, animation or skill. |
| `generated/js/<name>/<name>.jsx` | The JavaScript version of each component, made on `pnpm dev` and `pnpm build`. |
| `generated/items/`, `app/docs/<name>/page.tsx`, `registry.json` | Made by `scripts/items.mjs` from `items/`. The page files aren't kept in git. |
| `public/r/` | The shadcn install files. `pnpm registry:build` remakes them. |
| `next.config.ts` | Redirects and the security headers every page is sent with. |

`pnpm check` runs the item checker on its own. `pnpm dev` and `pnpm build` run it first and stop with a plain message when a piece is missing.

Old `/components/...` links redirect to `/docs/...`, and `/docs/brain-map` redirects to `/docs/brain-txt`.

## Who makes it

[Vraj Sensei](https://x.com/vrajsensei), a product designer from Vadodara.

## License

[MIT](LICENSE)
