import type { MetadataRoute } from "next";
import {
  blogPath,
  blogPosts,
  brandPath,
  brands,
  devicePath,
  devices,
  landingPages,
  repairPath,
  repairs,
} from "@/lib/catalog";
import { localizePath, locales } from "@/lib/i18n";
import { staticPaths } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

/** One entry per locale, each listing its language alternates (hreflang). */
function entries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizePath(path, l))]));
  return locales.map((l) => ({
    url: absoluteUrl(localizePath(path, l)),
    priority: l === "nl" ? priority : Math.round(priority * 0.8 * 10) / 10,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.flatMap((p) => entries(p, p === "/" ? 1 : 0.7)),
    ...brands.flatMap((b) => entries(brandPath(b.id), 0.8)),
    ...repairs.flatMap((r) => entries(repairPath(r.slug), 0.8)),
    ...devices.flatMap((d) => entries(devicePath(d), 0.6)),
    ...landingPages.flatMap((p) => entries(p.path, 0.6)),
    ...blogPosts.flatMap((p) => entries(blogPath(p.slug), 0.4)),
  ];
}
