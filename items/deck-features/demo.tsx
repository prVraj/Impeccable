"use client";

import { useEffect, useRef, useState } from "react";
import { DeckFeatures, DECK_FEATURES } from "./deck-features";

/**
 * The five sample cards are about Impeccable itself. Their pictures are made from real
 * Impeccable pieces (Orrery Gallery, the prompts tabs, Capsule Testimonials in both themes,
 * Isometric Wall on two phones, the install bar), squeezed to WebP, 149KB for all five
 * (public/deck-features).
 */
export const SAMPLE_FEATURES = DECK_FEATURES;

/**
 * The docs preview: a page-sized box you scroll inside, so the cards stack in the box the
 * way they stack on the screen on a real page. There is no header in the box, so the deck
 * sticks 40px from its top.
 */
export function DeckFeaturesDemo() {
  return (
    // The box fills the card, so in fullscreen (where the card grows to the screen) it grows too.
    <div className="card relative overflow-hidden rounded-2xl" style={{ minHeight: "min(680px, 80svh)" }}>
      <div className="no-scrollbar absolute inset-0 overflow-y-auto" tabIndex={0} aria-label="Deck Features preview, scroll inside it">
        <DeckFeatures items={SAMPLE_FEATURES} offset={40} style={{ paddingTop: 64, paddingBottom: 160 }} />
      </div>
    </div>
  );
}

/**
 * A live, shrunken copy for its card on the Feature sections page: drawn at a laptop
 * size (960 x 760), scrolled to where three cards are in the deck, scaled down. Not clickable.
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
    if (!s) return;
    // Scroll to where the third card has just landed on the deck.
    const place = () => {
      const third = s.querySelectorAll<HTMLElement>(".idf-card")[2];
      if (third) s.scrollTop = third.offsetTop - 40 - 2 * 20 + 40;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(s.firstElementChild as Element);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
      <div inert className="pointer-events-none absolute top-0 left-0 origin-top-left select-none" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <div ref={scroller} className="no-scrollbar h-full overflow-hidden">
          <DeckFeatures items={SAMPLE_FEATURES} offset={40} style={{ paddingTop: 56 }} />
        </div>
      </div>
    </div>
  );
}
