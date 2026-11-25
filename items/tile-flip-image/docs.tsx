import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { TileFlipImageDemo, TileFlipImageSizesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/tile-flip-image.json";

const USAGE = `"use client";
import { TileFlipImage } from "@/components/ui/tile-flip-image";

// Give it a new src and the tiles turn over to it.
// The box covers its width at 3:2; corners come from className.
export function ProductShot({ shot }: { shot: { src: string; alt: string } }) {
  return <TileFlipImage src={shot.src} alt={shot.alt} className="w-full max-w-xl rounded-2xl" />;
}`;

const TYPES = `<TileFlipImage src={src} alt={alt} tile={8} />    // fine
<TileFlipImage src={src} alt={alt} />              // default, about 14px
<TileFlipImage src={src} alt={alt} tile={28} />   // bold`;

const PROPS: [string, string, string][] = [
  ["src", "—", "The picture to show. Give it a new one and the tiles turn over to it, once it has loaded."],
  ["alt", "—", "What the picture shows, for screen readers, like on an image."],
  ["tile", "14", "About how wide each tile is, in pixels. Smaller is finer, larger is bolder. A very big picture never gets more than 3,000 tiles."],
  ["ratio", '"3 / 2"', "The box's shape, as a CSS aspect ratio like \"16 / 9\". The picture covers it, centered. Ignored when you set the height yourself."],
  ["className / style", "—", "On the box: its width, height and corners. The box clips the tiles, so rounded corners stay round while they turn."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/tile-flip-image/tile-flip-image.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/tile-flip-image/tile-flip-image.jsx"), "utf8");
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
    { id: "types", title: "Tile sizes" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      A new photo every 3 seconds, or press Next picture. Look closely: each tiny tile turns over like a card, the old photo
      on its front and the new one on its back, in a random order, until the whole photo has changed in 1.2 seconds.
    </>
  );

  return (
    <DocsLayout slug="tile-flip-image" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/tile-flip-image.tsx"
        preview={<TileFlipImageDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "tile-flip-image.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "tile-flip-image.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Tile sizes">
        <Lede>
          Three sizes, playing the same pictures. <strong className="font-medium text-[var(--fg)]">Fine</strong> tiles turn
          like a shimmer, the <strong className="font-medium text-[var(--fg)]">default</strong> reads as tiny tiles, and{" "}
          <strong className="font-medium text-[var(--fg)]">bold</strong> ones are blocks you can follow one by one.
        </Lede>
        <TileFlipImageSizesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "tile-sizes.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact picture and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the tile size, the
          shape and the corners), then fits it to your product without changing how the tiles turn.
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
          Pass the picture to <Code>src</Code> and <Code>alt</Code>, and size the box with <Code>className</Code>. Use pictures
          of about the same shape, so the old and new line up the same way.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "product-shot.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>Nothing moves until the new picture has fully loaded. Then the whole picture changes in 1.2 seconds.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The picture is cut into tiny square tiles about 14 pixels wide, each holding its own piece of the old picture on its
          front and the same piece of the new one on its back. The tiles are shuffled, and their starts follow a soft curve: a
          few first, most in the middle, a few last, so the whole change eases in and out. Each one turns over on its upright
          axis in 0.56 seconds: it lifts off gently, turns fastest when edge on and lands softly, darkening as it goes edge on,
          with the new picture a little darker in the gap beside it. The last tile lands at 1.2 seconds, and the drawing fades
          into a plain image in 0.16 seconds, so the end never blinks and nothing runs between changes. It is all drawn on one
          canvas, so thousands of tiles stay smooth, even on a phone. A picture asked for mid change waits for that change to
          land. With reduced motion no tile turns: the new picture simply fades in over 0.3 seconds.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
