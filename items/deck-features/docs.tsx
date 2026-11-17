import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { DeckFeaturesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/deck-features.json";

const USAGE = `import { DeckFeatures } from "@/components/ui/deck-features";

const FEATURES = [
  { title: "Plan in minutes", description: "Drag tasks onto the week and the plan fills itself in.", src: "/features/plan.jpg", alt: "The weekly planner" },
  { title: "See where time goes", description: "Every hour lands in a simple chart you can share.", src: "/features/chart.jpg", alt: "The time chart" },
  { title: "Works where you work", description: "Slack, Linear and your calendar, all in one place.", src: "/features/apps.jpg", alt: "App connections" },
  { title: "Private by default", description: "Your data stays yours, encrypted from end to end.", src: "/features/lock.jpg", alt: "The privacy screen" },
];

export function Features() {
  return (
    <DeckFeatures
      eyebrow="Features"
      title="Everything your week needs, in one calm place."
      items={FEATURES}
      offset={88} // under a 72px fixed header
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["items", "—", "The cards, top to bottom: { title, description, src, alt }. Any number; 3 to 6 reads best. Every card but the last joins the deck, the last one slides through it."],
  ["eyebrow", '"Features"', "The small chip above the heading. null hides it."],
  ["title", '"Everything you need to make the web feel human again."', "The heading above the cards. null hides it."],
  ["offset", "96", "Where the deck sticks, in px from the top of the screen (or of the scrolling box). Leave room for a fixed header."],
  ["step", "20", "How much of each card stays in view above the next one, in px (8 to 40). Narrow sections use 70% of it."],
  ["start", '"left"', "Which side the first picture sits on. The rest swap from card to card."],
  ["accent", "--primary, else --accent", "The color of the number on the top card. Any CSS color; a theme variable is best."],
  ["className / style", "—", "On the section itself. It fills its width and centres a 1152px stage."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/deck-features/deck-features.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/deck-features/deck-features.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([highlight(ts, "tsx"), highlight(js, "jsx"), highlight(USAGE, "tsx")]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  const code = "font-mono text-[13px] text-[var(--fg)]";
  const link = "font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]";

  return (
    <DocsLayout slug="deck-features" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/deck-features.tsx"
        preview={<DeckFeaturesDemo />}
        hint={
          <>
            Scroll inside the box. Each card sticks a little lower than the one before, so they pile up like a deck and the
            cards underneath lean back and dim. The numbers on top keep count. The last card does not stop: it slides through
            the whole deck and carries it away. More feature sections live in{" "}
            <Link href="/docs/feature-sections" className={link}>
              Feature sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "deck-features.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "deck-features.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your features and
          pictures, your words, and how tight the deck is), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it on its own between two sections of a landing page, and give it your own features and pictures.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/features.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The page&apos;s own scrolling moves everything, so it feels like the rest of your site. The cards stick to the screen,
          or to the nearest box that scrolls, so no wrapper between the section and that scroller may have{" "}
          <code className={code}>overflow: hidden</code>. Set <code className={code}>offset</code> a little taller than your
          fixed header, so the deck never slides under it. Each card takes the height the screen has room for once the whole
          deck is in place (300 to 560px, and never taller than half its width), so the deck always fits. Pictures load only as they come near. Colors come from your
          theme: <code className={code}>--foreground</code> and <code className={code}>--background</code> (or{" "}
          <code className={code}>--fg</code> and <code className={code}>--bg</code>), <code className={code}>--primary</code>{" "}
          for the number on the top card, and three times <code className={code}>--radius-lg</code> for the soft corners. It
          pairs well with{" "}
          <Link href="/docs/capsule-testimonials" className={link}>
            Capsule Testimonials
          </Link>{" "}
          further down the same page.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
