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
  particles,
  children,
}: {
  group: string;
  title: string;
  count: number;
  icon?: React.ReactNode;
  /** A strip of faint pixel squares on the right 60% of the heading, fading out to the left (Intentional). */
  particles?: boolean;
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
        data-peek-group={group}
        aria-expanded={open}
        aria-controls={id}
        className="press relative flex w-full items-center justify-between overflow-hidden rounded-md px-2.5 py-1.5 text-label-12 font-medium text-[var(--fg)] transition-colors hover:bg-[var(--panel-2)]"
      >
        {particles && <Particles />}
        <span className="relative flex items-center gap-1.5">
          {icon && <span className="mr-0.5 flex text-[var(--muted)]">{icon}</span>}
          {title}
          <span className="text-label-11 font-normal text-[var(--muted)] tabular-nums">{count}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={cx("relative size-3.5 text-[var(--muted)] duration-200 ease-[var(--ease-out)]", ready && "transition-transform", open && "rotate-90")}
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
            data-peek-list={group}
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

/* The pixel strip: squares of 3px with a 1px gap, each a fixed faint shade (a seeded pattern, so the
   server and the browser draw the same picture). It covers the right 60% of the heading and fades
   out toward the left, so it marks the group without filling the row. */
const COLS = 40;
const ROWS = 8;
const CELLS = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const out: { x: number; y: number; o: number }[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const r = rand();
      if (r < 0.42) continue; // some cells stay empty, like the reference
      out.push({ x: x * 4, y: y * 4, o: r > 0.9 ? 0.2 : r > 0.75 ? 0.12 : 0.06 });
    }
  return out;
})();

function Particles() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${COLS * 4} ${ROWS * 4}`}
      preserveAspectRatio="xMaxYMid slice"
      className="side-particles"
    >
      {CELLS.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={3} height={3} fill="currentColor" fillOpacity={c.o} />
      ))}
      <style>{`.side-particles{position:absolute;top:0;right:0;width:60%;height:100%;color:var(--fg);pointer-events:none;-webkit-mask-image:linear-gradient(to left,#000,transparent);mask-image:linear-gradient(to left,#000,transparent)}`}</style>
    </svg>
  );
}
