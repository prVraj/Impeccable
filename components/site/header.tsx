import Link from "next/link";
import { cx } from "@/lib/utils";
import { Mark } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { SearchTrigger } from "./search";

export function Header({ className }: { className?: string }) {
  return (
    <header className={cx("sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/75 backdrop-blur-xl backdrop-saturate-150", className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Mark className="h-6 w-[21px] text-[var(--fg)]" />
          Impeccable
        </Link>
        <div className="flex items-center self-stretch sm:gap-3">
          {/* Search sits right next to the menu. The bulb takes no room: it
              hangs below the header, centred under Search, and its frame sits
              behind the Search button so clicks reach it. */}
          <div className="relative flex items-center self-stretch">
            <div className="absolute inset-y-0 left-1/2 z-0 flex -translate-x-1/2">
              <ThemeToggle />
            </div>
            <div className="relative z-10 hidden sm:block">
              <SearchTrigger />
            </div>
            <SearchTrigger compact className="relative z-10 sm:hidden" />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
