import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { TaskProgressDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/task-progress.json";

const USAGE = `"use client";
import { TaskProgress, type Task } from "@/components/ui/task-progress";

export function SetupSteps({ step }: { step: number }) {
  const names = ["Connect your store", "Import products", "Pick a theme", "Add a payment method", "Invite your team", "Go live"];
  const tasks: Task[] = names.map((label, i) => ({
    id: label,                                                       // stable, so each task keeps its animation
    label,
    status: i < step ? "done" : i === step ? "active" : "pending",   // change it and the row animates
  }));
  return <TaskProgress tasks={tasks} aria-label="Setup steps" className="max-w-md" />;
}`;

const PROPS: [string, string, string][] = [
  ["tasks", "—", 'The list, in order. Each task is { id, label, status }, where status is "pending" (not started), "active" (in progress) or "done". Change a status and that row animates.'],
  ["limit", "5", "How many tasks show before the rest fold under Show more."],
  ["moreLabel", "(n) => `Show ${n} more`", "Text of the button that opens the rest. It gets the number of hidden tasks."],
  ["lessLabel", '"Show less"', "Text of the button that folds them away."],
  ["defaultExpanded", "false", "Start with every task showing."],
  ["activeColor", "the text color", "Color of the spinning arc on the task in progress. Any CSS color, including var(--…)."],
  ["emptyLabel", '"No tasks yet."', "Shown when the list is empty."],
  ["aria-label", '"Tasks"', "Name of the list for screen readers."],
  ["className / style", "—", "On the outer box. It fills the width it is given and has no background, so set a max width or a background here."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/task-progress/task-progress.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/task-progress/task-progress.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      It plays on its own here and pauses while your pointer is on it. Hover a struck task to read it, and open Show 2
      more for the last two.
    </>
  );

  return (
    <DocsLayout slug="task-progress" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/task-progress.tsx"
        preview={<TaskProgressDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "task-progress.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "task-progress.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact list and asks only where it goes and which steps it shows.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which
          steps, how many show, the words, and the spinner&apos;s color), then fits it to your product without changing
          how it moves.
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
          Build <Code>tasks</Code> from the state your product already has, and change a task&apos;s{" "}
          <Code>status</Code> to move it along.
        </Lede>
        <Tabs tabs={[{ id: "usage", label: "setup-steps.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          For a wait with no steps, a single progress bar like{" "}
          <Link href="/docs/tug-of-work-loader" className="text-[var(--fg)] underline underline-offset-4">
            Tug of Work loader
          </Link>{" "}
          fits better.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>Three icons, one strike and a fold. Everything takes its color from the text around it.</Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          A task that has not started shows a ring of eight soft dots. When it starts, a dark arc draws in over the dots
          and spins, once every 0.9 seconds. When it finishes, the arc closes into a full ring, a filled circle pops in
          with a tiny overshoot and a check draws inside it. A moment later the text fades and a thin line draws across
          it from left to right, line by line on wrapped text. Hover a finished task and the line pulls back while the
          text darkens, so you can read it; move away and it strikes again. On a phone, tap it instead. Only the first
          five tasks show. Show more opens the rest: the space grows with a soft landing and the rows fade in one after
          another. Show less folds them away. With reduced motion the arc stands still and every change is a short fade.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
