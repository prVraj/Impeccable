"use client";

import { useEffect, useRef, useState } from "react";
import { CoffeeFaq, COFFEE_FAQ_ITEMS } from "./coffee-faq";

/** The docs preview: the whole section, as it ships. Ask anything in the box at the bottom. */
export function CoffeeFaqDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <CoffeeFaq />
    </div>
  );
}

/**
 * A live, shrunken copy of the section for its card on the FAQ sections page:
 * drawn at a laptop size (960 x 760) and scaled down to the card. Not clickable.
 */
function ScaledPage({ children, width = 960, height = 760 }: { children: React.ReactNode; width?: number; height?: number }) {
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
      <div inert className="pointer-events-none absolute top-0 left-0 origin-top-left select-none" style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/** Coffee FAQ as a card thumbnail on the FAQ sections page. Every family member's demo.tsx exports a Thumb. */
export function Thumb() {
  return (
    <ScaledPage>
      <CoffeeFaq items={COFFEE_FAQ_ITEMS.slice(0, 4)} defaultOpen={0} style={{ minHeight: 760 }} />
    </ScaledPage>
  );
}
