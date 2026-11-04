"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export type Tab = { id: string; label: string; copy: string; body: ReactNode };

/** Tabbed panel with a copy button for the active tab. */
export function Tabs({ tabs, maxHeight = "28rem" }: { tabs: Tab[]; maxHeight?: string }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
        <div className="flex gap-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === active}
              onClick={() => setActive(t.id)}
              className={cx(
                "h-7 rounded-full px-3 text-xs font-medium transition-colors",
                t.id === active
                  ? "bg-[var(--fg)] text-[var(--bg)]"
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
