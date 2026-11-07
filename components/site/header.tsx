import Link from "next/link";
import { Mark } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <Mark className="h-6 w-[21px] text-[var(--fg)]" />
            Impeccable
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
            <Link href="/components" className="transition-colors hover:text-[var(--fg)]">
              Components
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
