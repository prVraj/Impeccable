/** The site's list of items. The order lives in items/list.ts; each item's details in items/<slug>/info.ts. */
import { ORDER } from "@/items/list";
import { INFO } from "@/generated/items/info";

export type Group = "components" | "sections" | "skills" | "animations";

/** The parts of the library, in sidebar order. */
export const GROUPS: { id: Group; label: string }[] = [
  { id: "components", label: "Components" },
  // Website sections: header, top navbar, hero, footer and the like.
  { id: "sections", label: "Sections" },
  { id: "skills", label: "Skills" },
  { id: "animations", label: "Animations" },
];

/** Everything about one item, from items/<slug>/info.ts. */
export type ItemInfo = {
  slug: string;
  /** "family" for a page that lists several variants (like Login pages). */
  kind?: "family";
  name: string;
  group: Group;
  category?: string;
  /** Short line for the docs home, search and family cards. */
  blurb: string;
  /** Two lines at most: under the page title, the meta description and the install description. */
  description: string;
  /** Little labels under the page title. */
  tags: string[];
  /** Slug of the family it belongs to, like "login-pages". */
  family?: string;
  /** When it was added, "YYYY-MM-DD HH:MM". Newest shows first in search and on the home page. */
  added: string;
};

export type SiteComponent = ItemInfo;
export type Family = ItemInfo;

const ALL: ItemInfo[] = ORDER.map((slug) => INFO[slug]);

/**
 * Families: one sidebar entry that opens a page listing all its variants, so a
 * group with many login pages (or heroes, or footers) stays one short line.
 */
export const FAMILIES = ALL.filter((i) => i.kind === "family");

/** Every item that is not a family page, in sidebar order. */
export const COMPONENTS = ALL.filter((i) => i.kind !== "family");

/** Every item and family page, newest first. */
export function newestFirst() {
  return [...ALL].sort((a, b) => b.added.localeCompare(a.added));
}

/** The page title and meta description for an item's docs page. */
export function itemMetadata(info: ItemInfo) {
  return { title: `${info.name} · Impeccable`, description: info.description };
}

export const GITHUB = "https://github.com/prVraj/Impeccable";
export const AUTHOR = { name: "Vraj Parikh", href: "https://x.com/vrajsensei" };

/** What the sidebar lists for a group: its items, with each family shown once in place of its members. */
export function sideItems(group: Group): { slug: string; name: string }[] {
  const out: { slug: string; name: string }[] = [];
  for (const c of COMPONENTS.filter((c) => c.group === group)) {
    const fam = c.family && FAMILIES.find((f) => f.slug === c.family);
    if (!fam) out.push(c);
    else if (!out.some((i) => i.slug === fam.slug)) out.push(fam);
  }
  return out;
}

/** The members of a family, in COMPONENTS order. */
export function familyMembers(slug: string) {
  return COMPONENTS.filter((c) => c.family === slug);
}

/** True when the sidebar entry `item` should look active on page `slug`. */
export function isSideActive(item: string, slug?: string) {
  return item === slug || (!!slug && COMPONENTS.find((c) => c.slug === slug)?.family === item);
}

/** The docs in reading order: Introduction first, then each group in sidebar order (a family page, then its members). */
export const DOC_PAGES = [
  { href: "/docs", name: "Introduction" },
  ...GROUPS.flatMap((g) =>
    sideItems(g.id).flatMap((i) => [
      { href: `/docs/${i.slug}`, name: i.name },
      ...familyMembers(i.slug).map((c) => ({ href: `/docs/${c.slug}`, name: c.name })),
    ]),
  ),
];

/** Previous and next docs page. Leave out `slug` for the Introduction. */
export function neighbours(slug?: string) {
  const href = slug ? `/docs/${slug}` : "/docs";
  const i = DOC_PAGES.findIndex((p) => p.href === href);
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}
