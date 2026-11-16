"use client";

import { useEffect, useRef, useState } from "react";
import { WindowStats, type WindowStatsCard } from "./window-stats";

/**
 * Free photos from Unsplash (Unsplash License: free for commercial use, no credit needed; thanks to
 * Ellen Qin, Onur Can Elma, Zac Taheriyan, Brandon Smith and Max Nguyen). Squeezed to WebP,
 * about 1040px on the long side (1280px for the wide one), 109KB for all five (public/window-stats).
 */
export const SAMPLE_CARDS: WindowStatsCard[] = [
  { src: "/window-stats/empty.webp", alt: "A white chair in a quiet room with soft window light", value: "0", label: "Extra packages" },
  { src: "/window-stats/two.webp", alt: "Two people standing far apart on a white salt flat", value: "2", label: "Prompts with every piece" },
  { src: "/window-stats/salt.webp", alt: "A person standing on a mirror lake under a wide sky", value: "100%", label: "Original code" },
  { src: "/window-stats/dune.webp", alt: "The soft curve of a sand dune at sunset", value: "2", label: "Themes, light and dark" },
  { src: "/window-stats/paddle.webp", alt: "A lone paddle boarder on a calm misty lake", value: "MIT", label: "Free to use" },
];

/**
 * The docs preview: a page-sized box you scroll inside, so the statement sticks
 * to the box the way it sticks to the screen on a real page.
 */
export function WindowStatsDemo() {
  return (
    // The box fills the card, so in fullscreen (where the card grows to the screen) it grows too.
    <div className="card relative overflow-hidden rounded-2xl" style={{ minHeight: "min(640px, 78svh)" }}>
      <div
        className="no-scrollbar absolute inset-0 overflow-y-auto"
        tabIndex={0}
        aria-label="Window Stats preview, scroll inside it"
      >
        <WindowStats cards={SAMPLE_CARDS} />
      </div>
    </div>
  );
}

/**
 * A live, shrunken copy for its card on the Stats sections page: drawn at a laptop
 * size (960 x 760), scrolled to where the cards cover the statement, scaled down. Not clickable.
 */
export function Thumb() {
  const W = 960;
  const H = 760;
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const s = scroller.current;
    if (s) s.scrollTop = H * 0.82;
  }, []);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
      <div inert className="pointer-events-none absolute top-0 left-0 origin-top-left select-none" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <div ref={scroller} className="no-scrollbar h-full overflow-hidden">
          <WindowStats cards={SAMPLE_CARDS} backLabel={null} />
        </div>
      </div>
    </div>
  );
}
