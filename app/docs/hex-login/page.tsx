import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { HexLoginDemo } from "@/components/site/hex-login-demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { hexLoginBlendPrompt, hexLoginInstallPrompt } from "@/lib/prompts";

const DESCRIPTION =
  "A calm login page with your logo inside turning hexagon rings. Use it as your main sign-in page, with your own logo and real sign-in behind it.";

export const metadata: Metadata = {
  title: "Hex-Login · Impeccable",
  description: DESCRIPTION,
};

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/hex-login.json";

const USAGE = `"use client";
import { HexLogin } from "@/components/ui/hex-login";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <HexLogin
      logo={<Logo className="h-20 w-auto" />}
      brand="Acme"
      onContinue={async (email) => {
        await sendMagicLink(email); // your email sign-in
      }}
      // Leave onGoogle out until Google sign-in is connected.
    />
  );
}`;

const PROPS: [string, string, string][] = [
  ["logo", "Impeccable mark", "Your logo, in the middle of the rings. About 70 x 80px."],
  ["title", '"Welcome back, Buddy"', "The big line under the logo."],
  ["onContinue", "—", "Called with the email once it passes the check. Return a promise and Continue shows a spinner until it settles."],
  ["onGoogle", "—", "Called on Sign in with Google, with the same spinner. Leave it out and a toast says Google isn't connected yet, for 3 seconds."],
  ["google", "true", "Show the Google button and the OR line."],
  ["brand", '"Impeccable"', "Your product name in the small print."],
  ["termsHref / privacyHref", '"/terms" / "/privacy"', "Links in the small print."],
  ["defaultEmail", '""', "An email to start with, like one from a link."],
  ["labels", "—", "Any of the short texts: google, or, placeholder, continue, googleMissing, emptyEmail, badEmail, agree, terms, privacy, and."],
  ["className / style", "—", "On the page itself. It fills the screen (min-height 100dvh); set a smaller minHeight to fit it in a box."],
];

export default async function HexLoginPage() {
  const root = process.cwd();
  const ts = await readFile(join(root, "registry/impeccable/hex-login/hex-login.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/hex-login/hex-login.jsx"), "utf8");
  const installPrompt = hexLoginInstallPrompt(ts);
  const blendPrompt = hexLoginBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml] = await Promise.all([highlight(ts, "tsx"), highlight(js, "jsx"), highlight(USAGE, "tsx")]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="hex-login" sections={SECTIONS}>
      <PageTitle name="Hex-Login" description={DESCRIPTION} tags={["Login page", "No extra packages", "Light + dark", "Mobile"]} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/hex-login.tsx"
        preview={<HexLoginDemo />}
        hint={
          <>
            Press Continue with the field empty, or with a typo like <em>name@mail</em>, to see the message under the field. A real
            email opens my X profile in a new tab, standing in for sign-in. Google isn&apos;t connected here, so it shows a toast for 3
            seconds. More login pages live in{" "}
            <Link href="/docs/login-pages" className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]">
              Login pages
            </Link>
            .
          </>
        }
        files={[
          { id: "ts", label: "hex-login.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "hex-login.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact page and asks only which route and which logo.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (the page, your logo, how
          people sign in and the words), then fits it to your product without changing the design.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Make it the whole login page and pass it your logo and your sign-in.</Lede>
        <Tabs tabs={[{ id: "usage", label: "app/login/page.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Continue checks the email first. Empty or not an email, a short message opens under the field and nothing is sent. Colors
          come from your theme: it reads <code className="font-mono text-[13px] text-[var(--fg)]">--foreground</code> and{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--background</code> (or{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--fg</code> and{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--bg</code>),{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--destructive</code> for errors and{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--radius-lg</code> for the field, so it follows light and dark mode
          on its own.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
