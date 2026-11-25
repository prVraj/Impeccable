import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PeekIndexDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/peek-index.json";

const USAGE = `import { PeekIndex } from "@/components/ui/peek-index";

const ITEMS = [
  {
    title: "Brand identity",
    description: "A brand has to stand out and work twice as hard. We build the one your website and product grow from.",
    points: ["Logo and visual identity", "Brand guidelines", "Naming and voice"],
    media: { src: "/work/brand.webp", alt: "A brand board with a logo and colors" },
    link: { label: "See our branding work", href: "/work/brand" },
  },
  {
    title: "Product design",
    description: "Apps people understand on the first try.",
    points: ["Research", "Prototypes", "Design systems"],
    // A video plays while it shows; the poster stays with reduced motion.
    media: { type: "video", src: "/work/product.mp4", poster: "/work/product.webp", alt: "A product walkthrough" },
    link: { label: "See our product work", href: "/work/product" },
  },
  // one entry per row, 3 to 8 reads best
];

export function Services() {
  return <PeekIndex items={ITEMS} aria-label="What we do" />;
}`;

const PROPS: [string, string, string][] = [
  [
    "items",
    "—",
    "The rows, in order, numbered 01, 02, 03... Each one: title, description, points (a short list), media { type, src, alt, poster } and link { label, href or onClick, target }.",
  ],
  ["previewWidth", "240", "Width of the floating picture in px. In the open row the picture takes half the width instead (the full width on narrow lists)."],
  ["ratio", "4 / 3", "Shape of the pictures and videos, as width / height. 1.5 is 3:2, 16 / 9 is wide."],
  ["aria-label", "—", "What screen readers call the list."],
  ["className / style", "—", "On the list. It fills its width; leave about 200px free above it for the floating picture."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/peek-index/peek-index.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/peek-index/peek-index.jsx"), "utf8");
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
      Point at a row to see its picture follow you, then click it to open. Click the −, press Esc or click outside to
      close. On a phone, tap a row.
    </>
  );

  return (
    <DocsLayout slug="peek-index" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/peek-index.tsx"
        preview={<PeekIndexDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "peek-index.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "peek-index.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact list and asks where it goes, which rows it shows and whether any row should show a video.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which rows,
          pictures or videos, the picture size and its shape), then fits it to your brand without changing how it moves.
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
          Give each row a short title, a lead paragraph, a few points and one link. Leave about 200px free above the list, so
          the picture over the first row has room.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "services.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Keep each picture small (about 1000px wide, WebP). A video should be short, silent and small (a few seconds, MP4
          or WebM, under 2MB) with a poster: it starts loading only when its row is pointed at or opened.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A picture that peeks out where you point, and a numbered row that opens into its story.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Point at a row and its picture or video fades in just above your pointer, growing a little, then trails it softly
          as you move, always inside that row, while the other rows soften to 70%. Leave the row and it fades away; move to
          the next row and that row&apos;s picture takes over.
        </p>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Click and the row grows in place, pushing the rows below down while the others dim. The picture glides from your
          pointer to its seat on the left, and the paragraph, the points and the link drop in from above, line by line. The
          + turns into a −. Close it with the −, Esc or a click anywhere outside, and the row folds back. Phones never show
          the floating picture: one tap opens the row, with the picture across the full width and the words below. With
          reduced motion nothing glides, things only fade, and videos stay on their poster.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
