import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ComponentCard } from "@/components/site/component-card";
import { COMPONENTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Components · Impeccable",
  description: "Every Impeccable component, with a live demo, the code and two prompts.",
};

const STEPS = [
  ["Pick one", "Open a component and play with the live demo before you commit to it."],
  ["Install it your way", "One shadcn command, a copy of the TS or JS file, or the Install prompt for your AI tool."],
  ["Blend it in", "The Blend prompt asks a few short questions, then fits it to your brand. The motion stays as designed."],
] as const;

export default function ComponentsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Components" }]} />
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Components</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Each one does one thing well. Open it to play, then take the code or a prompt.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {COMPONENTS.map((c) => (
            <ComponentCard key={c.slug} c={c} />
          ))}
        </div>

        <ol className="mt-16 grid gap-5 border-t border-[var(--line)] pt-10 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="font-mono text-xs text-[var(--faint)]">0{i + 1}</span>
              <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </>
  );
}
