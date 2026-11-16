"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ReelStats, type ReelStatsItem } from "./reel-stats";

/**
 * Four original pictures drawn for this demo (layered hills under four kinds of light), squeezed
 * to WebP at 1120 x 840: 37KB for all four (public/reel-stats). The numbers are true Impeccable facts.
 */
export const SAMPLE_ITEMS: ReelStatsItem[] = [
  {
    title: "Ask first",
    description: "Every piece comes with a prompt that asks you a few questions before your AI tool writes a single line.",
    src: "/reel-stats/dawn.webp",
    alt: "Pink hills fading into a soft dawn sky",
    value: "2",
    label: "Prompts with every piece",
  },
  {
    title: "Fit your brand",
    description: "It reads your colors, fonts and corners, so the new piece looks like it was always on your page.",
    src: "/reel-stats/valley.webp",
    alt: "Green hills under a clear morning sky",
    value: "0",
    label: "Extra packages to install",
  },
  {
    title: "Made by hand",
    description: "Written from scratch, then every curve and timing is tuned by eye until it feels calm.",
    src: "/reel-stats/dunes.webp",
    alt: "Golden sand dunes with a low sun",
    value: "100%",
    label: "Original code",
  },
  {
    title: "Ship it",
    description: "One command puts it in your project. Then go get a coffee, you earned it.",
    src: "/reel-stats/night.webp",
    alt: "Violet mountains and a full moon over a still lake",
    value: "1",
    label: "Command to install",
  },
];

export const SAMPLE_TITLE = "Every piece goes through four rooms before it reaches you.";

/** The docs preview: the whole section, as it ships. Point at a heading (or tap it). */
export function ReelStatsDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <ReelStats items={SAMPLE_ITEMS} title={SAMPLE_TITLE} />
    </div>
  );
}

/** Draws a page at a laptop size and scales it down to the box. Not clickable. */
function ScaledPage({ children, width = 960, height = 760 }: { children: ReactNode; width?: number; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true">
      <div
        inert
        className="pointer-events-none absolute top-0 left-0 grid origin-top-left select-none place-items-center"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        <div style={{ width }}>{children}</div>
      </div>
    </div>
  );
}

/** Reel Stats as a card thumbnail on the Stats sections page (second row open). */
export function Thumb() {
  return (
    <ScaledPage>
      <ReelStats items={SAMPLE_ITEMS} defaultIndex={1} />
    </ScaledPage>
  );
}
