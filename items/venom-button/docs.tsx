import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { VenomButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/venom-button.json";

const USAGE = `"use client";
import { VenomButton } from "@/components/ui/venom-button";

export function HeroAction() {
  return (
    <VenomButton
      color="var(--foreground)"   // optional: the ink
      textColor="var(--background)" // optional: the label
      onClick={() => router.push("/signup")}
    >
      Get started
    </VenomButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. Keep it short: it stays on one line and trims with … if it runs out of room."],
  ["color", "the text color around it", "The ink: the button and its tentacles. Any CSS color, including var(--…)."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the ink."],
  ["strands", "9", "The most tentacles that hold on at once, 3 to 12. Three grab at reach, more join as the pointer gets closer, and the last to join snap first."],
  ["reach", "64", "Distance in px from the button's edge where the first three tentacles grab the pointer. Feelers rise 90px further out."],
  ["snapAt", "220", "Distance in px from the edge where the last tentacles snap. Always at least 60px past reach."],
  ["weight", "0.18", "How much the held pointer is slowed, 0 to 0.3 (0.18 is 18% slower). 0 turns the heavy pointer off."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled turns the tentacles off."],
  ["className / style", "—", "On the button itself. It is 44px tall with 22px sides; change height and padding here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/venom-button/venom-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/venom-button/venom-button.jsx"), "utf8");
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
    { id: "heavy-pointer", title: "The heavy pointer" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Move your pointer slowly toward the button, watch more tentacles grab it, then pull away. On a phone, press the
      button and drag your finger out.
    </>
  );

  return (
    <DocsLayout slug="venom-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/venom-button.tsx"
        preview={<VenomButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "venom-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "venom-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the ink and
          label colors, how heavy the pointer feels and how far the tentacles reach), then fits it to your product without
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
          Give it room: the tentacles reach up to <Code>snapAt</Code> (220px) past the edge and are drawn above everything
          else, so a box with hidden overflow never cuts them off. One per screen is plenty.
        </p>
      </DocSection>

      <DocSection id="heavy-pointer" title="The heavy pointer">
        <Lede>
          A website can't slow down your real mouse. So while the tentacles hold on, and only outside the button, the
          system pointer is hidden and a drawn arrow takes its place. The arrow is pulled back toward the button by{" "}
          <Code>weight</Code> (18% by default) and trails a little behind, so it feels heavy.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Over the button the real pointer is back, so clicking it is always exact. When the last tentacles snap, the arrow
          slides back onto the real pointer in a fraction of a second and the system pointer returns. Clicking anywhere
          else while held lets go first. On touch screens and with reduced motion there is no drawn pointer.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
