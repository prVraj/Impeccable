#!/usr/bin/env node
// Health check scan: the parts of the check a script can do. Read-only: it never changes a file.
// Needs Node 18+ and git. Run from the project's root folder:
//   node <path-to-skill>/scripts/scan.mjs            (checks staged + unstaged changes and new files)
//   node <path-to-skill>/scripts/scan.mjs --all      (also scans every tracked file for secrets)
// Prints one line per finding, grouped, then "0 problems" or "<n> problems". Exit code 1 on problems.
// "look:" lines need a person's judgment and don't fail the scan.

import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const ALL = process.argv.includes("--all");
const sh = (cmd) => {
  try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }); }
  catch { return ""; }
};
if (!sh("git rev-parse --is-inside-work-tree").trim()) {
  console.error("Not a git folder. Run this from the project's root.");
  process.exit(2);
}

const problems = [];
const looks = [];
const bad = (group, msg) => problems.push(`[${group}] ${msg}`);
const look = (group, msg) => looks.push(`look: [${group}] ${msg}`);

// ---------- What is going out
const status = sh("git status --porcelain=v1 -uall").split("\n").filter(Boolean);
const changed = status.map((l) => l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop());
const LEFTOVER = [
  [/(^|\/)\.DS_Store$/, "macOS folder file"],
  [/\.tmp$|\.bak$|~$/, "scratch or backup file"],
  [/(^|\/)\.fuse_hidden/, "stale copy left by an editor on a mounted folder"],
  [/ copy( \d+)?\.[a-z]+$/i, "a copy of another file"],
  [/(^|\/)(\.next|dist|out|build|coverage)\//, "build output"],
  [/\.(png|jpe?g|mov|mp4)$/i, "a picture or video: is it used by the site, or a screenshot?"],
];
for (const f of changed) {
  for (const [re, why] of LEFTOVER) {
    if (!re.test(f)) continue;
    if (/\.(png|jpe?g|mov|mp4)$/i.test(f) && /^public\//.test(f)) break; // site images live in public/
    (why.startsWith("a picture") ? look : bad)("going out", `${f}: ${why}`);
    break;
  }
}

// ---------- Secrets
const gi = existsSync(".gitignore") ? readFileSync(".gitignore", "utf8") : "";
for (const line of [".env*", "*.pem", "*.key"]) if (!gi.split("\n").map((s) => s.trim()).includes(line)) bad("secrets", `.gitignore has no "${line}" line`);
if (/^\.env\*$/m.test(gi) && !/^!\.env\.example$/m.test(gi) && existsSync(".env.example")) look("secrets", ".env.example exists but .gitignore doesn't keep it (!.env.example)");

const tracked = sh("git ls-files").split("\n").filter(Boolean);
for (const f of tracked) if (/(^|\/)\.env(\.|$)(?!example)|\.pem$|\.key$|(^|\/)id_(rsa|ed25519)$/.test(f)) bad("secrets", `${f} is tracked by git; remove it with git rm --cached and rotate what's inside`);

// Patterns from common secret scanners (gitleaks rule set), kept to ones with few false alarms.
const SECRET = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, "Anthropic key"],
  [/sk-(proj-)?[A-Za-z0-9_-]{32,}/, "OpenAI-style key"],
  [/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/, "GitHub token"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/AIza[0-9A-Za-z_-]{35}/, "Google API key"],
  [/xox[abposr]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/(sk|rk)_live_[A-Za-z0-9]{20,}/, "Stripe live key"],
  [/npm_[A-Za-z0-9]{36}/, "npm token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JSON web token (check it isn't a service key)"],
  [/\b(api[_-]?key|secret|password|token)\b\s*[:=]\s*["'][^"'\s]{12,}["']/i, "a hard-coded key or password"],
];
const added = sh("git diff HEAD --unified=0 --no-color") + sh("git diff --cached --unified=0 --no-color");
const newFiles = status.filter((l) => l.startsWith("??")).map((l) => l.slice(3));
const addedLines = [];
let cur = "";
for (const line of added.split("\n")) {
  if (line.startsWith("+++ b/")) cur = line.slice(6);
  else if (line.startsWith("+") && !line.startsWith("+++")) addedLines.push({ file: cur, text: line.slice(1) });
}
for (const f of newFiles) {
  try { if (statSync(f).size < 2_000_000) readFileSync(f, "utf8").split("\n").forEach((t) => addedLines.push({ file: f, text: t })); } catch {}
}
const scanText = (file, text) => {
  if (/(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/.test(file)) return;
  for (const [re, what] of SECRET) if (re.test(text)) bad("secrets", `${file}: looks like a ${what}: ${text.trim().slice(0, 80)}`);
};
for (const { file, text } of addedLines) scanText(file, text);
if (ALL) for (const f of tracked) { try { if (statSync(f).size < 2_000_000) readFileSync(f, "utf8").split("\n").forEach((t) => scanText(f, t)); } catch {} }

// ---------- Risky code in what changed
const CODE = /\.(m?[jt]sx?|vue|svelte|astro|html)$/;
const RISK = [
  [/dangerouslySetInnerHTML|\.innerHTML\s*=|v-html|\{@html/, "HTML from a string: only for build-time content or sanitized input", look],
  [/(?<![\w$])eval\s*\(|new Function\s*\(|setTimeout\s*\(\s*["'`]/, "code from a string", bad],
  [/href=\{?[^}]*javascript:/i, "a javascript: link", bad],
  [/localStorage\.setItem\([^)]*(token|password|secret|email)/i, "browser storage holding a token, password or personal data", bad],
  [/curl[^\n|]*\|\s*(ba|z)?sh/, "tells someone (or an agent) to pipe a download into a shell", bad],
];
const externalHosts = new Set();
for (const { file, text } of addedLines) {
  if (!CODE.test(file) && !/\.(md|css)$/.test(file)) continue;
  if (CODE.test(file)) {
    for (const [re, what, fn] of RISK) if (re.test(text)) fn("code", `${file}: ${what}: ${text.trim().slice(0, 90)}`);
  }
  for (const m of text.matchAll(/(?:src|href|url\()\s*=?\s*["'(]?(https?:\/\/[^/"' )]+)/g)) externalHosts.add(m[1]);
}
// New-tab links: read each changed code file whole, so a tag split over several lines is judged as one.
for (const f of new Set(changed.filter((f) => CODE.test(f) && existsSync(f)))) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/target=\{?["']_blank["']\}?/g)) {
    const start = src.lastIndexOf("<", m.index);
    const end = src.indexOf(">", m.index);
    const tag = src.slice(start, end === -1 ? undefined : end);
    if (!/noopener|noreferrer/.test(tag)) {
      const line = src.slice(0, m.index).split("\n").length;
      bad("code", `${f}:${line}: target="_blank" without rel="noopener noreferrer"`);
    }
  }
}
for (const h of externalHosts) look("outside", `new outside address in changed code: ${h}. If it loads a script, font, image or frame, the security policy must allow exactly this address.`);

// ---------- Security headers (where they are set)
const headerFiles = ["next.config.ts", "next.config.js", "next.config.mjs", "vercel.json", "netlify.toml", "public/_headers", "_headers", "vite.config.ts", "astro.config.mjs"].filter(existsSync);
const headerText = headerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
const HEADERS = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"];
const missing = HEADERS.filter((h) => !new RegExp(h, "i").test(headerText));
if (missing.length === HEADERS.length) look("headers", "no security headers found in the usual config files; offer the starter set (references/headers.md)");
else for (const h of missing) bad("headers", `${h} is not set (looked in ${headerFiles.join(", ") || "no config files"})`);
if (/X-XSS-Protection/i.test(headerText)) bad("headers", "X-XSS-Protection is set; remove it (OWASP: does more harm than good)");
if (/frame-ancestors/i.test(headerText) === false && !missing.includes("Content-Security-Policy")) look("headers", "the Content-Security-Policy has no frame-ancestors 'none'");

// ---------- Packages: cooldown setting
const pm = existsSync("pnpm-lock.yaml") ? "pnpm" : existsSync("yarn.lock") ? "yarn" : existsSync("bun.lock") || existsSync("bun.lockb") ? "bun" : "npm";
const cooldown = {
  pnpm: () => /minimumReleaseAge/.test(existsSync("pnpm-workspace.yaml") ? readFileSync("pnpm-workspace.yaml", "utf8") : ""),
  npm: () => /min-release-age/.test(existsSync(".npmrc") ? readFileSync(".npmrc", "utf8") : ""),
  yarn: () => /npmMinimalAgeGate/.test(existsSync(".yarnrc.yml") ? readFileSync(".yarnrc.yml", "utf8") : ""),
  bun: () => /minimumReleaseAge/.test(existsSync("bunfig.toml") ? readFileSync("bunfig.toml", "utf8") : ""),
}[pm]();
if (!cooldown) look("packages", `${pm} has no minimum release age set; the two-week rule is checked by hand (references/packages.md shows the one-line setting)`);
if (changed.some((f) => /^package\.json$/.test(f))) look("packages", "package.json changed: check every new or updated package was published at least two weeks ago");

// ---------- Report
console.log(`Package manager: ${pm}. Files going out: ${changed.length}.`);
for (const f of changed) console.log(`  ${f}`);
for (const p of problems) console.log(p);
for (const l of looks) console.log(l);
console.log(problems.length === 0 ? "0 problems" : `${problems.length} problems`);
process.exit(problems.length === 0 ? 0 : 1);
