import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { LoupeGridDemo, LoupeGridTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/loupe-grid.json";

const TYPES_CODE = `<LoupeGrid type="plus" />        // plus marks (the default)
<LoupeGrid type="plus-lines" />  // plus marks on a grid of lines
<LoupeGrid type="dots" />        // dots
<LoupeGrid type="dots-lines" />  // dots on a grid of lines`;

const USAGE = `"use client";
import { LoupeGrid } from "@/components/ui/loupe-grid";

export function Hero() {
  return (
    <LoupeGrid
      type="dots-lines"
      hoverColor="var(--primary)"   // optional: the color marks turn under the pointer
      className="flex min-h-[560px] flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <h1 className="text-5xl font-semibold tracking-tight">Ship the calm version</h1>
      <a href="/signup" className="rounded-full bg-foreground px-5 py-2.5 text-background">
        Get started
      </a>
    </LoupeGrid>
  );
}`;

const PAGE_USAGE = `// Behind a whole page: fixed to the screen, under everything.
<LoupeGrid type="plus" className="fixed inset-0 -z-10" />`;

const PROPS: [string, string, string][] = [
  ["type", '"plus"', 'Which marks: "plus", "plus-lines", "dots" or "dots-lines". The lines join the marks into a grid.'],
  ["gap", "56", "Distance between marks, in px (12 to 400). The grid is centred, so the edges always match."],
  ["radius", "150", "How far the loupe reaches from the pointer, in px. Marks farther away stay still."],
  ["magnify", "1.8", "How big the mark right under the pointer grows (1.8 is 80% bigger). 1 turns the growing off; it still lights up."],
  ["color", "the text color", "Color of the marks and lines at rest. Marks are drawn at 30% of it and lines at 10%, so pass a full color."],
  ["hoverColor", "the text color", "Color the marks turn near the pointer, and their soft glow. A brand color works well here."],
  ["children", "—", "Your content. It sits above the grid and works as normal: text can be selected and buttons clicked."],
  ["className / style", "—", "On the box. Give it a size (or fill its parent), and a background color if you want one: the grid has none."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/loupe-grid/loupe-grid.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/loupe-grid/loupe-grid.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, typesHtml, usageHtml, pageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(TYPES_CODE, "tsx"),
    highlight(USAGE, "tsx"),
    highlight(PAGE_USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Types" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-reacts", title: "How it reacts" },
    { id: "props", title: "Props" },
  ];

  const hint = <>Move your pointer over the grid, then switch the type with the pills. On a phone, touch and drag.</>;

  return (
    <DocsLayout slug="loupe-grid" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/loupe-grid.tsx"
        preview={<LoupeGridDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "loupe-grid.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "loupe-grid.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Four types. <strong className="font-medium text-[var(--fg)]">Plus</strong> and{" "}
          <strong className="font-medium text-[var(--fg)]">Dots</strong> are marks on their own.{" "}
          <strong className="font-medium text-[var(--fg)]">Plus and lines</strong> and{" "}
          <strong className="font-medium text-[var(--fg)]">Dots and lines</strong> join the same marks with faint lines,
          and the lines bend with the marks under the pointer.
        </Lede>
        <LoupeGridTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES_CODE, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact background and asks only which section it goes behind.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where, the type and
          spacing, and the colors), then fits it to your brand without changing how it reacts.
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
          Wrap a section&apos;s content in it and give it a size. Everything inside sits above the grid.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "hero.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          For a whole page, leave it empty and fix it to the screen, so it stays one screen big however long the page is.
        </p>
        <div className="mt-4">
          <Tabs tabs={[{ id: "page", label: "layout.tsx", copy: PAGE_USAGE, body: <Html html={pageHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="how-it-reacts" title="How it reacts">
        <Lede>
          At rest it is a faint, even grid. Under the pointer it works like a loupe: the marks within{" "}
          <Code>radius</Code> swell, light up and spread apart a little.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The mark right under the pointer grows the most and turns fully into the hover color, with a soft glow behind it.
          Marks farther out grow less and keep more of their faint color, fading smoothly to nothing at the edge of the
          loupe, so there is never a hard ring. The marks spread a few pixels away from the pointer, and on the types with
          lines the lines bend with them and brighten too. The loupe trails the pointer by a hair, eases in quickly when the
          pointer arrives and fades out slowly when it leaves. It listens to the pointer across the whole page, so it reacts
          under your headline and buttons too, and it never catches a click or a text selection. On a phone it shows where
          your finger touches and fades shortly after you lift it. With reduced motion the marks still light up and glow,
          but they don&apos;t grow or move. Nothing runs while it is at rest or off screen.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
