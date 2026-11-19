# Build and look

Read this at step 8.

## Build

Run the build command. It finishes with no errors and no new warnings. Then start the built site (not the dev server): `next start`, `vite preview`, `astro preview`, or serve the output folder.
Why: the built site is what visitors get; the dev server hides some errors and shows others that never ship.

## Look

Open every page in light and dark mode (if the site has both), at 1280px and 375px wide. Check that:

- nothing looks broken, nothing scrolls sideways at the phone width, and every animation moves the way it did,
- the browser console has no red errors and no "Refused to load" or "Content Security Policy" messages,
- buttons, forms, copy buttons and menus still work, by mouse and by keyboard (Tab, Enter, Esc),
- with reduced motion turned on, the page still works and nothing is stuck halfway.

If you have a browser tool (Playwright, a built-in browser), use it and take screenshots; open every screenshot you take. If you don't, say so in the handover and list the pages the person should open.

To confirm the headers on the running build, run this in the browser console on any page:

```js
const r = await fetch(location.href, { method: "HEAD" }); [...r.headers].filter(([k]) => /security|frame|nosniff|referrer|permissions|opener/.test(k))
```

Stop the server when done.

## What needs a real device

Headless browsers are Chromium. Safari on a Mac and a real iPhone or Android phone can differ (clipboard, video autoplay, `100vh`, backdrop blur). Name these in the handover when the work touches them.
