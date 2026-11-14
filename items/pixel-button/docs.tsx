import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PixelButtonDemo, PixelButtonTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/pixel-button.json";

const TYPES = `// Only on hover (the default): plain until someone reaches for it.
<PixelButton>Make a wave</PixelButton>

// Always on: the pixels twinkle softly at rest and glow on hover.
<PixelButton mode="always">Make a wave</PixelButton>`;

const USAGE = `"use client";
import { PixelButton } from "@/components/ui/pixel-button";

export function HeroAction() {
  return (
    <PixelButton
      mode="hover"                  // optional: "hover" (default) or "always"
      color="var(--background)"     // optional: the fill (default white in light mode, dark in dark mode)
      textColor="var(--foreground)" // optional: the label
      glowColor="var(--brand-500)"  // optional: the pixels and light (default a violet that suits the fill)
      onClick={() => router.push("/signup")}
    >
      Get started
    </PixelButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Normal, sharp text above the pixels. It stays on one line and trims with … if it runs out of room."],
  ["mode", '"hover"', '"hover" shows the pixels only while the pointer is on it. "always" keeps them on, dimly, and makes them glow on hover.'],
  ["color", "white / near-black", "The button's fill. Any CSS color, including var(--…). By default it is white in light mode and near-black in dark mode (it follows a .dark class or data-theme=\"dark\" on the page)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["glowColor", "violet", "The color of the pixels, the glow, the wave and the light going round the edge. By default a deeper violet on a light fill and a lighter one on a dark fill."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled stops the pixels, the light and the wave."],
  ["className / style", "—", "On the button itself. It is 44px tall with 24px sides. Its border-radius sets the shape, and the pixels and the edge light follow it."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/pixel-button/pixel-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/pixel-button/pixel-button.jsx"), "utf8");
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

  const hint = <>Move your pointer onto the button to bring the pixels up, then click near one end to send a wave. On a phone, press and tap it.</>;

  return (
    <DocsLayout slug="pixel-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/pixel-button.tsx"
        preview={<PixelButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "pixel-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "pixel-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Two types. <strong className="font-medium text-[var(--fg)]">Only on hover</strong> stays plain until someone
          reaches for it. <strong className="font-medium text-[var(--fg)]">Always on</strong> keeps the pixels twinkling
          softly and makes them glow on hover. Both send a wave on click.
        </Lede>
        <PixelButtonTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, which type, the
          fill and label colors, and the pixel color), then fits it to your product without changing how it moves.
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
          Everything happens inside the button, so it needs no extra room around it.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>
          A white pill in light mode and a dark one in dark mode, with a light that keeps travelling round its edge: a
          bright head with a soft, fading tail.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Behind the label sit tiny 2px pixels, each nudged a little off the grid with some spots left empty, so they feel
          scattered by hand. Each has its own brightness, breathes at its own uneven pace, and a few now and then light up
          brighter and fade back. They are brighter toward the edge than in the middle, so the label always reads first. With{" "}
          <Code>mode=&quot;hover&quot;</Code> they only show while your pointer is on the button; with{" "}
          <Code>mode=&quot;always&quot;</Code> they show dimly all the
          time. Either way, hovering makes them glow: the pixels light up outward from the spot your pointer came in, a soft light comes in evenly from every side, the pixels
          near your pointer light up a little more, and the whole edge lights up softly. When you click, a wave of bright
          pixels rolls out from the exact spot you pressed and fades by the far edge. Quick clicks overlap, up to three waves
          at once. On a phone, pressing lights it up and the tap sends the wave from your finger. The keyboard sends it from
          the centre. With reduced motion, the pixels and the edge light hold still and only the wave passes. Off screen or
          in a hidden tab, nothing is drawn.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
