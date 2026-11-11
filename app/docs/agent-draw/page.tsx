import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { AgentDrawDemo } from "@/components/site/agent-draw-demo";
import { InstallCommand } from "@/components/site/install-command";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { agentDrawBlendPrompt, agentDrawInstallPrompt } from "@/lib/prompts";

export const metadata: Metadata = {
  title: "Agent-Draw · Impeccable",
  description: "A loader where named cursors draw your page's skeleton live, then the real content fades in.",
};

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/agent-draw.json";

const USAGE = `"use client";
import { AgentDraw } from "@/components/ui/agent-draw";

export function ProfilePage() {
  const { data, isLoading } = useProfile(); // any data fetching

  return (
    <AgentDraw loading={isLoading}>
      <ProfileHeader user={data?.user} />
      <About text={data?.about} />
      <Projects items={data?.projects} />
    </AgentDraw>
  );
}`;

const USAGE_SECTIONS = `// Long page? Wrap each section. Each one draws when it scrolls
// into view, and they share the same cursors (never more than 8).
<AgentDraw loading={isLoading}><Hero /></AgentDraw>
<AgentDraw loading={isLoading}><Projects /></AgentDraw>
<AgentDraw loading={isLoading}><Footer /></AgentDraw>`;

const PROPS: [string, string, string][] = [
  ["loading", "false", "True while your data loads. The drawing runs either way; if it's still true at the end, the skeleton shimmers until it turns false."],
  ["duration", "3500", "Length of the drawing, in ms."],
  ["maxAgents", "8", "Most cursors on screen at once on desktop (never more than 9)."],
  ["maxAgentsMobile", "4", "Most cursors on screen at once on phones."],
  ["names", '["Vraj", "Sensei", "Impeccable"]', 'Cursor names, in order. The rest become "Agent 4", "Agent 5"…'],
  ["colors", "10 light colors", "Cursor colors, in order. Keep them light: the name tags use dark text."],
  ["sizeTags", "true", "Show the W × H tag while a box is dragged."],
  ["once", "—", 'A key like "profile". Draws only on the first visit; later visits just fade in.'],
  ["onDone", "—", "Called when the real content is fully shown."],
  ["className", "—", "Your layout classes, for the box that holds the content."],
];

export default async function AgentDrawPage() {
  const root = process.cwd();
  const ts = await readFile(join(root, "registry/impeccable/agent-draw/agent-draw.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/agent-draw/agent-draw.jsx"), "utf8");
  const installPrompt = agentDrawInstallPrompt(ts);
  const blendPrompt = agentDrawBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml, sectionsHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
    highlight(USAGE_SECTIONS, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
    { id: "code", title: "Code" },
    { id: "prompts", title: "Prompts" },
  ];

  return (
    <>
      <DocsLayout slug="agent-draw" sections={SECTIONS}>
        <PageTitle
          name="Agent-Draw"
          description="Instead of a spinner, a few named cursors draw your page's skeleton live, top to bottom, one cursor per shape. While they draw, your data loads; then the real content fades in."
          tags={["Loader", "No extra packages", "Light + dark", "Mobile"]}
        />

        <DocSection id="preview" title="Preview">
          <AgentDrawDemo />
          <p className="mt-3 text-[13px] leading-relaxed text-pretty text-[var(--muted)]">
            Everything in the window opens the matching part of Vraj&apos;s portfolio. Turn on{" "}
            <span className="text-[var(--fg)]">Slow data</span> to see the skeleton shimmer while data
            takes longer than the drawing. With reduced motion on, the content simply fades in.
          </p>
        </DocSection>

        <DocSection id="installation" title="Installation">
          <Lede>Run the command in a project set up with shadcn. No other packages needed.</Lede>
          <InstallCommand url={REGISTRY_URL} />
          <p className="mt-3 text-sm text-[var(--muted)]">
            Or copy the code below into <Code>components/ui/agent-draw.tsx</Code>.
          </p>
        </DocSection>

        <DocSection id="usage" title="Usage">
          <Lede>
            Wrap the part of the page that loads, and pass your loading state. It reads the layout
            inside and turns every block into a rectangle or circle.
          </Lede>
          <Tabs tabs={[{ id: "usage", label: "profile-page.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
          <p className="mt-6 mb-4 text-[15px] leading-relaxed text-[var(--muted)]">
            Add <Code>data-agent-draw</Code> to draw an element as one solid shape (good for image
            placeholders), or <Code>data-agent-skip</Code> to leave it out. On a long page, wrap each section.
          </p>
          <Tabs tabs={[{ id: "sections", label: "long-page.tsx", copy: USAGE_SECTIONS, body: <Html html={sectionsHtml} /> }]} />
        </DocSection>

        <DocSection id="props" title="Props">
          <PropsTable rows={PROPS} />
        </DocSection>

        <DocSection id="code" title="Code">
          <Tabs
            tabs={[
              { id: "ts", label: "agent-draw.tsx", copy: ts, body: <Html html={tsHtml} /> },
              { id: "js", label: "agent-draw.jsx", copy: js, body: <Html html={jsHtml} /> },
            ]}
          />
        </DocSection>

        <DocSection id="prompts" title="Prompts">
          <Lede>
            Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
            adds this exact component and asks only which screen should load with it.{" "}
            <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
            (where, names, colors, speed), then fits it to your brand without changing how it draws.
          </Lede>
          <Tabs
            tabs={[
              { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
              { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
            ]}
          />
        </DocSection>
      </DocsLayout>
    </>
  );
}
