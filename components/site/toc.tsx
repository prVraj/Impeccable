"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import { scrollToElement } from "@/lib/scroll";

/** "On this page" list that highlights the section you're reading. */
export function Toc({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  // While a click scroll runs, keep the clicked item lit instead of flicking
  // through every section on the way.
  const scrolling = useRef(false);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0] && !scrolling.current) setActive(seen[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // Line the list's left line up with the bulb's wire, so the list hangs from the same line as the bulb.
  // The bulb never moves: the list's right margin changes instead. The CSS default (38px) is already close,
  // so this only corrects a few pixels after the page loads and whenever the tab or window changes size.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const aside = root.current?.closest("aside");
    if (!aside) return;
    const align = () => {
      const bulb = document.querySelector<HTMLElement>('.sheet button[aria-label="Switch between light and dark"]');
      const box = bulb?.getBoundingClientRect();
      if (!box || !box.width || getComputedStyle(aside).display === "none") return;
      const wire = box.left + box.width / 2;
      const margin = parseFloat(getComputedStyle(aside).marginRight) || 0;
      const left = aside.getBoundingClientRect().left;
      aside.style.marginRight = `${Math.max(0, margin + left - wire + 0.5)}px`;
    };
    // The tab's width changes after load (fonts, and Search showing ⌘K or Ctrl K), which moves the bulb.
    const tab = document.querySelector('.sheet button[aria-label="Switch between light and dark"]')?.closest(".pointer-events-auto");
    const ro = new ResizeObserver(align);
    if (tab) ro.observe(tab);
    align();
    document.fonts?.ready.then(align);
    window.addEventListener("resize", align);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", align);
    };
  }, []);

  return (
    <div ref={root}>
      {/* Two levels, on the site's type scale: the label is a quiet 14px medium heading with extra room under
          it, the sections are 14px regular, and the one you're reading turns dark with the purple line. */}
      <p className="mb-5 text-label-14 font-medium text-[var(--muted)]">On this page</p>
      <ul className="space-y-0.5 border-l border-[var(--line)]">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                const el = document.getElementById(s.id);
                if (!el || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                setActive(s.id);
                scrolling.current = true;
                history.pushState(null, "", `#${s.id}`);
                scrollToElement(el, () => (scrolling.current = false));
              }}
              className={cx(
                "-ml-px block border-l py-1 pl-4 text-label-14 transition-colors",
                active === s.id
                  ? "border-[var(--accent)] font-medium text-[var(--fg)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
