import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type InventoryRecord = { url: string; targetPath: string | null; redirect: boolean };

/** 301s for original URLs whose path changes. Source of truth: src/data/url-inventory.json */
function legacyRedirects() {
  const inventory: InventoryRecord[] = JSON.parse(
    readFileSync(join(process.cwd(), "src/data/url-inventory.json"), "utf8"),
  );
  return inventory
    .filter((r) => r.redirect && r.targetPath)
    .map((r) => ({
      source: new URL(r.url).pathname.replace(/\/$/, "") || "/",
      destination: r.targetPath as string,
      statusCode: 301 as const,
    }))
    .filter((r) => r.source !== r.destination);
}

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
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
