import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { SettleCounterDemo, SettleCounterTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/settle-counter.json";

const USAGE = `"use client";
import { SettleCounter } from "@/components/ui/settle-counter";

// Give it a new value and only the digits that changed settle into place.
// Size, weight and color come from the text around it.
export function LiveCount({ count }: { count: number }) {
  return <SettleCounter value={count} aria-label="People online:" className="text-6xl font-medium tracking-tight" />;
}`;

const TYPES = `<SettleCounter value={83295} />                 // 83,295
<SettleCounter value={83295} separator="" />    // 83295`;

const PROPS: [string, string, string][] = [
  ["value", "—", "The number to show. Give it a new one and the changed digits settle. A string is shown as written, like \"$1.2k\"."],
  ["separator", '","', "The mark between thousands: \",\" gives 83,295. Use \"\" for none, or another mark like \".\". Only for number values."],
  ["aria-label", "—", "Read by screen readers before the number, like \"People online:\". The number itself is read from hidden text."],
  ["className / style", "—", "On the number. It takes its font, size, weight and color from here or from the text around it."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/settle-counter/settle-counter.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/settle-counter/settle-counter.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, typesHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(TYPES, "tsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Types" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      A new random number every 7 seconds until you press Change number, then it stays on yours. Watch a changed digit count
      there (1, 2, 3, 4, 5, 6), slowing into the last number, which lands big and faint and settles. When a digit is added the
      number widens first, and when one leaves it closes up after.
    </>
  );

  return (
    <DocsLayout slug="settle-counter" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/settle-counter.tsx"
        preview={<SettleCounterDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "settle-counter.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "settle-counter.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Two types, playing the same numbers. <strong className="font-medium text-[var(--fg)]">Commas</strong> is the
          default: a comma sits between thousands and settles in like a digit when the number grows past 999.{" "}
          <strong className="font-medium text-[var(--fg)]">No commas</strong> shows the digits alone.
        </Lede>
        <SettleCounterTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact counter and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, commas or not,
          the type and the color), then fits it to your product without changing how it settles.
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
          Pass the number to <Code>value</Code> and size it with <Code>className</Code>. Leave a little room above and below
          it, where a new digit lands bigger before it settles.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "live-count.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>Only the digits that change move. The rest stay perfectly still.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          A digit that changes counts to its new number, up or down, showing every number in between: from 1 to 6 you see
          2, 3, 4 and 5 on the way. Each one arrives a little bigger (1.3 times) and leaves in 0.18 seconds. The count is
          quick at first and slows into the last number, and never takes more than 0.56 seconds, so 0 to 9 doesn&apos;t
          drag. The last number arrives 1.6 times bigger at 30% and settles to full size and full color in 0.62 seconds:
          quick at first, then a long, soft landing. The old digit shrinks to half its size and fades out in 0.38 seconds,
          gone early with no tail. When the number gets longer, the frame opens first, one digit wide in 0.42
          seconds, easing in and out so it never jolts, and the new digit starts settling 0.3 seconds in, when there is
          almost room for it. When the number gets shorter, the digit leaves first and the frame closes behind it. Digits
          that change together start 45ms apart, left to right. If a new number comes while digits are still settling, each
          one leaves from wherever it is, so nothing jumps. With reduced motion nothing grows or widens: each new digit
          simply fades in where it stands.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
