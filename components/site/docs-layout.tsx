import { Children } from "react";
import Link from "next/link";
import { COMPONENTS, GITHUB, TALK, GROUPS, isSideActive, neighbours, sideItems } from "@/lib/site";
import { cx } from "@/lib/utils";
import { ArrowUpRight01Icon } from "./hugeicons";
import { Button } from "./button";
import { Tooltip } from "./tooltip";
import { GroupIcon } from "./group-icon";
import { SearchTrigger } from "./search";
import { ArrowLeft, Arrow, GitHub, Mark } from "./icons";
import { Header } from "./header";
import { ThemeToggle } from "./theme-toggle";
import { Toc } from "./toc";
import { SideDropdown } from "./side-dropdown";
import { Redraw } from "./page-redraw";
import { NewChip } from "./new-chip";

export type DocSection = { id: string; title: string };

/**
 * Desktop: the side panel on the left, on the frame colour; the page is a
 * raised sheet next to it with "On this page" on its right.
 * Phones and tablets: the top bar with the hamburger menu, then the page.
 * Leave out `slug` for the Introduction page. A page outside /docs (like /components) passes its
 * `page` address instead. `wide` gives the page the whole sheet (no "On this page"), for a card grid.
 */
export function DocsLayout({
  slug,
  page,
  wide,
  sections,
  children,
}: {
  slug?: string;
  page?: string;
  wide?: boolean;
  sections: DocSection[];
  children: React.ReactNode;
}) {
  const { prev, next } = neighbours(slug, page);
  return (
    <div className="min-h-dvh lg:flex lg:bg-[var(--frame)]">
      {/* Phones and tablets: the top bar with the hamburger menu. */}
      <Header className="lg:hidden" />

      {/* Desktop: the side panel sits on the frame, next to the page sheet. */}
      <aside aria-label="Sidebar" className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col lg:flex">
        {/* Each part is drawn back by "Redraw this page" on the Agent Draw docs.
            The logo and the card stay put; only the list under the divider scrolls. */}
        <div className="shrink-0 px-3 pt-4">
          <Redraw>
            <Link href="/" className="flex items-center gap-2 px-2.5 py-1 text-[15px] font-semibold tracking-tight">
              <Mark className="h-6 w-[21px] text-[var(--fg)]" />
              Impeccable
            </Link>

            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="press group mt-4 mb-4 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--sheet)] p-2.5 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))]"
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
          </Redraw>
        </div>
        <div className="mx-3 h-px shrink-0 bg-[var(--line)]" aria-hidden="true" />
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pt-5 pb-6">
          <Redraw>
            <SideGroup title="Getting started">
              <SideLink href="/docs" active={!slug && !page}>
                Introduction
              </SideLink>
              <SideLink href="/components" active={page === "/components"}>
                All components
              </SideLink>
            </SideGroup>
            {GROUPS.map((g) => {
              const items = sideItems(g.id);
              const count = COMPONENTS.filter((c) => c.group === g.id).length;
              return (
                <SideDropdown key={g.id} group={g.id} title={g.label} count={count} icon={<GroupIcon group={g.id} />}>
                  {items.length ? (
                    items.map((c) => (
                      <SideLink
                        key={c.slug}
                        href={`/docs/${c.slug}`}
                        active={isSideActive(c.slug, slug)}
                        badge={<NewChip slug={c.slug} />}
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
        </div>
      </aside>

      {/* The page itself: a raised sheet with the tab cut into its top right corner. */}
      <div className="sheet relative min-w-0 flex-1 lg:my-2 lg:mr-2 lg:rounded-2xl lg:border lg:border-[var(--line)] lg:bg-[var(--sheet)]">
        <SheetTab />
        {/* The text starts 40px in from the sheet's left edge at every width (not centred, so wide screens
            don't leave a big gap on the left), and "On this page" sits at the right edge. */}
        {/* Plain CSS rather than new Tailwind classes, so a running pnpm dev picks it up straight away. */}
        <style>{`@media (min-width: 80rem) { .docs-main { padding-top: 3rem; } .docs-toc { position: sticky; top: 8px; height: calc(100dvh - 16px); display: flex; flex-direction: column; justify-content: center; width: 13rem; padding-block: 112px; margin-right: 38px; } } .docs-toc-list { min-height: 0; max-height: 100%; overflow-y: auto; }`}</style>
        <div className="flex gap-12 px-4 sm:px-6 lg:px-10">
          {/* 1024 to 1279px: the title starts lower so a long one clears the hanging bulb. From 1280px the
              bulb sits right of the text, so the title moves up close to the top of the sheet. */}
          <main className={cx("docs-main min-w-0 flex-1 pt-12 pb-24 lg:pt-23", wide ? "max-w-6xl" : "max-w-3xl")}>
            {Children.map(children, (child) => (child ? <Redraw>{child}</Redraw> : child))}

            <Redraw>
              <nav className="mt-20 grid gap-3 sm:grid-cols-2" aria-label="More pages">
                {prev ? <PagerCard dir="prev" href={prev.href} name={prev.name} /> : <span className="hidden sm:block" />}
                {next && <PagerCard dir="next" href={next.href} name={next.name} />}
              </nav>
            </Redraw>
          </main>

          {/* Centred top to bottom in the visible sheet while the page scrolls, and its left line sits right
              under the bulb's wire (Toc fine-tunes the right margin), so it reads as hanging from the tab.
              13rem wide so 16px section names fit on one line; it grows into the free space right of it.
              112px of room above and below keeps it clear of the tab and the bulb; a list too long for a
              short screen scrolls inside itself (no scrollbar) instead of running off the page. */}
          {!wide && (
            <aside aria-label="On this page" className="docs-toc ml-auto hidden shrink-0 self-start xl:block">
              <div className="docs-toc-list no-scrollbar">
                <Redraw>
                  <Toc sections={sections} />
                </Redraw>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The tab in the sheet's top right corner, on the frame colour, like a
 * folder tab cut out of the page: Search (with the bulb theme switch
 * hanging under it), GitHub, Talk to Vraj. GitHub and Talk to Vraj show a
 * small hint on hover.
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
          {/* Search first, then GitHub, then the Talk to Vraj button, split by thin
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
          <Tooltip label="star if you are human">
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              data-cta-sound
              className="flex items-center gap-1.5 self-stretch px-4 transition-colors hover:text-[var(--fg)]"
            >
              <GitHub className="size-4" />
              GitHub
            </a>
          </Tooltip>
          <TabDivider />
          <Tooltip label="Improve your product!" align="end" className="pr-1 pl-3">
            <Button href={TALK} size="xs" data-cta-sound>
              Talk to Vraj
            </Button>
          </Tooltip>
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
  badge?: React.ReactNode;
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
      <span className="min-w-0 flex-1">{children}</span>
      {badge}
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
