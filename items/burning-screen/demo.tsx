"use client";

import { PageButton } from "@/components/site/page-button";
import { currentTheme, setTheme } from "@/components/site/theme-toggle";
import { useBurningScreen } from "./burning-screen";

/**
 * The preview: one button that burns this whole website away from the click.
 * The page under the fire is the same page in the other theme, so the hole
 * shows (burning onto an identical page would look like nothing happened).
 */
export function Playground() {
  const { burn } = useBurningScreen();
  return (
    <PageButton
      onClick={(e) =>
        void burn(() => setTheme(currentTheme() === "dark" ? "light" : "dark"), { origin: e })
      }
    >
      Burn this page
    </PageButton>
  );
}
