import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { BrainMapDemo } from "@/components/site/brain-map-demo";
import { InstallCommand } from "@/components/site/install-command";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { brainMapBlendPrompt, brainMapInstallPrompt } from "@/lib/prompts";

export const metadata: Metadata = {
  title: "Brain-Map · Impeccable",
  description: "A brain in the middle of a web of dots. Each dot holds a thought; drag the web to play with it.",
};

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/brain-map.json";

const USAGE = `"use client";
import { BrainMap, type Thought } from "@/components/ui/brain-map";

const THOUGHTS: Thought[] = [
  { text: "Boredom is the waiting room for ideas." },
  { text: "If it's worth thinking twice, it's worth writing once.", tag: "writing" },
  { text: "Copy first, then make it yours.", featured: true },
  { text: "Rest is part of the work.", brain: false }, // never linked to the brain
  // …as many as you like. 8 to 20 looks best.
];

export function Thoughts() {
  return <BrainMap thoughts={THOUGHTS} />;
}`;

const PROPS: [string, string, string][] = [
  ["thoughts", "—", "The dots. Each is { text, tag?, featured?, brain? }. 8 to 20 looks best."],
  ["brainLinks", "true", "Draw direct lines from the brain to the inner dots. False turns them all off."],
  ["thoughts[].brain", "auto", "Per dot: true always links it to the brain, false never does. Left out, the dots closest to the brain link."],
  ["maxLinks", "3", "Most links a dot has to other dots: 1, 2 or 3. It can never go above 3."],
  ["center", '"🧠"', "What sits in the middle: an emoji, an image or any small element."],
  ["accent", '"#3b8ff6"', "Color for lit lines, featured dots and tags. Any CSS color, including var(--name)."],
  ["hint", "Click on dots…", "Small help text under the map. Pass null to hide it."],
  ["seed", "7", "Changes the layout. Same seed, same map."],
  ["height", "420", "Height of the map, hint included."],
  ["className / style", "—", "Layout for the outer box."],
];

export default async function BrainMapPage() {
  const root = process.cwd();
  const ts = await readFile(join(root, "registry/impeccable/brain-map/brain-map.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/brain-map/brain-map.jsx"), "utf8");
  const installPrompt = brainMapInstallPrompt(ts);
  const blendPrompt = brainMapBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
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
    <DocsLayout slug="brain-map" sections={SECTIONS}>
      <PageTitle
        name="Brain-Map"
        description="A brain sits in the middle of a web of dots, and each dot holds one of your thoughts. Hover a dot to light up its links, click it to read it, and drag anything to play with the web. Every dot links to at most 3 nearby dots, so it never gets crowded."
        tags={["Interactive", "No extra packages", "Light + dark", "Mobile"]}
      />

      <DocSection id="preview" title="Preview">
        <BrainMapDemo />
        <p className="mt-3 text-[13px] leading-relaxed text-pretty text-[var(--muted)]">
          Drag the empty space to move the whole web, or drag a dot or the brain to pull it around.
          Everything springs back. With reduced motion on, nothing wobbles.
        </p>
      </DocSection>

      <DocSection id="installation" title="Installation">
        <Lede>Run the command in a project set up with shadcn. No other packages needed.</Lede>
        <InstallCommand url={REGISTRY_URL} />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Or copy the code below into <Code>components/ui/brain-map.tsx</Code>.
        </p>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>
          Give it a list of thoughts. The map places the dots, links each one to its nearest neighbours
          (never more than 3) and links the inner dots to the brain.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "thoughts.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="code" title="Code">
        <Tabs
          tabs={[
            { id: "ts", label: "brain-map.tsx", copy: ts, body: <Html html={tsHtml} /> },
            { id: "js", label: "brain-map.jsx", copy: js, body: <Html html={jsHtml} /> },
          ]}
        />
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
          (where, your thoughts, the center and the colors), then fits it to your brand without changing how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>
    </DocsLayout>
  );
}
