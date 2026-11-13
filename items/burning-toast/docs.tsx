import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import {
  BurningToastDemo,
  BurningToastDemoToaster,
  ToastPositionDemo,
  ToastTypesDemo,
} from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/burning-toast.json";

const LAYOUT = `import { BurningToaster } from "@/components/ui/burning-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BurningToaster position="bottom-right" />
      </body>
    </html>
  );
}`;

const USAGE = `"use client";
import { toast } from "@/components/ui/burning-toast";

export function SaveButton() {
  return (
    <button
      onClick={() =>
        toast.success("Changes saved", { description: "Your profile is up to date." })
      }
    >
      Save
    </button>
  );
}`;

const TYPES = `toast("Event created", { description: "Sunday, December 3 at 9:00 AM" });
toast.success("Changes saved", { description: "Your profile is up to date." });
toast.info("New version available", { description: "Refresh to get the latest features." });
toast.warning("Storage almost full", { description: "You have used 9 GB of your 10 GB." });
toast.error("Payment failed", { description: "Your card was declined. Try another one." });`;

const POSITION = `<BurningToaster position="bottom-right" />  // default
<BurningToaster position="bottom-center" />`;

const PROPS: [string, string, string][] = [
  ["position", '"bottom-right"', 'Where the stack sits: "bottom-right" or "bottom-center". On screens under 600px it is always bottom center and full width.'],
  ["duration", "4000", "Ms before a toast burns on its own. Hovering or touching the stack pauses it."],
  ["burnDuration", "1200", "Length of the burn in ms."],
  ["visibleToasts", "3", "How many toasts show in the stack. Older ones wait, hidden, behind."],
  ["offset", "24 (16 on phones)", "Gap from the bottom and side of the screen, in px."],
  ["colors", "Canvas, CanvasText", "surface, text, muted and border. Any CSS color, including var(--…). The default follows light and dark through color-scheme."],
  ["radius", '"var(--radius-lg, 12px)"', "Corner radius. The close button's corners follow it."],
  ["iconColors", "the text color", "One color per type: default, success, info, warning, error."],
  ["burnColors", "black, white, gray", "char, glow, smoke and ember, as in Burning-Screen. The edge picks whichever shows on your toast and page."],
  ["id", "—", "Only for a second toaster on the same page. It shows only toasts sent with that toaster's id."],
];

const TOAST_OPTIONS: [string, string, string][] = [
  ["description", "—", "The supporting line under the main message."],
  ["type", '"default"', "default, success, info, warning or error. Picks the icon. toast.success() and friends set it for you."],
  ["duration", "the toaster's", "Ms for this toast only. Infinity keeps it until it is closed."],
  ["icon", "the type's icon", "Your own icon. null for none."],
  ["id", "auto", "Reuse an id to update a toast that is still showing."],
  ["onDismiss", "—", "Called once the toast has burned away."],
  ["toaster", "—", "Sends the toast to the toaster with this id. Leave it out for the main one."],
  ["toast.dismiss(id?)", "—", "Burns one toast from the top, or all of them with no id."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/burning-toast/burning-toast.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/burning-toast/burning-toast.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, layoutHtml, usageHtml, typesHtml, positionHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(LAYOUT, "tsx"),
    highlight(USAGE, "tsx"),
    highlight(TYPES, "tsx"),
    highlight(POSITION, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Types" },
    { id: "position", title: "Position" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="burning-toast" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/burning-toast.tsx"
        preview={<BurningToastDemo />}
        hint={
          <>
            Pop a few. They stack, and spread out while you hover. Close one and it burns from the X. Wait 4 seconds and it
            burns from the top. Swipe one sideways or down and it burns from where you let go. With reduced motion on, it
            fades.
          </>
        }
        files={[
          { id: "ts", label: "burning-toast.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "burning-toast.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>Five types. Each one only changes the icon, so the toast stays calm and the fire stays the star.</Lede>
        <ToastTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="position" title="Position">
        <Lede>
          Toasts always pop at the bottom, on the right or in the center. On a phone they are always centered and full width.
        </Lede>
        <ToastPositionDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "position", label: "layout.tsx", copy: POSITION, body: <Html html={positionHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only which toasts it should show.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (which toasts, the side,
          the colors and the timing), then fits it to your product without changing how it burns.
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
          Put <Code>BurningToaster</Code> once in your root layout, then call <Code>toast()</Code> from anywhere.
        </Lede>
        <Tabs tabs={[{ id: "layout", label: "app/layout.tsx", copy: LAYOUT, body: <Html html={layoutHtml} /> }]} />
        <div className="mt-4">
          <Tabs tabs={[{ id: "usage", label: "save-button.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
        <p className="mt-8 mb-3 text-[15px] font-medium text-[var(--fg)]">toast() options</p>
        <PropsTable rows={TOAST_OPTIONS} />
      </DocSection>

      <BurningToastDemoToaster />
    </DocsLayout>
  );
}
