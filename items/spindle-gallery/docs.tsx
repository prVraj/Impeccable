import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { SpindleGalleryDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/spindle-gallery.json";

const USAGE = `"use client";
import { SpindleGallery, type SpindleImage } from "@/components/ui/spindle-gallery";

const posters: SpindleImage[] = [
  { src: "/campaign/spring.jpg", alt: "Spring campaign poster, a runner at sunrise" },
  { src: "/campaign/studio.jpg", alt: "Studio portrait with the new bottle" },
  { src: "/campaign/coast.jpg", alt: "The bottle on a rock in clear water" },
  // 8 to 12 tall pictures work best
];

export function Campaign() {
  return (
    <SpindleGallery
      images={posters}
      height={560}
      aria-label="Spring campaign"
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures, in order. Each is { src, alt }. alt is read by screen readers. 8 to 12 work best; tall pictures (about 3 by 4) fit best. They are never links."],
  ["intro", "true", "Play the orbit the first time it scrolls into view. Off, the ring shows at once."],
  ["speed", "30", "How fast it turns on its own, in degrees a second (30 is one turn in 12 seconds). 0 keeps it still until dragged."],
  ["radius", "14", "Corner radius of each page, in px."],
  ["height", "560", "Height of the gallery. Any CSS height. It fills the width it is given."],
  ["aria-label", '"Gallery"', "Name of the gallery for screen readers."],
  ["className / style", "—", "On the outer box. It has no background and no words, and the focus ring and placeholders take its text color."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/spindle-gallery/spindle-gallery.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/spindle-gallery/spindle-gallery.jsx"), "utf8");
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
      Drag it sideways to spin it, or flick it to throw it. With a mouse, drag up or down to tilt it. Arrow keys turn it a page, Space pauses.
      Press reset in the toolbar to watch the orbit again.
    </>
  );

  return (
    <DocsLayout slug="spindle-gallery" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/spindle-gallery.tsx"
        preview={<SpindleGalleryDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "spindle-gallery.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "spindle-gallery.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact gallery and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where and which
          pictures, the pace and corners, and the intro), then fits it to your brand without changing how
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
          Give it your pictures with an <Code>alt</Code> each, and a height.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "campaign.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Keep each picture small (about 500px wide, WebP): the browser loads each one once and reuses it for both sides of its card. Pictures from
          another site must be allowed by your Content-Security-Policy (<Code>img-src</Code>), or they stay as soft
          placeholders.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>The same picture show as Orrery Gallery, then a ring of flat cards you can spin.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The pictures pop in as circles on a tilted ring that turns slowly, front ones bigger. The ring falls into the
          middle, spinning quicker as it shrinks, and the pictures land in one loose stack. Then each card grows into a
          tall page and swings out to its place, half one way and half the other. The pages don&apos;t meet in one point:
          they leave an open middle, and each one is turned at an angle, like the blades of a fan. The ring tips back so
          you look down on it a little, and starts to turn. Tap during the show and the rest plays faster.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Each card is one flat picture, with space between it and the next, and darkens a little as it turns
          edge-on. It turns right to left, one turn in 12 seconds, and slows under the
          mouse so you can look closer. Drag it sideways and the page under your pointer follows; flick it and it spins
          on, then eases back to its own pace, turning the way you threw it. With a mouse, dragging up or down tilts it
          and it springs back. Pictures are never links, can&apos;t be selected and can&apos;t be dragged out. Keyboard
          users can focus it, turn it a page with the arrow keys and pause it with Space. With reduced motion there is no
          show and it stands still until you drag it.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
