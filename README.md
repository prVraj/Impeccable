# Impeccable

Animation-first React components. Each one ships in TypeScript and JavaScript, with two prompts you can paste into any AI coding tool to add it to your project.

**[impeccable-rust.vercel.app](https://impeccable-rust.vercel.app)**

## Components

| Component | What it does |
| --- | --- |
| [Burning-Screen](https://impeccable-rust.vercel.app/components/burning-screen) | A page transition. One click burns the current screen away from the click point and reveals the next page through the hole. |
| [Agent-Draw](https://impeccable-rust.vercel.app/components/agent-draw) | A loader. Named cursors draw the page's skeleton live, top to bottom, while the data loads; then the real content fades in. |

## Add a component to your project

Every component page gives you three ways in. Pick the one that suits you.

**1. Install command.** In a project set up with [shadcn](https://ui.shadcn.com):

```bash
npx shadcn@latest add https://impeccable-rust.vercel.app/r/burning-screen.json
```

**2. Copy the code.** Copy the TypeScript or JavaScript file from the component page into your components folder.

**3. Use a prompt.** Paste one into your AI coding tool (Claude Code, Cursor and others):

- **Install prompt:** adds the exact component as shown on the site. It asks only where it should go.
- **Blend prompt:** asks a few short questions, then fits the component to your brand through the options it already has. The animation itself stays as designed.

## Every component works

- Light and dark themes.
- Phones as well as desktops.
- Reduced motion: people who turn it on get a short fade instead.
- No extra packages beyond React. Burning-Screen uses the browser's View Transitions API and WebGL; browsers without them get a short fade. Agent-Draw needs nothing beyond the DOM.

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
| `registry/impeccable/<name>/<name>.tsx` | The component source (TypeScript). |
| `generated/js/<name>/<name>.jsx` | The JavaScript version, generated on `pnpm dev` and `pnpm build`. Don't edit it by hand. |
| `lib/prompts.ts` | The Install and Blend prompts. |
| `app/components/<name>/page.tsx` | The component's page on the site. |
| `registry.json`, `public/r/` | The shadcn registry. `pnpm registry:build` regenerates `public/r/`. |

## License

[MIT](LICENSE)
