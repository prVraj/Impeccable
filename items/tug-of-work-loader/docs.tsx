import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { TugOfWorkLoaderDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/tug-of-work-loader.json";

const USAGE = `"use client";
import { TugOfWorkLoader } from "@/components/ui/tug-of-work-loader";

export function UploadProgress({ percent }: { percent: number }) {
  return (
    <TugOfWorkLoader
      value={percent}                              // 0 to 100; leave it out to loop on its own
      label="Developers are working really hard."  // optional: the support text under the bar
      color="var(--foreground)"                    // optional: the person, rope, border and fill tint
      onComplete={() => toast("Upload done")}      // optional: runs when it reaches 100
      className="max-w-sm"
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["value", "—", "Progress from 0 to 100. The person pulls the fill to it, never faster than about a third of the bar a second. Leave it out and the bar loops on its own, pulling and pausing like real work."],
  ["label", '"Developers are working really hard."', "The support text under the bar. It wraps on narrow screens. Pass null to hide it."],
  ["showValue", "true", "Shows the percentage at the right, under the bar."],
  ["color", "the text color around it", "The person, the rope, the border and the fill's tint. Any CSS color, including var(--…). The bar itself stays see-through."],
  ["height", "44", "How tall the bar is in px, 28 to 64. The person grows with it and always stays inside the border."],
  ["duration", "8000", "Looping only: how long one pull from 0 to 100 takes, in ms, 3000 to 30000."],
  ["onComplete", "—", "Runs each time the fill reaches 100."],
  ["className / style, aria-*, …", "—", "On the outer box. It fills the width it is given, so set a max width here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/tug-of-work-loader/tug-of-work-loader.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/tug-of-work-loader/tug-of-work-loader.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = <>It loops on its own here. Watch the pauses: that is where they strain on the rope.</>;

  return (
    <DocsLayout slug="tug-of-work-loader" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/tug-of-work-loader.tsx"
        preview={<TugOfWorkLoaderDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "tug-of-work-loader.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "tug-of-work-loader.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact loader and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and what it
          tracks, the support text, the color, and the size), then fits it to your product without changing how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>
          Pass your real progress as <Code>value</Code>. Without it the bar loops, which suits waits you can&apos;t measure.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "upload-progress.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>The bar is see-through: a thin border and a striped tint. The only solid thing in it is the person.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          A tiny person stands inside the bar, facing the fill, leaning back on a rope tied to its front edge. As the
          progress grows they walk backwards and haul the fill along, their steps matching the distance pulled. When the
          bar waits, they keep heaving on the rope, lean further back, shake a little and now and then a drop of sweat
          flies off. Near the end they run out of room, so they stay put and pull the rope in hand over hand until the
          fill reaches them. At 100% they throw their arms up and hop twice. When looping, the finished bar rests for a
          moment, fades and starts over. Everything, the person, the rope and the sweat, is clipped to the inside of the
          border, so nothing ever spills out. With reduced motion, the fill still moves but the person stands still,
          with no steps, heaves or hops.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
