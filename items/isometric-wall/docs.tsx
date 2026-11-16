import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { IsometricWallDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/isometric-wall.json";

const USAGE = `"use client";
import { IsometricWall } from "@/components/ui/isometric-wall";

// 16 pictures look best. Any size: each one is cropped to a 3:2 card.
const PHOTOS = ["/wall/01.webp", "/wall/02.webp", "/wall/03.webp" /* … */];

export function Hero() {
  return (
    <IsometricWall
      images={PHOTOS}
      className="flex min-h-[640px] flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <h1 className="text-5xl font-semibold tracking-tight">Components that move</h1>
      <a href="/docs" className="rounded-full bg-foreground px-5 py-2.5 text-background">
        Browse components
      </a>
    </IsometricWall>
  );
}`;

const PAGE_USAGE = `// Behind a whole page: fixed to the screen, under everything.
<IsometricWall images={PHOTOS} className="fixed inset-0 -z-10" />`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures, as URLs. Any size: each is cropped to a 3:2 card. 16 look best; with fewer, the same picture comes back more often. Use small WebP files (about 480px wide)."],
  ["columns", "7, 5 or 3", "About how many columns across the box. By default 7 on a wide box, 5 from 640px to 1024px and 3 below 640px, so the cards keep a good size on every screen."],
  ["speed", "12", "How fast the columns slide along their diagonal, in px a second. 0 holds it still."],
  ["lift", "8", "How far a hovered card rises off the floor, in px on screen."],
  ["opacity", "0.45", "How strong the pictures are in light mode, from 0 to 1. Lower is calmer."],
  ["darkOpacity", "0.18", "How strong the pictures are in dark mode, from 0 to 1. Kept low so bright photos never glare on a dark page."],
  ["radius", "14", "Card corners, in px."],
  ["children", "—", "Your content. It sits above the wall and works as normal: text can be selected and buttons clicked."],
  ["className / style", "—", "On the box. Give it a size (or let it fill its parent). The floor is your page color, so the wall has no background of its own."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/isometric-wall/isometric-wall.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/isometric-wall/isometric-wall.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml, pageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
    highlight(PAGE_USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = <>Rest your mouse on a card: it lifts, and the wall keeps drifting under it. On a phone it just drifts.</>;

  return (
    <DocsLayout slug="isometric-wall" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/isometric-wall.tsx"
        preview={<IsometricWallDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "isometric-wall.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "isometric-wall.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact background and asks only which section it goes behind.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks five short questions (where, which pictures,
          how calm, how fast and the corners), then fits it to your brand without changing how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Wrap a section&apos;s content in it, pass your pictures and give it a size. Everything inside sits above the wall.</Lede>
        <Tabs tabs={[{ id: "usage", label: "hero.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          For a whole page, leave it empty and fix it to the screen, so it stays one screen big however long the page is.
        </p>
        <div className="mt-4">
          <Tabs tabs={[{ id: "page", label: "layout.tsx", copy: PAGE_USAGE, body: <Html html={pageHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>
          The cards lie on a floor tipped back 56° and turned 45°, like prints on a table seen from above. They stand in
          diagonal columns, every other column half a card further along, and every column slides along itself, up and to
          the left, at <Code>speed</Code> px a second, forever.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Hover a card and it rises <Code>lift</Code> px off the floor in 320ms, with a quick start and a long soft finish,
          while its shadow slides further out, grows wider and turns softer. Move away and it lands again in 480ms, a touch
          slower than it rose, so a fast sweep across the wall leaves a gentle wave behind the mouse. The drift never stops
          for a hovered card: it lifts and keeps moving, and when it drifts out from under a still mouse the next card takes
          over. When it first comes into view the cards fade in and settle onto the floor, from the middle outward. Phones
          get the drift without the lift. With reduced motion the wall stays still, the cards only fade in, and a hovered
          card only deepens its shadow. Off screen it pauses, and pictures load only when it comes near.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
