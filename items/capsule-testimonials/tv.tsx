"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { CapsuleTestimonials } from "./capsule-testimonials";
import { SAMPLE_REVIEWS } from "./demo";

const W = 760; // drawn at a laptop width, scaled to the tube
const STEP_MS = 2600; // opens the next capsule every 2.6s

/** The row on the tube: it opens the next review by itself, so the capsules keep trading places. */
export default function CapsuleTestimonialsChannel() {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.5, height: 400 });
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const scale = el.clientWidth / W;
      setFit({ scale, height: el.clientHeight / scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(id);
      if (e.isIntersecting) id = window.setInterval(() => setOpen((o) => (o + 1) % SAMPLE_REVIEWS.length), STEP_MS);
    });
    if (box.current) io.observe(box.current);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          className="absolute top-0 left-0 flex origin-top-left items-center"
          style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}
        >
          <CapsuleTestimonials items={SAMPLE_REVIEWS} title={null} description={null} open={open} onOpenChange={setOpen} style={{ width: W }} />
        </div>
      </div>
    </Screen>
  );
}
