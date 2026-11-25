import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { CoffeeFaqDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/coffee-faq.json";

const USAGE = `import { CoffeeFaq } from "@/components/ui/coffee-faq";

const FAQS = [
  { question: "How long is the free trial?", answer: "14 days, no card needed." },
  { question: "Can I cancel any time?", answer: "Yes, from Settings, in one click." },
  { question: "Do you offer refunds?", answer: "Within 30 days, no questions asked." },
];

export function Faq() {
  return (
    <CoffeeFaq
      title="Questions about Acme"
      description="Can't find yours? Ask it at the bottom."
      items={FAQS}
      // No onAsk: every question gets the reply below after the dots.
      reply="Thanks! We'll email you an answer within a day."
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["items", "6 questions about Impeccable UI", "The rows, top to bottom: { question, answer }. An answer can be text or your own markup with links."],
  ["eyebrow", '"Frequently asked questions"', "The small pill above the title. null hides it."],
  ["title", '"Questions about Impeccable UI"', "The big line."],
  ["description", "a short line", "The line under the title. null hides it."],
  ["defaultOpen", "—", "Which row starts open (0 is the first). Leave it out to start with all closed."],
  ["chat", "true", "Show the chat box under the questions."],
  ["chatTitle / chatDescription", '"Still have a question?"', "The two lines in the chat box."],
  ["avatar", "Impeccable mark", "The round face in the chat box and next to every reply. An <img> fills it."],
  ["reply", '"My credits are over. Buy me a coffee."', "What every question gets back when there is no onAsk."],
  ["replyDelay", "1500", "How long the dots type, in ms (300 to 10000), give or take 250ms so it feels human."],
  ["onAsk", "—", "Called with each question. Return a string, or a promise of one, to answer with it. The dots stay for at least replyDelay."],
  ["labels", "—", "Any of the short texts: placeholder, send, you, typing, error."],
  ["className / style", "—", "On the section itself. It fills its width and centres a 640px column."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/coffee-faq/coffee-faq.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/coffee-faq/coffee-faq.jsx"), "utf8");
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

  return (
    <DocsLayout slug="coffee-faq" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/coffee-faq.tsx"
        preview={<CoffeeFaqDemo />}
        hint={
          <>
            Open any question, then type anything in the box at the bottom and press Enter. The dots type for about a second and a
            half, then I reply. My answer never changes, because there&apos;s no AI behind it, only an honest designer. More FAQ
            sections live in{" "}
            <Link href="/docs/faq-sections" className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]">
              FAQ sections
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "coffee-faq.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "coffee-faq.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact section and asks only which page it goes on.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, your questions, what the
          chat answers and its face), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Put it near the end of a page and give it your own questions.</Lede>
        <Tabs tabs={[{ id: "usage", label: "components/faq.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          One row is open at a time, and a question you ask becomes a new open row above the box. Asking again replaces it, so only your latest question stays and the section never keeps growing. With no{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">onAsk</code>, nothing leaves the page: every question gets{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">reply</code>. To answer for real later, return the answer from{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">onAsk</code>. Colors come from your theme: it reads{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">--foreground</code> and{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">--background</code> (or{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">--fg</code> and{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">--bg</code>) and{" "}
          <code className="font-mono text-code-inline text-[var(--fg)]">--radius-lg</code> for the corners, so it follows light and dark
          mode on its own. It pairs well with{" "}
          <Link href="/docs/hex-login" className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]">
            Hex Login
          </Link>
          , drawn from the same colors.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
