"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { ReelStats } from "./reel-stats";
import { SAMPLE_ITEMS } from "./demo";

const W = 760; // drawn at a laptop width (wide layout), scaled to the tube

/** The section playing itself: every 2.4s the next row opens and its picture rolls up into the frame. Point at it to take over. */
export default function ReelStatsChannel() {
  const box = useRef<HTMLDivElement>(null);
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
  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          className="absolute top-0 left-0 grid origin-top-left place-items-center"
          style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}
        >
          <div style={{ width: W }}>
            <ReelStats items={SAMPLE_ITEMS} autoplay={2400} />
          </div>
        </div>
      </div>
    </Screen>
  );
}
