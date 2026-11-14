import { Children } from "react";
import Link from "next/link";
import { AUTHOR, COMPONENTS, FAMILIES, GITHUB, GROUPS, isSideActive, neighbours, sideItems } from "@/lib/site";
import { cx } from "@/lib/utils";
import { ArrowUpRight01Icon } from "./hugeicons";
import { GroupIcon } from "./group-icon";
import { SearchTrigger } from "./search";
import { ArrowLeft, Arrow, GitHub, Mark } from "./icons";
import { Header } from "./header";
import { Footer } from "./footer";
import { ThemeToggle } from "./theme-toggle";
import { Breadcrumbs } from "./breadcrumbs";
import { Toc } from "./toc";
import { SideDropdown } from "./side-dropdown";
import { Redraw } from "./page-redraw";

export type DocSection = { id: string; title: string };

/**
 * Desktop: the side panel on the left, on the frame colour; the page is a
 * raised sheet next to it with "On this page" on its right.
 * Phones and tablets: the top bar with the hamburger menu, then the page.
 * Leave out `slug` for the Introduction page.
 */
export function DocsLayout({
  slug,
  sections,
  children,
}: {
  slug?: string;
  sections: DocSection[];
  children: React.ReactNode;
}) {
  const current = slug ? (COMPONENTS.find((c) => c.slug === slug) ?? FAMILIES.find((f) => f.slug === slug)) : undefined;
  const family = current && "family" in current && current.family ? FAMILIES.find((f) => f.slug === current.family) : undefined;
  const { prev, next } = neighbours(slug);
  return (
    <div className="min-h-dvh lg:flex lg:bg-[var(--frame)]">
      {/* Phones and tablets: the top bar with the hamburger menu. */}
      <Header className="lg:hidden" />

      {/* Desktop: the side panel sits on the frame, next to the page sheet. */}
      <aside aria-label="Sidebar" className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col overflow-y-auto px-3 pt-4 pb-6 lg:flex">
        {/* Each part is drawn back by "Redraw this page" on the Agent-Draw docs. */}
        <Redraw>
          <Link href="/" className="flex items-center gap-2 px-2.5 py-1 text-[15px] font-semibold tracking-tight">
            <Mark className="h-6 w-[21px] text-[var(--fg)]" />
            Impeccable
          </Link>

          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="press group mt-4 mb-6 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-2.5 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))]"
          >
            <span className="btn-brand grid size-8 shrink-0 place-items-center rounded-lg">
              <Mark className="h-4 w-[14px] text-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-tight font-medium">Animation-first UI</span>
              <span className="block truncate text-[11px] text-[var(--muted)]">Open source · MIT</span>
            </span>
            <ArrowUpRight01Icon size={14} className="text-[var(--faint)] transition-colors group-hover:text-[var(--accent)]" />
          </a>

          <SideGroup title="Getting started">
            <SideLink href="/docs" active={!slug}>
              Introduction
            </SideLink>
          </SideGroup>
          {GROUPS.map((g) => {
            const items = sideItems(g.id);
            const count = COMPONENTS.filter((c) => c.group === g.id).length;
            return (
              <SideDropdown key={g.id} title={g.label} count={count} icon={<GroupIcon group={g.id} />}>
                {items.length ? (
                  items.map((c) => (
                    <SideLink
                      key={c.slug}
                      href={`/docs/${c.slug}`}
                      active={isSideActive(c.slug, slug)}
                    >
                      {c.name}
                    </SideLink>
                  ))
                ) : (
                  <p className="px-2.5 py-1.5 text-sm text-[var(--faint)]">Coming soon</p>
                )}
              </SideDropdown>
            );
          })}
        </Redraw>
      </aside>

      {/* The page itself: a raised sheet with the tab cut into its top right corner. */}
      <div className="sheet relative min-w-0 flex-1 lg:my-2 lg:mr-2 lg:rounded-2xl lg:border lg:border-[var(--line)] lg:bg-[var(--sheet)]">
        <SheetTab />
        <div className="mx-auto flex max-w-6xl justify-center gap-12 px-4 sm:px-6 lg:px-10">
          <main className="min-w-0 max-w-3xl flex-1 pt-10 pb-24 lg:pt-14">
            <Redraw>
              <Breadcrumbs
                items={
                  current
                    ? [
                        { label: "Docs", href: "/docs" },
                        { label: GROUPS.find((g) => g.id === current.group)!.label },
                        ...(family ? [{ label: family.name, href: `/docs/${family.slug}` }] : []),
                        { label: current.name },
                      ]
                    : [{ label: "Docs", href: "/docs" }, { label: "Introduction" }]
                }
              />
            </Redraw>
            {Children.map(children, (child) => (child ? <Redraw>{child}</Redraw> : child))}

            <Redraw>
              <nav className="mt-20 grid gap-3 sm:grid-cols-2" aria-label="More pages">
                {prev ? <PagerCard dir="prev" href={prev.href} name={prev.name} /> : <span className="hidden sm:block" />}
                {next && <PagerCard dir="next" href={next.href} name={next.name} />}
              </nav>
            </Redraw>
          </main>

          {/* Starts lower than the text, to leave room for the hanging bulb. */}
          <aside aria-label="On this page" className="sticky top-[9px] hidden w-44 shrink-0 self-start pt-[103px] xl:block">
            <Redraw>
              <Toc sections={sections} />
            </Redraw>
          </aside>
        </div>
        <Redraw>
          <Footer />
        </Redraw>
      </div>
    </div>
  );
}

