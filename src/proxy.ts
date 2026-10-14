import { NextResponse, type NextRequest } from "next/server";
import { blogPath, blogPosts, brands, devices, landingPages, repairs } from "@/lib/catalog";
import { hasUntranslatedSegment, localizePath, parsePublicPath } from "@/lib/i18n";
import { staticPaths } from "@/lib/routes";

/**
 * Routing for both languages.
 * - Dutch keeps the original, unprefixed URLs; English lives under /en with translated segments.
 * - Public URLs are rewritten to the internal `app/[lang]/…` pages (Dutch folder names).
 * - Unknown URLs get a real HTTP 404 instead of a soft 404 from a streamed dynamic route.
 *   The static 404 page is fetched internally and returned with status 404, because a
 *   rewrite to a prerendered page keeps that page's 200 status in production.
 * Legacy 301s from next.config.ts run before this proxy.
 */
const known = new Set<string>([
  ...staticPaths,
  ...brands.map((b) => `/reparaties/${b.id}`),
  ...devices.map((d) => `/reparaties/${d.brandId}/${d.slug}`),
  ...repairs.map((r) => `/reparatie/${r.slug}`),
  ...landingPages.map((p) => p.path),
  ...blogPosts.map((p) => blogPath(p.slug)),
]);

/** Place slug → the page for that place (a /telefoon-… page when there are several). */
const placePages = new Map<string, string>();
for (const p of landingPages) {
  if (p.kind !== "area" || !p.place) continue;
  const key = p.place.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (!placePages.has(key) || p.path.startsWith("/telefoon-")) placePages.set(key, p.path);
}
const AREA_URL = /^\/(?:telefoon|gsm|iphone|ipad|mobiel|scherm|smartphone|samsung|huawei)-reparaties?-(.+?)(?:-\d+)?$/;
const placePageFor = (path: string) => {
  const slug = AREA_URL.exec(path)?.[1];
  return slug ? (placePages.get(slug) ?? null) : null;
};

/** Marks the proxy's own fetch of the 404 page, which must pass through untouched. */
const INTERNAL_404 = "x-pr-not-found";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/(.)\/$/, "$1");

  if (request.headers.get(INTERNAL_404) === "1" && /^\/(nl|en)\/niet-gevonden$/.test(pathname)) return NextResponse.next();

  // Old WordPress URLs end in "/": one permanent redirect to the canonical URL without it.
  // (A plain URL: a cloned nextUrl would put the trailing slash back.)
  if (request.nextUrl.pathname !== "/" && request.nextUrl.pathname.endsWith("/")) {
    const target = (!known.has(pathname) && placePageFor(pathname)) || pathname;
    return NextResponse.redirect(new URL(target + request.nextUrl.search, request.url), 301);
  }

  // The internal Dutch prefix is never public: /nl/… → /…
  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // English URL with a Dutch segment (/en/reparaties/…) → its English form.
  if (hasUntranslatedSegment(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(parsePublicPath(pathname).nlPath, "en");
    return NextResponse.redirect(url, 308);
  }

  const { locale, nlPath } = parsePublicPath(pathname);
  // Old place pages that are no longer in the export (renamed or trashed, but possibly still
  // linked from elsewhere): to the page for the same place.
  const place = locale === "nl" && !known.has(nlPath) ? placePageFor(nlPath) : null;
  if (place) return NextResponse.redirect(new URL(place, request.url), 301);
  if (!known.has(nlPath)) {
    const page = await fetch(new URL(`/${locale}/niet-gevonden`, request.nextUrl.origin), {
      headers: { [INTERNAL_404]: "1" },
    });
    return new NextResponse(page.body, {
      status: 404,
      headers: { "content-type": page.headers.get("content-type") ?? "text/html; charset=utf-8" },
    });
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${nlPath === "/" ? "" : nlPath}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Every page request; skips Next internals and files such as /robots.txt and images.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
