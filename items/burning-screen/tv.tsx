"use client";

import { Screen } from "@/components/site/tv-screen";
import { currentTheme, setTheme } from "@/components/site/theme-toggle";
import { useBurningScreen } from "./burning-screen";

/** A tiny sign-up screen. Its button burns the whole page into the other theme. */
export default function BurnChannel() {
  const { burn } = useBurningScreen();
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[10cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] text-[6cqw] leading-tight font-semibold tracking-tight">
          Create your account
        </p>
        <div className="mt-[4cqw] w-full rounded-full border border-[var(--line)] px-[3.5cqw] py-[2cqw] text-left text-[3cqw] text-[var(--muted)]">
          you@studio.com
        </div>
        <button
          type="button"
          onClick={(e) =>
            burn(() => setTheme(currentTheme() === "dark" ? "light" : "dark"), {
              origin: e,
            })
          }
          className="press mt-[2.5cqw] w-full rounded-full bg-[var(--fg)] py-[2.2cqw] text-[3.2cqw] font-medium text-[var(--bg)]"
        >
          Create account
        </button>
        <p className="mt-[3cqw] text-[2.4cqw] text-[var(--muted)]">
          Click it. The whole page burns into the other theme.
        </p>
      </div>
    </Screen>
  );
}
