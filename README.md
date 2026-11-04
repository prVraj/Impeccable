# Impeccable

Animation-first React components. Each one ships in TypeScript and JavaScript, with an Install prompt and a Recreate prompt.

## Run it on your Mac

You need Node.js 20 or newer and pnpm. In Terminal:

1. Type `node -v`. If it says "command not found", install the LTS version from [nodejs.org](https://nodejs.org).
2. Type `pnpm -v`. If it says "command not found", run `npm install -g pnpm` once.

Then:

```bash
cd ~/Desktop/Impeccable
pnpm install
pnpm dev
```

Open http://localhost:3000. Stop the server with `Ctrl + C`.

- Docs page: http://localhost:3000/components/burning-screen
- Sign-up demo: http://localhost:3000/demo/signup

Use Chrome, Edge, Arc or Safari 18+ for the full burn. Older browsers get a short fade.

## Where things live

| Path | What it is |
| --- | --- |
| `registry/impeccable/burning-screen/burning-screen.tsx` | The component (TypeScript). The source of truth. |
| `generated/js/burning-screen/burning-screen.jsx` | JavaScript copy, generated automatically on `pnpm dev` / `pnpm build`. Don't edit by hand. |
| `lib/prompts.ts` | The Install and Recreate prompts. |
| `app/components/burning-screen/page.tsx` | The docs page. |
| `app/demo/` | The sign-up to welcome demo flow. |
| `registry.json`, `public/r/` | The install registry (`pnpm registry:build` regenerates `public/r/`). |

## Adding a component

1. Put the TypeScript file in `registry/impeccable/<name>/<name>.tsx`.
2. Add it to `registry.json`.
3. Add a docs page in `app/components/<name>/page.tsx` and its prompts in `lib/prompts.ts`.
