import type { ReactNode } from "react";

/**
 * A read-only file box. Same frame as the code tabs, but with just the file's
 * name on top: no tabs to switch and no copy button. Skill pages use it to let
 * people read the skill before they download it.
 */
export function FileView({
  name,
  children,
  maxHeight = "28rem",
}: {
  name: string;
  children: ReactNode;
  maxHeight?: string;
}) {
  return (
    <div className="card overflow-hidden rounded-xl">
      <div className="flex items-center border-b border-[var(--line)] bg-[var(--panel-2)]/60 px-2 py-1.5">
        <span className="inline-flex h-7 items-center rounded-md bg-[var(--panel)] px-2.5 text-xs font-medium text-[var(--fg)] shadow-[0_0_0_1px_var(--line)]">
          {name}
        </span>
      </div>
      <div
        role="region"
        aria-label={name}
        tabIndex={0}
        className="overflow-auto p-4 text-[13px] leading-relaxed [&_pre]:break-words [&_pre]:whitespace-pre-wrap"
        style={{ maxHeight }}
      >
        {children}
      </div>
    </div>
  );
}
