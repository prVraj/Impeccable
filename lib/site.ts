/** The site's list of components. Order here is the order in the sidebar and on the home page. */
export type Group = "components" | "sections" | "skills" | "animations";

/** The parts of the library, in sidebar order. */
export const GROUPS: { id: Group; label: string }[] = [
  { id: "components", label: "Components" },
  // Website sections: header, top navbar, hero, footer and the like.
  { id: "sections", label: "Sections" },
  { id: "skills", label: "Skills" },
  { id: "animations", label: "Animations" },
];

export type SiteComponent = {
  slug: string;
  name: string;
  group: Group;
  category: string;
  blurb: string;
  preview: string;
  isNew?: boolean;
  /** Slug of the family it belongs to (see FAMILIES), like "login-pages". */
  family?: string;
};

/**
 * Families: one sidebar entry that opens a page listing all its variants, so a
 * group with many login pages (or heroes, or footers) stays one short line.
 */
export type Family = { slug: string; name: string; group: Group; blurb: string };

export const FAMILIES: Family[] = [
  {
    slug: "login-pages",
    name: "Login pages",
    group: "sections",
    blurb: "Every login page in the library, side by side.",
  },
];

export const COMPONENTS: SiteComponent[] = [
  {
    slug: "burning-toast",
    name: "Burning-toast",
    group: "components",
    category: "Feedback",
    blurb: "Toasts that stack at the bottom and burn away when they close.",
    preview: "",
  },
  {
    slug: "brain-txt",
    name: "brain.txt",
    group: "components",
    category: "Interactive",
    blurb: "A brain in a web of dots; each dot holds one of your thoughts.",
    preview: "",
  },
  {
    slug: "scratch-me",
    name: "Scratch-me",
    group: "components",
    category: "Interactive",
    blurb: "Scratch off the foil to reveal a promo code; it copies itself.",
    preview: "",
  },
  {
    slug: "password-strength",
    name: "Password-Strength",
    group: "components",
    category: "Form",
    blurb: "A password field that rates you as AI, AI agent or Human.",
    preview: "",
  },
  {
    slug: "framed-upload",
    name: "Framed-Upload",
    group: "components",
    category: "Upload",
    blurb: "Drop in a picture and it hangs in a frame, like a print on a wall.",
    preview: "",
  },
  {
    slug: "hex-login",
    name: "Hex-Login",
    group: "sections",
    family: "login-pages",
    category: "Login page",
    blurb: "A calm login page with your logo inside turning hexagon rings.",
    preview: "",
  },
  {
    slug: "agent-draw",
    name: "Agent-Draw",
    group: "animations",
    category: "Loader",
    blurb: "Named cursors draw your page's skeleton live while it loads.",
    preview: "/previews/agent-draw",
    isNew: true,
  },
  {
    slug: "burning-screen",
    name: "Burning-Screen",
    group: "animations",
    category: "Page transition",
    blurb: "One click burns the screen away and reveals the next page.",
    preview: "/previews/burning-screen",
  },
  {
    slug: "ui-tongue",
    name: "UI-tongue",
    group: "skills",
    category: "Skill",
    blurb: "Learns your UI taste and writes you your own UI skill.",
    preview: "",
    isNew: true,
  },
];

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
