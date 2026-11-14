// Reads items/list.ts and every items/<name>/ folder, checks that each item has
// all its pieces, and writes the files the site reads them from:
//   generated/items/*.ts      (info, iMac channels, family thumbnails)
//   app/docs/<name>/page.tsx  (a tiny page file per item; kept out of git)
//   registry.json             (the install list for `pnpm registry:build`)
// It runs before `pnpm dev` and `pnpm build`. A missing piece stops it with a
// plain message. Run it alone with `node scripts/items.mjs`.
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const ITEMS = "items";
// The live address. Keep it the same as SITE.url in lib/seo.ts.
const SITE = "https://impeccableui.vercel.app";
const errors = [];
const warnings = [];
const read = (p) => readFileSync(p, "utf8");
const has = (slug, file) => existsSync(join(ITEMS, slug, file));

// 1. The list.
const listSrc = read(join(ITEMS, "list.ts"));
const order = [...listSrc.slice(listSrc.indexOf("[")).matchAll(/^\s*"([a-z0-9-]+)",?/gm)].map((m) => m[1]);
const folders = readdirSync(ITEMS).filter((f) => !f.startsWith("_") && statSync(join(ITEMS, f)).isDirectory());

for (const f of folders) if (!order.includes(f)) errors.push(`items/${f}/ is not in items/list.ts. Add "${f}" to the list (or remove the folder).`);
for (const s of order) if (!folders.includes(s)) errors.push(`items/list.ts names "${s}", but there is no items/${s}/ folder.`);
const dupes = order.filter((s, i) => order.indexOf(s) !== i);
for (const s of dupes) errors.push(`"${s}" is in items/list.ts twice.`);

