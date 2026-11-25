import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { RollingClockDemo, RollingClockTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccable-ui.com/r/rolling-clock.json";

const USAGE = `"use client";
import { RollingClock } from "@/components/ui/rolling-clock";

// The visitor's own time. Size, weight and color come from the text around it.
export function LocalTime() {
  return <RollingClock className="text-5xl font-medium tracking-tight" aria-label="Your local time" />;
}`;

const TYPES = `<RollingClock />          // 24 hour
<RollingClock hour12 />   // 12 hour, with AM or PM`;

const PROPS: [string, string, string][] = [
  ["hour12", "false", "12 hour time with a small AM or PM after the seconds. Off is 24 hour time."],
  ["aria-label", '"Time"', "Name for screen readers. The time itself is read from hidden text that does not announce every second."],
  ["className / style", "—", "On the clock. It takes its font, size, weight and color from here or from the text around it."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/rolling-clock/rolling-clock.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/rolling-clock/rolling-clock.jsx"), "utf8");
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
      It starts at 00:00:00 and spins up to your own time (press Reset to see it again). Then watch the seconds: the new number rises from below on a curve, the left digit swinging left
      and the right one right, and at the top of a minute the digits roll one after another, right to left.
    </>
  );

  return (
    <DocsLayout slug="rolling-clock" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/rolling-clock.tsx"
        preview={<RollingClockDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "rolling-clock.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "rolling-clock.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Two types. <strong className="font-medium text-[var(--fg)]">24 hour</strong> is the default.{" "}
          <strong className="font-medium text-[var(--fg)]">12 hour</strong> adds a small AM or PM after the seconds, which
          rolls the same way when noon or midnight comes.
        </Lede>
        <RollingClockTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact clock and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where, 12 or 24 hour,
          the type and the color), then fits it to your product without changing how it rolls.
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
          Drop it in where the time belongs and size it with <Code>className</Code>. Leave a little room above and below
          it, where the digits swing out as they roll.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "local-time.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>Each pair of digits rolls like two little wheels turning side by side.</Lede>
        <p className="mt-4 max-w-prose text-copy-16 text-[var(--muted)]">
          When a digit changes, the bigger number rises from below and the old one leaves upward, in 0.62 seconds. The
          move starts gently and lands softly. They never travel in a straight line: the left digit of each pair swings out
          to the left on a curve and the right digit swings out to the right, leaning along the curve, shrinking and
          fading as they leave the front. When several digits change on the same second they roll right to left, 70ms
          apart, like a wave. The first time it appears it shows 00:00:00, waits a moment once you can see it, then every
          digit spins up through each number to the real time in 1.5 seconds and eases out to a soft stop, so you see how
          it rolls. After that the clock wakes only when the second changes. With reduced motion there is no spin: each new
          number simply fades in.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
