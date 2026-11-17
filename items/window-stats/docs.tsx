import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { WindowStatsDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/window-stats.json";

const USAGE = `import { WindowStats } from "@/components/ui/window-stats";

const CARDS = [
  { src: "/about/team.jpg", alt: "Our team at the spring offsite", value: "40+", label: "People on the team" },
  { src: "/about/studio.jpg", alt: "The studio at night", value: "12", label: "Years in business" },
  { src: "/about/launch.jpg", alt: "A launch party", value: "300+", label: "Products shipped" },
  { src: "/about/client.jpg", alt: "A client workshop", value: "98%", label: "Clients who come back" },
  { src: "/about/city.jpg", alt: "The city from our roof", value: "3", label: "Offices" },
];

export function About() {
  return (
    <WindowStats
      proof={{ score: "4.8/5", text: "Trusted by 300+ teams" }}
      title="We have helped hundreds of teams ship products their customers love to use."
      logos={[<img key="a" src="/logos/a.svg" alt="Northwind" height={20} />, <img key="b" src="/logos/b.svg" alt="Globex" height={20} />]}
      cards={CARDS}
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["cards", "—", "The cards, top to bottom: { src, alt, value, label }. 3 to 7 reads best. They fall into a left, right, wide middle rhythm, one per row on phones."],
  ["proof", '{ score: "4.9/5", text }', "The little row above the statement: four drawn faces, five stars, the score and a line. null hides it."],
  ["title", '"I design with brain. Present with heart."', "The statement that stays in the middle of the screen. One or two sentences."],
  ["caption", "null", "An optional small line under the statement."],
  ["logos", "8 made-up studios", "The strip under the statement that slides slowly sideways and fades at both ends. Text, SVG or <img>. It rests once the cards arrive, and on hover. null hides it."],
  ["parallax", "0.12", "How far each picture moves inside its card, as a share of the card's height (0 to 0.3). 0 turns it off."],
  ["blur", "10", "How soft the statement gets behind the cards, in px (0 to 24)."],
  ["backLabel", '"Back to the start"', "The pill after the last card. It glides back to the top of the section on an ease-out curve (0.7 to 1.5s, longer for longer trips) and lets go if you scroll yourself. null hides it."],
  ["className / style", "—", "On the section itself. It fills its width and centres a 1152px stage."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/window-stats/window-stats.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/window-stats/window-stats.jsx"), "utf8");
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
    <DocsLayout slug="window-stats" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/window-stats.tsx"
        preview={<WindowStatsDemo />}
        hint={
          <>
            Scroll inside the box. The statement stays in the middle while the photo cards slide up over it, and it softens
            behind them and leaves with the last card. Watch the photos too: each one moves up inside its own frame. At the
            end, Back to the start glides you up to watch it again. More stats sections live in{" "}
            <Link href="/docs/stats-sections" className={link}>
              Stats sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "window-stats.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "window-stats.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your numbers and
          photos, your statement, and how deep the motion goes), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it on its own between two sections of a long page, and give it your own numbers and photos.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/about.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The page&apos;s own scrolling moves everything, so it feels like the rest of your site. The statement sticks to the
          screen, or to the nearest box that scrolls, so no wrapper between the section and that scroller may have{" "}
          <code className={code}>overflow: hidden</code>. Photos load only as they come near, and the script runs only while the
          section is on screen, so it adds nothing to your page load. Colors come from your theme: it reads{" "}
          <code className={code}>--foreground</code> and <code className={code}>--background</code> (or{" "}
          <code className={code}>--fg</code> and <code className={code}>--bg</code>) and{" "}
          three times <code className={code}>--radius-lg</code> for the soft corners. The numbers sit on a dark mask that fades up from the bottom
          of each photo, so they read on any picture in both themes. It pairs well with{" "}
          <Link href="/docs/coffee-faq" className={link}>
            Coffee FAQ
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
