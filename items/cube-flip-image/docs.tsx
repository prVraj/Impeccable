import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { CubeFlipImageDemo, CubeFlipImageSizesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/cube-flip-image.json";

const USAGE = `"use client";
import { CubeFlipImage } from "@/components/ui/cube-flip-image";

const SHOTS = [
  { src: "/shots/lake.webp", alt: "A rowing boat on a mountain lake" },
  { src: "/shots/city.webp", alt: "A city skyline at night" },
  { src: "/shots/road.webp", alt: "A desert road toward the mountains" },
];

// Each click rolls the cubes out from that spot to the next picture.
// The sound file: download impeccable-ui.com/cube-flip-image/cube-roll.mp3 into public/sounds.
export function PhotoWall() {
  return <CubeFlipImage images={SHOTS} sound="/sounds/cube-roll.mp3" className="w-full max-w-xl rounded-2xl" />;
}`;

const TYPES = `<CubeFlipImage images={shots} tile={12} />   // fine
<CubeFlipImage images={shots} />              // default, about 20px
<CubeFlipImage images={shots} tile={36} />   // bold`;

const PROPS: [string, string, string][] = [
  ["images", "—", "The pictures, each with src and alt, in order. Each click shows the next one, then it starts again."],
  ["sound", "—", "A sound file to play with each change, like \"/sounds/cube-roll.mp3\". Leave it out for silence."],
  ["tile", "20", "About how wide each cube is, in pixels. Smaller is finer, larger shows the cubes more. A very big picture never gets more than 2,500."],
  ["ratio", '"3 / 2"', "The box's shape, as a CSS aspect ratio like \"16 / 9\". The picture covers it, centered. Ignored when you set the height yourself."],
  ["label", '"show the next picture"', "What a click does, read by screen readers after the picture's alt."],
  ["onChange", "—", "Called with the new picture's index once a change has landed."],
  ["className / style", "—", "On the box: its width, height and corners. The box clips the cubes, so rounded corners stay round while they roll."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/cube-flip-image/cube-flip-image.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/cube-flip-image/cube-flip-image.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, typesHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(TYPES, "tsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Cube sizes" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Click anywhere on the photo, with sound on. The cubes nearest your click roll first, rising toward you as they
      roll a half turn away from it, and the wave spreads to the edges. Try a corner, then the middle. Clicks during a change are ignored.
    </>
  );

  return (
    <DocsLayout slug="cube-flip-image" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/cube-flip-image.tsx"
        preview={<CubeFlipImageDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "cube-flip-image.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "cube-flip-image.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Cube sizes">
        <Lede>
          Three sizes, each its own picture to click. <strong className="font-medium text-[var(--fg)]">Fine</strong> cubes
          ripple like a shimmer, the <strong className="font-medium text-[var(--fg)]">default</strong> shows tiny cubes
          rolling, and <strong className="font-medium text-[var(--fg)]">bold</strong> ones are blocks you can watch turn one
          by one.
        </Lede>
        <CubeFlipImageSizesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "cube-sizes.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact picture and asks only where it goes, which pictures it shows and whether it plays the sound.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks five short questions (where, the cube size, the
          sound, the shape and the corners), then fits it to your product without changing how the cubes roll.
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
          Pass your pictures to <Code>images</Code> and size the box with <Code>className</Code>. For the sound, download{" "}
          <a className="underline underline-offset-2" href="/cube-flip-image/cube-roll.mp3" download>
            cube-roll.mp3
          </a>{" "}
          (26KB) into your public folder and pass its path to <Code>sound</Code>. For a picture that changes on its own, use{" "}
          <a className="underline underline-offset-2" href="/docs/tile-flip-image">
            Tile flip image
          </a>
          .
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "photo-wall.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>One click, one wave, rolling out from the exact spot you clicked like a wave on water.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The picture is made of tiny cubes about 20 pixels wide, the current picture on their fronts and the next one on their
          backs. A click sends a slow wave out from that spot, crossing to the farthest corner in 1.4 seconds, so you can watch
          it travel. As the wave reaches a cube, a dark gap opens round it so you see it on its own, and it swells up toward you,
          casting a soft shadow down and to the right that makes it look lifted. At the crest it rolls a half turn away from
          the click in 0.76 seconds: the
          old face turns away, a darker side face comes round, then the new face arrives. Then it settles back down flat, like
          water after a wave. Every face is seen in perspective, narrowing toward its far edge. The last cube settles at about
          2.6 seconds, then the drawing
          fades into a plain image so the end never blinks. Clicks during a change are ignored. The sound, a cascade of small
          cube clacks made with ElevenLabs, plays with each click that starts a change. With reduced motion no cube rolls and no
          sound plays: the next picture simply fades in over 0.3 seconds.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
