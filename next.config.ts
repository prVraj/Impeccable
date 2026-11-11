import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the docs pages read component source files at build time.
  outputFileTracingIncludes: {
    "/docs/*": ["./registry/**/*", "./generated/**/*"],
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
