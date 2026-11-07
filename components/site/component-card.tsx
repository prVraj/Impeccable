import Link from "next/link";
import type { SiteComponent } from "@/lib/site";

/** A component's card: live-looking preview on top, name and category below. */
export function ComponentCard({ c }: { c: SiteComponent }) {
  return (
    <Link href={`/components/${c.slug}`} className="card press group overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--line)] bg-[var(--panel-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${c.preview}-light.png`}
          alt=""
          className="size-full object-cover object-top transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.02] dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${c.preview}-dark.png`}
          alt=""
          className="hidden size-full object-cover object-top transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.02] dark:block"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-tight">{c.name}</h2>
            {c.isNew && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-1.5 text-[10px] leading-4 font-medium text-[var(--accent)]">
                New
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">{c.blurb}</p>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full border border-[var(--line)] px-2 py-0.5 text-xs text-[var(--muted)]">
          {c.category}
        </span>
      </div>
    </Link>
  );
}
