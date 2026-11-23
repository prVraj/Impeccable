import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PeekListDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/peek-list.json";

const USAGE = `import { PeekList } from "@/components/ui/peek-list";

const ITEMS = [
  {
    title: "Kitcut button",
    description: "A button that cracks open while it loads, then snaps back with a WooHoo.",
    image: { src: "/showcase/kitcut-button.webp", alt: "Kitcut button, split in two with dots in the gap" },
    cta: { label: "Open component", href: "/docs/kitcut-button" },
  },
  // one entry per row, 3 to 8 reads best
];

export function Components() {
  return <PeekList items={ITEMS} aria-label="Our components" />;
}`;

const PROPS: [string, string, string][] = [
  ["items", "—", "The rows, in order. Each one: title, description, image { src, alt } and cta { label, href or onClick, target }."],
  ["previewWidth", "240", "Width of the floating picture in px. In the open row the picture takes 42% of the width instead."],
  ["ratio", "1.5", "Shape of the pictures, as width / height. 1.5 is 3:2, 4 / 3 is 4:3."],
  ["aria-label", "—", "What screen readers call the list."],
  ["className / style", "—", "On the list. It fills its width; leave about 100px free above it for the floating picture."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/peek-list/peek-list.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/peek-list/peek-list.jsx"), "utf8");
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
      Point at a row to see its picture follow you, then click it to open. Click outside, press Esc or the X to close. On
      a phone, tap a row.
    </>
  );

  return (
    <DocsLayout slug="peek-list" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/peek-list.tsx"
        preview={<PeekListDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "peek-list.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "peek-list.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact list and asks only where it goes and which rows it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where and which rows,
          the picture size and its shape), then fits it to your brand without changing how it moves.
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
          Give each row a short title, one to three sentences and one button. Leave about 100px free above the list, so the
          picture over the first row has room.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "components.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Keep each picture small (about 1000px wide, 3:2, WebP). Pictures load only when the list comes near the screen.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A picture that peeks out where you point, and a row that opens like a pop up.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Point at a row and its picture fades in just above your pointer, growing a little, then trails it softly as you
          move, always inside that row, while the other rows soften to 70%. Leave the row and it fades away; move to the next row and that row&apos;s picture takes
          over.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Click and the row grows in place, pushing the rows below down while the others dim. The picture glides from your
          pointer to its seat on the left, the title glides to the top of the story, and the description and button drop in
          from above, line by line. The + turns into an X in the top right corner of the open row. Close it with the X, Esc or a
          click anywhere outside, and the row folds back. Phones never show the floating picture: one tap opens the row.
          With reduced motion nothing glides, things only fade.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
