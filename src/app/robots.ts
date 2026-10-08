import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { allowIndexing } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    // Demo/staging: keep the whole site out of search engines until launch is approved.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
