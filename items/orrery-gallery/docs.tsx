import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { OrreryGalleryDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/orrery-gallery.json";

const USAGE = `"use client";
import { OrreryGallery, type OrreryImage } from "@/components/ui/orrery-gallery";

const work: OrreryImage[] = [
  { src: "/work/atlas.jpg", alt: "Atlas, a travel app", href: "/work/atlas" },
  { src: "/work/fern.jpg", alt: "Fern, a plant shop", href: "/work/fern" },
  { src: "/work/north.jpg", alt: "North, a winter campaign", href: "https://north.example.com", newTab: true },
  // 6 to 12 pictures work best
];

export function Work() {
  return (
    <OrreryGallery
      images={work}
      brand="Studio Name"       // in the middle of the orbit, then small in the corner
      height={540}
      aria-label="Selected work"
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures, in order. Each is { src, alt, href?, newTab? }. alt is read by screen readers and names the link. 6 to 12 work best; landscape pictures fit best."],
  ["brand", '"Impeccable"', "The name in the middle of the orbit, and the small mark in the corner after."],
  ["markPosition", '"bottom-left"', 'Corner for the small mark: "bottom-left" or "top-right".'],
  ["intro", "true", "Play the orbit the first time it scrolls into view. Off, the strip shows at once."],
  ["bend", "0.32", "How much the strip curves at rest, from 0 (flat) to 0.6."],
  ["radius", "10", "Corner radius of each picture in the strip, in px."],
  ["height", "520", "Height of the gallery. Any CSS height. It fills the width it is given."],
  ["aria-label", '"Gallery"', "Name of the gallery for screen readers."],
  ["className / style", "—", "On the outer box. It has no background, and the name and mark take its text color."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/orrery-gallery/orrery-gallery.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/orrery-gallery/orrery-gallery.jsx"), "utf8");
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
      Drag it sideways. Right to left pinches the middle like a rubber band, left to right pushes it out. Click a picture to open its page.
      Press reset in the toolbar to watch the orbit again.
    </>
  );

  return (
    <DocsLayout slug="orrery-gallery" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/orrery-gallery.tsx"
        preview={<OrreryGalleryDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "orrery-gallery.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "orrery-gallery.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact gallery and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which
          pictures, your name and its corner, the shape, and the intro), then fits it to your brand without changing how
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
        <Lede>
          Give it your pictures with an <Code>alt</Code> and a link each, your name, and a height.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "work.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Pictures from another site must be allowed by your Content-Security-Policy (<Code>img-src</Code>), or they stay as
          soft placeholders.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>One small show when it first comes into view, then a strip that answers your hand.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Your name fades in from a soft blur and the pictures pop in around it as circles, one after another, on a tilted
          ring that turns slowly, front ones bigger, like planets on an orrery. Then the ring falls into the middle,
          faster and faster, spinning quicker as it shrinks, and the pictures land in one loose stack over your name. The
          stack opens: each card flies to its place in the strip, the middle one first, turning from a circle into a card
          on the way, and the curve settles in with a small bounce. Your name then rests small in the corner. Tap during
          the show and the rest plays faster.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The strip is shorter in the middle and taller at the sides, like the inside of a cylinder, and loops forever.
          A soft blur at both sides lets pictures drift out of focus as they leave, so the middle one holds your eye.
          Dragging works like a rubber band pinned at both sides: the ends keep their height, and only the middle is
          pinched in (right to left) or pushed out a little (left to right). It follows a spring, so it wobbles back
          when it stops, then settles on the nearest picture. A press only becomes a
          drag after 6px, so a drag never opens a link. Keyboard users can Tab through the pictures (each slides to the
          middle with a ring) and use the arrow keys. With reduced motion there is no show and no rubber pinch.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