// 2. Each item's info.ts (read as text: a few simple fields).
const field = (src, name) => src.match(new RegExp(`^\\s*${name}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m"))?.[1];
const items = [];
for (const slug of order.filter((s) => folders.includes(s))) {
  if (!has(slug, "info.ts")) {
    errors.push(`${slug}: info.ts is missing (name, group, blurb, description, date added).`);
    continue;
  }
  const src = read(join(ITEMS, slug, "info.ts"));
  const it = {
    slug,
    infoSlug: field(src, "slug"),
    name: field(src, "name"),
    group: field(src, "group"),
    kind: field(src, "kind"),
    family: field(src, "family"),
    blurb: field(src, "blurb"),
    description: field(src, "description"),
    added: field(src, "added"),
  };
  items.push(it);
  const where = `items/${slug}/info.ts`;
  if (it.infoSlug !== slug) errors.push(`${where}: slug is "${it.infoSlug}", but the folder is "${slug}". They must match.`);
  for (const k of ["name", "group", "blurb", "description", "added"]) if (!it[k]) errors.push(`${where}: "${k}" is missing.`);
  if (it.group && !["components", "buttons", "loaders", "sections", "skills", "animations"].includes(it.group))
    errors.push(`${where}: group must be components, buttons, loaders, sections, skills or animations (it is "${it.group}").`);
  if (it.added && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(it.added))
    errors.push(`${where}: added must look like "2026-11-12 14:30" (it is "${it.added}").`);
  if (it.description && it.description.length > 150)
    warnings.push(`${where}: the description is ${it.description.length} characters; keep it to 150 or fewer (two lines), per the descriptions skill.`);
}

// 3. The pieces each kind of item needs.
const isFamily = (it) => it.kind === "family";
const isSkill = (it) => it.group === "skills";
const ships = (it) => !isFamily(it) && !isSkill(it); // has a component people install
for (const it of items) {
  const s = it.slug;
  const need = (file, why) => !has(s, file) && errors.push(`${s}: ${file} is missing (${why}).`);
  need("docs.tsx", "its docs page");
  if (ships(it)) {
    need(`${s}.tsx`, "the component people install");
    need("demo.tsx", "the live preview on its docs page");
    need("tv.tsx", "its channel on the home iMac; without it the TV goes blank");
    need("prompts.ts", "its Install and Blend prompts");
    if (has(s, "prompts.ts")) {
      const p = read(join(ITEMS, s, "prompts.ts"));
      for (const fn of ["installPrompt", "blendPrompt"])
        if (!new RegExp(`export function ${fn}\\(`).test(p)) errors.push(`${s}: prompts.ts must export ${fn}().`);
    }
    if (!existsSync(join("public/r", `${s}.json`)))
      warnings.push(`${s}: no install file yet. Run \`pnpm registry:build\` so ${SITE}/r/${s}.json works.`);
  }
  if (isSkill(it) && has(s, "prompts.ts")) errors.push(`${s}: skills have no prompts; remove prompts.ts.`);
  if (it.family) {
    const fam = items.find((f) => f.slug === it.family);
    if (!fam || !isFamily(fam)) errors.push(`${s}: family "${it.family}" is not a family page in items/list.ts.`);
    if (has(s, "demo.tsx") && !/export function Thumb\(/.test(read(join(ITEMS, s, "demo.tsx"))))
      errors.push(`${s}: demo.tsx must export Thumb(), the card picture on the ${it.family} page.`);
  }
  if (isFamily(it) && !items.some((m) => m.family === s)) warnings.push(`${s}: this family page has no members yet.`);
  if (!existsSync("README.md") || !read("README.md").includes(`/docs/${s})`))
    warnings.push(`${s}: README.md doesn't link to /docs/${s} yet. Add it to the table for its group.`);
}

for (const w of warnings) console.warn(`items: note: ${w}`);
if (errors.length) {
  console.error(`\nitems: ${errors.length} problem${errors.length > 1 ? "s" : ""} to fix first:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nSee docs/ADDING-AN-ITEM.md.\n");
  process.exit(1);
}

// 4. Write the generated files.
const OUT = "generated/items";
mkdirSync(OUT, { recursive: true });
const HEAD = "// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.\n";
const id = (slug) => slug.replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase());
const write = (file, text) => {
  const path = join(OUT, file);
  if (!existsSync(path) || read(path) !== text) writeFileSync(path, text);
};

write(
  "info.ts",
  HEAD +
    'import type { ItemInfo } from "@/lib/site";\n' +
    items.map((i) => `import { info as ${id(i.slug)} } from "@/items/${i.slug}/info";`).join("\n") +
    "\n\nexport const INFO: Record<string, ItemInfo> = {\n" +
    items.map((i) => `  "${i.slug}": ${id(i.slug)},`).join("\n") +
    "\n};\n",
);

// One small page file per item, so each docs page only loads its own demo.
// They are rebuilt every time and kept out of git (see .gitignore).
const ROUTE_MARK = "// Written by scripts/items.mjs";
for (const i of items) {
  const dir = join("app/docs", i.slug);
  const file = join(dir, "page.tsx");
  if (existsSync(file) && !read(file).startsWith(ROUTE_MARK)) {
    console.error(`items: app/docs/${i.slug}/page.tsx was written by hand. Move its content to items/${i.slug}/docs.tsx, then delete it.`);
    process.exit(1);
  }
  mkdirSync(dir, { recursive: true });
  const text =
    `${ROUTE_MARK} for /docs/${i.slug}. Don't edit: the page is items/${i.slug}/docs.tsx.\n` +
    `import Docs from "@/items/${i.slug}/docs";\n` +
    `import { info } from "@/items/${i.slug}/info";\n` +
    `import { itemMetadata } from "@/lib/site";\n` +
    `import { ItemJsonLd } from "@/components/site/json-ld";\n\n` +
    `export const metadata = itemMetadata(info);\n\n` +
    `export default function Page() {\n  return (\n    <>\n      <ItemJsonLd info={info} />\n      <Docs info={info} />\n    </>\n  );\n}\n`;
  if (!existsSync(file) || read(file) !== text) writeFileSync(file, text);
}
// Remove pages of items that left the list.
for (const d of readdirSync("app/docs")) {
  const file = join("app/docs", d, "page.tsx");
  if (!order.includes(d) && existsSync(file) && read(file).startsWith(ROUTE_MARK)) {
    rmSync(join("app/docs", d), { recursive: true });
    console.log(`items: removed the old page app/docs/${d}/`);
  }
}

const tv = items.filter((i) => has(i.slug, "tv.tsx"));
write(
  "tv.ts",
  HEAD +
    'import type { ComponentType } from "react";\n' +
    tv.map((i) => `import ${id(i.slug)} from "@/items/${i.slug}/tv";`).join("\n") +
    "\n\nexport const TV: Record<string, ComponentType<{ onReplay: () => void }>> = {\n" +
    tv.map((i) => `  "${i.slug}": ${id(i.slug)},`).join("\n") +
    "\n};\n",
);

const members = items.filter((i) => i.family);
write(
  "thumbs.ts",
  HEAD +
    'import type { ComponentType } from "react";\n' +
    members.map((i) => `import { Thumb as ${id(i.slug)} } from "@/items/${i.slug}/demo";`).join("\n") +
    "\n\nexport const THUMBS: Record<string, ComponentType> = {\n" +
    members.map((i) => `  "${i.slug}": ${id(i.slug)},`).join("\n") +
    "\n};\n",
);

// The install list, oldest first, for `pnpm registry:build` (shadcn).
const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "impeccable",
  homepage: SITE,
  items: items
    .filter(ships)
    .sort((a, b) => a.added.localeCompare(b.added))
    .map((i) => ({
      name: i.slug,
      type: "registry:component",
      title: i.name,
      description: JSON.parse(`"${i.description}"`),
      files: [{ path: `items/${i.slug}/${i.slug}.tsx`, type: "registry:component", target: `components/ui/${i.slug}.tsx` }],
    })),
};
const regText = JSON.stringify(registry, null, 2) + "\n";
if (!existsSync("registry.json") || read("registry.json") !== regText) writeFileSync("registry.json", regText);

console.log(`items: ${items.length} items checked, all pieces in place.`);
