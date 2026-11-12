"use client";

import { BrainTxt, type Thought } from "./brain-txt";

/** Thoughts for the docs preview. The first four are from Vraj's brain page; the rest are placeholders. */
export const DEMO_THOUGHTS: Thought[] = [
  { text: "If you are not a hypocrite it means you are not learning something new.", tag: "learning", featured: true },
  { text: "If it's worth thinking twice, it's worth writing once." },
  { text: "In era of AI most good ideas are two old ideas meeting for the first time." },
  { text: "Boredom is the waiting room for ideas." },
  { text: "Taste is the last thing a machine will learn from you.", tag: "design" },
  { text: "Ship the small thing. The big thing hides inside it." },
  { text: "A good animation is one you only notice when it's gone." },
  { text: "Copy first, then make it yours." },
  { text: "Every blank page is just a page that hasn't been asked a question." },
  { text: "Simple is hard work you don't show." },
  { text: "Write it down before it becomes a feeling." },
  { text: "Most of design is deciding what to leave out.", tag: "design" },
  { text: "Curiosity compounds." },
  { text: "Rest is part of the work." },
];

export function BrainTxtDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl px-2 pt-6 pb-5 text-[var(--fg)]">
      <BrainTxt thoughts={DEMO_THOUGHTS} accent="var(--accent)" height={460} />
    </div>
  );
}
