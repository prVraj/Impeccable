import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PixelTremorButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/pixel-tremor-button.json";

const USAGE = `"use client";
import { PixelTremorButton } from "@/components/ui/pixel-tremor-button";

export function HeroAction() {
  return (
    <PixelTremorButton
      color="var(--background)"   // optional: the button (default white)
      textColor="var(--foreground)" // optional: the label
      pixel={6}                   // optional: block size in px
      reach={34}                  // optional: how big the pixel chunk is
      onClick={() => router.push("/signup")}
    >
      Start building
    </PixelTremorButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Normal, sharp text that never pixelates. It stays on one line and trims with … if it runs out of room."],
  ["color", "white", "The button's color. Any CSS color, including var(--…)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the button."],
  ["pixel", "6", "The size of one pixel block in px, 2 to 10. Bigger blocks look chunkier."],
  ["reach", "34", "How far in px from the pointer the button breaks into blocks, 12 to 80. The edge of the chunk is ragged on purpose."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled stops the pixels and the wave."],
  ["className / style", "—", "On the button itself. It is 44px tall with 24px sides. Its border-radius sets the shape, and where it breaks into blocks the edge steps like pixel art."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/pixel-tremor-button/pixel-tremor-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/pixel-tremor-button/pixel-tremor-button.jsx"), "utf8");
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

  const hint = <>Move your pointer slowly across the button, then click near one end to send a wave of pixels across it. On a phone, press and tap it.</>;

  return (
    <DocsLayout slug="pixel-tremor-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/pixel-tremor-button.tsx"
        preview={<PixelTremorButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "pixel-tremor-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "pixel-tremor-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the button and
          label colors, how chunky the blocks are, and how big the pixel chunk is), then fits it to your product without
          changing how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Use it like any button. Everything has a default.</Lede>
        <Tabs tabs={[{ id: "usage", label: "hero-action.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The wave lifts blocks a couple of px and the button has a soft shadow. Give it about 10px of room, or a box with
          hidden overflow will clip them.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>
          At rest it is one plain white pill with a soft shadow and a hairline edge. Only the part you touch turns into
          pixels, so it looks simple until someone reaches for it.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Bring your pointer onto it and a small, ragged chunk within <Code>reach</Code> (34px) breaks into square blocks of{" "}
          <Code>pixel</Code> px (6), with dark seams between them so they show on a white page too. The chunk follows your
          pointer, and the spots you leave melt back into the solid surface. When you click, a
          wave starts at the exact spot you pressed and runs out across the button: everything it passes breaks into blocks
          that lift and then settle back. Quick clicks overlap, up to four waves at once. The label is normal text and stays
          sharp the whole time. On a phone, pressing pixelates the part under your finger and the tap sends the wave from it.
          The keyboard sends it from the centre. With reduced motion, the blocks still appear but nothing lifts.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
