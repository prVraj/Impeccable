import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { SleeveCardDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/sleeve-card.json";

const USAGE = `import { SleeveCard } from "@/components/ui/sleeve-card";

export function Work() {
  return (
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-x-16">
      <SleeveCard
        href="/work/nova"
        image={{ src: "/work/nova.webp", alt: "Nova app on a phone" }}
        title="Nova"
        stat="6.2%"
        statLabel="Average engagement rate"
      />
      {/* more cards */}
    </div>
  );
}`;

const PROPS: [string, string, string][] = [
  ["image", "—", "The picture: { src, alt }. Shown nearly square. alt is read by screen readers."],
  ["title", "—", "The project name under the picture."],
  ["stat / statLabel", "—", "The line under the title: a number, then a few words."],
  ["href", "—", "Where the card goes. The whole card is one link."],
  ["target", "—", 'Link target. "_blank" also adds rel="noopener noreferrer".'],
  ["onClick", "—", "Runs on click. Without href the card is a button. On touch screens the first tap only opens it."],
  ["label", '"View Project"', "Written down the card that slides out, in capitals."],
  ["open", "—", "true keeps it open. Leave it out and it opens on hover, focus or a first tap."],
  ["accent / accentText", "lavender / ink", "The sliding card, and the text on it. Any CSS color or token."],
  ["peek", "soft sage", "The card that peeks out between them. Any CSS color or token."],
  ["radius", "14", "Card corners in px. The picture inside follows: inner radius = outer radius minus the 6px padding."],
  ["className / style", "—", "On the card. It fills its width; keep about a quarter of its width free on its right for the tab."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/sleeve-card/sleeve-card.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/sleeve-card/sleeve-card.jsx"), "utf8");
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
      Point at a card. On a phone, tap it once to open it and again to go. Here a click reloads the page instead of leaving it.
    </>
  );

  return (
    <DocsLayout slug="sleeve-card" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/sleeve-card.tsx"
        preview={<SleeveCardDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "sleeve-card.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "sleeve-card.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact card and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where and which
          projects, the colors, and the tab&apos;s words and corners), then fits it to your brand without changing how it moves.
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
          Give each card a picture, a title and an <Code>href</Code>. Leave room on the right of each card for the tab.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "work.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Keep each picture small (about twice the size it shows, WebP). Pictures load only when they come near the screen.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>A card that turns toward you, and a second card that slides out of it like a record from its sleeve.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Point at the card and it rises off the page and turns, its right edge coming toward you, while it steps a little
          to the left. A beat later the tab slides out from behind it, leaning a little, with View Project written up its
          edge, and a softer card peeks out between them. Its shadow grows as it rises. Move away and it all slides back
          in one smooth motion. Pressing it makes it give a little.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The whole card is one link, so it is one stop for the keyboard, and focusing it opens it too. Touch screens have
          no hover, so the first tap opens it, the second tap follows the link, and a tap anywhere else closes it. With
          reduced motion nothing turns or slides: the tab simply fades in.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
