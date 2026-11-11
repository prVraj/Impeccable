import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/site/docs-layout";
import { DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { FramedUploadDemo } from "@/components/site/framed-upload-demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { framedUploadBlendPrompt, framedUploadInstallPrompt } from "@/lib/prompts";

const DESCRIPTION =
  "Drop in a picture and it hangs in a frame with a soft shadow, like a print on a wall. Use it on cover or portfolio forms, one picture per frame.";

export const metadata: Metadata = {
  title: "Framed-Upload · Impeccable",
  description: DESCRIPTION,
};

const REGISTRY_URL = "https://impeccable-rust.vercel.app/r/framed-upload.json";

const USAGE = `"use client";
import { FramedUpload } from "@/components/ui/framed-upload";

export function CoverField() {
  return (
    <FramedUpload
      name="cover"
      onChange={(file) => console.log(file)} // a File, or null after Remove
    />
  );
}`;

const TOKENS = `/* Your design tokens. The frame reads these two. */
:root {
  --radius-lg: 0.5rem; /* frame corners, 8px */
  --stroke-2: 2px;     /* the lip between frame and mat */
}`;

const PROPS: [string, string, string][] = [
  ["defaultSrc", "—", "An image to show before anything is picked, like a current cover."],
  ["onChange", "—", "Called with the picked File, or null after Remove."],
  ["name", "—", "Form field name. A picked or dropped file is sent with a normal form."],
  ["alt", '"Uploaded image"', "Alt text for the image in the frame."],
  ["accept", '"image/*"', "Which files to take, like a file input's accept. Images only."],
  ["maxSize", "10 MB", "Largest file in bytes. Bigger files get a short note in the frame."],
  ["aspectRatio", '"4 / 5"', "Shape of the empty frame. Portrait, like a poster."],
  ["fitToImage", "true", "The frame takes each picture's own shape, so nothing is cropped. Off, every picture is cropped to aspectRatio."],
  ["radius", "var(--radius-lg, 0.5rem)", "Frame corners. Any CSS length or token. Inner corners follow it: inner radius = outer radius minus the padding between them."],
  ["stroke", "var(--stroke-2, 2px)", "The thin lip between the frame and the mat. Any CSS length or token."],
  ["frameColor", "white / graphite", "Frame color. White on a light page, graphite on a dark one. Any CSS color or token."],
  ["matColor", "a shade off the frame", "Mat color, the border around the picture. Any CSS color or token."],
  ["mat", "true", "Show the mat. Off, the picture fills the frame right up to the lip."],
  ["title / hint", '"Drop an image here"', "The two lines in the empty frame. The hint names the size limit."],
  ["labels", "—", "The other short texts: drop, replace, remove, typeError, sizeError."],
  ["className / style", "—", "Layout for the outer box. Full width up to 320px by default."],
];

export default async function FramedUploadPage() {
  const root = process.cwd();
  const ts = await readFile(join(root, "registry/impeccable/framed-upload/framed-upload.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/framed-upload/framed-upload.jsx"), "utf8");
  const installPrompt = framedUploadInstallPrompt(ts);
  const blendPrompt = framedUploadBlendPrompt(ts);

  const [tsHtml, jsHtml, usageHtml, tokensHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(USAGE, "tsx"),
    highlight(TOKENS, "css"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "props", title: "Props" },
  ];

  return (
    <DocsLayout slug="framed-upload" sections={SECTIONS}>
      <PageTitle name="Framed-Upload" description={DESCRIPTION} tags={["Upload", "No extra packages", "Light + dark", "Mobile"]} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/framed-upload.tsx"
        preview={<FramedUploadDemo />}
        hint={
          <>
            Drop an image on either frame, or click one. A wide photo gets a wide frame. Replace and Remove sit in the corner. Your
            picture stays in your browser. With reduced motion on, it simply fades in.
          </>
        }
        files={[
          { id: "ts", label: "framed-upload.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "framed-upload.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact component and asks only where it goes.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions
          (where, the frame shape, the frame look and the words), then fits it to your product without changing how it frames.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Drop it in a form. Everything else has a default.</Lede>
        <Tabs tabs={[{ id: "usage", label: "cover-field.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          The frame&apos;s corners and its lip come from your design tokens, not fixed numbers. It reads{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--radius-lg</code> and{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">--stroke-2</code>, and only falls back to 8px
          and 2px when your project has neither. Pass <code className="font-mono text-[13px] text-[var(--fg)]">radius</code> or{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">stroke</code> to point it at other tokens.
        </p>
        <div className="mt-4">
          <Tabs tabs={[{ id: "tokens", label: "globals.css", copy: TOKENS, body: <Html html={tokensHtml} /> }]} />
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          It only shows the picture. Uploading it to your storage is up to your form, through{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">name</code> or{" "}
          <code className="font-mono text-[13px] text-[var(--fg)]">onChange</code>.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
