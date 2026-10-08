import { ORIGIN } from "./paths";

const SKIP = /\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|css|js)$|\/wp-(admin|login|includes)|\/feed\/?$|[?&](replytocom|add-to-cart)=/i;

/** Same-origin, no fragment/tracking params, WordPress-style trailing slash. */
export function normalizeUrl(href: string, base = ORIGIN): string | null {
  try {
    const u = new URL(href, base);
    if (u.origin !== new URL(ORIGIN).origin) return null;
    u.hash = "";
    for (const p of [...u.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/.test(p)) u.searchParams.delete(p);
    if (!u.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(u.pathname)) u.pathname += "/";
    return SKIP.test(u.toString()) ? null : u.toString();
  } catch {
    return null;
  }
}
