"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { WindowStats } from "./window-stats";
import { SAMPLE_CARDS } from "./demo";

const W = 760; // drawn at a laptop width, scaled to the tube
const DOWN_MS = 9000; // scrolls down through the cards...
const HOLD_MS = 1400; // ...rests at the end...
const UP_MS = 1600; // ...and glides back to the top
const REST_MS = 900;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** The section scrolling itself inside the tube: cards slide over the statement, then it glides back up. */
export default function WindowStatsChannel() {
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.5, height: 400 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth) return; // hidden or not laid out yet: 0 wide would make the height NaN
      const scale = el.clientWidth / W;
      setFit({ scale, height: el.clientHeight / scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = scroller.current;
    if (!s) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      s.scrollTop = (s.scrollHeight - s.clientHeight) * 0.3;
      return;
    }
    let raf = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      const max = s.scrollHeight - s.clientHeight;
      const t = (now - start) % (DOWN_MS + HOLD_MS + UP_MS + REST_MS);
      let y = 0;
      if (t < DOWN_MS) y = ease(t / DOWN_MS);
      else if (t < DOWN_MS + HOLD_MS) y = 1;
      else if (t < DOWN_MS + HOLD_MS + UP_MS) y = 1 - ease((t - DOWN_MS - HOLD_MS) / UP_MS);
      s.scrollTop = y * max;
      raf = requestAnimationFrame(loop);
    };
    // Only while the tube is on screen.
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(s);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}>
          <div ref={scroller} className="h-full overflow-hidden">
            <WindowStats cards={SAMPLE_CARDS} caption={null} backLabel={null} />
          </div>
        </div>
      </div>
    </Screen>
  );
}
