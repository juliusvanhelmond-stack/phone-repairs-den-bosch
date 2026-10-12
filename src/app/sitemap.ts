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
import { staticPaths } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), priority: p === "/" ? 1 : 0.7 })),
    ...brands.map((b) => ({ url: absoluteUrl(brandPath(b.id)), priority: 0.8 })),
    ...repairs.map((r) => ({ url: absoluteUrl(repairPath(r.slug)), priority: 0.8 })),
    ...devices.map((d) => ({ url: absoluteUrl(devicePath(d)), priority: 0.6 })),
    ...landingPages.map((p) => ({ url: absoluteUrl(p.path), priority: 0.6 })),
    ...blogPosts.map((p) => ({ url: absoluteUrl(blogPath(p.slug)), priority: 0.4 })),
  ];
}
