import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DocsLayout } from "@/components/site/docs-layout";
import { Code, DocSection, Lede, PageTitle, PropsTable } from "@/components/site/doc-parts";
import { PeepholeButtonDemo, PeepholeButtonSlotDemo, PeepholeButtonTypesDemo } from "./demo";
import { Showcase } from "@/components/site/showcase";
import { Tabs } from "@/components/site/tabs";
import { Html, PromptBody } from "@/components/site/html";
import { highlight } from "@/lib/highlight";
import { blendPrompt as buildBlendPrompt, installPrompt as buildInstallPrompt } from "./prompts";
import type { ItemInfo } from "@/lib/site";

const REGISTRY_URL = "https://impeccableui.vercel.app/r/peephole-button.json";

const TYPES = `// Reveal (the default): frosted glass tinted by the picture; hover opens the whole picture.
<PeepholeButton image="/fields.jpg">Take a peek</PeepholeButton>

// Fill: your avatar in the slot; hover pours your brand color out of it.
<PeepholeButton variant="fill" image="/ava.jpg" side="right">Talk to Ava</PeepholeButton>`;

const SLOT = `<PeepholeButton image="/dunes.jpg">Circle slot</PeepholeButton>
<PeepholeButton image="/tide.jpg" shape="square">Square slot</PeepholeButton>
<PeepholeButton image="/fields.jpg" side="right">On the right</PeepholeButton>
<PeepholeButton variant="fill" image="/kai.jpg" slotSize={28}>Small slot</PeepholeButton>
<PeepholeButton variant="fill" image="/ava.jpg" shape="square" slotSize={48} side="right">Big square</PeepholeButton>`;

const USAGE = `"use client";
import { PeepholeButton } from "@/components/ui/peephole-button";

export function TalkToUs() {
  return (
    <PeepholeButton
      variant="fill"                   // optional: "reveal" (default) or "fill"
      image="/team/ava.jpg"            // the picture: the whole image, or an avatar or logo
      shape="circle"                   // optional: "circle" (default) or "square"
      side="right"                     // optional: "left" (default) or "right"
      slotSize={32}                    // optional: the slot in px, 20 to 80
      fillColor="var(--primary)"       // optional, fill only: the color that pours in
      onClick={() => openChat()}
    >
      Talk to Ava
    </PeepholeButton>
  );
}`;

const PROPS: [string, string, string][] = [
  ["children", "—", "The label. It stays on one line and trims with … if it runs out of room. Leave it out for a round button that is only the slot, and give it an aria-label."],
  ["image", "—", "The picture, any image URL. In \"reveal\" it is the whole picture (it also tints the glass). In \"fill\" it is the avatar or logo in the slot. If it is missing or fails to load, the button shows plain glass and an empty slot."],
  ["variant", '"reveal"', '"reveal" opens the whole picture on hover. "fill" pours fillColor out of the slot on hover.'],
  ["shape", '"circle"', '"circle" is a round slot in a pill. "square" is a rounded square slot in a rounded button.'],
  ["side", '"left"', "Which end the slot sits at."],
  ["slotSize", "32", "The slot in px, from 20 to 80. The button is 44px tall and grows to keep 6px around a bigger slot."],
  ["radius", "12", "Only with shape=\"square\": the button's corner radius in px. The slot's corners are this radius minus the space around the slot, so the two always nest."],
  ["icon", "—", "A small icon shown in the middle of the slot, over the picture. It is drawn in white."],
  ["fillColor", "violet", "Only with variant=\"fill\": the color that pours in. Any CSS color, including var(--…)."],
  ["fillTextColor", "white", "Only with variant=\"fill\": the label color where the fill has reached."],
  ["textColor", "white / theme", "The label at rest. White in \"reveal\"; black in light mode and white in dark mode in \"fill\"."],
  ["onClick, type, disabled, …", 'type="button"', "Everything a normal button takes. Disabled keeps the slot closed."],
  ["className / style", "—", "On the button itself. Its width follows the label."],
];

