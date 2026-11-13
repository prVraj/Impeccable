import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PasswordStrengthDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/password-strength.json";

const USAGE = `"use client";
import { PasswordStrength } from "@/components/ui/password-strength";

export function SignUpPassword() {
  return (
    <PasswordStrength
      name="password"
      onLevelChange={(level) => setCanSubmit(level === 3)} // optional
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["label", '"Password"', "Text above the field."],
  ["value / defaultValue", '—  / ""', "Controlled or uncontrolled value."],
  ["onChange", "—", "Called with the new value on every keystroke."],
  ["onLevelChange", "—", "Called with the number of checkpoints met: 0 (No), 1 (AI), 2 (AI agent) or 3 (Human)."],
  ["levels", '["No", "AI", "AI agent", "Human"]', "Names for 0, 1, 2 and 3 checkpoints met. Nothing shows while the field is empty."],
  ["rules", "the three checkpoint lines", "Text for the three checkpoints. The checks themselves stay the same."],
  ["minLength", "12", "Shortest length for the first checkpoint."],
  ["colors", "red, amber, green", "Meter colors for AI, AI agent and Human. Any CSS color, including var(--…)."],
  ["name / id / placeholder", "—", "Passed to the input, for forms."],
  ["autoComplete", '"new-password"', "So password managers offer to make one."],
  ["className / style", "—", "Layout for the outer box. It is full width up to 480px."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/password-strength/password-strength.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/password-strength/password-strength.jsx"), "utf8");
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
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="password-strength" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/password-strength.tsx"
        preview={<PasswordStrengthDemo />}
        hint={
          <>
            Try <Code>Sunflower-Pie42</Code> and watch it turn Human. The eye shows and hides the password
            without moving the cursor or closing the phone keyboard.
          </>
        }
        files={[
          { id: "ts", label: "password-strength.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "password-strength.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />
      <p className="mt-3 text-sm leading-relaxed text-pretty text-[var(--muted)]">
        Try <Code>Sunflower-Pie42</Code> and watch it turn Human. The eye shows and hides the password
        without moving the cursor or closing the phone keyboard.
      </p>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
          (where, the level names, the colors and what happens at each level), then fits it to your product without changing how it moves.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Drop it in your sign-up form. Everything has a default.</Lede>
        <Tabs tabs={[{ id: "usage", label: "sign-up-password.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The three checkpoints: at least 12 characters, at least 2 upper and 2 lower case letters, and at
          least one number and one special character. None met is No, 1 is AI, 2 is AI agent, 3 is Human.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
