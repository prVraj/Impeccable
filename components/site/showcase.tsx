"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import { scrollToElement } from "@/lib/scroll";
import { CommandLineIcon, PictureInPictureOnIcon } from "./hugeicons";
import { InstallCommand } from "./install-command";
import { Tabs, type Tab } from "./tabs";

const VIEWS = [
  { id: "preview", label: "Preview", Icon: PictureInPictureOnIcon },
  { id: "code", label: "Code", Icon: CommandLineIcon },
] as const;

type View = (typeof VIEWS)[number]["id"];

/**
 * The top of every component page: a Preview | Code switch over one box,
 * and the install command right under it, so everything to copy sits together.
 */
export function Showcase({
  preview,
  files,
  hint,
  installUrl,
  filePath,
}: {
  preview: ReactNode;
  hint?: ReactNode;
  files: Tab[];
  installUrl: string;
  filePath: string;
}) {
  const [view, setView] = useState<View>("preview");
  const previewRef = useRef<HTMLDivElement>(null);
  // The code box takes the preview's height, so the page below doesn't jump.
  const [height, setHeight] = useState(448);

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(Math.max(360, el.offsetHeight)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  return (
    <section id="preview" className="mt-10 scroll-mt-20">
      <div
        role="tablist"
        aria-label="Show preview or code"
        className="relative inline-grid w-fit grid-cols-2 rounded-xl bg-[var(--panel-2)] p-1 shadow-[inset_0_0_0_1px_var(--line)]"
      >
        <span
          aria-hidden="true"
          className="card absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ transform: view === "code" ? "translateX(100%)" : "translateX(0)" }}
        />
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            aria-controls={`showcase-${id}`}
            onClick={() => setView(id)}
            className={cx(
              "press relative z-10 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition-colors duration-200",
              view === id ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {view === "preview" ? (
          <div ref={previewRef} id="showcase-preview" role="tabpanel">
            {preview}
          </div>
        ) : (
          <div id="showcase-code" role="tabpanel">
            <Tabs tabs={files} maxHeight={`${height - 41}px`} />
          </div>
        )}
      </div>

      <div id="installation" className="mt-6 scroll-mt-20">
        <InstallCommand url={installUrl} />
        {hint && <div className="mt-3 px-1 text-[13px] leading-relaxed text-pretty text-[var(--muted)]">{hint}</div>}
        <p className="mt-2 px-1 text-[13px] leading-relaxed text-[var(--muted)]">
          Run it in a project set up with shadcn. No other packages needed. Or open{" "}
          <button
            type="button"
            onClick={() => {
              setView("code");
              const el = document.getElementById("preview");
              if (el && el.getBoundingClientRect().top < 0) scrollToElement(el);
            }}
            className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]"
          >
            Code
          </button>{" "}
          and copy the file into{" "}
          <code className="rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-[12px] whitespace-nowrap text-[var(--fg)]">
            {filePath}
          </code>
          .
        </p>
      </div>
    </section>
  );
}
