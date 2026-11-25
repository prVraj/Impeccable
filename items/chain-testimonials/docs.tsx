import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { ChainTestimonialsDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/chain-testimonials.json";

const USAGE = `import { ChainTestimonials } from "@/components/ui/chain-testimonials";

const REVIEWS = [
  { heading: "Moved our team over in a week", quote: "The switch took one afternoon of setup.", name: "Lena Fischer", role: "COO, Northwind", image: "/reviews/northwind.jpg" },
  { heading: "Support before I finish typing", quote: "Every question answered in minutes.", name: "Omar Haddad", role: "Founder, Globex", image: "/reviews/globex.jpg" },
  { heading: "It finally looks like our brand", quote: "Our designers stopped filing tickets.", name: "Mia Chen", role: "Designer, Initech", image: "/reviews/initech.jpg" },
  { heading: "Our fastest setup this year", quote: "Live before the coffee got cold.", name: "Sam Ortiz", role: "CTO, Umbrella", image: "/reviews/umbrella.jpg" },
  { heading: "Half the emails we used to get", quote: "People find the answer on the page now.", name: "Ana Lima", role: "Head of Support, Hooli", image: "/reviews/hooli.jpg" },
];

export function Reviews() {
  return <ChainTestimonials title="What our customers say" description="Real words from real teams." items={REVIEWS} />;
}`;

const PROPS: [string, string, string][] = [
  ["items", "6 made-up reviews", "The reviews, in order: { heading, quote, name, role, image, alt }. 5 or more fills the desktop row (3 or more on tablets); with fewer, the row shows fewer cards so nobody shows twice. An empty list shows nothing."],
  ["items[].heading", "—", "The result, short and concrete, like \"Our launch page went live in 2 days\". The biggest words on the card, up to 3 lines."],
  ["items[].image", "—", "The picture: a product shot, their work or a portrait. Square or portrait pictures crop best. Without one (or if it fails to load), the card shows initials."],
  ["title", '"Loved by 100k+ humans"', "The heading above the row. null hides it."],
  ["description", '"Real words from people who build with Impeccable UI."', "The line under the heading. null hides it."],
  ["interval", "6000", "Milliseconds each review stays open before the chain moves on (1500 at least). 0 turns the timer off."],
  ["defaultIndex", "0", "Which review starts open."],
  ["index / onIndexChange", "—", "Control the open review yourself, and hear when it changes."],
  ["className / style", "—", "On the section itself. It fills its width and centres a 1288px column (a row up to 1240px)."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/chain-testimonials/chain-testimonials.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/chain-testimonials/chain-testimonials.jsx"), "utf8");
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

  const code = "font-mono text-code-inline text-[var(--fg)]";
  const link = "font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]";

  return (
    <DocsLayout slug="chain-testimonials" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/chain-testimonials.tsx"
        preview={<ChainTestimonialsDemo />}
        hint={
          <>
            Wait a few seconds and the chain moves on by itself, or click a side card, a dot or use the arrow keys. On a phone,
            swipe. Pointing at the row pauses the timer. More testimonial sections live in{" "}
            <Link href="/docs/testimonial-sections" className={link}>
              Testimonial sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "chain-testimonials.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "chain-testimonials.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your reviews, your
          pictures and your heading), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it after your features or pricing, where people want proof, and give it your own reviews and pictures.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/reviews.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The open card&apos;s words are laid out at its full size, so they never re-wrap while it opens. It counts its own room, not the screen: 5 cards
          from 1000px (a row up to 1240px), 3 from 600px (up to 820px) and 1 card on phones (up to 420px), where the picture sits above the
          words and the next card slides in. The preview box here is narrower than a desktop, so press Desktop or Fullscreen above to see all 5. Colors come from your theme: it reads{" "}
          <code className={code}>--foreground</code> and <code className={code}>--background</code> (or{" "}
          <code className={code}>--fg</code> and <code className={code}>--bg</code>), and the cards and links are a faint tint
          of your text color, so no brand color is needed. It pairs well with{" "}
          <Link href="/docs/capsule-testimonials" className={link}>
            Capsule Testimonials
          </Link>{" "}
          if you want a second, quieter set of reviews further down.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
