# Adding an item

An item is anything in the library: a component, a button, a loader, a section, an animation or a skill. Each one lives in its own folder, `items/<name>/`, and has one line in `items/list.ts`. The sidebar, search, docs page, home iMac and install file all read from there.

Use lowercase words joined by dashes for the name, like `price-slider`. It becomes the web address (`/docs/price-slider`) and the install file name.

## Steps

1. **Copy the closest item.** For a component, copy `items/password-strength/` to `items/price-slider/`. For a button, copy `items/peter-tingle-button/`. For a loader, copy `items/tug-of-work-loader/`. For a login page, copy `items/hex-login/`. Rename the component file to match the folder: `items/price-slider/price-slider.tsx`.
2. **Build the component** in `price-slider.tsx`. This is the file people install, so it only imports React.
3. **Fill in `info.ts`**:
   - `slug`: the folder name.
   - `name`: how it is written on the site, like `Price-Slider`.
   - `group`: `components`, `buttons`, `loaders`, `sections`, `animations` or `skills`. Every button goes in `buttons` and every loader or progress bar in `loaders`, never in `components`.
   - `family`: only for a variant inside a family page, like `login-pages`.
   - `blurb`: one short line for the docs home, search and family cards.
   - `description`: two lines at most, used under the page title, as the meta description and in the install file. Follow the descriptions skill.
   - `tags`: the small labels under the title.
   - `added`: now, as `"2026-11-12 14:30"`. The newest item shows first in search and in the home page's New pill.
   - `seo`: `{ keyword, title }`, the words people search for it. `title` goes in the browser tab as "<name>: <title> | Impeccable UI" (65 characters at most), like `"Fire Page Transition for React"`. The visible name never changes.
4. **Write `demo.tsx`**, the live preview. Use the secondary pill button, never the brand button. Use `@min-[40rem]:` instead of `sm:` so it reacts to the preview width. A family member's `demo.tsx` also exports `Thumb`, the picture on the family page's card.
5. **Write `tv.tsx`**, its channel on the home iMac. Draw it inside `<Screen>` from `components/site/tv-screen`.
6. **Write `docs.tsx`**, the page: Showcase (preview, install bar, hint), then Types or Position if it has variants, then Prompts, Usage and Props. The title, description and tags come from `info.ts`.
7. **Write `prompts.ts`**: `installPrompt` and `blendPrompt`, following the prompts skill. Skills have no prompts, so skip this for a skill.
8. **Add one line** to `items/list.ts`, where it should sit in the sidebar.
9. **Run `pnpm dev`.** The checker runs first. If a piece is missing it stops and says which, for example `price-slider: tv.tsx is missing (its channel on the home iMac; without it the TV goes blank)`.
10. **Run `pnpm registry:build`** so the install command works. Leave `README.md` alone: it describes the project, not each item, and the website is the list.
11. **Before you push**, run the edge-case check, then the pre-push check.

## A skill

A skill's folder holds only `info.ts` and `docs.tsx`. Its files live in `skills/<name>/` and its zip in `public/downloads/`.

## A family page

A family page (like Login pages) is one sidebar entry that lists all its variants. Its `info.ts` has `kind: "family"` and its folder holds `info.ts` and `docs.tsx`. Each variant points back with `family: "<family name>"`.

## Changing or removing an item

To change an item, open its folder: everything it uses is there. To remove one, delete its folder and its line in `items/list.ts`.

Never edit `generated/`, `public/r/`, `registry.json` or `app/docs/<name>/page.tsx`. They are rewritten every time.
