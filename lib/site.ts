/** The site's list of items. The order lives in items/list.ts; each item's details in items/<slug>/info.ts. */
import type { Metadata } from "next";
import { ORDER } from "@/items/list";
import { SITE, SHARE_IMAGE, absolute } from "@/lib/seo";
import { INFO } from "@/generated/items/info";

export type Group = "components" | "intentional" | "buttons" | "loaders" | "backgrounds" | "sections" | "skills" | "animations" | "interactions";

/** The parts of the library, in sidebar order. */
export const GROUPS: { id: Group; label: string }[] = [
  { id: "components", label: "Components" },
  // Items with logic behind them: each one lists every rule it follows in its Logic checkpoint.
  { id: "intentional", label: "Intentional" },
  // Buttons of every kind. Its own dropdown, because there will be many.
  { id: "buttons", label: "Buttons" },
  // Loaders and progress bars: what people see while they wait. Its own dropdown, like Buttons.
  { id: "loaders", label: "Loaders" },
  // Backgrounds that sit behind a section or a whole page (grids, patterns). Its own dropdown, like Buttons.
  { id: "backgrounds", label: "Backgrounds" },
  // Website sections: header, top navbar, hero, footer and the like.
  { id: "sections", label: "Sections" },
  { id: "skills", label: "Skills" },
  { id: "animations", label: "Animations" },
  // Small interactions for any website, like a small pop at the pointer on every click. Its own dropdown, like Buttons.
  { id: "interactions", label: "Interactions" },
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
  /**
   * When it last got a real change people would notice (a new look, behaviour or option),
   * "YYYY-MM-DD HH:MM". Leave it out until then. The latest updates get the Updated chip.
   */
  updated?: string;
  /**
   * Search words for Google and AI tools. The visible name stays as it is; these only go in the
   * browser-tab title and the page's hidden data. `keyword`: the main phrase people search.
   * `title`: what it is in searched words, like "Fire Page Transition for React".
   */
  seo?: { keyword: string; title: string };
  /**
   * The Logic checkpoint: every rule the item follows, in groups, each rule one plain sentence.
   * Shown as its own section right after Installation. Items in the Intentional group have one.
   */
  logic?: LogicGroup[];
};

/** One group of rules in a Logic checkpoint, like "Hover card". */
export type LogicGroup = { title: string; rules: string[] };

/** How many rules an item's Logic checkpoint lists (0 when it has none). */
export function logicCount(info: Pick<ItemInfo, "logic">) {
  return info.logic?.reduce((n, g) => n + g.rules.length, 0) ?? 0;
}

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

/**
 * Everything people can open and use (no family pages), newest first: the /components list.
 * The newest `added` in info.ts is the top card, so a new item lands at the top on its own.
 */
export const LIBRARY = [...COMPONENTS].sort((a, b) => b.added.localeCompare(a.added));

/**
 * The New chip. Two rules, both read from each item's `added` date in info.ts, so a new item
 * gets the chip on its own and the oldest one loses it:
 * the 5 newest items on the whole site, plus the 2 newest in each sidebar group.
 */
export const NEW_ON_SITE = 5;
export const NEW_IN_GROUP = 2;
const NEW_SLUGS = new Set(
  [
    ...LIBRARY.slice(0, NEW_ON_SITE),
    ...GROUPS.flatMap((g) => LIBRARY.filter((i) => i.group === g.id).slice(0, NEW_IN_GROUP)),
  ].map((i) => i.slug),
);

/** True when an item gets the New chip. A family page (like Stats sections) gets it when one of its members does. */
export function isNew(slug: string) {
  return NEW_SLUGS.has(slug) || COMPONENTS.some((c) => c.family === slug && NEW_SLUGS.has(c.slug));
}

/**
 * The Updated chip: the 5 items changed most recently, by the `updated` date in info.ts.
 * An item that is still New keeps New (one chip at a time), so it doesn't use up a place here.
 */
export const UPDATED_COUNT = 5;
const UPDATED_SLUGS = new Set(
  LIBRARY.filter((i) => i.updated && i.updated > i.added && !NEW_SLUGS.has(i.slug))
    .sort((a, b) => b.updated!.localeCompare(a.updated!))
    .slice(0, UPDATED_COUNT)
    .map((i) => i.slug),
);

/** Which chip an item (or a family page, through its members) shows next to its name, if any. */
export function itemChip(slug: string): "new" | "updated" | undefined {
  if (isNew(slug)) return "new";
  if (UPDATED_SLUGS.has(slug) || COMPONENTS.some((c) => c.family === slug && UPDATED_SLUGS.has(c.slug))) return "updated";
}

/** Every item and family page, newest first. */
export function newestFirst() {
  return [...ALL].sort((a, b) => b.added.localeCompare(a.added));
}

/** Everything search engines and link previews read for an item's docs page: title, description, canonical link, social card. */
export function itemMetadata(info: ItemInfo): Metadata {
  const what = info.seo?.title ?? info.category ?? GROUPS.find((g) => g.id === info.group)!.label;
  const title = `${info.name}: ${what} | ${SITE.name}`;
  const path = `/docs/${info.slug}`;
  return pageMetadata({ title, description: info.description, path });
}

/** Title, description, canonical link and social card for any page. Pages never set openGraph themselves.
 *  The social card is always the one main picture (SHARE_IMAGE), on every page. */
export function pageMetadata(p: { title: string; description: string; path: string }): Metadata {
  const image = SHARE_IMAGE;
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: absolute(p.path) },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: absolute(p.path),
      title: p.title,
      description: p.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      creator: SITE.x,
      title: p.title,
      description: p.description,
      images: [image],
    },
  };
}

export const GITHUB = "https://github.com/prVraj/Impeccable";
export const AUTHOR = { name: "Vraj Parikh", href: "https://x.com/vrajsensei" };
/** Where the docs header's Talk to Vraj button goes: Vraj's booking page. */
export const TALK = "https://cal.com/vraj-sensei/talk-to-vraj?overlayCalendar=true";

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

/** The docs in reading order: Introduction and All components first, then each group in sidebar order (a family page, then its members). */
export const DOC_PAGES = [
  { href: "/docs", name: "Introduction" },
  { href: "/components", name: "All components" },
  ...GROUPS.flatMap((g) =>
    sideItems(g.id).flatMap((i) => [
      { href: `/docs/${i.slug}`, name: i.name },
      ...familyMembers(i.slug).map((c) => ({ href: `/docs/${c.slug}`, name: c.name })),
    ]),
  ),
];

/** Previous and next docs page. Leave out `slug` for the Introduction; pass `page` for a page outside /docs (like /components). */
export function neighbours(slug?: string, page?: string) {
  const href = page ?? (slug ? `/docs/${slug}` : "/docs");
  const i = DOC_PAGES.findIndex((p) => p.href === href);
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}
