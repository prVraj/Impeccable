import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { KitcutButtonDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/kitcut-button.json";

const USAGE = `"use client";
import { KitcutButton } from "@/components/ui/kitcut-button";

export function PublishAction() {
  return (
    <KitcutButton
      color="var(--primary)"        // optional: the fill (default Impeccable violet)
      dotColor="var(--muted-foreground)" // optional: the dots in the gap (default your text color, half strength)
      successText="Published"       // optional: the label when it worked (default "WooHoo")
      sound={true}                  // optional: the crack sound on click
      onClick={() => publishPost()} // return a promise: it stays open until it settles
    >
      Publish post
    </KitcutButton>
  );
}

// Or control it yourself:
// <KitcutButton loading={isPublishing} success={!error} onClick={publish}>Publish post</KitcutButton>`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. It stays on one line and trims with … if it runs out of room. The button is as wide as its label or its success word, whichever is longer, and never changes width."],
  ["loading", "—", "Shows the loading state: it cracks and opens. Leave it out and return a promise from onClick instead: it stays open until the promise settles."],
  ["onClick", "—", "Runs on click, like any button. Clicks while it is open are ignored, so a form is never sent twice."],
  ["color", "Impeccable violet", "The fill. Any CSS color, including var(--…). The edge, the shading, the crack and the sparks are all made from it."],
  ["textColor", "black or white", "The label color. By default it picks whichever reads best on the fill."],
  ["dotColor", "your text color, half strength", "The three dots in the gap. They sit on your page, not on the button, so they follow your text color."],
  ["sound", "true", "Plays the crack sound when a click opens it. It never plays when only the loading prop opens it."],
  ["loadingText", '"Loading"', "What screen readers hear while it is open."],
  ["success", "true", "Plays the success state when loading ends. Set it to false when the work failed. A promise that rejects never plays it."],
  ["successText", '"WooHoo"', "The label in the success state."],
  ["type, disabled, aria-*, …", 'type="button"', "Everything a normal button takes. Disabled dims it and it never cracks."],
  ["className / style", "—", "On the button itself. It is 44px tall with 16px each side and 8px corners."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/kitcut-button/kitcut-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/kitcut-button/kitcut-button.jsx"), "utf8");
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

  const hint = <>Click it with the sound on. It cracks, stays open for four seconds, then snaps back with a WooHoo.</>;

  return (
    <DocsLayout slug="kitcut-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/kitcut-button.tsx"
        preview={<KitcutButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "kitcut-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "kitcut-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, the
          button and dot colors, the success word, and the sound), then fits it to your product without changing how it
          moves.
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
        <Tabs tabs={[{ id: "usage", label: "publish-action.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The sparks fly about 40px above and below the button on success, so give it a little room inside a box that hides overflow. They never go past its sides.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>At rest it is a plain brand button: a soft top to bottom shade, a thin darker edge, a lit top line and a small shadow.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          On click it dips a little and a jagged zigzag crack runs down its middle in 90ms, with a short crack sound
          made in the browser (a sharp snap, a low knock and a few tiny splinters). The crack is new every time. Then
          the two halves pull apart from the crack in 460ms, fast at first and landing softly. The label splits with
          them, slides 10px outward and goes a little blurred, and three small dots pop into the gap and hop one after
          another. The gap stays open at least 720ms, so the dots are seen even when the work is instant. When loading
          ends, the halves rush back together in 260ms, picking up speed into the snap. The seam flashes white, the
          button bumps, a few sparks in its own color fly out of the seam and the label reads{" "}
          <Code>successText</Code> (WooHoo) on a slightly lighter fill. It holds for just over a second, then eases back
          to rest in 600ms. If the work failed, the halves still snap back, but the label returns without the success
          state. With reduced motion nothing cracks or flies: the label fades to blinking dots and back.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
