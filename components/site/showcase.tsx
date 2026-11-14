"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import { scrollToElement } from "@/lib/scroll";
import { Cancel01Icon, CommandLineIcon, PictureInPictureOnIcon } from "./hugeicons";
import { Button } from "./button";
import { InstallCommand } from "./install-command";
import { Tabs, type Tab } from "./tabs";
import { useViewport, ViewportStage, ViewportToolbar } from "./viewport";

const VIEWS = [
  { id: "preview", label: "Preview", Icon: PictureInPictureOnIcon },
  { id: "code", label: "Code", Icon: CommandLineIcon },
] as const;

type View = (typeof VIEWS)[number]["id"];

/**
 * The top of every component page: a Preview | Code switch over one box,
 * and the install command right under it, so everything to copy sits together.
 * On the right of the switch: preview width (desktop, tablet, mobile, or drag
 * the handle), reset and fullscreen.
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
  const vp = useViewport();

  // Fullscreen is for trying the component, so it always shows the preview.
  useEffect(() => {
    if (vp.full) setView("preview");
  }, [vp.full]);

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
        className={cx(
          vp.full && "fixed inset-0 z-[70] flex flex-col overflow-auto bg-[var(--bg)] p-4 pt-16 sm:p-6 sm:pt-20",
        )}
      >
        {/* Rendered on <body> so nothing on the page can sit above it or trap it. */}
        {vp.full &&
          createPortal(
            <div className="fixed top-3 right-3 z-[80] rounded-xl bg-[var(--panel-2)] p-1 shadow-[inset_0_0_0_1px_var(--line)] sm:top-5 sm:right-5">
              <Button
                hierarchy="secondary"
                size="sm"
                autoFocus
                aria-label="Close fullscreen"
                onClick={vp.closeFull}
                leading={<Cancel01Icon size={16} />}
              >
                Close
                <kbd className="ml-1 hidden rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-[11px] font-normal text-[var(--muted)] shadow-[inset_0_0_0_1px_var(--line)] sm:inline">
                  Esc
                </kbd>
              </Button>
            </div>,
            document.body,
          )}
        <div className={cx("flex items-center justify-between gap-3", vp.full && "hidden")}>
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
          <ViewportToolbar vp={vp} showPreviewTools={view === "preview"} />
        </div>

        <div className={cx(vp.full ? "flex flex-1 flex-col" : "mt-3")}>
          {view === "preview" ? (
            <div
              ref={previewRef}
              id="showcase-preview"
              role="tabpanel"
              className={cx(vp.full && "flex flex-1 flex-col")}
            >
              <ViewportStage vp={vp}>{preview}</ViewportStage>
            </div>
          ) : (
            <div id="showcase-code" role="tabpanel">
              <Tabs tabs={files} maxHeight={`${height - 41}px`} />
            </div>
          )}
        </div>
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
