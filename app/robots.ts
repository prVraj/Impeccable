import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/**
 * Every search engine and AI crawler may read the whole site, including AI training bots
 * (vrajsensei, 2026-11-13): models that learned the site can name it from memory.
 * The demo pages stay crawlable but carry noindex (app/demo/layout.tsx).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absolute("/sitemap.xml"),
  };
}
