import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { Playground } from "@/components/site/playground";
import { InstallCommand } from "@/components/site/install-command";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { burningScreenBlendPrompt, burningScreenInstallPrompt } from "@/lib/prompts";

export const metadata: Metadata = {
  title: "Burning-Screen · Impeccable",
  description: "One click burns the screen away from the click and reveals the next page.",
};

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/burning-screen.json";

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

export default async function BurningScreenPage() {
  const root = process.cwd();
  const ts = await readFile(
    join(root, "registry/impeccable/burning-screen/burning-screen.tsx"),
    "utf8",
  );
  const js = await readFile(join(root, "generated/js/burning-screen/burning-screen.jsx"), "utf8");
  const installPrompt = burningScreenInstallPrompt(ts);
  const blendPrompt = burningScreenBlendPrompt(ts);

  const [tsHtml, jsHtml, layoutHtml, buttonHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE_LAYOUT, "tsx"),
    highlight(USAGE_BUTTON, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
    { id: "code", title: "Code" },
    { id: "prompts", title: "Prompts" },
  ];

  return (
    <>
      <DocsLayout slug="burning-screen" sections={SECTIONS}>
        <PageTitle
          name="Burning-Screen"
          description="One click burns the current screen away from where you clicked, and the next page shows through the hole. The edge chars black on light pages and glows white on dark ones."
          tags={["Page transition", "WebGL", "View Transitions", "Light + dark"]}
        />

        <DocSection id="preview" title="Preview">
          <Playground />
          <p className="mt-3 text-xs text-[var(--muted)]">
            Uses View Transitions and WebGL. Older browsers and reduced-motion settings get a short
            fade instead.
          </p>
        </DocSection>

        <DocSection id="installation" title="Installation">
          <Lede>Run the command in a project set up with shadcn. No other packages needed.</Lede>
          <InstallCommand url={REGISTRY_URL} />
          <p className="mt-3 text-sm text-[var(--muted)]">
            Or copy the code below into <Code>components/ui/burning-screen.tsx</Code>.
          </p>
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

        <DocSection id="code" title="Code">
          <Tabs
            tabs={[
              { id: "ts", label: "burning-screen.tsx", copy: ts, body: <Html html={tsHtml} /> },
              { id: "js", label: "burning-screen.jsx", copy: js, body: <Html html={jsHtml} /> },
            ]}
          />
        </DocSection>

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
      </DocsLayout>
    </>
  );
}
