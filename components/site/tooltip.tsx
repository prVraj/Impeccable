import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

/**
 * A small, calm hint that appears under its trigger on mouse hover or
 * keyboard focus. Never on touch: Tailwind's hover only fires on devices
 * that can hover, and focus shows it only for the keyboard (focus-visible).
 * Pure CSS, so it costs nothing until it shows.
 *
 *   <Tooltip label="star if you are human"><a href={GITHUB}>GitHub</a></Tooltip>
 *
 * `align="end"` lines its right edge up with the trigger's, for triggers near
 * the right edge of the screen.
 */
export function Tooltip({
  label,
  align = "center",
  className,
  children,
}: {
  label: string;
  align?: "center" | "end";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cx("group/tip relative flex items-center self-stretch", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute top-full z-40 mt-1.5 rounded-md border border-[var(--line)] bg-[var(--sheet)] px-2 py-1 text-xs whitespace-nowrap text-[var(--fg)] shadow-[var(--shadow-card)]",
          "translate-y-[-2px] opacity-0 transition-[opacity,translate] duration-150 ease-[var(--ease-out)]",
          "group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-hover/tip:delay-200",
          "group-has-[:focus-visible]/tip:translate-y-0 group-has-[:focus-visible]/tip:opacity-100",
          "motion-reduce:translate-y-0",
          align === "end" ? "right-0" : "left-1/2 -translate-x-1/2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
