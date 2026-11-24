"use client";

import { useEffect, useState } from "react";
import { SettleCounter } from "./settle-counter";

const START = 7329; // the first number, the same on the server and in the browser
const HOLD_MS = 7000; // each number stays this long before the next one

/**
 * A random number from 100 to 1,00,000. Picked evenly by number of digits (3, 4, 5 or 6), so the
 * demo often grows and shrinks and shows the frame opening and closing, not only 5 digit swaps.
 */
export function randomNumber(not?: number) {
  let n = not ?? 0;
  while (n === not) n = Math.min(100000, Math.round(10 ** (2 + 3 * Math.random())));
  return n;
}

/**
 * Plays random numbers on its own, a new one every 7 seconds. `next` changes it now; after that
 * it stops playing on its own and stays on the visitor's number until they press again.
 */
export function useDemoNumber() {
  const [value, setValue] = useState(START);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) return;
    const t = window.setTimeout(() => setValue((v) => randomNumber(v)), HOLD_MS);
    return () => clearTimeout(t);
  }, [value, touched]);
  return {
    value,
    next: () => {
      setTouched(true);
      setValue((v) => randomNumber(v));
    },
  };
}

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

/** The preview: a live count about Impeccable UI, big on the dotted card, and one pill to change it. */
export function SettleCounterDemo() {
  const { value, next } = useDemoNumber();
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-12 @min-[40rem]:min-h-96 @min-[40rem]:py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="text-[13px] text-[var(--muted)]">Humans on Impeccable UI right now</span>
        <SettleCounter
          value={value}
          aria-label="Humans on Impeccable UI right now:"
          className="text-[56px] font-medium tracking-tight text-[var(--fg)] @min-[40rem]:text-[88px]"
        />
        <button type="button" onClick={next} className={`${PILL} mt-2`}>
          Change number
        </button>
      </div>
    </div>
  );
}

/** The two types side by side, playing the same numbers: with commas (the default), and without. */
export function SettleCounterTypesDemo() {
  const { value } = useDemoNumber();
  const rows = [
    { label: "Commas", code: "<SettleCounter value={n} />", el: <SettleCounter value={value} /> },
    { label: "No commas", code: 'separator=""', el: <SettleCounter value={value} separator="" /> },
  ];
  return (
    <div
      className="card dots flex min-h-40 flex-wrap items-center justify-center rounded-2xl px-5 py-12"
      style={{ columnGap: 56, rowGap: 40 }}
    >
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-4">
          <span className="text-[40px] font-medium tracking-tight text-[var(--fg)]">{r.el}</span>
          <span className="text-[13px] text-[var(--muted)]">
            {r.label} · <code className="font-mono text-[12px]">{r.code}</code>
          </span>
        </div>
      ))}
    </div>
  );
}
