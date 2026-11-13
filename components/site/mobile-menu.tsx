"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPONENTS, GROUPS, isSideActive, sideItems } from "@/lib/site";
import { cx } from "@/lib/utils";
import { Mark } from "./icons";

/**
 * Phones and tablets only (the sidebar shows from `lg` up).
 * Three lines in the header open a full-screen menu: logo and a close X on
 * top, then Introduction and the list for each part of the library (Components, Buttons, Sections, Skills, Animations).
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  // Close when the page changes.
  useEffect(() => setOpen(false), [pathname]);

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

              {GROUPS.map((g) => {
                const items = sideItems(g.id);
                const count = COMPONENTS.filter((c) => c.group === g.id).length;
                return (
                  <section key={g.id} className="mt-7">
                    <p {...row()} className="mobile-menu-row mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--faint)]">
                      {g.label}
                      <span className="font-mono text-[10px]">{count}</span>
                    </p>
                    {items.length ? (
                      items.map((c) => (
                        <div key={c.slug} {...row()} className="mobile-menu-row">
                          <MenuLink
                            href={`/docs/${c.slug}`}
                            active={isSideActive(c.slug, pathname?.replace(/^\/docs\//, ""))}
                            onPick={() => setOpen(false)}
                          >
                            {c.name}
                          </MenuLink>
                        </div>
                      ))
                    ) : (
                      <p {...row()} className="mobile-menu-row py-2 text-lg text-[var(--faint)]">
                        Coming soon
                      </p>
                    )}
                  </section>
                );
              })}
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
  onPick,
  children,
}: {
  href: string;
  active?: boolean;
  badge?: string;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onPick}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-2 py-2 text-lg tracking-tight transition-colors",
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
