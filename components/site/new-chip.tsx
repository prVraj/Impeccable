import { itemChip } from "@/lib/site";
import { cx } from "@/lib/utils";

/**
 * The small chip next to an item's name (sidebar, phone menu, /components, search):
 * "New" for the newest items, "Updated" (plain light purple text, no pill) for the ones changed most recently, nothing otherwise.
 * lib/site.ts decides (itemChip) from each item's `added` and `updated` dates in info.ts,
 * so nothing is set by hand here. Styles: .new-chip and .updated-chip in app/globals.css.
 */
export function NewChip({ slug, className }: { slug: string; className?: string }) {
  const chip = itemChip(slug);
  if (!chip) return null;
  return (
    <span className={cx(chip === "new" ? "new-chip" : "new-chip updated-chip", className)}>
      {/* So a screen reader says "Peek List, New" instead of "Peek ListNew". */}
      <span className="sr-only">, </span>
      {chip === "new" ? "New" : "Updated"}
    </span>
  );
}
