"use client";

import { useId, useState } from "react";
import { cx } from "@/lib/utils";

/** A sidebar group that opens and closes. Starts open so nothing is hidden. */
export function SideDropdown({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="press flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--fg)] transition-colors hover:bg-[var(--panel-2)]"
      >
        <span className="flex items-center gap-1.5">
          {icon && <span className="mr-0.5 flex text-[var(--muted)]">{icon}</span>}
          {title}
          <span className="font-mono text-[10px] text-[var(--faint)]">{count}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={cx("size-3.5 text-[var(--muted)] transition-transform duration-200 ease-[var(--ease-out)]", open && "rotate-90")}
        >
          <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={id}
        className={cx(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
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
