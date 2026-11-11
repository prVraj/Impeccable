import Link from "next/link";
import { cx } from "@/lib/utils";
import { Mark } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";

export function Header({ className }: { className?: string }) {
  return (
    <header className={cx("sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/75 backdrop-blur-xl backdrop-saturate-150", className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Mark className="h-6 w-[21px] text-[var(--fg)]" />
          Impeccable
        </Link>
        <div className="flex items-center gap-2 self-stretch">
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