/**
 * The tab in the sheet's top right corner, on the frame colour, like a
 * folder tab cut out of the page: Search (with the bulb theme switch
 * hanging under it), GitHub, the author.
 * It stays at the top while the page scrolls.
 */
function SheetTab() {
  return (
    <div className="pointer-events-none sticky top-[9px] z-30 hidden h-0 lg:block">
      {/* The frame band above the sheet and the sheet's rounded top edge,
          so scrolling text slides under them instead of over the frame. */}
      <div className="absolute inset-x-[-1px] -top-[9px] h-[9px] bg-[var(--frame)]" />
      {/* Frame colour behind the rounded corners, so the sheet's straight
          side lines scrolling underneath never show outside the curve. */}
      <div className="absolute inset-x-[-1px] -top-px h-4 bg-[var(--frame)]">
        <div className="size-full rounded-t-2xl border-x border-t border-[var(--line)] bg-[var(--sheet)]" />
      </div>
      <div className="pointer-events-auto absolute -top-px -right-px flex h-11 items-stretch">
        <svg className="h-11 w-10 shrink-0" viewBox="0 0 40 44" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 .5C9 .5 12 2 15 8L25 36.5C27.5 42 31 43.5 40 43.5V0H0Z" fill="var(--frame)" />
          <path d="M0 .5C9 .5 12 2 15 8L25 36.5C27.5 42 31 43.5 40 43.5" fill="none" stroke="var(--line)" />
        </svg>
        <div className="flex items-center border-b border-[var(--line)] bg-[var(--frame)] pr-1 text-[13px] text-[var(--muted)]">
          {/* Search first, then GitHub, then the author, split by thin
              dividers. The bulb takes no room in the tab: it hangs below it,
              centred under Search. The bulb's frame sits behind the Search
              button so clicks reach it. */}
          <div className="flex items-center self-stretch pr-4">
            <div className="relative flex items-center self-stretch">
              <div className="absolute inset-y-0 left-1/2 z-0 flex -translate-x-1/2">
                <ThemeToggle />
              </div>
              <SearchTrigger className="relative z-10" />
            </div>
          </div>
          <TabDivider />
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 transition-colors hover:text-[var(--fg)]"
          >
            <GitHub className="size-4" />
            GitHub
          </a>
          <TabDivider />
          <a
            href={AUTHOR.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 transition-colors hover:text-[var(--fg)]"
          >
            Built by <span className="text-[var(--fg)]">Vraj</span>
          </a>
        </div>
        {/* The sheet's rounded corner under the tab. It sits on the tab's
            bottom line, so the line stops exactly where the curve begins. */}
        <span className="absolute top-[calc(100%-1px)] right-0 size-4 bg-[var(--frame)]" aria-hidden="true">
          <span className="block size-full rounded-tr-2xl border-t border-r border-[var(--line)] bg-[var(--sheet)]" />
        </span>
      </div>
    </div>
  );
}

/** The thin line between the items in the tab. */
function TabDivider() {
  return <span className="h-4 w-px shrink-0 bg-[var(--line)]" aria-hidden="true" />;
}

function SideGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="mb-2 px-2.5 text-xs font-medium text-[var(--fg)]">{title}</p>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function SideLink({
  href,
  active,
  badge,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-medium text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
      )}
    >
      {icon && <span className={active ? "text-[var(--accent)]" : "text-[var(--faint)]"}>{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-1.5 text-[10px] leading-4 font-medium text-[var(--accent)]">
          {badge}
        </span>
      )}
    </Link>
  );
}

function PagerCard({ dir, href, name }: { dir: "prev" | "next"; href: string; name: string }) {
  return (
    <Link
      href={href}
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
