"use client";

import { useEffect, useRef, useState } from "react";
import { AUTHOR } from "@/lib/site";
import { HexLogin } from "./hex-login";

/**
 * The docs preview. Continue opens Vraj's X profile in a new tab (a demo
 * stand-in for real sign-in), and Google isn't connected, so it shows the toast.
 */
export function HexLoginDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <HexLogin
        style={{ minHeight: 832 }}
        termsHref="#preview"
        privacyHref="#preview"
        onContinue={() => {
          window.open(AUTHOR.href, "_blank", "noopener,noreferrer");
        }}
      />
    </div>
  );
}

/**
 * A live, shrunken copy of a page for the cards on a family page: drawn at
 * a laptop size (960 x 760) and scaled down to the card. Not clickable.
 */
export function ScaledPage({ children, width = 960, height = 760 }: { children: React.ReactNode; width?: number; height?: number }) {
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
        className="pointer-events-none absolute top-0 left-0 origin-top-left select-none"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/** Hex-Login as a card thumbnail on the Login pages family page. Every family member's demo.tsx exports a Thumb. */
export function Thumb() {
  return (
    <ScaledPage>
      <HexLogin style={{ minHeight: 760 }} />
    </ScaledPage>
  );
}
