import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { TumbleGalleryDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/tumble-gallery.json";

const USAGE = `"use client";
import { TumbleGallery, type TumbleImages } from "@/components/ui/tumble-gallery";

// At least 4 pictures. Fewer is a type error.
const shots: TumbleImages = [
  { src: "/work/studio.jpg", alt: "The studio desk with the new prototype" },
  { src: "/work/launch.jpg", alt: "Launch day, the team on stage" },
  { src: "/work/app.jpg", alt: "The app's home screen on a phone" },
  { src: "/work/sketch.jpg", alt: "First sketches of the logo" },
  { src: "/work/print.jpg", alt: "The printed poster on a wall" },
];

export function Work() {
  return <TumbleGallery images={shots} aria-label="Our work" />;
}`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures, in order. Each is { src, alt }. At least 4 (5 is a good default): fewer is a type error, and at runtime shows a small notice instead. Wide pictures fit best, cropped to 4:3. They are never links."],
  ["autoPlay", "true", "Flip on its own. Off, it only moves when dragged."],
  ["interval", "2000", "How long each picture rests before the next flip, in ms."],
  ["radius", "20", "Corner radius of each picture, in px."],
  ["height", "auto", "Height of the gallery, any CSS height. Left out, it keeps a 3:2 shape, at most 560px tall."],
  ["aria-label", '"Gallery"', "Name of the gallery for screen readers."],
  ["className / style", "—", "On the outer box. It has no background and no words; the placeholders take its text color."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/tumble-gallery/tumble-gallery.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/tumble-gallery/tumble-gallery.jsx"), "utf8");
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
      It flips every 2 seconds. Hover to pause it, or drag it up or down to flip it by hand.
    </>
  );

  return (
    <DocsLayout slug="tumble-gallery" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/tumble-gallery.tsx"
        preview={<TumbleGalleryDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "tumble-gallery.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "tumble-gallery.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact gallery and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where and which
          pictures, the pace, and the corners), then fits it to your brand without changing how it moves.
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
          Give it at least 4 pictures, each with an <Code>alt</Code>.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "campaign.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Keep each picture small (about 700px wide, WebP). Pictures from
          another site must be allowed by your Content-Security-Policy (<Code>img-src</Code>), or they stay as soft
          placeholders.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A split flap board for pictures, flipping like a card file.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Each picture is cut across the middle onto two flaps that hang on one hinge. The picture in view always sits
          flat and whole, facing you. Every 2 seconds one flap falls toward you over the middle hinge, slow at first
          and faster and faster, and lands on the next picture in 0.8 seconds. It never skips a picture, and no line
          shows across the middle. The flaps darken as they tip and lighten as they land.
        </p>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          A mouse over it pauses it. Drag down to pull flaps toward you, drag up to turn them back; a flick moves one more, never further.
          It needs at least 4 pictures, because one flap always swings round the back, out of sight. Pictures are never
          links and can&apos;t be selected or dragged out. With reduced motion it never flips on its own and only moves
          when you drag it.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
