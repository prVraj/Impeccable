#!/usr/bin/env node
// UI tongue gate: checks a generated taste skill before it's handed over. Read-only.
// Needs Node 18+. Usage:
//   node <this skill's folder>/scripts/check-skill.mjs <path to the generated skill folder>
// Prints one line per problem, then "0 problems" or "<n> problems". Exit code 1 on problems.
// "look:" lines need your judgment and don't fail the check.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = process.argv[2];
if (!dir || !existsSync(join(dir, "SKILL.md"))) {
  console.error("Usage: node check-skill.mjs <generated skill folder>  (the folder must hold SKILL.md)");
  process.exit(2);
}
const problems = [];
const looks = [];
const bad = (m) => problems.push(m);
const look = (m) => looks.push(`look: ${m}`);
const read = (p) => (existsSync(join(dir, p)) ? readFileSync(join(dir, p), "utf8") : null);
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

// ---------- Folder
const NEEDED = ["SKILL.md", "references/taste.md", "references/DESIGN.md", "references/tokens.css", "references/motion.md", "references/references.md", "references/never.md", "references/floor.md", "references/feedback-log.md"];
for (const f of NEEDED) if (read(f) === null) bad(`missing ${f}`);

// ---------- Frontmatter
const skill = read("SKILL.md");
const fm = skill.match(/^---\n([\s\S]*?)\n---/);
if (!fm) bad("SKILL.md has no frontmatter");
else {
  const keys = [...fm[1].matchAll(/^([a-z_-]+):/gm)].map((m) => m[1]);
  for (const k of keys) if (!["name", "description", "license", "metadata"].includes(k)) bad(`frontmatter has "${k}"; only name and description (license, metadata optional)`);
  const name = (fm[1].match(/^name:\s*(.+)$/m) || [])[1]?.trim().replace(/^["']|["']$/g, "");
  if (!name) bad("frontmatter has no name");
  else {
    if (!/^[a-z0-9-]{1,64}$/.test(name)) bad(`name "${name}": lowercase letters, digits and hyphens, 64 at most`);
    if (/claude|anthropic/.test(name)) bad(`name "${name}" can't contain claude or anthropic`);
    if (name !== basename(dir.replace(/\/+$/, ""))) bad(`name "${name}" doesn't match the folder "${basename(dir)}"`);
  }
  const desc = (fm[1].match(/^description:\s*(.+)$/m) || [])[1]?.trim();
  if (!desc) bad("frontmatter has no description");
  else {
    if (!/^".*"$/.test(desc)) bad("description isn't wrapped in double quotes");
    const inner = desc.replace(/^"|"$/g, "");
    if (inner.includes('"')) bad("description has a double quote inside it");
    if (/[<>]/.test(inner)) bad("description has an angle bracket");
    if (inner.length > 1024) bad(`description is ${inner.length} characters; 1024 at most`);
    if (!/one-line|one line|even a/i.test(inner)) look("description doesn't say it's for every UI request, including one-liners");
  }
}
const lines = skill.split("\n").length;
if (lines > 200) bad(`SKILL.md is ${lines} lines; keep it under 200`);

// ---------- Placeholders
for (const f of walk(dir)) {
  const rel = f.slice(dir.replace(/\/+$/, "").length + 1);
  const s = readFileSync(f, "utf8");
  if (/\{\{/.test(s)) bad(`${rel} still has a {{placeholder}}`);
  if (/\[\[[^\]\s]/.test(s) && rel !== "references/DESIGN.md") bad(`${rel} has a [[slot]]; those belong only in references/DESIGN.md`);
}

// ---------- tokens.css
const tokens = read("references/tokens.css") ?? "";
if (/spring|bounce/i.test(tokens.replace(/\/\*[\s\S]*?\*\//g, ""))) bad("tokens.css says spring or bounce; CSS easing is always a cubic-bezier");
for (const m of tokens.matchAll(/--ease[\w-]*:\s*([^;]+);/g)) if (!/cubic-bezier\(|linear|ease/.test(m[1])) bad(`tokens.css easing "${m[1].trim()}" isn't a cubic-bezier`);
for (const m of tokens.matchAll(/--(dur|duration)[\w-]*:\s*([^;]+);/g)) if (!/^\d+ms$/.test(m[2].trim())) bad(`tokens.css duration "${m[2].trim()}" isn't in ms`);
if ((tokens.match(/\{/g) || []).length !== (tokens.match(/\}/g) || []).length) bad("tokens.css has unbalanced braces");

// ---------- Rules: soft words, sources, whys
const SOFT = /\b(reasonably|appropriate(ly)?|try to|tasteful(ly)?|nice|clean|modern|sleek|as needed|if possible)\b/i;
// never.md and quoted words are the person's own: they stay as said.
for (const f of ["SKILL.md", "references/taste.md", "references/motion.md", "references/DESIGN.md"]) {
  const s = read(f);
  if (!s) continue;
  s.split("\n").forEach((line, i) => {
    if (/^\s*(#|<!--)/.test(line)) return;
    const m = line.replace(/"[^"]*"|“[^”]*”/g, "").match(SOFT);
    if (m) bad(`${f}:${i + 1} soft word "${m[0]}": write the value instead`);
  });
}
const taste = read("references/taste.md") ?? "";
const rows = taste.split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Decision \| Choice/.test(l));
for (const r of rows) {
  const cells = r.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length < 4) continue;
  if (!cells[2]) bad(`taste.md row "${cells[0]}" has no why`);
  if (!/^(said|picked|confirmed)$/.test(cells[3])) bad(`taste.md row "${cells[0]}" source is "${cells[3]}"; use said, picked or confirmed`);
}

// ---------- floor.md is an unchanged copy
const here = dirname(fileURLToPath(import.meta.url));
const floor = join(here, "..", "references", "floor.md");
if (existsSync(floor) && read("references/floor.md") !== null && read("references/floor.md") !== readFileSync(floor, "utf8")) bad("references/floor.md differs from UI tongue's floor.md; copy it unchanged");

for (const p of problems) console.log(p);
for (const l of looks) console.log(l);
console.log(problems.length ? `${problems.length} problems` : "0 problems");
process.exit(problems.length ? 1 : 0);
