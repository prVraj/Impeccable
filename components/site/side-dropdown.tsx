"use client";

import { useEffect, useId, useState } from "react";
import { cx } from "@/lib/utils";
import { setGroupOpen, useGroupState } from "./group-state";

/**
 * A sidebar group that opens and closes. Starts open so nothing is hidden, and
 * remembers what someone chose, so moving to another page leaves it as it was.
 */
export function SideDropdown({
  group,
  title,
  count,
  icon,
  children,
}: {
  group: string;
  title: string;
  count: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const open = useGroupState("side")[group] ?? true;
  const id = useId();
  // A remembered closed group shows closed at once on a fresh load, without the closing animation.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setGroupOpen("side", group, !open)}
        aria-expanded={open}
        aria-controls={id}
        className="press flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-label-12 font-medium text-[var(--fg)] transition-colors hover:bg-[var(--panel-2)]"
      >
        <span className="flex items-center gap-1.5">
          {icon && <span className="mr-0.5 flex text-[var(--muted)]">{icon}</span>}
          {title}
          <span className="text-label-11 font-normal text-[var(--muted)] tabular-nums">{count}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={cx("size-3.5 text-[var(--muted)] duration-200 ease-[var(--ease-out)]", ready && "transition-transform", open && "rotate-90")}
        >
          <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={id}
        className={cx(
          "grid duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
          ready && "transition-[grid-template-rows,opacity]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          {/* A thin line from under the icon down to the last item, so the group's end is clear. */}
          <div
            className={cx(
              "mt-px flex flex-col gap-px pb-1",
              icon ? "ml-[17px] border-l border-[var(--line)] pl-1.5" : "",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
