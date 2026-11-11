import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy: the browser only runs scripts, styles, images and fonts
 * that come from this site. Follows the "Without Nonces" setup in the Next.js CSP guide,
 * which keeps every page static.
 * - 'unsafe-inline' for scripts: the theme script in app/layout.tsx and the small
 *   inline scripts Next.js writes into static pages.
 * - 'unsafe-inline' for styles: components set inline styles.
 * - 'unsafe-eval' only in `pnpm dev`, where React needs it for error overlays.
 * If you add anything from another site (analytics, fonts, embeds, images), add its
 * address to the matching line below, or the browser will block it.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Security headers on every response. Based on the OWASP HTTP Headers Cheat Sheet. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Always use HTTPS for this site (two years).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Don't let other sites show this site inside a frame (older browsers; CSP frame-ancestors covers new ones).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let the browser guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites only see the domain a visitor came from, never the full page address.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off browser features the site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Pages opened from this site can't reach back into it.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Don't announce "Next.js" in every response.
  poweredByHeader: false,
  // Lets the docs pages read component source files at build time.
  outputFileTracingIncludes: {
    "/docs/*": ["./registry/**/*", "./generated/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Component pages used to live under /components. Old links keep working.
  async redirects() {
    return [
      { source: "/components", destination: "/docs", permanent: true },
      { source: "/components/:slug", destination: "/docs/:slug", permanent: true },
      // Brain-Map was renamed brain.txt.
      { source: "/docs/brain-map", destination: "/docs/brain-txt", permanent: true },
    ];
  },
};

export default nextConfig;
