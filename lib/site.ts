/** The site's list of components. Order here is the order in the sidebar and on the home page. */
export type SiteComponent = {
  slug: string;
  name: string;
  category: string;
  blurb: string;
  preview: string;
  isNew?: boolean;
};

export const COMPONENTS: SiteComponent[] = [
  {
    slug: "agent-draw",
    name: "Agent-Draw",
    category: "Loader",
    blurb: "Named cursors draw your page's skeleton live while it loads.",
    preview: "/previews/agent-draw",
    isNew: true,
  },
  {
    slug: "burning-screen",
    name: "Burning-Screen",
    category: "Page transition",
    blurb: "One click burns the screen away and reveals the next page.",
    preview: "/previews/burning-screen",
  },
];

export const GITHUB = "https://github.com/prVraj/Impeccable";
export const AUTHOR = { name: "Vraj Parikh", href: "https://x.com/vrajsensei" };

export function neighbours(slug: string) {
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  return { prev: COMPONENTS[i - 1], next: COMPONENTS[i + 1] };
}
