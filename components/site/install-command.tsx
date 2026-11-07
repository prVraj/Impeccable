"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { CopyButton } from "./copy-button";

const MANAGERS = [
  { id: "pnpm", run: "pnpm dlx" },
  { id: "npm", run: "npx" },
  { id: "yarn", run: "yarn dlx" },
  { id: "bun", run: "bunx --bun" },
] as const;

/** The shadcn install command, with a tab per package manager. */
export function InstallCommand({ url }: { url: string }) {
  const [pm, setPm] = useState<(typeof MANAGERS)[number]["id"]>("pnpm");
  const cmd = `${MANAGERS.find((m) => m.id === pm)!.run} shadcn@latest add ${url}`;
  return (
    <div className="card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--panel-2)]/60 px-2 py-1.5">
        <div className="flex gap-0.5" role="tablist">
          {MANAGERS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === pm}
              onClick={() => setPm(m.id)}
              className={cx(
                "h-7 rounded-md px-2.5 font-mono text-xs transition-colors",
                m.id === pm
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-[0_0_0_1px_var(--line)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {m.id}
            </button>
          ))}
        </div>
        <CopyButton text={cmd} />
      </div>
      <div className="overflow-x-auto px-4 py-3.5">
        <code className="font-mono text-[13px] whitespace-nowrap">
          <span className="text-[var(--faint)] select-none">$ </span>
          {cmd}
        </code>
      </div>
    </div>
  );
}
