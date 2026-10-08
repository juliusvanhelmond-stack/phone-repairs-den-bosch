import type { MetadataRoute } from "next";
import { brandPath, brands, devicePath, devices, repairPath, repairs } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

const staticPaths = ["/", "/reparaties", "/werkwijze", "/over-ons", "/veelgestelde-vragen", "/contact", "/afspraak"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), priority: p === "/" ? 1 : 0.7 })),
    ...brands.map((b) => ({ url: absoluteUrl(brandPath(b.id)), priority: 0.8 })),
    ...repairs.map((r) => ({ url: absoluteUrl(repairPath(r.slug)), priority: 0.8 })),
    ...devices.map((d) => ({ url: absoluteUrl(devicePath(d)), priority: 0.6 })),
  ];
}
