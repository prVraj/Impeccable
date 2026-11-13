/**
 * The site's identity for search engines and AI tools: its address, its name and who makes it.
 * This is the only place the domain and brand are written. Everything else (page titles,
 * canonical links, social cards, structured data, sitemap, robots.txt, llms.txt) reads from here,
 * so moving to a new domain is a one-line change.
 */
export const SITE = {
  /** No trailing slash. */
  url: "https://impeccableui.vercel.app",
  /** The brand, written the same way everywhere: page titles, social cards, posts (vrajsensei, 2026-11-13). */
  name: "Impeccable UI",
  /** Other names people may use for it. */
  alternateNames: ["Impeccable"],
  /** The home page's title and description, also used by llms.txt. */
  title: "Impeccable UI: Animated React Components with AI Prompts",
  description:
    "Free animated React components, buttons, page sections and AI skills. Each comes with TypeScript and JavaScript code and two prompts for your AI tool.",
  author: {
    name: "Vraj Parikh",
    alternateName: "Vraj Sensei",
    url: "https://x.com/vrajsensei",
    /** Profile links that belong to the author. Only links the author gave; never guessed. */
    sameAs: [
      "https://x.com/vrajsensei",
      "https://www.linkedin.com/in/vraj-parikh-b64b61257/",
      "https://www.instagram.com/vraj_sensei106/",
      "https://www.youtube.com/@SenseiVraj",
      "https://contra.com/vraj_sensei_r8it0oe9",
      "https://peerlist.io/vrajsensei",
      "https://github.com/prVraj",
    ] as string[],
  },
  /** X handle for link cards. */
  x: "@vrajsensei",
  locale: "en_US",
} as const;

/** A full address on this site, from a path like "/docs/burning-screen". */
export const absolute = (path = "/") => SITE.url + (path === "/" ? "" : path);

/** The social card image for a page: "home", "docs" or an item's slug. Made by app/og/[slug]/route.tsx. */
export const ogImage = (slug: string, alt: string) => ({
  url: `/og/${slug}`,
  width: 1200,
  height: 630,
  alt,
  type: "image/png",
});
