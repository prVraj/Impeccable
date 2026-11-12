import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { ScratchMeDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/scratch-me.json";

const USAGE = `"use client";
import { ScratchMe } from "@/components/ui/scratch-me";

export function UpgradeOffer() {
  return (
    <ScratchMe
      code="SAVE20"
      label="20% off Pro"
      onReveal={(code) => track("promo_revealed", { code })} // optional
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["code", "—", "The code under the foil. Copied to the clipboard when it's revealed."],
  ["label", "—", "Optional small line above the code, like \"20% off Pro\"."],
  ["hint", '"Scratch to reveal…"', "Line under the card before it's revealed."],
  ["copiedText", '"Copied. Paste it…"', "Line under the code for 2 seconds after each copy."],
  ["copyAgainText", '"Click the code to copy it again."', "Line under the code after that, once the copy icon is back."],
  ["toast", '"Code copied"', "The little pop at the bottom center of the screen on every copy. Pass null to turn it off."],
  ["threshold", "0.5", "Share of the foil to scratch (0.3 to 0.9). Let go past it and the rest comes off."],
  ["brushSize", "26", "Brush size in px."],
  ["shavings", "true", "Shavings that fall and pile up at the bottom. Always off with reduced motion."],
  ["onReveal", "—", "Called once when the code is revealed."],
  ["onCopy", "—", "Called after each copy. Clicking a revealed code copies it again."],
  ["className / style", "—", "Layout for the outer box. The code pill is at least 260px wide and grows with the code."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/scratch-me/scratch-me.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/scratch-me/scratch-me.jsx"), "utf8");
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
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="scratch-me" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/scratch-me.tsx"
        preview={<ScratchMeDemo />}
        hint={
          <>
            Scratch past half and let go. Keyboard: Tab to the card and press Enter. With reduced motion
            on, there are no shavings and the foil simply fades.
          </>
        }
        files={[
          { id: "ts", label: "scratch-me.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "scratch-me.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only where it goes and which code it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
          (where, the code, the wording and how much to scratch), then fits it to your product without changing how it scratches.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Give it the code. Everything else has a default.</Lede>
        <Tabs tabs={[{ id: "usage", label: "upgrade-offer.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The code sits in the page, so anyone can read it in the page source. Use it for friendly
          offers, not secrets.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
