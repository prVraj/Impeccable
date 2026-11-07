import Link from "next/link";
import { COMPONENTS, neighbours } from "@/lib/site";
import { cx } from "@/lib/utils";
import { ArrowLeft, Arrow } from "./icons";
import { Breadcrumbs } from "./breadcrumbs";
import { Toc } from "./toc";

export type DocSection = { id: string; title: string };

/** Sidebar on the left, the page in the middle, "On this page" on the right. */
export function DocsLayout({
  slug,
  sections,
  children,
}: {
  slug: string;
  sections: DocSection[];
  children: React.ReactNode;
}) {
  const current = COMPONENTS.find((c) => c.slug === slug)!;
  const { prev, next } = neighbours(slug);
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 sm:px-6">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-10 lg:block">
        <SideGroup title="Getting started">
          <SideLink href="/">Introduction</SideLink>
          <SideLink href="/components">All components</SideLink>
        </SideGroup>
        <SideGroup title="Components">
          {COMPONENTS.map((c) => (
            <SideLink key={c.slug} href={`/components/${c.slug}`} active={c.slug === slug} badge={c.isNew ? "New" : undefined}>
              {c.name}
            </SideLink>
          ))}
        </SideGroup>
      </aside>

      <main className="min-w-0 flex-1 pt-10 pb-24">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Components", href: "/components" },
            { label: current.category },
          ]}
        />
        {children}

        <nav className="mt-20 grid gap-3 sm:grid-cols-2" aria-label="More components">
          {prev ? <PagerCard dir="prev" slug={prev.slug} name={prev.name} /> : <span className="hidden sm:block" />}
          {next && <PagerCard dir="next" slug={next.slug} name={next.name} />}
        </nav>
      </main>

      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-44 shrink-0 py-10 xl:block">
        <Toc sections={sections} />
      </aside>
    </div>
  );
}

function SideGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="mb-2 px-2.5 text-xs font-medium text-[var(--fg)]">{title}</p>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function SideLink({ href, active, badge, children }: { href: string; active?: boolean; badge?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-medium text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
      )}
    >
      {children}
      {badge && (
        <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-1.5 text-[10px] leading-4 font-medium text-[var(--accent)]">
          {badge}
        </span>
      )}
    </Link>
  );
}

function PagerCard({ dir, slug, name }: { dir: "prev" | "next"; slug: string; name: string }) {
  return (
    <Link
      href={`/components/${slug}`}
      className={cx("card press group flex flex-col gap-1 rounded-xl px-4 py-3.5", dir === "next" && "items-end text-right sm:col-start-2")}
    >
      <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
        {dir === "prev" && <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />}
        {dir === "prev" ? "Previous" : "Next"}
        {dir === "next" && <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
      </span>
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
}
