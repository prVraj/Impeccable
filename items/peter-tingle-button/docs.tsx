import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PeterTingleButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/peter-tingle-button.json";

const USAGE = `"use client";
import { PeterTingleButton } from "@/components/ui/peter-tingle-button";

export function HeroAction() {
  return (
    <PeterTingleButton
      color="var(--foreground)"       // optional: the fill
      textColor="var(--background)"   // optional: the label
      senseColor="var(--primary)"     // optional: the sense lines
      onClick={() => router.push("/signup")}
    >
      Get started
    </PeterTingleButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Keep it short: it stays on one line and trims with … if it runs out of room."],
  ["color", "the text color around it", "The button's fill. Any CSS color, including var(--…)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["senseColor", "the fill", "The color of the wavy sense lines. A brand color works well here."],
  ["range", "120", "Distance in px from the button's edge where the tingle starts. It grows stronger all the way to the edge."],
  ["lines", "one per 24px of edge", "How many sense lines go around the edge, 4 to 64. A 160px wide button gets about 15."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled turns the tingle off."],
  ["className / style", "—", "On the button itself. It is 44px tall with 22px sides; change height and padding here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/peter-tingle-button/peter-tingle-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/peter-tingle-button/peter-tingle-button.jsx"), "utf8");
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
    { id: "how-it-senses", title: "How it senses" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Bring your pointer slowly toward the button from any side, then rush at it. On a phone, tap it.
    </>
  );

  return (
    <DocsLayout slug="peter-tingle-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/peter-tingle-button.tsx"
        preview={<PeterTingleButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "peter-tingle-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "peter-tingle-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where, the button and
          sense line colors, and how early it senses you), then fits it to your product without changing how it moves.
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
          The sense lines reach about 40px past the edge. Give it that much room, or a box with hidden overflow will cut
          them off.
        </p>
      </DocSection>

      <DocSection id="how-it-senses" title="How it senses">
        <Lede>
          The tingle starts when your pointer comes within <Code>range</Code> (120px) of the edge and grows stronger all
          the way in. Coming in fast makes it stronger still, so a rush feels like a threat and a slow approach feels like
          a hunch.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The lines are longest and brightest on the side your pointer comes from, so the button seems to look at it. The
          moment the pointer lands on the button, the lines flash outward once and everything goes still, so your click is
          always steady. Phones have no pointer to sense, so a tap sets off one short tingle all around. Keyboard focus sets
          off a softer one. With reduced motion, the lines simply fade in and out, with no shiver and no waves.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
