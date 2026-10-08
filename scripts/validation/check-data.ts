/**
 * Content integrity checks. Runs before every build (`prebuild`).
 * Fails when content could be shown without a traceable source.
 *
 * Usage: npm run validate:data
 */
import { z } from "zod";
import {
  brands,
  claims,
  devices,
  faqs,
  getBrand,
  getRepair,
  prices,
  repairs,
  warranties,
} from "../../src/lib/catalog";
import { ORIGIN } from "../../src/lib/sources";
import { urlRecordSchema } from "../../src/types/content";
import inventoryJson from "../../src/data/url-inventory.json";

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

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
unique("legacy URL", [...devices, ...brands].flatMap((r) => r.legacyUrls));

for (const d of devices) {
  if (!getBrand(d.brandId)) fail(`device ${d.id}: unknown brand ${d.brandId}`);
  if (!getBrand(d.brandId)?.categories.includes(d.categoryId)) fail(`device ${d.id}: brand has no category ${d.categoryId}`);
  for (const r of d.repairs ?? []) if (!getRepair(r)) fail(`device ${d.id}: unknown repair ${r}`);
  if (!d.sources.length) fail(`device ${d.id}: no source`);
}

const deviceIds = new Set(devices.map((d) => d.id));
for (const p of prices) {
  if (!deviceIds.has(p.deviceId)) fail(`price: unknown device ${p.deviceId}`);
  if (!getRepair(p.repairId)) fail(`price: unknown repair ${p.repairId}`);
  if (p.verified && !p.sources.some((s) => s.verification === "verified-source" || s.verification === "owner-confirmed"))
    fail(`price ${p.deviceId}/${p.repairId}: verified but not from the live source or the owner`);
}

for (const w of warranties)
  if (w.verified && w.durationMonths === null) fail(`warranty ${w.id}: verified without duration`);

// Public claims and FAQs must be traceable to the original site, never demo copy.
for (const item of [...claims, ...faqs]) {
  const ok = item.sources.some((s) => s.verification !== "demo" && s.url.startsWith(ORIGIN));
  if (!ok) fail(`${"title" in item ? "claim" : "faq"} ${item.id}: no non-demo source on ${ORIGIN}`);
}

const inventory = z.array(urlRecordSchema).safeParse(inventoryJson);
if (!inventory.success) fail(`url-inventory.json invalid: ${inventory.error.message}`);
else {
  unique("inventory URL", inventory.data.map((r) => r.url));
  const staticRoutes = new Set(["/", "/reparaties", "/werkwijze", "/over-ons", "/veelgestelde-vragen", "/contact", "/afspraak"]);
  for (const r of inventory.data) {
    if (!r.targetPath) continue;
    const parts = r.targetPath.split("/").filter(Boolean);
    const exists =
      staticRoutes.has(r.targetPath) ||
      (parts[0] === "reparaties" && parts.length === 2 && !!getBrand(parts[1])) ||
      (parts[0] === "reparaties" && parts.length === 3 && deviceIds.has(`${parts[1]}-${parts[2]}`)) ||
      (parts[0] === "reparatie" && parts.length === 2 && !!getRepair(parts[1]));
    if (!exists) fail(`inventory ${r.url}: target ${r.targetPath} is not a route`);
    if (r.redirect && new URL(r.url).pathname.replace(/\/$/, "") === r.targetPath) fail(`inventory ${r.url}: redirect to itself`);
  }
}

const verifiedPrices = prices.filter((p) => p.verified).length;
console.log(
  `Checked ${devices.length} devices, ${brands.length} brands, ${repairs.length} repairs, ${prices.length} prices (${verifiedPrices} verified), ${claims.length} claims, ${faqs.length} FAQs.`,
);
if (errors.length) {
  console.error(`\n✗ ${errors.length} data problem(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("✓ Content data is consistent and traceable.");
