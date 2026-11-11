import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle } from "@/components/site/doc-parts";
import { CopyButton } from "@/components/site/copy-button";

export const metadata: Metadata = {
  title: "UI-tongue · Impeccable",
  description: "A skill that learns your UI taste and writes you your own UI skill, so one-line prompts come out in your style.",
};

const ZIP = "/downloads/ui-tongue.zip";
const CLAUDE_CODE = "unzip ~/Downloads/ui-tongue.zip -d ~/.claude/skills";

const RULES: [string, string][] = [
  ["Your references first", "You share a few sites you love. It studies them, then asks what exactly grabbed you: the type, the spacing, the easing, the shadows. Vague answers get its own findings to pick from."],
  ["Nothing slips through", "Skip a question or just say yes, and it asks if you really want that in your skill. Say no, and it asks why, so it learns where it read you wrong."],
  ["Taste, not basics", "Every question has a reason to exist. Anything your references already answer, it reads instead of asking."],
  ["A sample before it's final", "It builds one hero in your taste, in light and dark, and asks what's off. Then it writes the skill."],
  ["Same taste, new projects", "Each project gets its own DESIGN.md that grows with it, so your projects feel related without looking the same."],
];

const QUESTIONS: { q: string; deep?: boolean }[] = [
  { q: "What do you mostly build, and for whom?" },
  { q: "Share 3 to 5 sites or apps you love." },
  { q: "For each one, what exactly grabbed you?" },
  { q: "Which sites or looks are you tired of, and what do you never want to see?" },
  { q: "Your brand colour, and where it shows." },
  { q: "Headlines: like Linear, Stripe, Apple, or an editorial serif?" },
  { q: "Dark mode: near-black, soft grey, or tinted with your brand?" },
  { q: "Edges and depth: hairlines, soft shadows, glass, or flat?" },
  { q: "Density: lots of air, or rich and informative?" },
  { q: "Imagery: screenshots, photos, illustration, or type only?", deep: true },
  { q: "How much motion: none, subtle, polished, or cinematic?" },
  { q: "Motion feel: snappy, elegant, bouncy, or heavy?" },
  { q: "Your entrance and hover pair." },
  { q: "Scroll: nothing, reveals, scrubbed, or pinned?", deep: true },
  { q: "Copy voice: pick a headline, or rewrite it your way." },
  { q: "When you're vague: ask first, or decide and show the brief?" },
];

const TREE = `yourname-ui/
  SKILL.md            runs on every UI request you make
  references/
    taste.md          your answers, as rules
    DESIGN.md         the starting point for each project's own DESIGN.md
    tokens.css        colours, type, radius, motion as CSS variables
    motion.md         your easing, durations, entrance and hover
    references.md     the sites you love, and what to take from each
    never.md          what you never want to see
    floor.md          quality rules every build follows
    feedback-log.md   every "no, because..." so it keeps learning`;

const SECTIONS = [
  { id: "download", title: "Download" },
  { id: "install", title: "Install" },
  { id: "how-it-works", title: "How it works" },
  { id: "questions", title: "The questions" },
  { id: "what-you-get", title: "What you get" },
];

export default function UiTonguePage() {
  return (
    <>
      <DocsLayout slug="ui-tongue" sections={SECTIONS}>
        <PageTitle
          name="UI-tongue"
          description="Ask any AI for a hero section and you get the same hero as everyone else. UI-tongue learns your taste in about 15 minutes and writes you your own UI skill, so a one-line prompt comes out looking like you made it."
          tags={["Skill", "Claude", "Free + MIT", "Web UI"]}
        />

        <DocSection id="download" title="Download">
          <Lede>One zip with everything inside. Free to use, change and share.</Lede>
          <a
            href={ZIP}
            download
            className="press btn-brand inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
              <path
                d="M8 2.5v8M4.75 7.5 8 10.75 11.25 7.5M3 13.25h10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download UI-tongue
          </a>
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
            Then just say <Code>make my UI skill</Code>. It takes it from there.
          </p>
        </DocSection>

        <DocSection id="how-it-works" title="How it works">
          <Lede>
            It knows the quality rules good interfaces share, like contrast, reduced motion and
            working on phones, so it never asks about those. It only asks about taste.
          </Lede>
          <ol className="card divide-y divide-[var(--line)] overflow-hidden rounded-xl">
            {RULES.map(([title, body], i) => (
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

        <DocSection id="questions" title="The questions">
          <Lede>
            Quick mode asks 14 and takes about 15 minutes, including a sample it builds for you. Say &ldquo;deep mode&rdquo; for all 16.
            Every question comes with a suggested answer taken from your own references.
          </Lede>
          <ol className="max-w-2xl space-y-2 text-[15px] leading-relaxed text-[var(--muted)]">
            {QUESTIONS.map(({ q, deep }, i) => (
              <li key={q} className="flex gap-3">
                <span className="w-5 shrink-0 text-right font-mono text-xs leading-[1.6rem] text-[var(--faint)] tabular-nums">{i + 1}</span>
                <span>
                  {q}
                  {deep && (
                    <span className="ml-2 rounded-full border border-[var(--line)] px-1.5 py-px align-[1px] text-[11px] text-[var(--faint)]">
                      Deep
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </DocSection>

        <DocSection id="what-you-get" title="What you get">
          <Lede>
            A skill folder that&apos;s yours. It turns every short request into a brief in your taste,
            shows you the brief, builds, and checks the result. Tell it &ldquo;I don&apos;t like
            that&rdquo; any time and it offers to remember.
          </Lede>
          <div className="card overflow-x-auto rounded-xl px-4 py-3.5">
            <pre className="font-mono text-[12.5px] leading-relaxed text-[var(--muted)]">{TREE}</pre>
          </div>
        </DocSection>
      </DocsLayout>
    </>
  );
}
