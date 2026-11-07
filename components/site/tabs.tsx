"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export type Tab = { id: string; label: string; copy: string; body: ReactNode };

/** Tabbed code panel with a copy button for the active tab. */
export function Tabs({ tabs, maxHeight = "28rem" }: { tabs: Tab[]; maxHeight?: string }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--panel-2)]/60 px-2 py-1.5">
        <div className="flex min-w-0 gap-0.5 overflow-x-auto" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === active}
              onClick={() => setActive(t.id)}
              className={cx(
                "h-7 shrink-0 rounded-md px-2.5 text-xs font-medium transition-colors",
                t.id === active
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-[0_0_0_1px_var(--line)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton text={tab.copy} />
      </div>
      <div className="overflow-auto p-4 text-[13px] leading-relaxed" style={{ maxHeight }}>
        {tab.body}
      </div>
    </div>
  );
}
