/** The site's list of components. Order here is the order in the sidebar and on the home page. */
export type Group = "components" | "skills" | "animations";

/** The three parts of the library, in sidebar order. */
export const GROUPS: { id: Group; label: string }[] = [
  { id: "components", label: "Components" },
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
};

export const COMPONENTS: SiteComponent[] = [
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

/** The docs in reading order: Introduction first, then each group in sidebar order. */
export const DOC_PAGES = [
  { href: "/docs", name: "Introduction" },
  ...GROUPS.flatMap((g) =>
    COMPONENTS.filter((c) => c.group === g.id).map((c) => ({ href: `/docs/${c.slug}`, name: c.name })),
  ),
];

/** Previous and next docs page. Leave out `slug` for the Introduction. */
export function neighbours(slug?: string) {
  const href = slug ? `/docs/${slug}` : "/docs";
  const i = DOC_PAGES.findIndex((p) => p.href === href);
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}
