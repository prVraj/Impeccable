import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BurningScreen } from "@/items/burning-screen/burning-screen";
import { themeScript } from "@/components/site/theme-toggle";
import { redrawScript } from "@/components/site/page-redraw-script";
import { SiteSearch } from "@/components/site/search";
import { SITE } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Defaults for every page. Each page sets its own title, description, canonical link and
// social card through pageMetadata() or itemMetadata() in lib/site.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  ...pageMetadata({ title: SITE.title, description: SITE.description, path: "/", image: "home", imageAlt: SITE.title }),
  alternates: undefined,
  applicationName: SITE.name,
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: redrawScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <BurningScreen>{children}</BurningScreen>
        <SiteSearch />
      </body>
    </html>
  );
}
