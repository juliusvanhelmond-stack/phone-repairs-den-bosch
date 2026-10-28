import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveLegacyTarget } from "./src/lib/legacy-targets";

type InventoryRecord = { url: string; targetPath: string | null; redirect: boolean };

/** 301s for original URLs whose path changes. Source of truth: src/data/url-inventory.json */
function legacyRedirects() {
  const inventory: InventoryRecord[] = JSON.parse(
    readFileSync(join(process.cwd(), "src/data/url-inventory.json"), "utf8"),
  );
  // Devices and blog posts as built from the CMS (`npm run content` runs before every build).
  const generated = (file: string) => {
    try {
      return JSON.parse(readFileSync(join(process.cwd(), "src/data/generated", file), "utf8")) as { brandId?: string; slug: string }[];
    } catch {
      return null;
    }
  };
  const devices = generated("devices.json");
  const posts = generated("blog.json");
  const devicePaths = new Set(devices?.map((d) => `${d.brandId}/${d.slug}`));
  const postSlugs = new Set(posts?.map((p) => p.slug));
  const has = {
    device: (brandId: string, slug: string) => !devices || devicePaths.has(`${brandId}/${slug}`),
    brand: (brandId: string) => !devices || devices.some((d) => d.brandId === brandId),
    blogPost: (slug: string) => !posts || postSlugs.has(slug),
  };
  // The generated rules also match the trailing slash of the WordPress URLs: one 301, no 308 first.
  return inventory
    .filter((r) => r.redirect && r.targetPath)
    .map((r) => ({
      source: new URL(r.url).pathname.replace(/\/$/, "") || "/",
      destination: resolveLegacyTarget(r.targetPath as string, has),
      statusCode: 301 as const,
    }))
    .filter((r) => r.source !== r.destination);
}

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Copyright year in the footer, fixed at build time (pages are prerendered).
  env: { BUILD_YEAR: String(new Date().getFullYear()) },
  partialPrefetching: true,
  poweredByHeader: false,
  // Trailing slashes are handled in src/proxy.ts with a single 301 (old WordPress URLs end in "/").
  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return legacyRedirects();
  },
  async headers() {
    // Belt and braces next to the robots meta tag: keep the demo out of search engines.
    return allowIndexing ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
