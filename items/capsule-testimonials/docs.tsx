import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { CapsuleTestimonialsDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/capsule-testimonials.json";

const USAGE = `import { CapsuleTestimonials } from "@/components/ui/capsule-testimonials";

const REVIEWS = [
  { name: "Lena Fischer", role: "COO, Northwind", quote: "We moved our whole team over in a week.", date: "Oct 2026", rating: 5, photo: "/people/lena.jpg" },
  { name: "Omar Haddad", role: "Founder, Globex", quote: "Support answers before I finish typing.", date: "Sep 2026", rating: 5, photo: "/people/omar.jpg" },
  { name: "Mia Chen", role: "Designer, Initech", quote: "It finally looks like our brand.", date: "Aug 2026", rating: 4, photo: "/people/mia.jpg" },
  { name: "Sam Ortiz", role: "CTO, Umbrella", quote: "The fastest setup we have had all year.", date: "Jul 2026", rating: 5, photo: "/people/sam.jpg" },
];

export function Reviews() {
  return <CapsuleTestimonials title="What our customers say" description="Open a capsule to read one." items={REVIEWS} />;
}`;

const PROPS: [string, string, string][] = [
  ["items", "6 made-up reviews", "The reviews, left to right: { name, role, quote, date, rating, photo, alt, color, ink }. 4 to 7 reads best. Portrait photos work best; without one, the capsule shows initials. An empty list shows nothing."],
  ["items[].rating", "—", "Stars out of 5, whole numbers. They pop in one after another as the card opens. Leave it out to hide the stars."],
  ["items[].color / ink", "soft palette", "The card color (any CSS color or theme variable) and its text, \"light\" or \"dark\". Six built-in colors take turns when you leave it out."],
  ["title", '"People said nice things. We kept them."', "The heading above the row. null hides it."],
  ["description", '"Real words from people who shipped with us…"', "The line under the heading. null hides it."],
  ["defaultOpen", "0", "Which review starts open."],
  ["open / onOpenChange", "—", "Control the open review yourself, for example to cycle them on a timer, and hear when someone opens one."],
  ["className / style", "—", "On the section itself. It fills its width and centres an 896px column."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/capsule-testimonials/capsule-testimonials.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/capsule-testimonials/capsule-testimonials.jsx"), "utf8");
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
    <DocsLayout slug="capsule-testimonials" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/capsule-testimonials.tsx"
        preview={<CapsuleTestimonialsDemo />}
        hint={
          <>
            Hover a capsule to see it grow and its photo stretch into a portrait, then click it. It opens while the open card
            eases back into a capsule, the words settle in and the stars pop in one by one. Arrow keys work too. More testimonial
            sections live in{" "}
            <Link href="/docs/testimonial-sections" className={link}>
              Testimonial sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "capsule-testimonials.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "capsule-testimonials.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your reviews, your
          card colors and your heading), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it after your features or pricing, where people want proof, and give it your own reviews and photos.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/reviews.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          Only one review is open at a time, and its words are laid out at the full card size, so they never re-wrap while it
          opens. Under 560px of width the capsules lie down and stack, so it works with a thumb on a phone. Page text comes from
          your theme: it reads <code className={code}>--foreground</code> and <code className={code}>--background</code> (or{" "}
          <code className={code}>--fg</code> and <code className={code}>--bg</code>), and the open card&apos;s corners are 3.5
          times <code className={code}>--radius-lg</code>. Each card keeps its own color, so set{" "}
          <code className={code}>color</code> and <code className={code}>ink</code> to your brand variables if the soft palette
          doesn&apos;t fit. It pairs well with{" "}
          <Link href="/docs/window-stats" className={link}>
            Window Stats
          </Link>{" "}
          higher up the same page.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
