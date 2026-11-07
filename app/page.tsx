import Link from "next/link";
import { Header } from "@/components/site/header";

const components = [
  {
    slug: "burning-screen",
    name: "Burning-Screen",
    blurb: "One click burns the screen away and reveals the next page.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">Impeccable</p>
        <h1 className="mt-3 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          Motion that makes an interface feel made.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          Animation-first React components. Every one ships in TypeScript and JavaScript, with an
          install prompt and a blend prompt for your own AI tool.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 transition-colors hover:border-[var(--fg)]/30"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight">{c.name}</h2>
                <span className="text-sm text-[var(--muted)] transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
