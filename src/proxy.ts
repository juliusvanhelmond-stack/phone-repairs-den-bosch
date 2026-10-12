import { NextResponse, type NextRequest } from "next/server";
import { blogPath, blogPosts, brands, devices, landingPages, repairs } from "@/lib/catalog";
import { staticPaths } from "@/lib/routes";

/**
 * Returns a real HTTP 404 for unknown URLs handled by dynamic routes.
 * Dynamic routes would otherwise stream their prerendered shell with status 200
 * before `notFound()` runs, which search engines treat as a soft 404.
 * Legacy redirects (next.config.ts) run before this proxy.
 */
const known = new Set<string>([
  ...staticPaths,
  ...brands.map((b) => `/reparaties/${b.id}`),
  ...devices.map((d) => `/reparaties/${d.brandId}/${d.slug}`),
  ...repairs.map((r) => `/reparatie/${r.slug}`),
  ...landingPages.map((p) => p.path),
  ...blogPosts.map((p) => blogPath(p.slug)),
]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/(.)\/$/, "$1");
  if (known.has(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  matcher: [
    "/reparaties/:path+",
    "/reparatie/:path*",
    "/veelgestelde-vragen/:path+",
    "/blog-post/:path+",
    // Top-level slugs (area and service pages); skips Next internals and files such as /robots.txt.
    "/((?!_next|api)[^/.]+)",
  ],
};
