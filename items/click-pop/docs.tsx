import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { ClickPopDemo, ClickPopTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/click-pop.json";

const USAGE = `// app/layout.tsx: once, and every click on the site pops.
import { ClickPop } from "@/components/ui/click-pop";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClickPop type="burst" color="var(--primary)" />
      </body>
    </html>
  );
}

// Or only inside one part of a page:
<ClickPop type="ring" className="rounded-2xl border p-8">
  <Pricing />
</ClickPop>

// Or from code, at any point on the screen:
import { clickPop } from "@/components/ui/click-pop";
clickPop(event.clientX, event.clientY, { type: "particles" });`;

const TYPES = `<ClickPop type="burst" />      // four lines shoot out above the pointer tip
<ClickPop type="ring" />       // a thin ring opens around the click
<ClickPop type="particles" />  // eight dots scatter and drift down
<ClickPop type="crosshair" />  // four ticks swing in and lock on
<ClickPop type="wavy" />       // four lines wriggle out, then straighten`;

const PROPS: [string, string, string][] = [
  ["type", '"burst"', 'Which pop: "burst", "ring", "particles", "crosshair" or "wavy".'],
  ["color", "soft violet", "Any CSS color, like \"var(--primary)\" or \"currentColor\". It follows your theme when you pass a variable."],
  ["size", "1", "1 is the designed size. 0.7 is smaller, 1.3 bigger."],
  ["touch", "true", "Pop on touch taps too. false keeps it to mouse and pen."],
  ["children", "—", "Wrap part of a page and only clicks inside it pop. Without children, every click on the page pops."],
  ["className / style", "—", "On the wrapper, only when there are children."],
  ["clickPop(x, y, options)", "—", "Fires one pop from code at a point on the screen. Takes type, color and size."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/click-pop/click-pop.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/click-pop/click-pop.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, typesHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(TYPES, "tsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Types" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Click anywhere on the card, then pick another type below and click again. Each pop starts at the very tip of your
      pointer and is gone in about half a second.
    </>
  );

  return (
    <DocsLayout slug="click-pop" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/click-pop.tsx"
        preview={<ClickPopDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "click-pop.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "click-pop.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Five types, each popping on its own in turn. Click a box to pop it yourself.{" "}
          <strong className="font-medium text-[var(--fg)]">Burst</strong> is the default: four short lines above the tip,
          the one this website uses. <strong className="font-medium text-[var(--fg)]">Ring</strong> and{" "}
          <strong className="font-medium text-[var(--fg)]">Crosshair</strong> are the calmest,{" "}
          <strong className="font-medium text-[var(--fg)]">Particles</strong> and{" "}
          <strong className="font-medium text-[var(--fg)]">Wavy</strong> the most playful.
        </Lede>
        <ClickPopTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact pop and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, which type, the
          color and taps on phones), then fits it to your product without changing how it moves.
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
          Put <Code>{"<ClickPop />"}</Code> once in your layout and every click on the site pops. Wrap part of a page in it to
          keep the pops inside that part, or call <Code>clickPop()</Code> to fire one from code.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "layout.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>Every pop starts at the very tip of the pointer, on the frame of the press, and is gone in about half a second.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Burst throws four short lines up and out from just above the tip; they travel about 22px, shrink to dots and fade
          after the halfway mark, in 0.42 seconds. Ring opens from 3px to 26px around the click while its line thins out, in
          0.52 seconds. Particles throws eight dots all around, each a little off its slot and a little farther or nearer, then
          lets them drift down as they shrink, in 0.62 seconds. Crosshair starts as a cross turned 45 degrees, swings straight
          as its four ticks close in on the click, and a dot appears in the middle, in 0.48 seconds. Wavy sends four lines out
          to the left and up, wriggling as they go; they straighten as they arrive, then shrink toward their outer end until
          they are dots, in 0.4 seconds. Nothing is on the page until the first click, the pops never catch the pointer, so
          clicks and text selection pass straight through, and each one removes itself when it ends. With reduced motion
          there are no pops.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
