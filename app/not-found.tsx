import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/site/button";
import { BrowseButton } from "@/components/site/browse-button";
import { Mark } from "@/components/site/icons";
import { Liquid404 } from "@/components/site/liquid-404";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `Page not found | ${SITE.name}` },
  description: "This page doesn't exist. Go home or browse the components.",
  robots: { index: false, follow: true },
};

/**
 * The site's 404: one screen. Wordmark on top, the liquid "404" in the middle
 * (the level follows the pointer, from empty to full), one line and two ways out.
 * Liquid colours are tokens set here, so light and dark each get their own.
 */
export default function NotFound() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center overflow-hidden px-4 [--liquid-back:color-mix(in_srgb,var(--brand-300)_55%,transparent)] [--liquid-bottom:var(--brand-700)] [--liquid-glass:color-mix(in_srgb,var(--fg)_5%,transparent)] [--liquid-top:var(--brand-500)] dark:[--liquid-back:color-mix(in_srgb,var(--brand-300)_30%,transparent)] dark:[--liquid-bottom:var(--brand-600)] dark:[--liquid-glass:color-mix(in_srgb,var(--fg)_7%,transparent)] dark:[--liquid-top:var(--brand-400)]"
    >
      <Link href="/" className="mt-6 flex items-center gap-2 text-[15px] font-semibold tracking-tight sm:mt-8">
        <Mark className="h-6 w-[21px] text-[var(--fg)]" />
        Impeccable
      </Link>

      <main className="flex w-full flex-1 flex-col items-center justify-center py-10 text-center">
        <h1 className="sr-only">Page not found</h1>
        <Liquid404 className="h-auto w-[min(92vw,60rem,max(18rem,calc((100dvh-20rem)*2.5)))] select-none" />
        <p className="mt-8 max-w-md text-base text-pretty text-[var(--muted)] sm:mt-10 sm:text-lg">
          This page will lead you towards the Stoneage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" hierarchy="secondary" size="lg">
            Go Home
          </Button>
          <BrowseButton />
        </div>
      </main>
    </div>
  );
}
