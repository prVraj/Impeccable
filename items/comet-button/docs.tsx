import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { CometButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/comet-button.json";

const USAGE = `"use client";
import { CometButton } from "@/components/ui/comet-button";

export function SaveAction() {
  return (
    <CometButton
      glowColor="var(--primary)"    // optional: the glow and the dots (default soft violet)
      color="var(--foreground)"     // optional: the pill (default near-black)
      speed={1.4}                   // optional: seconds for one lap while loading
      successText="Saved"           // optional: the label when it worked (default "Ah yeah!")
      onClick={() => saveDraft()}   // return a promise: it loads until it settles
    >
      Save draft
    </CometButton>
  );
}

// Or control it yourself:
// <CometButton loading={isSaving} success={!error} onClick={save}>Save draft</CometButton>`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. It stays on one line and trims with … if it runs out of room. While loading it makes way for three dots, and the button keeps its width."],
  ["loading", "—", "Shows the loading state. Leave it out and return a promise from onClick instead: the button loads until the promise settles."],
  ["onClick", "—", "Runs on click, like any button. Clicks while it loads are ignored, so a form is never sent twice."],
  ["glowColor", "soft violet", "The glow, the dots and the focus ring. Any CSS color, including var(--…). Pick one that shows on a dark pill."],
  ["color", "near-black", "The fill of the pill. The glow is made for a dark fill."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["speed", "1.4", "Seconds the glow takes to run once round the border while loading, 0.8 to 4."],
  ["loadingText", '"Loading"', "What screen readers hear while it loads."],
  ["success", "true", "Plays the success state when loading ends. Set it to false when the work failed. A promise that rejects never plays it."],
  ["successText", '"Ah yeah!"', "The label in the success state. The button is as wide as its longest text, so it never changes width."],
  ["type, disabled, aria-*, …", 'type="button"', "Everything a normal button takes. Disabled dims it and stops the glow."],
  ["className / style", "—", "On the button itself. It is 44px tall with 24px each side."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/comet-button/comet-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/comet-button/comet-button.jsx"), "utf8");
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

  const hint = <>Click it. It loads for about two and a half seconds, says Ah yeah! with its whole border lit, then eases back.</>;

  return (
    <DocsLayout slug="comet-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/comet-button.tsx"
        preview={<CometButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "comet-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "comet-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks five short questions (where, the glow
          color, the pill and label colors, how fast the glow runs, and the success word), then fits it to your product without changing
          how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Use it like any button. Return a promise from onClick, or pass loading yourself.</Lede>
        <Tabs tabs={[{ id: "usage", label: "save-action.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The soft glow spreads about 18px past the edge, so give it a little room inside a box that hides overflow.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>At rest the glow sits still: a bright streak on the top edge and a dim one on the bottom.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          When it starts loading, the label lifts away and three dots hop in, one after another. Both streaks brighten,
          pick up speed in a fraction of a second and race round the border, one lap every <Code>speed</Code> seconds
          (1.4). While they run, each one grows a sharp head and a long tail, like a comet. When loading ends, the
          streaks don&apos;t stop dead or whip round to their place. If home is close ahead, they keep going the way
          they were running and glide into it, slowing to a stop. If it is further, they slow down and fade where they
          are while the resting glow lights up again. Either way it takes 330ms, as the dots fade out and the label
          drops back in. If it worked, the success state plays at the same time: the light spreads round the whole
          border in 330ms, a soft glow in the same color spreads behind the button, and the label reads{" "}
          <Code>successText</Code> (Ah yeah!). It holds for just over a second, then the lit border, the glow behind it
          and the text ease back to the resting look in 600ms. Clicks while it loads
          do nothing. With reduced motion the glow brightens in place instead of running and the dots blink instead
          of hopping.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
