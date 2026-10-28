/**
 * Where an old (WordPress) URL ends up when its target was removed in the CMS: a deleted device
 * sends its old URLs to the brand overview, a deleted blog post to the blog, and a brand without
 * devices left (Redmi, 2026-10-27) to the overview of all brands. Used by the redirects
 * (next.config.ts) and the data check, so deleting an entry in the CMS never breaks the build
 * (Martijn deleted the iPhone SE models on 2026-10-21).
 */
export function resolveLegacyTarget(
  target: string,
  has: {
    device: (brandId: string, slug: string) => boolean;
    brand: (brandId: string) => boolean;
    blogPost: (slug: string) => boolean;
  },
): string {
  const parts = target.split("/").filter(Boolean);
  if (parts[0] === "reparaties" && parts.length >= 2 && !has.brand(parts[1])) return "/reparaties";
  if (parts[0] === "reparaties" && parts.length === 3 && !has.device(parts[1], parts[2])) return `/reparaties/${parts[1]}`;
  if (parts[0] === "blog-post" && parts.length === 2 && !has.blogPost(parts[1])) return "/blog-post";
  return target;
}
