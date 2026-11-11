"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { CopyButton } from "./copy-button";

const MANAGERS = [
  { id: "npm", run: "npx" },
  { id: "yarn", run: "yarn dlx" },
  { id: "bun", run: "bunx --bun" },
  { id: "pnpm", run: "pnpm dlx" },
] as const;

type Manager = (typeof MANAGERS)[number]["id"];
const KEY = "impeccable-pm";

/** The shadcn install command, with a tab per package manager. Remembers your pick. */
export function InstallCommand({ url }: { url: string }) {
  const [pm, setPm] = useState<Manager>("npm");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (MANAGERS.some((m) => m.id === saved)) setPm(saved as Manager);
    } catch {}
  }, []);

  const pick = (id: Manager) => {
    setPm(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  };

  const cmd = `${MANAGERS.find((m) => m.id === pm)!.run} shadcn@latest add ${url}`;

  return (
    <div className="rounded-2xl bg-[var(--panel-2)] px-2 pb-2 shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="flex items-center justify-between gap-2 pt-1 pl-1">
        <div className="flex" role="tablist" aria-label="Package manager">
          {MANAGERS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === pm}
              onClick={() => pick(m.id)}
              className={cx(
                "relative h-9 px-2.5 font-mono text-[12.5px] transition-colors duration-200",
                m.id === pm ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {m.id}
              <span
                aria-hidden="true"
                className={cx(
                  "absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-[var(--accent)] transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
                  m.id === pm ? "opacity-100" : "scale-x-50 opacity-0",
                )}
              />
            </button>
          ))}
        </div>
        <CopyButton text={cmd} />
      </div>
      <div className="card overflow-x-auto rounded-xl px-5 py-4">
        <code className="font-mono text-[13px] whitespace-nowrap">{cmd}</code>
      </div>
    </div>
  );
}
