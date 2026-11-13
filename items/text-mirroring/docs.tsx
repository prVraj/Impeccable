import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { TextMirroringDemo, TextMirroringSizesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/text-mirroring.json";

const USAGE = `import { TextMirroring } from "@/components/ui/text-mirroring";

export function Hero() {
  return (
    <section className="grid place-items-center py-24">
      <TextMirroring as="h1" text="Made for humans" />
    </section>
  );
}`;

const SIZES = `<TextMirroring text="Made for humans" />            {/* 64px, the default */}
<TextMirroring text="Built with care" size={52} />  {/* 52px */}`;

const PROPS: [string, string, string][] = [
  ["text", "—", "The header text. Two to four short words read best."],
  ["as", '"h2"', 'Which tag it renders: "h1", "h2", "h3", "h4", "p", "span" or "div".'],
  ["size", "64", "Font size in px, 64 or 52. Bold, tight letter spacing. It shrinks to fit narrow screens."],
  ["depth", "auto", "How many smaller letters open inside each letter, 2 to 8. Automatic: 5 on tablets and desktops, 3 on phones (when the text shrinks to fit)."],
  ["duration", "1500", "Milliseconds for a 5-deep build, 400 to 4000. Fewer keep the same pace. Leaving takes about half."],
  ["active", "—", "Turn the mirror on or off yourself, for example while a card is hovered. Leave it out to use hover (tap on touch screens)."],
  ["className / style", "—", "Passed to the text. Its color is the color of the letters and of the glass."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/text-mirroring/text-mirroring.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/text-mirroring/text-mirroring.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml, sizesHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
    highlight(SIZES, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "sizes", title: "Sizes" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="text-mirroring" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/text-mirroring.tsx"
        preview={<TextMirroringDemo />}
        hint={
          <>
            Hover the name and hold still: smaller letters open inside each letter, one inside the other,
            then sink back when you leave. On a phone, tap it, and tap anywhere else to close. With reduced
            motion on, they simply fade in place.
          </>
        }
        files={[
          { id: "ts", label: "text-mirroring.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "text-mirroring.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="sizes" title="Sizes">
        <Lede>Two header sizes, 64px and 52px. Both shrink to fit a phone screen.</Lede>
        <TextMirroringSizesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "sizes", label: "sizes.tsx", copy: SIZES, body: <Html html={sizesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only which heading it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks five short questions
          (which heading, size, color, how deep and how slow), then fits it to your brand without changing how the mirror builds.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Give it the text. Everything else has a default.</Lede>
        <Tabs tabs={[{ id: "usage", label: "hero.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
