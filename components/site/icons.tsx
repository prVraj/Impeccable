import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Sun = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const Moon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a7 7 0 0 0 10.6 10.6Z" />
  </svg>
);
export const Arrow = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const Copy = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const GitHub = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p} aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
export const X = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p} aria-hidden="true">
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
  </svg>
);
export const Menu = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

/** Impeccable's mark: a hexagon with three stripes cut across its top-right edge.
 * Drawn in currentColor, so it follows light and dark. */
export const Mark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 69 80" className={className} aria-hidden="true">
    <defs>
      <mask id="imp-mark-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="69" height="80">
        <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#fff" />
        <g stroke="#000" strokeWidth="1.5">
          <path d="M0-11.5 69 28.5M0-6 69 34M0-.5 69 39.5" />
        </g>
      </mask>
    </defs>
    <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="currentColor" mask="url(#imp-mark-cut)" />
  </svg>
);
