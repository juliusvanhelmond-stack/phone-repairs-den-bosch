/**
 * Content integrity checks. Runs before every build (`prebuild`).
 * Fails when content could be shown without a traceable source.
 *
 * Usage: npm run validate:data
 */
import { z } from "zod";
import {
  blogPosts,
  brands,
  categories,
  claims,
  devices,
  englishContent,
  faqs,
  getBrand,
  getRepair,
  landingPages,
  priceLists,
  repairs,
  warranties,
} from "../../src/lib/catalog";
import { staticPaths } from "../../src/lib/routes";
import { ORIGIN } from "../../src/lib/sources";
import { urlRecordSchema } from "../../src/types/content";
import inventoryJson from "../../src/data/url-inventory.json";
import seoOverrides from "../../src/data/generated/seo-overrides.json";

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);
const warnings: string[] = [];
const warn = (msg: string) => warnings.push(msg);

function unique<T>(label: string, values: T[]) {
  const seen = new Set<T>();
  for (const v of values) {
    if (seen.has(v)) fail(`duplicate ${label}: ${String(v)}`);
    seen.add(v);
  }
}

unique("device id", devices.map((d) => d.id));
unique("device path", devices.map((d) => `${d.brandId}/${d.slug}`));
unique("brand id", brands.map((b) => b.id));
unique("repair slug", repairs.map((r) => r.slug));
unique("legacy URL", [...devices, ...brands, ...landingPages, ...blogPosts].flatMap((r) => r.legacyUrls));
unique("landing page path", landingPages.map((p) => p.path));
unique("blog slug", blogPosts.map((p) => p.slug));

for (const d of devices) {
  if (!getBrand(d.brandId)) fail(`device ${d.id}: unknown brand ${d.brandId}`);
  if (!getBrand(d.brandId)?.categories.includes(d.categoryId)) fail(`device ${d.id}: brand has no category ${d.categoryId}`);
  for (const r of d.repairs ?? []) if (!getRepair(r)) fail(`device ${d.id}: unknown repair ${r}`);
  if (!d.sources.length) fail(`device ${d.id}: no source`);
}

const deviceIds = new Set(devices.map((d) => d.id));
// Price lists: one per device, copied from the original site with their source page.
unique("price list", priceLists.map((l) => l.deviceId));
for (const l of priceLists) {
  if (!deviceIds.has(l.deviceId)) fail(`price list: unknown device ${l.deviceId}`);
  if (!l.sourceUrl.startsWith(ORIGIN)) fail(`price list ${l.deviceId}: source ${l.sourceUrl} is not on ${ORIGIN}`);
  for (const r of l.rows) if (r.repairId && !getRepair(r.repairId)) fail(`price list ${l.deviceId}: unknown repair ${r.repairId}`);
}

for (const w of warranties)
  // A verified entry without duration must say why (e.g. "no warranty on water damage").
  if (w.verified && w.durationMonths === null && !w.terms.length) fail(`warranty ${w.id}: verified without duration or terms`);

// Public claims, FAQs, kept pages and blog summaries must be traceable to the original site, never demo copy.
const traceable = [
  ...claims.map((c) => ({ label: `claim ${c.id}`, sources: c.sources })),
  ...faqs.map((f) => ({ label: `faq ${f.id}`, sources: f.sources })),
  ...landingPages.map((p) => ({ label: `page ${p.path}`, sources: p.sources })),
  ...blogPosts.map((p) => ({ label: `blog ${p.slug}`, sources: p.sources })),
];
for (const item of traceable) {
  const ok = item.sources.some((s) => s.verification !== "demo" && s.url.startsWith(ORIGIN));
  if (!ok) fail(`${item.label}: no non-demo source on ${ORIGIN}`);
}
for (const p of landingPages) {
  if ((staticPaths as readonly string[]).includes(p.path)) fail(`page ${p.path}: collides with a static route`);
  if (p.kind === "area" && (!p.place || !p.focus)) fail(`page ${p.path}: area page needs place and focus`);
  if (p.kind === "faq-topic" && !p.path.startsWith("/veelgestelde-vragen/")) fail(`page ${p.path}: FAQ topic outside /veelgestelde-vragen`);
  if (p.kind !== "faq-topic" && p.path.split("/").length !== 2) fail(`page ${p.path}: must be a top-level path`);
}

