import { FAMILIES, GITHUB, type ItemInfo } from "@/lib/site";
import { SITE, absolute } from "@/lib/seo";

/**
 * Structured data: a hidden block that tells Google and AI tools what a page is and who made it.
 * Built only from SITE and each item's info.ts, so it always matches what the page shows.
 */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so no text inside can close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const WEBSITE_ID = `${SITE.url}/#website`;
const AUTHOR_ID = `${SITE.url}/#author`;

/** Home page only: the site's name (Google reads it from the home page) and the person behind it. */
export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": WEBSITE_ID,
            name: SITE.name,
            alternateName: SITE.alternateNames,
            url: `${SITE.url}/`,
            description: SITE.description,
            inLanguage: "en",
            publisher: { "@id": AUTHOR_ID },
          },
          {
            "@type": "Person",
            "@id": AUTHOR_ID,
            name: SITE.author.name,
            alternateName: SITE.author.alternateName,
            url: SITE.author.url,
            sameAs: SITE.author.sameAs,
          },
        ],
      }}
    />
  );
}

/** Item docs pages: what the item is, where its code lives, and the breadcrumb trail. */
export function ItemJsonLd({ info }: { info: ItemInfo }) {
  const url = absolute(`/docs/${info.slug}`);
  const family = info.family ? FAMILIES.find((f) => f.slug === info.family) : undefined;
  const skill = info.group === "skills";
  const crumbs = [
    { name: "Docs", item: absolute("/docs") },
    ...(family ? [{ name: family.name, item: absolute(`/docs/${family.slug}`) }] : []),
    { name: info.name },
  ];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": info.kind === "family" ? "CollectionPage" : "SoftwareSourceCode",
            name: info.name,
            description: info.description,
            url,
            ...(info.kind === "family"
              ? {}
              : {
                  codeRepository: GITHUB,
                  programmingLanguage: skill ? "Markdown" : ["TypeScript", "JavaScript"],
                  ...(skill ? {} : { runtimePlatform: "React" }),
                  license: "https://opensource.org/licenses/MIT",
                  keywords: [info.seo?.keyword, ...info.tags].filter(Boolean).join(", "),
                  author: { "@type": "Person", "@id": AUTHOR_ID, name: SITE.author.name, url: SITE.author.url },
                }),
            isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE.name, url: `${SITE.url}/` },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
          },
        ],
      }}
    />
  );
}
