"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChainTestimonials, type ChainTestimonial } from "./chain-testimonials";

/** True while the site is in dark mode, so each card shows its item's dark picture. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
export function useDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/**
 * Seven reviews, each about a real Impeccable item, with that item as the picture. Pictures are square
 * crops of the items' own previews, light and dark, 560px WebP, about 120KB for all fourteen
 * (public/chain-testimonials). The people are made up.
 */
const REVIEWS: (ChainTestimonial & { slug: string })[] = [
  {
    slug: "kitcut-button",
    heading: "Our launch page went live in 2 days",
    quote: "Kitcut button made our sign up feel alive. My developer asked which agency we hired.",
    name: "Amara Okafor",
    role: "Product Designer, Lumen Health",
    alt: "Kitcut button, a purple button cracked in two with dots in the gap",
  },
  {
    slug: "isometric-wall",
    heading: "3 hours saved on every hero section",
    quote: "Blend fitted Isometric Wall to our brand in four questions. No more easing curves at 2 a.m.",
    name: "Hana Sato",
    role: "Front-end Lead, Kumo",
    alt: "Isometric Wall, faded picture cards on a tilted floor behind the words Components that move",
  },
  {
    slug: "burning-toast",
    heading: "Error messages people actually read",
    quote: "Burning toast turned our boring messages into the part people screenshot.",
    name: "Theo Marchetti",
    role: "Founder, Pasta Labs",
    alt: "Burning toast, a small Changes saved message under a Save your profile form",
  },
  {
    slug: "sleeve-card",
    heading: "Passed brand review on the first try",
    quote: "Our brand team rejects most new components. Sleeve Card passed on the first try.",
    name: "Priya Raman",
    role: "Head of Brand, Northbeam",
    alt: "Sleeve Card, a project card turned in 3D with a View Project tab",
  },
  {
    slug: "reel-stats",
    heading: "Zero extra packages to install",
    quote: "One file, works in dark mode. I read the source twice looking for the catch.",
    name: "Jonas Weber",
    role: "Developer, Fieldnote",
    alt: "Reel Stats, a green mountain picture with the number 0 and Extra packages to install",
  },
  {
    slug: "orrery-gallery",
    heading: "Our portfolio finally feels finished",
    quote: "Clients stop scrolling to point at Orrery Gallery. Two asked for it on their own site.",
    name: "Diego Alvarez",
    role: "Indie Maker",
    alt: "Orrery Gallery, colorful 3D shapes orbiting in a ring",
  },
  {
    slug: "comet-button",
    heading: "Waiting finally feels short",
    quote: "Comet button keeps people watching while the save goes through. Nobody clicks twice now.",
    name: "Lena Fischer",
    role: "Engineering Manager, Tidewater",
    alt: "Comet button, a dark pill with a glow racing round its border",
  },
];

/** The reviews with the pictures for the current theme. */
export function useReviews(): ChainTestimonial[] {
  const dark = useDark();
  return REVIEWS.map(({ slug, ...r }) => ({ ...r, image: `/chain-testimonials/${slug}-${dark ? "dark" : "light"}.webp` }));
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
