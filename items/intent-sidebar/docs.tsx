import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { LogicCheckpoint } from "@/components/site/logic-checkpoint";
import { IntentSidebarDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/intent-sidebar.json";

const USAGE = `import { IntentSidebar, type IntentSection } from "@/components/ui/intent-sidebar";

const SECTIONS: IntentSection[] = [
  {
    title: "Recents",
    chats: [
      {
        id: "kitcut",
        title: "Kitcut button crack sound",
        time: "Yesterday",
        files: [
          { id: "kitcut", name: "Kitcut button" },
          { id: "crack", name: "Crack sound" },
        ],
      },
      // one entry per chat
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-dvh w-64 flex-col">
      <IntentSidebar
        sections={SECTIONS}
        activeId="kitcut"
        projects={["Impeccable UI", "Docs site"]}
        onOpen={(chatId, fileId) => openChat(chatId, fileId)}
        onAction={(chatId, action, value) => updateChat(chatId, action, value)}
      />
    </aside>
  );
}`;

const PROPS: [string, string, string][] = [
  ["sections", "—", "Groups of chats, like Pinned and Recents. Each chat: id, title, time, and optional files, pinned, unread, notify, project."],
  ["activeId", "—", "The chat that is open now. Its row stays lit."],
  ["onOpen", "—", "(chatId, fileId?) when a chat, or one of its files, is chosen."],
  ["onAction", "—", "(chatId, action, value?) for a menu choice. value is the notification setting or the project name."],
  ["projects", "[]", "Projects listed under Move to project."],
  ["aria-label", "\"Chats\"", "What screen readers call the list."],
  ["className / style", "—", "On the sidebar. It fills a flex column; give its parent a height."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/intent-sidebar/intent-sidebar.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/intent-sidebar/intent-sidebar.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([highlight(ts, "tsx"), highlight(js, "jsx"), highlight(USAGE, "tsx")]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "logic", title: "Logic" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Rest on a chat, then move down the list: the card follows. Point at +N for every file. Open ⋯, go to Notifications,
      then cut diagonally across Settings to its submenu. On a phone, tap.
    </>
  );

  return (
    <DocsLayout slug="intent-sidebar" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/intent-sidebar.tsx"
        preview={<IntentSidebarDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "intent-sidebar.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "intent-sidebar.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <LogicCheckpoint groups={info.logic ?? []} what="this sidebar" />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact sidebar and asks only where it goes and what it lists.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks three short questions (where and what it lists,
          which actions your app supports, and your colors), then fits it to your brand without changing any rule above.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>
          Give it your chats and what opening one does. The sidebar never changes your data itself: onAction tells your app
          what was picked, and you update the chats there.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "sidebar.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          The card and menus float just right of the sidebar, over your page, so keep <code className="rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-code-inline text-[var(--fg)]">overflow: hidden</code> off its parents.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
