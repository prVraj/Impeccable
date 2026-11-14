"use client";

import { useEffect, useRef, useState } from "react";
import { PeepholeButton } from "./peephole-button";

const FIELDS = "/peephole/fields.webp";
const DUNES = "/peephole/dunes.webp";
const TIDE = "/peephole/tide.webp";
const AVA = "/peephole/avatar-ava.webp";
const KAI = "/peephole/avatar-kai.webp";

/** A small eye, drawn in the slot over the picture. */
function Eye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

const OUTLINE =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]";

/**
 * Spacing between the demo buttons is set inline, not with rare Tailwind gap classes, so it
 * shows even when a running dev server has not picked up this new folder's classes yet.
 */

/** The preview: one reveal button on the dotted card, and a way to try it with your own picture. */
export function PeepholeButtonDemo() {
  const [own, setOwn] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // Free the picture's memory when it is replaced or the demo goes away.
  useEffect(() => () => void (own && URL.revokeObjectURL(own)), [own]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNote("That file isn't a picture. Try a JPG, PNG or WebP.");
      return;
    }
    setNote("");
    setOwn(URL.createObjectURL(file));
  };

  return (
    <div className="card dots flex min-h-80 flex-col items-center justify-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96" style={{ gap: 32 }}>
      <PeepholeButton image={own ?? FIELDS} icon={<Eye />}>
        Take a peek
      </PeepholeButton>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <button type="button" className={OUTLINE} onClick={() => input.current?.click()}>
            Use my picture
          </button>
          {own ? (
            <button type="button" className={OUTLINE} onClick={() => setOwn(null)}>
              Reset
            </button>
          ) : null}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = ""; // so picking the same file again still works
          }}
        />
        <p className="text-[13px] text-[var(--muted)]" style={{ minHeight: 20 }} aria-live="polite">
          {note}
        </p>
      </div>
    </div>
  );
}

/** Types: both side by side, so the difference shows at a glance. */
export function PeepholeButtonTypesDemo() {
  return (
    <div className="card dots flex min-h-40 flex-wrap items-center justify-center rounded-2xl px-5 py-10" style={{ columnGap: 40, rowGap: 32 }}>
      <div className="flex flex-col items-center gap-3">
        <PeepholeButton image={FIELDS} icon={<Eye />}>
          Take a peek
        </PeepholeButton>
        <span className="text-[13px] text-[var(--muted)]">
          Reveal · <code className="font-mono text-[12px]">variant=&quot;reveal&quot;</code>
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <PeepholeButton variant="fill" image={AVA} side="right">
          Talk to Ava
        </PeepholeButton>
        <span className="text-[13px] text-[var(--muted)]">
          Fill · <code className="font-mono text-[12px]">variant=&quot;fill&quot;</code>
        </span>
      </div>
    </div>
  );
}

/** The slot: shape, side and size, one button each. */
export function PeepholeButtonSlotDemo() {
  const rows = [
    { label: 'shape="circle"', el: <PeepholeButton image={DUNES}>Circle slot</PeepholeButton> },
    { label: 'shape="square"', el: <PeepholeButton image={TIDE} shape="square">Square slot</PeepholeButton> },
    { label: 'side="right"', el: <PeepholeButton image={FIELDS} side="right">On the right</PeepholeButton> },
    { label: "slotSize={28}", el: <PeepholeButton variant="fill" image={KAI} slotSize={28}>Small slot</PeepholeButton> },
    {
      label: 'shape="square" slotSize={48}',
      el: (
        <PeepholeButton variant="fill" image={AVA} shape="square" slotSize={48} side="right">
          Big square
        </PeepholeButton>
      ),
    },
  ];
  return (
    <div className="card dots flex flex-wrap items-start justify-center rounded-2xl px-5 py-10" style={{ columnGap: 32, rowGap: 32 }}>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col items-center gap-3">
          {row.el}
          <code className="font-mono text-[12px] text-[var(--muted)]">{row.label}</code>
        </div>
      ))}
    </div>
  );
}
