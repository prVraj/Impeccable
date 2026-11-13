import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { AsciiTideButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/ascii-tide-button.json";

const USAGE = `"use client";
import { AsciiTideButton } from "@/components/ui/ascii-tide-button";

export function HeroAction() {
  return (
    <AsciiTideButton
      color="var(--foreground)"   // optional: the fill (default near-black)
      textColor="var(--background)" // optional: the label
      tideColor="var(--primary)"  // optional: the tide (default a light, warm violet)
      reach={64}                  // optional: how far the characters reach
      onClick={() => router.push("/signup")}
    >
      Get started
    </AsciiTideButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Normal, sharp text above the characters. It stays on one line and trims with … if it runs out of room."],
  ["color", "near-black", "The button's fill. Any CSS color, including var(--…)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["charColor", "the label color", "The color of the ASCII characters at rest. They are drawn faint, so the label always wins."],
  ["tideColor", "light, warm violet", "The tide's color on tap. Pick a light, soft color: the tide is meant to feel calm, not loud."],
  ["reach", "64", "How far in px from the pointer the characters show, 24 to 160. A big number fills the whole button."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled stops the characters and the tide."],
  ["className / style", "—", "On the button itself. It is 44px tall with 24px sides; change height, padding and border-radius here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/ascii-tide-button/ascii-tide-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/ascii-tide-button/ascii-tide-button.jsx"), "utf8");
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

  const hint = <>Move your pointer slowly across the button, then click near one end to send the tide. On a phone, press and tap it.</>;

  return (
    <DocsLayout slug="ascii-tide-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/ascii-tide-button.tsx"
        preview={<AsciiTideButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "ascii-tide-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "ascii-tide-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the fill and
          label colors, the tide color, and how far the characters reach), then fits it to your product without changing how
          it moves.
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
          At rest it is a plain dark pill. Only when someone reaches for it does the text-mode water show up behind the
          label.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Bring your pointer onto it and tiny ASCII characters ( . : - = + * ) rise behind the label within{" "}
          <Code>reach</Code> (64px) of the pointer, fading out softly toward the edge. Two slow waves drift through them, so
          the characters shift between faint and strong like moving water, and the field follows your pointer. They are drawn
          faint, so the label always reads first. When you tap, a tide rolls out from the exact spot you pressed, slowly: the
          characters it passes turn a light, slightly warm violet and grow stronger, then it
          fades. Quick taps overlap, up to three tides at once. On a phone, pressing shows the field under your finger and
          the tap sends the tide from it. The keyboard sends it from the centre. With reduced motion, the characters hold
          still and only the tide passes.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
