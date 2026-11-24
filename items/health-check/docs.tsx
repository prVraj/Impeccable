import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Button } from "@/components/site/button";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle } from "@/components/site/doc-parts";
import { CopyButton } from "@/components/site/copy-button";
import { FileView } from "@/components/site/file-view";
import { Html } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import type { ItemInfo } from "@/lib/site";

const ZIP = "/downloads/health-check.zip";
const CLAUDE_CODE = "unzip ~/Downloads/health-check.zip -d ~/.claude/skills";

const STEPS: [string, string][] = [
  ["Learn the project", "It reads your scripts, package manager and pages, then runs a quick scan, so every check runs the way your project does."],
  ["See what is going out", "It names every changed file and leaves out leftovers like screenshots, scratch files and copies."],
  ["Secrets", "It makes sure no key, password file or private note is about to go public, and tells you what to replace if one ever did."],
  ["Packages", "It runs an audit, fixes serious holes in what your site ships, and only installs versions that have been out for two weeks."],
  ["Risky code", "It reads the changes for the few ways a site really gets hurt, like HTML from a visitor or links that run code."],
  ["Security headers", "It checks the headers that keep other sites out of yours, and offers a starter set if you have none."],
  ["The README", "It checks that every claim, command and link in your README is still true, and changes nothing that is."],
  ["Build and look", "It builds the site, then opens every page in light and dark, on desktop and phone, with the console open."],
  ["Hand over", "It tells you Ready to push or Not yet, what it fixed, and gives you the commands. It never pushes for you."],
];

const TREE = `health-check/
  SKILL.md            the nine steps, read before every push
  references/         one file per step, plus where each rule comes from
    headers.md        starter security headers for Next.js, Vercel, Netlify and Cloudflare
  examples/           a handover that is ready, and one that blocks the push
  teaching/           common mistakes, each with its fix
  scripts/scan.mjs    a quick first pass that never changes a file
  evals/              test cases for anyone changing the skill
  README.md           what is inside and how to change it
  LICENSE             MIT`;

const SECTIONS = [
  { id: "download", title: "Download" },
  { id: "install", title: "Install" },
  { id: "what-it-checks", title: "What it checks" },
  { id: "what-you-get", title: "What you get" },
];

export default async function Docs({ info }: { info: ItemInfo }) {
  // The skill's main file, shown under the download button so people can read it first.
  const skillMd = await readFile(join(process.cwd(), "skills/health-check/SKILL.md"), "utf8");
  const skillHtml = await highlight(skillMd, "md");
  return (
    <>
      <DocsLayout slug="health-check" sections={SECTIONS}>
        <PageTitle name={info.name} description={info.description} tags={info.tags} />

        <DocSection id="download" title="Download">
          <Lede>One zip with everything inside. Free to use, change and share.</Lede>
          <Button
            href={ZIP}
            download
            data-cta-sound
            size="lg"
            leading={
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M8 2.5v8M4.75 7.5 8 10.75 11.25 7.5M3 13.25h10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            Download Health check
          </Button>
          <p className="mt-8 mb-3 text-[15px] leading-relaxed text-[var(--muted)]">
            Read it before you install. This is <Code>SKILL.md</Code>, the file your AI tool reads first.
          </p>
          <FileView name="SKILL.md">
            <Html html={skillHtml} />
          </FileView>
        </DocSection>

        <DocSection id="install" title="Install">
          <h3 className="mb-2 text-[15px] font-medium">Claude on the web or desktop</h3>
          <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Open Settings, find Skills, and upload the zip as it is. No need to unzip it.
          </p>
          <h3 className="mb-2 text-[15px] font-medium">Claude Code</h3>
          <p className="mb-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Unzip it into your skills folder so it works in every project:
          </p>
          <div className="card flex items-center justify-between gap-2 overflow-hidden rounded-xl py-1.5 pr-2 pl-4">
            <code className="overflow-x-auto font-mono text-[13px] whitespace-nowrap">
              <span className="text-[var(--faint)] select-none">$ </span>
              {CLAUDE_CODE}
            </code>
            <CopyButton text={CLAUDE_CODE} />
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Then say <Code>is this ready to push?</Code> or <Code>run a health check</Code>. It also runs on its own when you ask to push, commit or deploy.
          </p>
        </DocSection>

        <DocSection id="what-it-checks" title="What it checks">
          <Lede>
            Nine steps, every time, even when you only asked about one. It fixes what a small edit can fix and tells you the rest.
            Made for websites and front ends. If your project has its own server, logins or a database, it says that part needs its own review.
          </Lede>
          <ol className="card divide-y divide-[var(--line)] overflow-hidden rounded-xl">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4 px-4 py-3.5">
                <span className="mt-px font-mono text-xs text-[var(--faint)] tabular-nums">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium tracking-tight">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-pretty text-[var(--muted)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </DocSection>

        <DocSection id="what-you-get" title="What you get">
          <Lede>
            A short answer you can act on: Ready to push or Not yet, what it checked and fixed, what is safe to leave, and what needs a
            real phone. Then the commands, adding only your own files, so nothing half done goes out with them.
          </Lede>
          <div className="card overflow-x-auto rounded-xl px-4 py-3.5">
            <pre className="font-mono text-[12.5px] leading-relaxed text-[var(--muted)]">{TREE}</pre>
          </div>
        </DocSection>
      </DocsLayout>
    </>
  );
}
