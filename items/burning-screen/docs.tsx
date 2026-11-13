import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { Playground } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/burning-screen.json";

const USAGE_LAYOUT = `// app/layout.tsx
import { BurningScreen } from "@/components/ui/burning-screen";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BurningScreen>{children}</BurningScreen>
      </body>
    </html>
  );
}`;

const USAGE_BUTTON = `"use client";
import { useRouter } from "next/navigation";
import { useBurningScreen } from "@/components/ui/burning-screen";

export function SignUpButton() {
  const router = useRouter();
  const { burn } = useBurningScreen();

  return (
    <button onClick={(e) => burn(() => router.push("/welcome"), { origin: e })}>
      Create account
    </button>
  );
}`;

const PROPS: [string, string, string][] = [
  ["duration", "2000", "Length of the burn, in ms."],
  ["origin", "screen center", "Where the fire starts: a click event, an element or { x, y }. Passed to burn()."],
  ["colors", "black, white, gray", "{ char, glow, smoke, ember }. Override any of them."],
  ["embers", "true", "After the burn, let the last ash keep rising over the new page."],
  ["emberDuration", "1500", "How long that ash lasts, in ms."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(
    join(root, "items/burning-screen/burning-screen.tsx"),
    "utf8",
  );
  const js = await readFile(join(root, "generated/js/burning-screen/burning-screen.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, layoutHtml, buttonHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE_LAYOUT, "tsx"),
    highlight(USAGE_BUTTON, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <>
      <DocsLayout slug="burning-screen" sections={SECTIONS}>
        <PageTitle name={info.name} description={info.description} tags={info.tags} />

        <Showcase
          installUrl={REGISTRY_URL}
          filePath="components/ui/burning-screen.tsx"
          preview={<Playground />}
          hint={
            <>
              The button burns this whole page away from where you click, into the other theme. Uses
              View Transitions and WebGL. Older browsers and reduced-motion settings get a short fade
              instead.
            </>
          }
          files={[
            { id: "ts", label: "burning-screen.tsx", copy: ts, body: <Html html={tsHtml} /> },
            { id: "js", label: "burning-screen.jsx", copy: js, body: <Html html={jsHtml} /> },
          ]}
        />

        <DocSection id="prompts" title="Prompts">
          <Lede>
            Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
            adds this exact component and asks only where it should burn.{" "}
            <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
            (where, colors, speed, ash), then fits it to your brand without changing the burn.
          </Lede>
          <Tabs
            tabs={[
              { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
              { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
            ]}
          />
        </DocSection>

        <DocSection id="usage" title="Usage">
          <Lede>1. Wrap your app once, in the root layout, so it survives page changes.</Lede>
          <Tabs tabs={[{ id: "layout", label: "layout.tsx", copy: USAGE_LAYOUT, body: <Html html={layoutHtml} /> }]} />
          <p className="mt-6 mb-4 text-[15px] leading-relaxed text-[var(--muted)]">
            2. Call <Code>burn()</Code> with the change you want. It waits for the new page, then
            burns from the click.
          </p>
          <Tabs tabs={[{ id: "button", label: "sign-up-button.tsx", copy: USAGE_BUTTON, body: <Html html={buttonHtml} /> }]} />
        </DocSection>

        <DocSection id="props" title="Props">
          <PropsTable rows={PROPS} />
          <p className="mt-3 text-sm text-[var(--muted)]">
            Set them on <Code>&lt;BurningScreen&gt;</Code> as defaults, or per call in{" "}
            <Code>burn(update, options)</Code>.
          </p>
        </DocSection>
      </DocsLayout>
    </>
  );
}
