"use client";

import { IsometricWall } from "./isometric-wall";

/** 16 travel photos from Unsplash (free to use), cropped to 3:2, 480px wide WebP, about 310KB for all of them (public/isometric-wall). */
export const DEMO_IMAGES = Array.from({ length: 16 }, (_, i) => `/isometric-wall/${String(i + 1).padStart(2, "0")}.webp`);

/** Five small faces for the "loved by" row, 96px WebP. */
const FACES = [1, 2, 3, 4, 5].map((i) => `/isometric-wall/face-${i}.webp`);

function Star() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 1.8l2.47 5.3 5.8.66-4.3 3.95 1.17 5.73L10 14.53 4.86 17.44l1.17-5.73L1.73 7.76l5.8-.66L10 1.8z" />
    </svg>
  );
}

/*
 * The hero's look lives in this one style block (not new utility classes), so it
 * shows the same in a running dev server, a build and an install.
 * Three clear levels: a big heading (its second line in gray), a smaller calm
 * description, then the actions, with the social proof quietest of all.
 */
const CSS = `
.iwd { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3.5rem 1.25rem; text-align: center; }
.iwd-hero { position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center; max-width: 44rem; }
.iwd-clear { position: absolute; inset: -5rem -4rem; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, var(--bg) 48%, transparent); }
.iwd-h { margin: 0; font-size: clamp(2.25rem, 6.2cqi, 4.25rem); font-weight: 600; line-height: 1.02;
  letter-spacing: -0.04em; color: var(--fg); text-wrap: balance; }
.iwd-h span { display: block; color: var(--muted); }
.iwd-p { margin: 1.5rem 0 0; max-width: 30rem; font-size: clamp(1rem, 1.9cqi, 1.1875rem); line-height: 1.6;
  letter-spacing: -0.005em; color: color-mix(in oklab, var(--fg) 68%, var(--bg)); text-wrap: pretty; }
.iwd-cta { margin-top: 2.25rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.625rem; }
.iwd-btn { display: inline-flex; align-items: center; justify-content: center; height: 2.75rem; padding: 0 1.25rem;
  border: 0; border-radius: 999px; font-size: 0.9375rem; font-weight: 500; letter-spacing: -0.01em; cursor: pointer;
  transition: transform 160ms cubic-bezier(.23,1,.32,1), opacity 200ms ease; }
.iwd-btn:active { transform: scale(0.97); }
.iwd-btn:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
.iwd-btn-main { background: var(--fg); color: var(--bg); }
@media (hover: hover) and (pointer: fine) {
  .iwd-btn-main:hover { opacity: 0.88; }
}
.iwd-proof { margin-top: 2.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.875rem; }
.iwd-faces { display: flex; }
.iwd-faces img { width: 2rem; height: 2rem; border-radius: 999px; object-fit: cover; margin-left: -0.5rem;
  box-shadow: 0 0 0 2px var(--bg); outline: 1px solid rgb(0 0 0 / .1); outline-offset: -1px; }
.iwd-faces img:first-child { margin-left: 0; }
:is(.dark, [data-theme="dark"]) .iwd-faces img { outline-color: rgb(255 255 255 / .1); }
.iwd-rate { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1875rem; text-align: left; }
.iwd-stars { display: flex; gap: 1px; color: var(--fg); }
.iwd-stars svg { width: 0.875rem; height: 0.875rem; fill: currentColor; }
.iwd-rate p { margin: 0; font-size: 0.8125rem; line-height: 1.3; color: var(--muted); }
@container (min-width: 40rem) { .iwd-clear { inset: -5.5rem -7rem; } }

@keyframes iwd-in { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } }
.iwd-in { animation: iwd-in 800ms cubic-bezier(.16,1,.3,1) both; }
@media (prefers-reduced-motion: reduce) { .iwd-in { animation: none; } .iwd-btn:active { transform: none; } }
`;

/**
 * The preview: a hero for Impeccable UI itself, sitting on the wall.
 * The heading, the words and the button come in one after another; the wall drifts behind them.
 */
export function IsometricWallDemo() {
  return (
    <div className="card overflow-hidden rounded-2xl">
      <IsometricWall images={DEMO_IMAGES} className="iwd" style={{ minHeight: "clamp(560px, 64cqi, 720px)", height: "100%" }}>
        <div className="iwd-hero">
          {/* A soft clearing in the page color, so the words never sit on a busy picture */}
          <div aria-hidden="true" className="iwd-clear" />
          <h2 className="iwd-h iwd-in">
            Components that move
            <span>made for humans again</span>
          </h2>
          <p className="iwd-p iwd-in" style={{ animationDelay: "90ms" }}>
            Copy animated React components into your app. Every one is tuned by hand, down to the easing curve.
          </p>
          <div className="iwd-cta iwd-in" style={{ animationDelay: "180ms" }}>
            <button type="button" className="iwd-btn iwd-btn-main">
              Browse components
            </button>
          </div>
          <div className="iwd-proof iwd-in" style={{ animationDelay: "270ms" }}>
            <div className="iwd-faces">
              {FACES.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" width={32} height={32} draggable={false} />
              ))}
            </div>
            <div className="iwd-rate">
              <div className="iwd-stars" role="img" aria-label="Rated 5 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} />
                ))}
              </div>
              <p>Loved by 100k+ humans</p>
            </div>
          </div>
        </div>
      </IsometricWall>
      <style>{CSS}</style>
    </div>
  );
}
