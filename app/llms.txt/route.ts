import { GROUPS, COMPONENTS, FAMILIES, GITHUB } from "@/lib/site";
import { ORDER } from "@/items/list";
import { SITE, absolute } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain index of the site for AI tools (llmstxt.org format).
 * Built from the item list, grouped like the sidebar.
 */
export function GET() {
  const all = [...FAMILIES, ...COMPONENTS].sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));
  const groups = GROUPS.map((g) => {
    const items = all.filter((i) => i.group === g.id);
    if (!items.length) return "";
    return `## ${g.label}\n\n${items.map((i) => `- [${i.name}](${absolute(`/docs/${i.slug}`)}): ${i.description}`).join("\n")}\n`;
  }).filter(Boolean);

  const text = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (also called ${SITE.alternateNames.join(", ")}) is a free, MIT-licensed library made by ${SITE.author.name} (${SITE.author.alternateName}). Every component, button, section and animation has a live preview, one file of code in TypeScript and JavaScript, an install command for projects set up with shadcn (\`npx shadcn@latest add ${SITE.url}/r/<name>.json\`), and two prompts: Install (adds it exactly as shown) and Blend (fits its look to your product without changing how it moves). Skills are downloadable files that teach an AI tool to work a certain way.

${groups.join("\n")}
## Optional

- [Introduction](${absolute("/docs")}): why the library exists, what every item comes with, and how the Install and Blend prompts work.
- [Source code on GitHub](${GITHUB}): the full site and every component, MIT licensed.
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
