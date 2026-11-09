import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede } from "@/components/site/doc-parts";
import { Arrow } from "@/components/site/icons";
import { AUTHOR, COMPONENTS, GITHUB, GROUPS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Introduction · Impeccable",
  description: "Why Impeccable exists, what every component comes with, and how the Install and Blend prompts fit it to your product.",
};

const SECTIONS = [
  { id: "why", title: "Why it exists" },
  { id: "name", title: "The name" },
  { id: "three-parts", title: "Three parts" },
  { id: "what-you-get", title: "What you get" },
  { id: "install-or-blend", title: "Install or Blend" },
  { id: "who-for", title: "Who it's for" },
  { id: "promises", title: "Promises" },
  { id: "inside", title: "What's inside" },
  { id: "who", title: "Who makes it" },
];

const GETS: [string, string][] = [
  ["A live preview", "Play with it before you take it. If it doesn't make you feel something here, it won't in your app either."],
  ["One install command", "Works in any project set up with shadcn. No extra packages needed."],
  ["The code, TS and JS", "One file you own. Copy it, read it, change it. Nothing is hidden behind a package."],
  ["Two prompts", "Paste one into Claude Code, Cursor or v0, and your AI tool builds it the way it was meant to feel."],
];

const PARTS: [string, string][] = [
  ["Animations", "Moments of motion you drop into a page: a loader, a page transition. Each comes with code and two prompts."],
  ["Skills", "Files you give your AI tool so it works your way. Download one, add it to Claude, and it does the rest."],
  ["Components", "Bigger building blocks with motion built in. The first ones are on their way."],
];

const PROMISES = [
  "Everything is original. Nothing here is a copy of someone else's work.",
  "Works in light and dark, and on phones. I test both themes and small screens before anything ships.",
  "Respects reduced motion. If someone has asked for less movement, they get less movement.",
  "Free and MIT licensed. Use it in client work, products, anything.",
  "The Blend prompt changes how an animation looks, never how it moves.",
];

export default function DocsIntroduction() {
  return (
    <>
      <Header />
      <DocsLayout sections={SECTIONS}>
        <div className="mt-4">
          <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Introduction</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-[var(--muted)] sm:text-lg">
            Impeccable is a library of animations and skills that fit your product like the missing
            piece of a puzzle. Before your AI tool builds anything, it asks you a few questions, so
            what you get feels made for you, not borrowed from someone else.
          </p>
        </div>

        <DocSection id="why" title="Why it exists">
          <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-pretty text-[var(--muted)]">
            <p>
              I wanted people to get things that feel personal. Most component libraries hand you a
              component and stop there. Then you spend time changing it to match your project, and
              even when your AI agent knows your project well, the result often looks like a piece
              taken from somewhere else.
            </p>
            <p>
              Impeccable works the other way round. Before your agent writes any code, the prompt
              has it ask you, the person, a few short questions about your brand and where it should
              go. Your answers shape the component, so it fits into your product like a puzzle piece
              that was always meant to be there.
            </p>
            <p>
              The skills take the same idea one step further. UI-tongue learns your taste once, so
              even a one-line prompt like &ldquo;make me a hero section&rdquo; comes out looking
              like you made it.
            </p>
            <p className="text-[var(--fg)]">Let&apos;s make something for Humans once again.</p>
          </div>
        </DocSection>

        <DocSection id="name" title="The name">
          <p className="max-w-2xl text-[15px] leading-relaxed text-pretty text-[var(--muted)]">
            Impeccable means perfect, without a flaw. It&apos;s the bar I hold every component to
            before it ships: every detail of the motion is worked out here, so you don&apos;t have
            to.
          </p>
        </DocSection>

        <DocSection id="three-parts" title="Three parts">
          <Lede>The sidebar splits the library into three parts, so it stays easy to find your way as it grows.</Lede>
          <div className="grid gap-3 sm:grid-cols-3">
            {PARTS.map(([title, text]) => (
              <div key={title} className="card rounded-xl p-4">
                <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="what-you-get" title="What you get">
          <Lede>Every animation page has the same four things, in the same order.</Lede>
          <div className="grid gap-3 sm:grid-cols-2">
            {GETS.map(([title, text], i) => (
              <div key={title} className="card rounded-xl p-4">
                <span className="font-mono text-xs text-[var(--faint)]">0{i + 1}</span>
                <h3 className="mt-2 text-[15px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="install-or-blend" title="Install or Blend">
          <Lede>Every animation comes with two prompts. Pick the one that matches what you want from it.</Lede>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card rounded-xl p-5">
              <h3 className="text-[15px] font-semibold tracking-tight">Install</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                You want it exactly as you see it here. The prompt adds the component as it is and
                only asks where it should go.
              </p>
            </div>
            <div className="card rounded-xl p-5">
              <h3 className="text-[15px] font-semibold tracking-tight">Blend</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                You want it to feel like it was always part of your product. Your agent asks you a few
                short questions first, then builds it with your colors, names and words. The motion
                stays as designed.
              </p>
            </div>
          </div>
        </DocSection>

        <DocSection id="who-for" title="Who it's for">
          <p className="max-w-2xl text-[15px] leading-relaxed text-pretty text-[var(--muted)]">
            Every product owner and brand that wants to stand out in public. If people will see
            your product and you want them to remember it, these are for you, whether you write the
            code yourself or let an AI tool do it.
          </p>
        </DocSection>

        <DocSection id="promises" title="Promises">
          <ul className="max-w-2xl space-y-2.5 text-[15px] leading-relaxed text-[var(--muted)]">
            {PROMISES.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection id="inside" title="What's inside">
          <Lede>
            Everything in the library today. New pieces arrive when they&apos;re ready, not on a
            schedule.
          </Lede>
          <div className="card divide-y divide-[var(--line)] overflow-hidden rounded-xl">
            {COMPONENTS.map((c) => (
              <Link
                key={c.slug}
                href={`/docs/${c.slug}`}
                className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--panel-2)]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium tracking-tight">{c.name}</span>
                    <span className="text-xs text-[var(--faint)]">
                      {GROUPS.find((g) => g.id === c.group)!.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{c.blurb}</p>
                </div>
                <Arrow className="size-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </DocSection>

        <DocSection id="who" title="Who makes it">
          <p className="max-w-2xl text-[15px] leading-relaxed text-pretty text-[var(--muted)]">
            I&apos;m{" "}
            <a href={AUTHOR.href} target="_blank" rel="noopener noreferrer" className="text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]">
              Vraj Sensei
            </a>
            , a product designer from Vadodara, and I make every piece of Impeccable myself. Impeccable is where I put the details I care about
            most. If something breaks or you have an idea, open an issue on{" "}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]">
              GitHub
            </a>{" "}
            or say hi on X.
          </p>
        </DocSection>
      </DocsLayout>
      <Footer />
    </>
  );
}
