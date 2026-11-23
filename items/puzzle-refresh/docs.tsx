import { readFile } from "node:fs/promises";
import Link from "next/link";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import {
  Code,
  DocSection,
  Lede,
  PageTitle,
  PropsTable,
} from "@/components/site/doc-parts";
import { PuzzleRefreshDemo } from "./demo";
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
  "https://impeccable-ui.com/r/puzzle-refresh.json";

const USAGE_LAYOUT = `// app/layout.tsx
import { PuzzleRefresh } from "@/components/ui/puzzle-refresh";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PuzzleRefresh />
        {children}
      </body>
    </html>
  );
}`;

const USAGE_SOFT = `"use client";
import { useRouter } from "next/navigation";
import { PuzzleRefresh } from "@/components/ui/puzzle-refresh";

// Put this in the root layout instead: the page refreshes while the pieces fall.
export function Puzzle() {
  const router = useRouter();
  return <PuzzleRefresh refresh={() => router.refresh()} />;
}`;

const USAGE_BUTTON = `"use client";
import { puzzleRefresh } from "@/components/ui/puzzle-refresh";

export function RefreshButton() {
  // Pass the click so the cracks start at the button.
  return <button onClick={(e) => puzzleRefresh({ origin: e })}>Refresh</button>;
}`;

const PROPS: [string, string, string][] = [
  [
    "duration",
    "4000",
    "Length of the whole refresh, in ms (2500 to 8000). Every step keeps its share of the time.",
  ],
  [
    "pieces",
    "56, 46 or 28",
    "How many pieces (6 to 100). By default 56 on wide screens, 46 on tablets and 28 on phones.",
  ],
  [
    "sound",
    "true",
    "The crack, the clatter as pieces land and a click as each one snaps back. Made in the browser, no files.",
  ],
  [
    "colors",
    "the page's own",
    "{ background, edge }. Any CSS colour, including var(--name). The empty screen behind the pieces; the thin line around each piece.",
  ],
  [
    "keys",
    "true",
    "<PuzzleRefresh> only. Catch F5, Ctrl+R and Cmd+R. Pressing again while it plays reloads at once.",
  ],
  [
    "origin",
    "the middle",
    "puzzleRefresh() only. Where the cracks start: pass the click event, an element or { x, y }.",
  ],
  [
    "root",
    "the whole page",
    "puzzleRefresh() only. Break just this element and what is inside it.",
  ],
  [
    "refresh",
    "full page reload",
    "A refresh that runs while the pieces fall, like router.refresh() or refetching data. If it is slow, the pieces wait in the heap (up to 10s), then the fresh page flies back.",
  ],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(
    join(root, "items/puzzle-refresh/puzzle-refresh.tsx"),
    "utf8",
  );
  const js = await readFile(
    join(root, "generated/js/puzzle-refresh/puzzle-refresh.jsx"),
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
    <DocsLayout slug="puzzle-refresh" sections={SECTIONS}>
      <PageTitle
        name={info.name}
        description={info.description}
        tags={info.tags}
      />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/puzzle-refresh.tsx"
        preview={<PuzzleRefreshDemo />}
        hint={
          <>
            The button breaks this whole page into puzzle pieces from where you
            click: it refreshes while they lie in a heap, then they fly back
            and click into place. Sound on. The reload keys (F5, Ctrl+R, Cmd+R)
            play it too, then do a real reload. The browser&apos;s reload button
            and pull-to-refresh on phones still reload straight away. With
            reduced motion on, the page simply fades.
          </>
        }
        files={[
          {
            id: "ts",
            label: "puzzle-refresh.tsx",
            copy: ts,
            body: <Html html={tsHtml} />,
          },
          {
            id: "js",
            label: "puzzle-refresh.jsx",
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
          four short questions (which refresh, colors, speed and sound, full
          reload or a refresh while it plays), then fits it to your brand
          without changing how the page breaks and comes back.
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
          break the page into pieces first.
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
          <Code>puzzleRefresh()</Code>.
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
          while the pieces fall. In Next.js, <Code>router.refresh()</Code>{" "}
          loads the fresh page without a full reload, and the fresh page is
          what flies back together.
        </p>
        <Tabs
          tabs={[
            {
              id: "soft",
              label: "puzzle.tsx",
              copy: USAGE_SOFT,
              body: <Html html={softHtml} />,
            },
          ]}
        />
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--muted)]">
          Want your refresh to feel heavier? Try{" "}
          <Link
            href="/docs/black-hole-refresh"
            className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]"
          >
            Black Hole Refresh
          </Link>
          , which swallows the page and blasts it back.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Set them on <Code>&lt;PuzzleRefresh&gt;</Code>, or pass them to{" "}
          <Code>puzzleRefresh(options)</Code>.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
