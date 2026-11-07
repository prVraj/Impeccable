import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { codeToHtml } from "shiki";
import { Header } from "@/components/site/header";
import { Playground } from "@/components/site/playground";
import { Tabs } from "@/components/site/tabs";
import { CopyButton } from "@/components/site/copy-button";
import { burningScreenBlendPrompt, burningScreenInstallPrompt } from "@/lib/prompts";

export const metadata: Metadata = {
  title: "Burning-Screen · Impeccable",
  description: "One click burns the screen away from the click and reveals the next page.",
};

const INSTALL = "npx shadcn@latest add https://impeccable-rust.vercel.app/r/burning-screen.json";

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

async function highlight(code: string, lang: string) {
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });
}

function Html({ html }: { html: string }) {
  return <div className="[&_pre]:font-mono" dangerouslySetInnerHTML={{ __html: html }} />;
}

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

  const promptBody = (text: string) => (
    <pre className="font-mono text-[12.5px] whitespace-pre-wrap text-[var(--fg)]">{text}</pre>
  );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
          Page transition
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Burning-Screen</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          One click burns the current screen away from where you clicked, and the next page shows
          through the hole. The edge chars black on light pages and glows white on dark ones.
        </p>

        <Section title="Try it">
          <Playground />
          <p className="mt-3 text-xs text-[var(--muted)]">
            Uses View Transitions and WebGL. Older browsers and reduced-motion settings get a short
            fade instead.
          </p>
        </Section>

        <Section title="Install">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
            <code className="truncate font-mono text-[13px]">{INSTALL}</code>
            <CopyButton text={INSTALL} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            No other packages needed. Or copy the code below into{" "}
            <code className="font-mono text-[13px] text-[var(--fg)]">components/ui/burning-screen.tsx</code>.
          </p>
        </Section>

        <Section title="Usage">
          <p className="mb-3 text-sm text-[var(--muted)]">
            1. Wrap your app once, in the root layout, so it survives page changes.
          </p>
          <Tabs tabs={[{ id: "layout", label: "layout.tsx", copy: USAGE_LAYOUT, body: <Html html={layoutHtml} /> }]} />
          <p className="mt-6 mb-3 text-sm text-[var(--muted)]">
            2. Call <code className="font-mono text-[13px] text-[var(--fg)]">burn()</code> with the
            change you want. It waits for the new page, then burns from the click.
          </p>
          <Tabs tabs={[{ id: "button", label: "sign-up-button.tsx", copy: USAGE_BUTTON, body: <Html html={buttonHtml} /> }]} />
        </Section>

        <Section title="Options">
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--panel)] text-xs text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Default</th>
                  <th className="px-4 py-2.5 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody>
                {PROPS.map(([name, def, desc]) => (
                  <tr key={name} className="border-t border-[var(--line)] align-top">
                    <td className="px-4 py-3 font-mono text-[13px]">{name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">{def}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Set them on <code className="font-mono text-[13px] text-[var(--fg)]">&lt;BurningScreen&gt;</code> as
            defaults, or per call in <code className="font-mono text-[13px] text-[var(--fg)]">burn(update, options)</code>.
          </p>
        </Section>

        <Section title="Code">
          <Tabs
            tabs={[
              { id: "ts", label: "TypeScript", copy: ts, body: <Html html={tsHtml} /> },
              { id: "js", label: "JavaScript", copy: js, body: <Html html={jsHtml} /> },
            ]}
          />
        </Section>

        <Section title="Prompts">
          <p className="mb-3 text-sm text-[var(--muted)]">
            <strong className="font-medium text-[var(--fg)]">Install</strong> has an AI agent add
            this exact component and asks only where it should burn.{" "}
            <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
            (where, colors, speed, ash), then fits it to your brand without changing the burn.
          </p>
          <Tabs
            tabs={[
              { id: "install", label: "Install prompt", copy: installPrompt, body: promptBody(installPrompt) },
              { id: "blend", label: "Blend prompt", copy: blendPrompt, body: promptBody(blendPrompt) },
            ]}
          />
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
