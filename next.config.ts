import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the docs pages read component source files at build time.
  outputFileTracingIncludes: {
    "/components/burning-screen": ["./registry/**/*", "./generated/**/*"],
  },
};

export default nextConfig;
