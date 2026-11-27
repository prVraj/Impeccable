import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { ParticleWakeDemo, ParticleWakeTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/particle-wake.json";

const USAGE = `import { ParticleWake } from "@/components/ui/particle-wake";

// Your SVG markup as a string (only its shape is used, not its colors).
const logo = \`<svg viewBox="0 0 64 64"><path d="M32 4 60 20v24L32 60 4 44V20z"/></svg>\`;

export function Hero() {
  return (
    <section className="text-foreground">
      <ParticleWake svg={logo} label="Acme" className="h-72 max-w-3xl" />
    </section>
  );
}

// Or a link to the file:
<ParticleWake svg="/logo.svg" label="Acme" />

// Or a word, in the font of the wrapper:
<ParticleWake text="Acme" className="font-semibold tracking-tight" />`;

const TYPES = `<ParticleWake svg={logo} />          // your SVG markup, or svg="/logo.svg"
<ParticleWake text="Humans" />       // a word, in the font around it`;

const PROPS: [string, string, string][] = [
  ["svg", "—", 'Your SVG: the markup as a string, or a link to the file like "/logo.svg" (any image link works). Only its shape is used.'],
  ["text", "—", "Or a word instead, drawn in the font of the wrapper. Used when there is no svg."],
  ["color", '"currentColor"', 'Any CSS color, like "var(--primary)". By default the dots take the text color around them, so they follow light and dark mode.'],
  ["gap", "4", "Space between dots in px. Smaller is denser. Boxes narrower than 640px pack them closer, so the shape stays full on a phone."],
  ["dot", "1.8", "Dot size in px. Each dot is a little bigger or smaller than this, and a little smaller in boxes under 640px."],
  ["radius", "64", "How far around the pointer dots get swept, in px. Boxes narrower than 640px scale it down, so a phone swipe stays gentle."],
  ["strength", "1", "How hard the pointer sweeps them. 0.6 is calm, 1.5 is wild."],
  ["intro", "true", "The dots gather into the shape the first time it comes into view."],
  ["label", "the text", 'What a screen reader says, like your product name. Without text it is "Particle shape".'],
  ["className / style", "—", "On the wrapper. Give it a size here; without one it is full width and 2:1."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/particle-wake/particle-wake.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/particle-wake/particle-wake.jsx"), "utf8");
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
    { id: "types", title: "Types" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Move your pointer through the word, fast and slow, and watch the dots follow it and find their way home. A click pushes
      them out in a ring. On a phone, drag a finger sideways through it or tap.
    </>
  );

  return (
    <DocsLayout slug="particle-wake" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/particle-wake.tsx"
        preview={<ParticleWakeDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "particle-wake.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "particle-wake.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Two ways to give it a shape. <strong className="font-medium text-[var(--fg)]">Your SVG</strong> is the main one: pass
          your logo or icon as markup or as a link, and anything filled or drawn in it turns into dots.{" "}
          <strong className="font-medium text-[var(--fg)]">A word</strong> needs no file and uses the font around it.
        </Lede>
        <ParticleWakeTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact effect and asks only where it goes and for your SVG.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your SVG, the color
          and how lively), then fits it to your product without changing how it moves.
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
          Pass your SVG as <Code>svg</Code> and give the wrapper a size. The dots take the text color around them, so they switch
          with your theme on their own.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "hero.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>The pointer drags a stream of dots behind it, and every dot finds its own way home.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Your shape is laid over a loose grid of dots 4px apart, each nudged a little so it reads as dust, in four soft
          brightness levels. On a phone the dots pack closer and get a little smaller, so the shape stays as full as on a desktop. Dots within 64px of a moving pointer take on part of its speed and get a small push outward, so
          the pointer pulls a trail behind it and parts the shape where it passes; a pointer that rests does nothing. Every
          dot is pulled home like a soft spring, each a little stronger or weaker than the next, so they come back one by one
          in about two seconds. A click or a tap pushes the dots around it out in a ring. The first time it comes into view,
          the dots gather in from around the shape. It sleeps when nothing moves or it is off screen. On phones nothing
          reacts to hover: a sideways drag sweeps the dots and up and down swipes still scroll. With reduced motion the shape
          stands still.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
