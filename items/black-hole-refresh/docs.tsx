import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import {
  Code,
  DocSection,
  Lede,
  PageTitle,
  PropsTable,
} from "@/components/site/doc-parts";
import { BlackHoleRefreshDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import {
  blendPrompt as buildBlendPrompt,
  installPrompt as buildInstallPrompt,
} from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL =
  "https://impeccableui.vercel.app/r/black-hole-refresh.json";

const USAGE_LAYOUT = `// app/layout.tsx
import { BlackHoleRefresh } from "@/components/ui/black-hole-refresh";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlackHoleRefresh />
        {children}
      </body>
    </html>
  );
}`;

const USAGE_SOFT = `"use client";
import { useRouter } from "next/navigation";
import { BlackHoleRefresh } from "@/components/ui/black-hole-refresh";

// Put this in the root layout instead: the page refreshes while it is eaten.
export function BlackHole() {
  const router = useRouter();
  return <BlackHoleRefresh refresh={() => router.refresh()} />;
}`;

const USAGE_BUTTON = `"use client";
import { blackHoleRefresh } from "@/components/ui/black-hole-refresh";

export function RefreshButton() {
  return <button onClick={() => blackHoleRefresh()}>Refresh</button>;
}`;

const PROPS: [string, string, string][] = [
  [
    "duration",
    "5200",
    "Length of the whole refresh, in ms (3000 to 12000). Every step keeps its share of the time.",
  ],
  [
    "colors",
    "black, white",
    "{ hole, glow }. Any CSS colour, including var(--name). The hole and its dark; the light, disk and blast.",
  ],
  [
    "keys",
    "true",
    "<BlackHoleRefresh> only. Catch F5, Ctrl+R and Cmd+R. Pressing again while it plays reloads at once.",
  ],
  [
    "root",
    "the whole page",
    "blackHoleRefresh() only. Swallow just this element and what is inside it.",
  ],
  [
    "refresh",
    "full page reload",
    "A refresh that runs while the hole eats, like router.refresh() or refetching data. If it is slow, the hole keeps spinning (up to 10s), then the blast throws the fresh page back.",
  ],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(
    join(root, "items/black-hole-refresh/black-hole-refresh.tsx"),
    "utf8",
  );
  const js = await readFile(
    join(root, "generated/js/black-hole-refresh/black-hole-refresh.jsx"),
    "utf8",
  );
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, layoutHtml, buttonHtml, softHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE_LAYOUT, "tsx"),
    highlight(USAGE_BUTTON, "tsx"),
    highlight(USAGE_SOFT, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="black-hole-refresh" sections={SECTIONS}>
      <PageTitle
        name={info.name}
        description={info.description}
        tags={info.tags}
      />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/black-hole-refresh.tsx"
        preview={<BlackHoleRefreshDemo />}
        hint={
          <>
            The button feeds this whole page to the black hole: it refreshes
            while the hole eats, then the blast throws it back. The reload keys
            (F5, Ctrl+R, Cmd+R) play it too, then do a real reload. The
            browser&apos;s reload button and pull-to-refresh on phones still
            reload straight away. With reduced motion on, the page simply fades.
          </>
        }
        files={[
          {
            id: "ts",
            label: "black-hole-refresh.tsx",
            copy: ts,
            body: <Html html={tsHtml} />,
          },
          {
            id: "js",
            label: "black-hole-refresh.jsx",
            copy: js,
            body: <Html html={jsHtml} />,
          },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool.{" "}
          <strong className="font-medium text-[var(--fg)]">Install</strong> adds
          this exact animation and asks only which refresh it takes over.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks
          four short questions (which refresh, colors, speed, full reload or a
          refresh while it eats), then fits it to your brand without changing how the hole
          eats.
        </Lede>
        <Tabs
          tabs={[
            {
              id: "install",
              label: "Install prompt",
              copy: installPrompt,
              body: <PromptBody text={installPrompt} />,
            },
            {
              id: "blend",
              label: "Blend prompt",
              copy: blendPrompt,
              body: <PromptBody text={blendPrompt} />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>
          1. Put it once in the root layout. From then on F5, Ctrl+R and Cmd+R
          play the black hole first.
        </Lede>
        <Tabs
          tabs={[
            {
              id: "layout",
              label: "layout.tsx",
              copy: USAGE_LAYOUT,
              body: <Html html={layoutHtml} />,
            },
          ]}
        />
        <p className="mt-6 mb-4 text-[15px] leading-relaxed text-[var(--muted)]">
          2. Phones have no reload keys, so give your own refresh button{" "}
          <Code>blackHoleRefresh()</Code>.
        </p>
        <Tabs
          tabs={[
            {
              id: "button",
              label: "refresh-button.tsx",
              copy: USAGE_BUTTON,
              body: <Html html={buttonHtml} />,
            },
          ]}
        />
        <p className="mt-6 mb-4 text-[15px] leading-relaxed text-[var(--muted)]">
          3. A slow site? Pass <Code>refresh</Code> and the page refreshes
          while the hole eats it. In Next.js, <Code>router.refresh()</Code>{" "}
          loads the fresh page without a full reload, and the blast throws it
          back into place.
        </p>
        <Tabs
          tabs={[
            {
              id: "soft",
              label: "black-hole.tsx",
              copy: USAGE_SOFT,
              body: <Html html={softHtml} />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Set them on <Code>&lt;BlackHoleRefresh&gt;</Code>, or pass them to{" "}
          <Code>blackHoleRefresh(options)</Code>.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
