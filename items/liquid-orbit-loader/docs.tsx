import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { LiquidOrbitLoaderDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/liquid-orbit-loader.json";

const USAGE = `"use client";
import { LiquidOrbitLoader } from "@/components/ui/liquid-orbit-loader";

export function DashboardLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <LiquidOrbitLoader
        size={64}                    // optional: 24 to 200 px
        label="Loading your boards"  // optional: the line under it, or null to hide it
        color="#f3f0fe"              // optional: the liquid where the light hits it
        glow="#ad98f7"               // optional: its deeper shade, edges and glow
      />
    </div>
  );
}`;

const PROPS: [string, string, string][] = [
  ["size", "64", "How big it is in px, 24 to 200. The ring and the drop grow with it."],
  ["label", '"Loading"', "The line under it. Pass null to hide it. Screen readers hear it either way (or \"Loading\" when it's hidden)."],
  ["color", "#f3f0fe (the lightest violet)", "The liquid where the light hits it, on the drop and the ring. Any CSS color, including var(--…). Keep it very light."],
  ["glow", "#ad98f7 (a light violet)", "The liquid's deeper shade toward the bottom, its thin edge on light pages and the soft glow round the ring. Any CSS color."],
  ["speed", "1", "1 is the designed pace. 0.5 is half as fast, 2 twice as fast (0.25 to 4)."],
  ["className / style, aria-*, …", "—", "On the outer box, which holds the loader with the label centered under it."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/liquid-orbit-loader/liquid-orbit-loader.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/liquid-orbit-loader/liquid-orbit-loader.jsx"), "utf8");
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

  const hint = <>Watch the drop drift around on its own while the ring bobs on a different beat, then the pool at the bottom of the ring when it pours back in. A new drop pulls out of it on a stretchy neck and lets go with a wobble.</>;

  return (
    <DocsLayout slug="liquid-orbit-loader" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/liquid-orbit-loader.tsx"
        preview={<LiquidOrbitLoaderDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "liquid-orbit-loader.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "liquid-orbit-loader.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact loader and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the line under
          it, the liquid colors, and the size), then fits it to your product without changing how it moves.
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
          Show it while you wait for something you can&apos;t measure. It loops on its own, so there is no{" "}
          <Code>value</Code> to pass.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "dashboard-loading.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A ring of liquid, a drop of the same liquid, and one loop of about 3.5 seconds.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Nothing here sits still. The drop floats around inside the ring on its own slow path and jiggles as it goes,
          the ring bobs on a different beat, and little bulges of liquid flow round the ring, so the two never move in
          step and the loop never looks the same twice. Every 3.5 seconds the ring turns over in 3D round the drop, on
          an axis that starts near upright and lies down as it turns, so it passes behind the drop and in front of it.
          Halfway through, the ring pulls apart into two streams that taper, slide round and shrink to nothing, and the
          drop shrinks and fades with it, leaving a faint ripple. After a breath, the ring pours itself back in from
          the bottom, both ends racing up to meet at the top, and liquid gathers in a pool at its bottom. A new drop
          rises out of that pool: it fades in, stretches up on a neck that thins as it pulls away, lets go with a
          wobble and floats off again. The liquid is lit from the top left, with a soft shine and a glint, and gets
          deeper toward the bottom, like it has weight. On a light page a thin violet edge holds its shape, since the
          lightest shade melts into white. It stops drawing when it is scrolled out of view or the tab is hidden. With
          reduced motion, the ring and the drop rest and only the glow slowly breathes.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
