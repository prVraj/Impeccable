import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { LibraryCard } from "@/components/site/library-card";
import { ListJsonLd } from "@/components/site/json-ld";
import { GROUPS, LIBRARY, pageMetadata } from "@/lib/site";

/**
 * /components: everything in the library, newest first (by `added` in each info.ts), so a new
 * item lands at the top on its own. "Browse components" on the home page and the 404 page opens it.
 * Each card is a still picture until you hover it; see components/site/library-card.tsx.
 */

const TITLE = "All components";
const LEDE = "Everything in the library, newest first. Each one comes with a live preview, its code and two prompts for your AI tool.";

export const metadata: Metadata = pageMetadata({
  title: "All Components: Animated React UI, Newest First | Impeccable UI",
  description: "Every Impeccable UI component, button, loader, background, section, animation and skill in one list, newest first, with a preview of each.",
  path: "/components",
});

/** Stills are checked once, when the page is built. */
const hasStill = (slug: string) =>
  ["light", "dark"].every((t) => existsSync(join(process.cwd(), "public/previews", `${slug}-${t}.webp`)));

/*
 * Plain CSS rather than new Tailwind classes, so a running pnpm dev picks it up straight away.
 * - Cards rise in once, a few at a time (only the first rows wait; the rest are below the fold).
 * - Hover: a faint accent ring, the arrow slides in, and the live preview comes into focus
 *   (blur to sharp) over the still, which softens behind it.
 */
const CSS = `
.lib-card { animation: lib-in 520ms var(--ease-out) backwards; animation-delay: calc(min(var(--i), 9) * 40ms); }
@keyframes lib-in { from { opacity: 0; transform: translateY(10px); } }
.lib-card::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent); opacity: 0; transition: opacity 200ms var(--ease-out); }
.lib-arrow { opacity: 0; transform: translateX(-4px); transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out); }
.lib-still { transition: filter 360ms var(--ease-out), transform 360ms var(--ease-out); }
.lib-live { opacity: 0; filter: blur(8px); transform: scale(1.03);
  transition: opacity 280ms var(--ease-out), filter 380ms var(--ease-out), transform 380ms var(--ease-out); }
.lib-live[data-shown] { opacity: 1; filter: none; transform: none; }
.lib-card[data-live] .lib-still { filter: blur(4px); transform: scale(1.02); }
.lib-sheet { transition: transform 260ms var(--ease-out); }
/* The channels' iMac warm-up flash belongs to the iMac, not to a card. */
.lib-live .imac-power-on { animation: none; }
.lib-live .imac-power-flash { display: none; }
@media (hover: hover) {
  .lib-card:hover::after, .lib-card:focus-visible::after { opacity: 1; }
  .lib-card:hover .lib-arrow, .lib-card:focus-visible .lib-arrow { opacity: 1; transform: none; }
  .lib-card:hover .lib-sheet { transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .lib-card { animation: none; }
  .lib-arrow, .lib-sheet { transition: opacity 150ms; transform: none !important; }
}
`;

export default function ComponentsPage() {
  return (
    <>
      <style>{CSS}</style>
      <DocsLayout page="/components" wide sections={[]}>
        <div className="mt-4">
          <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{TITLE}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-[var(--muted)] sm:text-lg">{LEDE}</p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {LIBRARY.map((i, n) => (
            <li key={i.slug} className="flex">
              <LibraryCard
                slug={i.slug}
                name={i.name}
                kind={i.category ?? GROUPS.find((g) => g.id === i.group)!.label}
                blurb={i.blurb}
                still={hasStill(i.slug)}
                index={n}
              />
            </li>
          ))}
        </ul>
      </DocsLayout>
      <ListJsonLd items={LIBRARY} path="/components" name={TITLE} description={LEDE} />
    </>
  );
}
