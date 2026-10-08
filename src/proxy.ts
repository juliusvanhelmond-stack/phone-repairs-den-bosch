import { NextResponse, type NextRequest } from "next/server";
import { brands, devices, repairs } from "@/lib/catalog";

/**
 * Returns a real HTTP 404 for unknown catalog URLs.
 * Dynamic routes would otherwise stream their prerendered shell with status 200
 * before `notFound()` runs, which search engines treat as a soft 404.
 */
const known = new Set([
  ...brands.map((b) => `/reparaties/${b.id}`),
  ...devices.map((d) => `/reparaties/${d.brandId}/${d.slug}`),
  ...repairs.map((r) => `/reparatie/${r.slug}`),
]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "");
  if (path === "/reparaties" || known.has(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  matcher: ["/reparaties/:path+", "/reparatie/:path*"],
};
