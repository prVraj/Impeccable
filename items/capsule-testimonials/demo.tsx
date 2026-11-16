"use client";

import { useEffect, useRef, useState } from "react";
import { CapsuleTestimonials, CAPSULE_TESTIMONIALS, type CapsuleTestimonial } from "./capsule-testimonials";

/**
 * The sample reviews with faces. The faces are drawn stand-ins (original art, squeezed to WebP,
 * about 1.6KB each, public/capsule-testimonials). Swap in real photos with the photo field.
 */
const FACES = ["amara", "theo", "hana", "diego", "priya", "jonas"];
export const SAMPLE_REVIEWS: CapsuleTestimonial[] = CAPSULE_TESTIMONIALS.map((t, i) => ({
  ...t,
  photo: `/capsule-testimonials/${FACES[i]}.webp`,
  alt: `${t.name}, drawn portrait`,
}));

/** The docs preview: the whole section, as it ships. */
export function CapsuleTestimonialsDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <CapsuleTestimonials items={SAMPLE_REVIEWS} />
    </div>
  );
}

/**
 * A live, shrunken copy for its card on the Testimonial sections page: drawn at a laptop
 * size (960 x 760) and scaled down to the card. Not clickable.
 */
export function Thumb() {
  const W = 960;
  const H = 760;
  const box = useRef<HTMLDivElement>(null);
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
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
      <div inert className="pointer-events-none absolute top-0 left-0 origin-top-left select-none" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <CapsuleTestimonials items={SAMPLE_REVIEWS} defaultOpen={1} style={{ paddingTop: 40 }} />
      </div>
    </div>
  );
}
