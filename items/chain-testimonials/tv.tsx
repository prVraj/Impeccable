"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { ChainTestimonials } from "./chain-testimonials";
import { useReviews } from "./demo";

const W = 760; // drawn at a laptop width, scaled to the tube

/** The chain on the tube: it moves to the next review by itself every 3s. */
export default function ChainTestimonialsChannel() {
  const reviews = useReviews();
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
        <div className="absolute top-0 left-0 flex origin-top-left items-center" style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}>
          <ChainTestimonials items={reviews} title={null} description={null} interval={3000} style={{ width: W }} />
        </div>
      </div>
    </Screen>
  );
}
