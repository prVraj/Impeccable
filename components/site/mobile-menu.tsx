"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPONENTS, GROUPS, isSideActive, sideItems, type Group } from "@/lib/site";
import { cx } from "@/lib/utils";
import { GroupIcon } from "./group-icon";
import { Mark } from "./icons";

/** The part of the library the page belongs to, so its dropdown can start open. */
function groupOf(pathname: string | null): Group | undefined {
  const slug = pathname?.replace(/^\/docs\//, "");
  return GROUPS.find((g) => sideItems(g.id).some((i) => isSideActive(i.slug, slug)))?.id;
}

/**
 * Phones and tablets only (the sidebar shows from `lg` up).
 * Three lines in the header open a full-screen menu: logo and a close X on
 * top, then Introduction and one dropdown for each part of the library
 * (Components, Buttons, Sections, Skills, Animations). Only the dropdown
 * holding the current page starts open, so every part is one tap away
 * instead of at the end of a long scroll.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Group[]>(() => {
    const g = groupOf(pathname);
    return g ? [g] : [];
  });

  useEffect(() => setMounted(true), []);
  // Close when the page changes, and open only the new page's dropdown.
  useEffect(() => {
    setOpen(false);
    const g = groupOf(pathname);
    setOpenGroups(g ? [g] : []);
  }, [pathname]);

  const toggleGroup = (id: Group) =>
    setOpenGroups((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Stop the page behind from scrolling while the menu is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Close if the screen grows to desktop size, where the sidebar takes over.
    const wide = matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  let i = 0; // counts rows so they can come in one after another
  const row = () => ({ style: { "--i": i++ } as React.CSSProperties });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="press -mr-2 grid size-9 place-items-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--fg)] lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            inert={!open}
            data-open={open || undefined}
            className="mobile-menu fixed inset-0 z-50 flex flex-col bg-[var(--bg)] lg:hidden"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--line)] px-4 sm:px-6">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                <Mark className="h-6 w-[21px] text-[var(--fg)]" />
                Impeccable
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="press -mr-2 grid size-9 place-items-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-12 sm:px-6" aria-label="Docs">
              <div {...row()} className="mobile-menu-row">
                <MenuLink href="/docs" active={pathname === "/docs"} onPick={() => setOpen(false)}>
                  Introduction
                </MenuLink>
              </div>

              <div className="mt-4 flex flex-col">
                {GROUPS.map((g) => {
                  const items = sideItems(g.id);
                  const count = COMPONENTS.filter((c) => c.group === g.id).length;
                  const isOpen = openGroups.includes(g.id);
                  const listId = `mobile-menu-${g.id}`;
                  return (
                    <section key={g.id}>
                      <button
                        type="button"
                        {...row()}
                        onClick={() => toggleGroup(g.id)}
                        aria-expanded={isOpen}
                        aria-controls={listId}
                        className="mobile-menu-row flex min-h-12 w-full items-center justify-between gap-3 text-left text-lg font-medium tracking-tight text-[var(--fg)]"
                      >
                        <span className="flex items-center gap-2.5">
                          <GroupIcon group={g.id} size={18} className="shrink-0 text-[var(--muted)]" />
                          {g.label}
                          <span className="font-mono text-[11px] font-normal text-[var(--faint)]">{count}</span>
                        </span>
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          className={cx(
                            "size-4 shrink-0 text-[var(--muted)] transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
                            isOpen && "rotate-90",
                          )}
                        >
                          <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div
                        id={listId}
                        className={cx(
                          "grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden" inert={!isOpen}>
                          {/* Thin guide line under the icon, down to the last item, like the desktop sidebar. */}
                          <div className="mb-2 ml-[8.5px] border-l border-[var(--line)] pl-[18.5px]">
                            {items.length ? (
                              items.map((c) => (
                                <div key={c.slug} {...(isOpen ? row() : {})} className="mobile-menu-row">
                                  <MenuLink
                                    href={`/docs/${c.slug}`}
                                    active={isSideActive(c.slug, pathname?.replace(/^\/docs\//, ""))}
                                    onPick={() => setOpen(false)}
                                    small
                                  >
                                    {c.name}
                                  </MenuLink>
                                </div>
                              ))
                            ) : (
                              <p className="py-2.5 text-base text-[var(--faint)]">Coming soon</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuLink({
  href,
  active,
  badge,
  small,
  onPick,
  children,
}: {
  href: string;
  active?: boolean;
  badge?: string;
  small?: boolean;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onPick}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-2 tracking-tight transition-colors",
        small ? "min-h-11 text-base" : "py-2 text-lg",
        active ? "font-medium text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
      )}
    >
      {active && <span className="size-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />}
      {children}
      {badge && (
        <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-1.5 text-[10px] leading-4 font-medium text-[var(--accent)]">
          {badge}
        </span>
      )}
    </Link>
  );
}