export default async function Docs({ info }: { info: ItemInfo }) {
  const root = process.cwd();
  const ts = await readFile(join(root, "items/peephole-button/peephole-button.tsx"), "utf8");
  const js = await readFile(join(root, "generated/js/peephole-button/peephole-button.jsx"), "utf8");
  const installPrompt = buildInstallPrompt(ts);
  const blendPrompt = buildBlendPrompt(ts);

  const [tsHtml, jsHtml, typesHtml, slotHtml, usageHtml] = await Promise.all([
    highlight(ts, "tsx"),
    highlight(js, "jsx"),
    highlight(TYPES, "tsx"),
    highlight(SLOT, "tsx"),
    highlight(USAGE, "tsx"),
  ]);

  const SECTIONS = [
    { id: "preview", title: "Preview" },
    { id: "installation", title: "Installation" },
    { id: "types", title: "Types" },
    { id: "slot", title: "Slot" },
    { id: "prompts", title: "Prompts" },
    { id: "usage", title: "Usage" },
    { id: "how-it-moves", title: "How it moves" },
    { id: "props", title: "Props" },
  ];

  const hint = (
    <>
      Hover the button to open the picture, or press <strong className="font-medium text-[var(--fg)]">Use my picture</strong> to
      try it with your own. On a phone, press and hold it.
    </>
  );

  return (
    <DocsLayout slug="peephole-button" sections={SECTIONS}>
      <PageTitle name={info.name} description={info.description} tags={info.tags} />

      <Showcase
        installUrl={REGISTRY_URL}
        filePath="components/ui/peephole-button.tsx"
        preview={<PeepholeButtonDemo />}
        hint={hint}
        files={[
          { id: "ts", label: "peephole-button.tsx", copy: ts, body: <Html html={tsHtml} /> },
          { id: "js", label: "peephole-button.jsx", copy: js, body: <Html html={jsHtml} /> },
        ]}
      />

      <DocSection id="types" title="Types">
        <Lede>
          Two types. <strong className="font-medium text-[var(--fg)]">Reveal</strong> is frosted glass tinted by your
          picture, and hovering opens the whole picture. <strong className="font-medium text-[var(--fg)]">Fill</strong> keeps
          your avatar or logo in the slot, and hovering pours your brand color across the button.
        </Lede>
        <PeepholeButtonTypesDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "types", label: "types.tsx", copy: TYPES, body: <Html html={typesHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="slot" title="Slot">
        <Lede>
          The slot is the little window. Make it a circle or a square, put it on the left or the right, and give it any size
          from 20 to 80px. A square slot gives the button rounded corners to match.
        </Lede>
        <PeepholeButtonSlotDemo />
        <div className="mt-4">
          <Tabs tabs={[{ id: "slot", label: "slot.tsx", copy: SLOT, body: <Html html={slotHtml} /> }]} />
        </div>
      </DocSection>

      <DocSection id="prompts" title="Prompts">
        <Lede>
          Paste one into Claude Code, Cursor or any AI coding tool. <strong className="font-medium text-[var(--fg)]">Install</strong>{" "}
          adds this exact button and asks only where it goes and which picture to use.{" "}
          <strong className="font-medium text-[var(--fg)]">Blend</strong> asks four short questions (where and which picture,
          which type, the slot, and the fill color), then fits it to your product without changing how it opens.
        </Lede>
        <Tabs
          tabs={[
            { id: "install", label: "Install prompt", copy: installPrompt, body: <PromptBody text={installPrompt} /> },
            { id: "blend", label: "Blend prompt", copy: blendPrompt, body: <PromptBody text={blendPrompt} /> },
          ]}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Lede>Use it like any button. Only the picture is needed.</Lede>
        <Tabs tabs={[{ id: "usage", label: "talk-to-us.tsx", copy: USAGE, body: <Html html={usageHtml} /> }]} />
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Everything happens inside the button, so it needs no extra room around it. Pictures look best when they are at least
          twice the button&apos;s size.
        </p>
      </DocSection>

      <DocSection id="how-it-moves" title="How it moves">
        <Lede>
          At rest the slot is a small window in the glass. On hover it stretches open from where it sits until it fills the
          whole button.
        </Lede>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          In <Code>reveal</Code>, the glass is a heavily blurred copy of your picture, so it always takes the picture&apos;s
          colors, and the slot shows the same picture sharp. On hover the window widens across the button in 560ms with a soft
          ease out, the picture settles from a slight zoom to its real size, and a light shade fades in so the label stays easy
          to read. In <Code>fill</Code>, the glass is clear and your avatar stays in the slot. On hover the brand color pours
          out of the slot the same way, and the label turns white exactly where the color has reached. Moving away closes it
          in 420ms. On a phone, pressing opens it and it closes a moment after you lift your finger. Keyboard focus opens it
          too. With reduced motion, it switches open and closed without the stretch.
        </p>
      </DocSection>

      <DocSection id="props" title="Props">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocsLayout>
  );
}
