import Link from "next/link";
import { Header } from "@/components/site/header";
import { IMac } from "@/components/site/imac";
import { Arrow, GitHub } from "@/components/site/icons";
import { AUTHOR, COMPONENTS, GITHUB } from "@/lib/site";

/** One screen, nothing to scroll: the promise, two ways in. */
export default function Home() {
  const latest = COMPONENTS.find((c) => c.isNew) ?? COMPONENTS[0];
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="relative flex flex-1 items-center overflow-hidden">
        <div
          className="dots fade-edges pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link
              href={`/docs/${latest.slug}`}
              className="card press group inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[13px]"
            >
              <span className="btn-brand rounded-full px-2 py-0.5 text-[11px] font-medium">
                New
              </span>
              <span className="text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                {latest.name}
              </span>
              <Arrow className="size-3.5 text-[var(--muted)] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-8 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl xl:text-7xl">
              Let&apos;s make something for Humans once again.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-[var(--muted)] sm:text-lg">
              Screens are easy to make now. Feeling is not. Impeccable is a
              small set of React animations made with care, each with the code
              and two prompts so your AI tool builds it exactly as it was meant
              to feel.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/docs"
                className="press inline-flex h-11 items-center gap-2 rounded-full btn-brand px-5 text-sm font-medium"
              >
                Browse components
                <Arrow className="size-4" />
              </Link>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="card press inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
              >
                <GitHub />
                Star on GitHub
              </a>
            </div>
          </div>
          <IMac />
        </div>
      </main>
      <footer className="relative px-4 pb-6 text-center text-xs text-[var(--faint)]">
        Built by{" "}
        <a
          href={AUTHOR.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted)] hover:text-[var(--fg)]"
        >
          {AUTHOR.name}
        </a>
        . Free and open source.
      </footer>
    </div>
  );
}
