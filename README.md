# Impeccable

Animations and skills that fit your product like the missing piece of a puzzle. Before your AI tool builds anything, it asks you a few questions, so what you get feels made for you.

**[impeccable-rust.vercel.app](https://impeccable-rust.vercel.app)** · Docs start at [/docs](https://impeccable-rust.vercel.app/docs)

## What's inside

The library has three parts.

### Animations

| Animation | What it does |
| --- | --- |
| [Agent-Draw](https://impeccable-rust.vercel.app/docs/agent-draw) | A loader. Named cursors draw the page's skeleton live, top to bottom, while the data loads; then the real content fades in. |
| [Burning-Screen](https://impeccable-rust.vercel.app/docs/burning-screen) | A page transition. One click burns the current screen away from the click point and reveals the next page through the hole. |

### Skills

| Skill | What it does |
| --- | --- |
| [UI-tongue](https://impeccable-rust.vercel.app/docs/ui-tongue) | Learns your UI taste in about 15 minutes and writes you your own UI skill, so a one-line prompt comes out in your style. |

### Components

Coming soon.

## Add an animation to your project

Every animation page gives you three ways in.

**1. Install command.** In a project set up with [shadcn](https://ui.shadcn.com):

```bash
npx shadcn@latest add https://impeccable-rust.vercel.app/r/agent-draw.json
```

**2. Copy the code.** Copy the TypeScript or JavaScript file from the page into your components folder.

**3. Use a prompt.** Paste one into your AI coding tool (Claude Code, Cursor, v0 and others):

- **Install prompt:** adds the exact animation as shown on the site. It only asks where it should go.
- **Blend prompt:** your agent asks you a few short questions first, then fits it to your brand with your colors, names and words. The motion stays as designed.

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

| Path | What it is |
| --- | --- |
| `registry/impeccable/<name>/<name>.tsx` | An animation's source (TypeScript). |
| `generated/js/<name>/<name>.jsx` | The JavaScript version, generated on `pnpm dev` and `pnpm build`. Don't edit it by hand. |
| `lib/prompts.ts` | The Install and Blend prompts. |
| `lib/site.ts` | The list of everything in the library and which part it belongs to. |
| `app/docs/<name>/page.tsx` | Each item's docs page. `app/docs/page.tsx` is the Introduction. |
| `skills/<name>/` | A skill's source files. The download lives in `public/downloads/`. |
| `registry.json`, `public/r/` | The shadcn registry. `pnpm registry:build` regenerates `public/r/`. |

Old `/components/...` links redirect to `/docs/...`.

## Who makes it

[Vraj Sensei](https://x.com/vrajsensei), a product designer from Vadodara.

## License

[MIT](LICENSE)
