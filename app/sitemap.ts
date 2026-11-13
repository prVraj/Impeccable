import type { MetadataRoute } from "next";
import { COMPONENTS, FAMILIES } from "@/lib/site";
import { absolute } from "@/lib/seo";

/** Every public page, built from the item list, so a new item is listed the moment it's in items/list.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/docs", ...[...FAMILIES, ...COMPONENTS].map((i) => `/docs/${i.slug}`)].map((path) => ({
    url: absolute(path),
  }));
}
