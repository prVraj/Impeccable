<p align="center">
  <a href="https://impeccableui.vercel.app">
    <img src="app/icon.svg" width="64" height="64" alt="Impeccable UI logo" />
  </a>
</p>

<h1 align="center">Impeccable UI</h1>

<p align="center">
  Animated React components, buttons, page sections and AI skills,<br />
  made to fit your product like the missing piece of a puzzle.
</p>

<p align="center">
  <a href="https://impeccableui.vercel.app"><strong>Website</strong></a> ·
  <a href="https://impeccableui.vercel.app/docs">Docs</a> ·
  <a href="https://x.com/vrajsensei">Follow on X</a> ·
  <a href="LICENSE">MIT License</a>
</p>

---

## Let's make something for Humans once again

Screens are easy to make now. Feeling is not.

AI tools can build a working page in seconds, and most of those pages look the same. What they rarely get right is the part people remember: how a button answers your pointer, how a page leaves, how a loader keeps you company while you wait.

Impeccable UI is a free, open-source library of those moments. Every piece is designed and tuned by hand, then shipped with the code and two prompts, so you, or your AI tool, can add it to your product and have it feel exactly as it was meant to.

## What's in the library

The library has five parts. Browse all of them, with live previews, at **[impeccableui.vercel.app](https://impeccableui.vercel.app)**.

- **Components:** building blocks with motion built in, like toasts, upload fields and password meters.
- **Buttons:** buttons that react to the person using them.
- **Sections:** whole page blocks, like login pages, grouped into families.
- **Animations:** moments that play across a page: loaders, transitions, refreshes.
- **Skills:** files you give your AI tool so it works your way.

New pieces are added often. The website is always the up-to-date list.

## Why it exists

Most component libraries hand you a component and stop there. Then you spend your time bending it to match your product, and even when your AI agent knows your project well, the result often looks like a piece taken from somewhere else.

Impeccable UI works the other way round. Before your AI tool writes any code, the prompt has it ask you a few short questions about your brand and where the piece should live. Your answers shape it, so it fits into your product like it was always meant to be there.

The skills take the same idea one step further. They teach your AI tool your taste once, so even a one-line request comes out looking like you made it.

## What you get

Every component, button, section and animation page gives you the same things:

- **A live preview.** Play with it first, and check it at desktop, tablet and phone width. If it doesn't make you feel something there, it won't in your app either.
- **The code, in TypeScript and JavaScript.** One file you own. Read it, copy it, change it. Nothing is hidden inside a package.
- **One install command** for projects set up with [shadcn](https://ui.shadcn.com).
- **Two prompts** for Claude Code, Cursor, v0 or any AI coding tool:
  - **Install** adds it exactly as you see it on the site. It only asks where it should go.
  - **Blend** asks you a few short questions first, then builds it with your colors, names and words. The motion stays as designed.

## The value for you

- **Stand out.** Your product feels made with care, not assembled from the same kit as everyone else's.
- **Save the tuning time.** Timing, easing, edge cases, light and dark, small screens and reduced motion are already worked out.
- **Keep your brand.** Blend fits each piece to your colors and your words, not ours.
- **Stay light.** No extra packages beyond React. You get plain code you can read and keep.
- **Use it anywhere.** Free and MIT licensed, for client work, products and anything else.

## Quick start

Open any page on the [website](https://impeccableui.vercel.app/docs) and pick one of three ways in.

**1. Install command.** In a project set up with shadcn, run the command shown on the page. It looks like this:

```bash
npx shadcn@latest add https://impeccableui.vercel.app/r/<name>.json
```

**2. Copy the code.** Copy the TypeScript or JavaScript file into your components folder.

**3. Paste a prompt.** Copy the Install or Blend prompt into your AI coding tool and answer its questions.

Skills are a download: get the zip from the skill's page and add it to Claude (Settings, then Skills) or unzip it into `~/.claude/skills`.

## Promises

- Everything is original. Nothing here is a copy of someone else's work.
- Works in light and dark mode, and on phones. Both themes and small screens are tested before anything ships.
- Respects reduced motion. People who ask for less movement get less movement.
- No extra packages beyond React.
- The Blend prompt changes how a piece looks, never how it moves.

## Who makes it

Hi, I'm **Vraj Parikh**, known online as **Vraj Sensei**: a product designer from Vadodara, India. I design and build every piece of Impeccable UI myself.

I started it because I wanted the things people make with AI to feel personal again. Impeccable is where I put the details I care about most: the timing of a motion, the weight of a shadow, the way a button answers when you come close.

Say hi or follow along as new pieces land:

[X](https://x.com/vrajsensei) · [LinkedIn](https://www.linkedin.com/in/vraj-parikh-b64b61257/) · [YouTube](https://www.youtube.com/@SenseiVraj) · [Peerlist](https://peerlist.io/vrajsensei) · [GitHub](https://github.com/prVraj)

## Feedback and ideas

Found something broken, or have an idea for a new piece? [Open an issue](https://github.com/prVraj/Impeccable/issues) or message me on [X](https://x.com/vrajsensei).

## Run the website locally

You need Node.js 20 or newer and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/prVraj/Impeccable.git
cd Impeccable
pnpm install
pnpm dev
```

Then open http://localhost:3000. Each piece lives in its own folder under `items/`, and [docs/ADDING-AN-ITEM.md](docs/ADDING-AN-ITEM.md) explains how to add a new one.

Built with React, TypeScript, Tailwind CSS v4 and Next.js.

## License

[MIT](LICENSE). Free to use in personal and commercial projects.
