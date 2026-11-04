import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Impeccable
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <Link href="/components/burning-screen" className="hover:text-[var(--fg)]">
            Components
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
