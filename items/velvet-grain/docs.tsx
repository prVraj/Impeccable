import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { VelvetGrainDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/velvet-grain.json";

const USAGE = `"use client";
import { VelvetGrain } from "@/components/ui/velvet-grain";

export function Hero() {
  return (
    <VelvetGrain className="flex min-h-[560px] flex-col items-center justify-center gap-6 bg-background px-6">
      <h1 className="text-5xl font-semibold tracking-tight">Made for humans, once again</h1>
      <a href="/components" className="rounded-full border px-5 py-2.5">
        Browse components
      </a>
    </VelvetGrain>
  );
}`;

const PAGE_USAGE = `// Behind a whole page: fixed to the screen, under everything.
<VelvetGrain className="fixed inset-0 -z-10" />`;

const PROPS: [string, string, string][] = [
  ["color", "the text color", "Color of the grain. The specks are drawn at up to 36% of it, so pass a full color, like your text color or a muted one."],
  ["density", "0.5", "How much grain, from 0 (almost none) to 1 (dense). It always gathers a little more toward the bottom and in soft clouds."],
  ["radius", "90", "Size of the brush in px, at rest. It spreads about 30% wider while you move fast."],
  ["fade", "1800", "How long the brushed track takes to fill back in, in ms."],
  ["mass", "1", "How heavy the brush feels. 2 trails further behind and swings wider; 0.5 follows closely."],
  ["autoBrush", "false", "The brush draws slow figure eights on its own whenever nobody is pointing at it, and again once the pointer has rested for 1.2s. Made for previews and screens nobody touches."],
  ["children", "—", "Your content. It sits above the grain and works as normal: text can be selected and buttons clicked."],
  ["className / style", "—", "On the box. Give it a size (or fill its parent), and a background color if you want one: the grain has none."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/velvet-grain/velvet-grain.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/velvet-grain/velvet-grain.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml, pageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
    highlight(PAGE_USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-reacts", title: "How it reacts" },
    { id: "props", title: "Props" },
  ];

  const hint = <>Move your pointer across the grain, fast and slow. On a phone, drag a finger across it.</>;

  return (
    <DocsLayout slug="velvet-grain" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/velvet-grain.tsx"
        preview={<VelvetGrainDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "velvet-grain.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "velvet-grain.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact background and asks only which section it goes behind.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where, how much grain,
          and the color), then fits it to your brand without changing how the brush feels.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Wrap a section&apos;s content in it and give it a size. Everything inside sits above the grain.</Lede>
        <Tabs tabs={[{ id: "usage", label: "hero.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          For a whole page, leave it empty and fix it to the screen, so it stays one screen big however long the page is.
        </p>
        <div className="mt-4">
          <Tabs tabs={[{ id: "page", label: "layout.tsx", copy: PAGE_USAGE, body: <Html html={pageHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="how-it-reacts" title="How it reacts">
        <Lede>
          At rest it is a still, fine grain, thinner at the top and gathering toward the bottom in soft clouds. The pointer
          drags a soft brush through it, about <Code>radius</Code> wide.
        </Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The brush has weight. It trails the pointer on a spring, so it lags a beat behind, swings a little past a sharp
          turn and then settles, and it spreads wider when you move fast. Where it passes, the grain is smoothed into an
          even haze, lighter than thin grain and darker than thick grain, and a little extra grain piles up along the edges of the
          track, the way sand does. Once the brush moves on, the track holds its shape for a moment, then melts away evenly over{" "}
          <Code>fade</Code> ms, and the same specks come back. It listens to the pointer across the whole page, so it reacts under your headline and
          buttons too, and it never catches a click or a text selection. Phones have no hover, so there it stays still
          until a finger drags across it, and scrolling counts as a drag. With reduced motion the brush sits right under
          the pointer with no weight, and the track fills back in sooner. Nothing runs while it is at rest or off screen.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
