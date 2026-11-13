import type { Metadata } from "next";

// The demo pages exist only for the Burning-Screen preview. Keep them out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