// Every public text record needs an English overlay, so /en never falls back to Dutch.
const english: [string, { id: string }[], Record<string, unknown>][] = [
  ["category", categories, englishContent.categories],
  ["repair", repairs, englishContent.repairs],
  ["faq", faqs, englishContent.faqs],
  ["claim", claims, englishContent.claims],
  ["page", landingPages, englishContent.landingPages],
  ["blog", blogPosts, englishContent.blog],
];
for (const [label, items, table] of english) {
  const ids = new Set(items.map((i) => i.id));
  // Pages and blog posts are added and removed in the CMS: a missing English version (then /en shows the
  // Dutch text) or a translation of a removed entry is a warning only.
  const report = label === "page" || label === "blog" ? warn : fail;
  for (const i of items) if (!(i.id in table)) report(`${label} ${i.id}: no English translation in translations/en.json`);
  for (const id of Object.keys(table)) if (!ids.has(id)) report(`translations/en.json: unknown ${label} ${id}`);
}

const inventory = z.array(urlRecordSchema).safeParse(inventoryJson);
if (!inventory.success) fail(`url-inventory.json invalid: ${inventory.error.message}`);
else {
  unique("inventory URL", inventory.data.map((r) => r.url));
  const staticRoutes = new Set<string>([
    ...staticPaths,
    ...landingPages.map((p) => p.path),
    ...blogPosts.map((p) => `/blog-post/${p.slug}`),
  ]);
  for (const r of inventory.data) {
    if (!r.targetPath) continue;
    const parts = r.targetPath.split("/").filter(Boolean);
    const exists =
      staticRoutes.has(r.targetPath) ||
      (parts[0] === "reparaties" && parts.length === 2 && !!getBrand(parts[1])) ||
      (parts[0] === "reparaties" && parts.length === 3 && deviceIds.has(`${parts[1]}-${parts[2]}`)) ||
      (parts[0] === "reparatie" && parts.length === 2 && !!getRepair(parts[1]));
    if (!exists) fail(`inventory ${r.url}: target ${r.targetPath} is not a route`);
    const source = new URL(r.url).pathname.replace(/\/$/, "") || "/";
    if (r.redirect && source === r.targetPath) fail(`inventory ${r.url}: redirect to itself`);
    // Redirects run before routing, so a redirect from a live path would hide that page.
    if (r.redirect && staticRoutes.has(source)) fail(`inventory ${r.url}: redirect shadows the live page ${source}`);
  }
}

const priceRowCount = priceLists.reduce((n, l) => n + l.rows.length, 0);
const pricedRows = priceLists.reduce((n, l) => n + l.rows.filter((r) => r.amount !== null).length, 0);
console.log(
  `Checked ${devices.length} devices, ${brands.length} brands, ${repairs.length} repairs, ${priceRowCount} price rows (${pricedRows} with an amount), ${claims.length} claims, ${faqs.length} FAQs, ${landingPages.length} kept pages, ${blogPosts.length} blog posts.`,
);
// SEO overrides from the CMS must point at a page that exists.
for (const o of seoOverrides as { id: string; path: string; title?: string; description?: string }[]) {
  const parts = o.path.split("/").filter(Boolean);
  const exists =
    o.path === "/" ||
    (staticPaths as readonly string[]).includes(o.path) ||
    landingPages.some((p) => p.path === o.path) ||
    blogPosts.some((p) => `/blog-post/${p.slug}` === o.path) ||
    (parts[0] === "reparaties" && parts.length === 2 && !!getBrand(parts[1])) ||
    (parts[0] === "reparaties" && parts.length === 3 && deviceIds.has(`${parts[1]}-${parts[2]}`)) ||
    (parts[0] === "reparatie" && parts.length === 2 && !!getRepair(parts[1]));
  if (!exists) fail(`SEO (CMS) ${o.id}: ${o.path} is not a page on the site`);
  if (o.title && o.title.length > 70) fail(`SEO (CMS) ${o.id}: title longer than 70 characters`);
  if (o.description && o.description.length > 170) fail(`SEO (CMS) ${o.id}: description longer than 170 characters`);
}

if (warnings.length) console.warn(`\n! ${warnings.length} warning(s):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} data problem(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("✓ Content data is consistent and traceable.");
