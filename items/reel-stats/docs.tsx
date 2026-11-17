import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { ReelStatsDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/reel-stats.json";

const USAGE = `import { ReelStats } from "@/components/ui/reel-stats";

const ITEMS = [
  {
    title: "Spatial planning",
    description: "We rework the flow of your floor plan for everyday comfort.",
    src: "/services/plan.jpg",
    alt: "A bright living room with an open plan",
    value: "240+",
    label: "Homes replanned",
  },
  {
    title: "Material curation",
    description: "We pick finishes and textures that age well and feel warm to the touch.",
    src: "/services/materials.jpg",
    alt: "Oak, linen and stone samples on a table",
    value: "1,800",
    label: "Samples in our library",
  },
  // ...3 to 6 rows read best
];

export function Services() {
  return <ReelStats title="Four steps from a plan to a home." items={ITEMS} />;
}`;

const PROPS: [string, string, string][] = [
  ["items", "—", "The rows, top to bottom: { title, description, src, alt, value, label }. 3 to 6 read best. value and label are optional (the number on the picture)."],
  ["title", "null", "An optional heading above the section."],
  ["tint", "8% of your text color in your page color", "The one color of the frame and the tab that glides behind the open heading. It stays the same for every row. Any CSS color, ideally one of your theme variables."],
  ["defaultIndex", "0", "Which row is open at the start."],
  ["autoplay", "0", "Open the next row by itself every so many ms (1500 or more). It rests while someone points at it or tabs into it, and when it is off screen. 0 turns it off."],
  ["className / style", "—", "On the section itself. It fills its width and centres a 1152px stage."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/reel-stats/reel-stats.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/reel-stats/reel-stats.jsx"), "utf8");
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
    <DocsLayout slug="reel-stats" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/reel-stats.tsx"
        preview={<ReelStatsDemo />}
        hint={
          <>
            Point at the headings (or tap them). Go down the list and the next picture rises from below and pushes the last one
            up; go back up and it rolls the other way, as if every picture was always there in one reel. The soft tab glides
            behind the text to the heading you chose, and the old line eases out before the new one eases in. More stats sections live in{" "}
            <Link href="/docs/stats-sections" className={link}>
              Stats sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "reel-stats.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "reel-stats.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where, your rows and
          pictures, and whether it plays by itself), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it on its own between two sections of a landing or services page, and give it your own rows and pictures.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/services.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Pictures load only when the section comes near the screen: the open one first, the rest right after it, so it adds
          nothing to your page load. Until a picture arrives its slot shows the soft tint. The frame and the tab share one tint,
          8% of your text color mixed into your page color, so it works in light and dark mode; pass{" "}
          <code className={code}>tint</code> to use one of your own colors. Text colors come from your theme: it reads <code className={code}>--foreground</code> and <code className={code}>--background</code> (or{" "}
          <code className={code}>--fg</code> and <code className={code}>--bg</code>) and three times{" "}
          <code className={code}>--radius-lg</code> for the soft corners. It pairs well with{" "}
          <Link href="/docs/window-stats" className={link}>
            Window Stats
          </Link>{" "}
          further up the same page.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
