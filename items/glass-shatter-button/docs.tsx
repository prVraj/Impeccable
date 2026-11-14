import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { GlassShatterButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/glass-shatter-button.json";

const USAGE = `"use client";
import { GlassShatterButton } from "@/components/ui/glass-shatter-button";

export function HeroAction() {
  return (
    <GlassShatterButton
      color="var(--foreground)"    // optional: the solid middle (default near-black)
      textColor="var(--background)" // optional: the label
      glowColor="var(--primary)"    // optional: the light the glass catches
      range={120}                   // optional: how far away the glass starts to glow
      onClick={() => router.push("/signup")}
    >
      Get started
    </GlassShatterButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Sharp text on the solid middle. It stays on one line and trims with … if it runs out of room."],
  ["color", "near-black", "The fill of the solid middle. Any CSS color, including var(--…)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["glassColor", "the text color around it", "The glass tint and its edge lines. By default it follows your page's text color, so the glass shows on light and dark pages."],
  ["glowColor", "soft violet", "The light the glass catches near the pointer, and the flash and seal on click."],
  ["range", "120", "How far in px from the button the glass starts to glow, 40 to 240. The glow grows faster the closer the pointer gets."],
  ["ring", "6", "How thick the glass ring is in px, 4 to 12. The middle keeps its 44px height, so the button grows by twice this."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. The click fires straight away, while the glass is still breaking. Disabled stops the glow and the shatter."],
  ["className / style", "—", "On the button itself. Change border-radius here: the middle's corners follow, minus the ring."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/glass-shatter-button/glass-shatter-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/glass-shatter-button/glass-shatter-button.jsx"), "utf8");
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

  const hint = <>Bring your pointer slowly toward the button from any side, then click near one end. On a phone, press and tap it.</>;

  return (
    <DocsLayout slug="glass-shatter-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/glass-shatter-button.tsx"
        preview={<GlassShatterButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "glass-shatter-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "glass-shatter-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the fill and
          label colors, the glow color, and how far away the glass starts to glow), then fits it to your product without
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
          The shards fly up to about 60px outside the button, so keep it away from the edge of a box that hides overflow.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>
          Only the ring around the button is glass. The middle is a plain, solid button, so the label always reads.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          As your pointer comes within <Code>range</Code> (120px), the part of the ring nearest to it catches the light.
          The glow grows faster the closer you get: faint at the edge of the range, bright and wide once you are on the
          button, and its edges light up most, like light running along cut glass. Click it and the click goes through
          straight away while the glass breaks: cracks run out from the exact spot you pressed (90ms), then the ring bursts
          into shards, small ones near the impact and bigger ones further away. They fly out fast and slow down like in
          air, turning and catching the light as they spin (about half a second), hang for a breath, then pull back in,
          the far ones first and the ones at the impact last, settling with a tiny snap. A line of light runs both ways
          round the ring as it seals. The whole thing takes about a second and a half. Click again while it is in pieces
          and the shards are blasted again from where they are. On a phone, pressing lights the glass under your finger
          and the tap shatters it. The keyboard breaks it from the top. With reduced motion, the cracks show and fade, and
          nothing flies.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
