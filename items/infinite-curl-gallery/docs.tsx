import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { InfiniteCurlGalleryDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/infinite-curl-gallery.json";

const USAGE = `"use client";
import { InfiniteCurlGallery } from "@/components/ui/infinite-curl-gallery";

const work = [
  { src: "/work/coffee-brand.webp", alt: "Coffee brand packaging" },
  { src: "/work/app-onboarding.webp", alt: "Onboarding screens for a banking app" },
  { src: "/work/poster-series.webp", alt: "Poster series for a jazz festival" },
  // 8 to 30 pictures, small files (about 400px on the long side)
];

export function WorkWall() {
  // It fills its box, so give the box a height.
  return <InfiniteCurlGallery images={work} aria-label="Selected work" className="h-[80svh] w-full" />;
}`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures: addresses, or { src, alt }. Each one shows several times across the canvas, in its own shape (very tall or wide ones are cropped a little)."],
  ["speed", "26", "How fast it drifts on its own, in pixels a second. 0 keeps it still until it is dragged."],
  ["angle", "200", "Which way it drifts at first, in degrees: 0 right, 90 down, 180 left, 270 up. A throw changes it to the way you threw."],
  ["curl", "0.6", "How much the edges curl toward you, from 0 (flat) to 1."],
  ["fade", "8", "How far in from each side the edges fade out, in percent of the shorter side. Every side fades the same, corners included. It is a mask, so it fades into whatever is behind."],
  ["tileSize", "160", "Width of the biggest pictures, in pixels. Small boxes shrink it, so phones get smaller pictures."],
  ["radius", "var(--radius-lg)", "Corner radius of the pictures. Any CSS length or var(--…)."],
  ["emptyLabel", '"No pictures yet."', "Shown when images is empty."],
  ["aria-label", '"Picture gallery"', "Name of the gallery for screen readers."],
  ["className / style", "—", "On the outer box. It fills the box and has no background, so give it a height here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/infinite-curl-gallery/infinite-curl-gallery.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/infinite-curl-gallery/infinite-curl-gallery.jsx"), "utf8");
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
      Grab the canvas and throw it any way; it glides on that way. Add your own photos, or drop them on the card. They
      stay in this tab.
    </>
  );

  return (
    <DocsLayout slug="infinite-curl-gallery" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/infinite-curl-gallery.tsx"
        preview={<InfiniteCurlGalleryDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "infinite-curl-gallery.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "infinite-curl-gallery.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact gallery and asks only where it goes and which pictures it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which
          pictures, the speed, how much it curls, and the corners), then fits it to your product without changing how it
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
        <Lede>
          Pass your pictures as <Code>images</Code> and give the gallery a height. Small files load fastest: about 400px
          on the long side is plenty.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "work-wall.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          For one picture at a time, like a cover or an avatar,{" "}
          <Link href="/docs/framed-upload" className="text-[var(--fg)] underline underline-offset-4">
            Framed-Upload
          </Link>{" "}
          fits better.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>One endless canvas that bends at its edges and fades out through a mask.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The pictures sit on a grid that repeats in every direction, so you never reach an end. Each one has its own
          size, from small to big, and its own shape. Near the edges the canvas curls toward you, like the inside of a
          bowl: pictures turn to face the middle and come a little closer. The edges fade out evenly through a
          mask, so it melts into any background in light and dark mode. It drifts slowly on its own and slows down while
          your mouse is on it, and the picture under the mouse lifts a little. Grab it and throw it: it glides on and eases
          back to a slow drift in the way you threw it. Arrow keys push it too. Pictures fade in as they load, from the
          middle out. Nothing loads until the gallery is near the screen, it stops when it is off screen or the tab is
          hidden, and pictures can&apos;t be selected or dragged out. With reduced motion it stays still and moves only
          when you drag it.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
