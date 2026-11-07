"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

/** "On this page" list that highlights the section you're reading. */
export function Toc({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <div>
      <p className="mb-3 text-xs font-medium">On this page</p>
      <ul className="space-y-0.5 border-l border-[var(--line)]">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cx(
                "-ml-px block border-l py-1 pl-3 text-[13px] transition-colors",
                active === s.id ? "border-[var(--accent)] text-[var(--fg)]" : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]",
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
