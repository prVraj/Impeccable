"use client";

import { useEffect, useRef, useState } from "react";
import { ChainTestimonials, type ChainTestimonial } from "./chain-testimonials";

/**
 * Seven reviews about real Impeccable items. The pictures are free Unsplash portraits (Unsplash
 * license), cropped square to 560px WebP, about 95KB for all seven (public/chain-testimonials).
 * The names and companies are made up.
 */
const REVIEWS: ChainTestimonial[] = [
  {
    heading: "Our launch page went live in 2 days",
    quote: "Kitcut button made our sign up feel alive. My developer asked which agency we hired.",
    name: "Amara Okafor",
    role: "Product Designer, Lumen Health",
    image: "/chain-testimonials/amara.webp",
    alt: "Amara, smiling, with long curly hair and a green t-shirt",
  },
  {
    heading: "3 hours saved on every hero section",
    quote: "Blend fitted Isometric Wall to our brand in four questions. No more easing curves at 2 a.m.",
    name: "Rohan Mehta",
    role: "Front-end Lead, Kumo",
    image: "/chain-testimonials/rohan.webp",
    alt: "Rohan, laughing, in a navy sweater against a grey wall",
  },
  {
    heading: "Error messages people actually read",
    quote: "Burning toast turned our boring messages into the part people screenshot.",
    name: "Theo Marchetti",
    role: "Founder, Pasta Labs",
    image: "/chain-testimonials/theo.webp",
    alt: "Theo, smiling, in a white t-shirt on a beach",
  },
  {
    heading: "Passed brand review on the first try",
    quote: "Our brand team rejects most new components. Sleeve Card passed on the first try.",
    name: "Priya Raman",
    role: "Head of Brand, Northbeam",
    image: "/chain-testimonials/priya.webp",
    alt: "Priya, laughing, with glasses and her hair tied up",
  },
  {
    heading: "Zero extra packages to install",
    quote: "One file, works in dark mode. I read the source twice looking for the catch.",
    name: "Jonas Weber",
    role: "Developer, Fieldnote",
    image: "/chain-testimonials/jonas.webp",
    alt: "Jonas, smiling, in a black beanie in front of an orange wall",
  },
  {
    heading: "Our portfolio finally feels finished",
    quote: "Clients stop scrolling to point at Orrery Gallery. Two asked for it on their own site.",
    name: "Daniel Mensah",
    role: "Indie Maker",
    image: "/chain-testimonials/daniel.webp",
    alt: "Daniel, smiling, outdoors in the sun",
  },
  {
    heading: "Waiting finally feels short",
    quote: "Comet button keeps people watching while the save goes through. Nobody clicks twice now.",
    name: "Sofia Reyes",
    role: "Engineering Manager, Tidewater",
    image: "/chain-testimonials/sofia.webp",
    alt: "Sofia, smiling over her shoulder in a field at dusk",
  },
];

/** The demo reviews. One picture per person works in light and dark. */
export function useReviews(): ChainTestimonial[] {
  return REVIEWS;
}

/** The docs preview: the whole section, as it ships. */
export function ChainTestimonialsDemo() {
  const reviews = useReviews();
  return (
    <div className="card overflow-hidden rounded-2xl">
      <ChainTestimonials items={reviews} />
    </div>
  );
}

/**
 * A live, shrunken copy for its card on the Testimonial sections page: drawn at a desktop
 * size (1280 x 940) and scaled down to the card. Not clickable.
 */
export function Thumb() {
  const W = 1280; // wide enough for the 5 card row
  const H = 940;
  const reviews = useReviews();
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
        <ChainTestimonials items={reviews} interval={4000} style={{ paddingTop: 40 }} />
      </div>
    </div>
  );
}
