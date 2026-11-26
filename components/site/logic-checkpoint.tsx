import type { LogicGroup } from "@/lib/site";
import { BrainCircuitIcon } from "./hugeicons";

/**
 * The Logic checkpoint: every rule an item follows, written out in plain sentences, in groups.
 * It sits right after Installation on the item's page (id "logic-checkpoint"), so people can check
 * each rule against the preview above it. Items in the Intentional group have one (info.ts `logic`).
 *
 * Laid out like a blog post, because this section is for reading (vrajsensei, 2026-11-26):
 * - one column at a readable width (65ch), no card, no border, no side by side columns;
 * - each group is a heading with its rules under it, and a big gap before the next group,
 *   so it is clear where one group ends and the next starts;
 * - every rule is its own bullet, so you always know where a new rule begins;
 * - the only highlight is the brain icon in the brand colour beside the heading.
 * Times inside a rule ("400 ms") use the site's normal inline code style.
 */
export function LogicCheckpoint({ groups, what }: { groups: LogicGroup[]; what: string }) {
  const count = groups.reduce((n, g) => n + g.rules.length, 0);
  return (
    <section id="logic-checkpoint" className="lc mt-16 scroll-mt-20" aria-labelledby="logic-checkpoint-title">
      <h2 id="logic-checkpoint-title" className="lc-title text-heading-24 text-balance">
        <BrainCircuitIcon size={22} className="lc-icon" />
        <a href="#logic-checkpoint" className="hover:underline hover:decoration-[var(--line)] hover:underline-offset-4">
          Logic checkpoint
        </a>
      </h2>
      <p className="lc-lede text-copy-16 text-pretty">
        The {count} rules {what} follows, written out. Try any of them in the preview above.
      </p>

      {groups.map((g) => (
        <div key={g.title} className="lc-group">
          <h3 className="text-heading-20 text-balance">{g.title}</h3>
          <ul className="lc-rules text-copy-16">
            {g.rules.map((r) => (
              <li key={r}>{withTimes(r)}</li>
            ))}
          </ul>
        </div>
      ))}
      <style>{CSS}</style>
    </section>
  );
}

/** "wait 400 ms" -> "wait <code>400 ms</code>", set like every other inline code on the site. */
function withTimes(rule: string) {
  return rule.split(/(\d+ ms)/).map((part, i) =>
    /^\d+ ms$/.test(part) ? (
      <code key={i} className="rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-code-inline whitespace-nowrap text-[var(--fg)]">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

// Plain CSS (not new Tailwind classes) so a running pnpm dev picks it up at once.
const CSS = `
.lc{max-width:65ch}
.lc-title{display:flex;align-items:center;gap:10px;margin:0 0 16px}
.lc-icon{flex:none;color:var(--accent)}
.lc-lede{margin:0;color:var(--muted)}
.lc-group{margin-top:48px}
.lc-group h3{margin:0}
.lc-rules{margin:12px 0 0;padding-left:22px;list-style:disc;color:var(--fg);text-wrap:pretty}
.lc-rules li{padding-left:4px}
.lc-rules li+li{margin-top:12px}
.lc-rules li::marker{color:var(--muted)}
`;
