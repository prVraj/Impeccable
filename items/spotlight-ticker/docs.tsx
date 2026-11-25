import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { SpotlightTickerDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/spotlight-ticker.json";

const USAGE = `import { SpotlightTicker } from "@/components/ui/spotlight-ticker";

const ITEMS = [
  {
    image: { src: "/showcase/comet-button.webp", alt: "Comet button, a glow racing round its border" },
    title: "Comet button",
    points: [
      "A glow races round the border while it loads.",
      "Success lights the whole border, then eases back.",
    ],
    cta: { label: "Open component", href: "/docs/comet-button" },
  },
  // one entry per picture, 5 to 10 reads best
];

export function Showcase() {
  return <SpotlightTicker items={ITEMS} aria-label="Our components" />;
}`;

const PROPS: [string, string, string][] = [
  ["items", "—", "The pictures, in order. Each one: image { src, alt }, title, points (the bullet points) and cta { label, href or onClick, target }."],
  ["direction", '"left"', 'Which way the row moves: "left" or "right".'],
  ["speed", "32", "How fast the row moves, in pixels per second, like most marquees. 32 lets people see each picture; 50 is brisk, 80 is fast."],
  ["size", "160", "Side of each picture at rest, in px. It grows to 1.8 times this in focus. Phones show it at 70%."],
  ["radius", "16", "Corner radius of the pictures in px, at rest, in focus and in the story."],
  ["aria-label", '"Pictures"', "What screen readers call the row."],
  ["className / style", "—", "On the outer block. It fills its width and is 1.8 times size plus 96px tall, room for the grown picture and its shadow."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/spotlight-ticker/spotlight-ticker.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/spotlight-ticker/spotlight-ticker.jsx"), "utf8");
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

  const hint = (
    <>
      Point at a picture to stop the row, then click it to open its story. Click outside, press Esc or the X to close.
      On a phone, tap a picture.
    </>
  );

  return (
    <DocsLayout slug="spotlight-ticker" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/spotlight-ticker.tsx"
        preview={<SpotlightTickerDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "spotlight-ticker.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "spotlight-ticker.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact ticker and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which
          pictures, the direction, the speed, and the size and corners), then fits it to your brand without changing how it moves.
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
          Give each picture a heading, two to four short bullet points and one button. Give the ticker the full width of its section.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "showcase.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Keep each picture small (about 500px square, WebP). Pictures load only when they come near the screen.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A row that stops for the picture you point at, and opens it like a pop up.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The row glides at a calm 32 pixels a second, slow enough to see every picture. Point at one and the row slows to
          a stop as the picture slowly grows to 1.8 times its size, and the others dim to 40%, so the one you
          chose is in focus. Both sides of the row fade out softly, so no picture is ever cut off with a hard edge, and near an edge the grown picture steps inward.
        </p>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Click it and the others fade away while the picture glides to the left. The heading, each bullet point and the
          button drop in from above, line by line. Close it with the X, Esc, a click on the picture or a click anywhere outside:
          the picture glides home in under a second, the others come back and the row carries on. Phones have no hover,
          so one tap opens the story, with smaller pictures and the story under the picture. With reduced motion the row
          stands still and scrolls by hand.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
