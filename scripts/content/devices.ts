/**
 * Devices and their price lists as CMS entries: one JSON file per device in src/content/toestellen/
 * (file name = the URL slug), edited in Keystatic (client request 2026-10-21: add devices and change
 * all prices himself). The WordPress importer writes these files; `npm run content` turns them into
 * src/data/generated/devices.json and price-lists.json, which the site reads.
 *
 * Provenance (original URLs, sources, WordPress ids, the price list's source page) stays in the same
 * file under keys the CMS does not show (`fields.ignored()`), so a save in the CMS keeps it.
 */
import { repairForLabel } from "../migration/wordpress/devices";

export const DEVICES_DIR = "src/content/toestellen";
const ORIGIN = "https://www.phonerepairs.nl";

type Source = { url: string; verification: string; capturedAt?: string; note?: string };
type Link = { text: string; href: string };

/** One price row as stored in the CMS: the price is the text the shop types, e.g. "€130,-". */
export type PriceEntry = { label: string; price: string; repairId: string; popular: boolean; links: Link[] };

export type DeviceEntry = {
  name: string;
  brandId: string;
  categoryId: string;
  series: string;
  order: number;
  releaseYear: string;
  art: string;
  popular: boolean;
  aliases: string[];
  seo: { title: string; description: string };
  prices: PriceEntry[];
  legacyUrls?: string[];
  sources?: Source[];
  extra?: Record<string, unknown>;
  priceSource?: { sourceUrl: string; capturedAt: string; updatedAt: string };
};

/** Select values for rows that are not a repair, or whose category follows from the label. */
export const ACCESSORY = "accessoire";
export const AUTO = "auto";

type Device = {
  slug: string;
  name: string;
  brandId: string;
  categoryId: string;
  series: string;
  order: number;
  releaseYear?: number;
  art: string;
  popular: boolean;
  aliases: string[];
  legacyUrls: string[];
  sources: Source[];
  seo?: { title?: string; description?: string };
  extra?: Record<string, unknown>;
};
type Row = { label: string; raw: string; repairId: string | null; popular?: boolean; links?: Link[] };
type PriceList = { sourceUrl: string; capturedAt: string; updatedAt: string; rows: Row[] };

/** Importer → CMS file. */
export function toEntry(device: Device, list: PriceList | undefined): DeviceEntry {
  return {
    name: device.name,
    brandId: device.brandId,
    categoryId: device.categoryId,
    series: device.series,
    order: device.order,
    releaseYear: device.releaseYear ? String(device.releaseYear) : "",
    art: device.art,
    popular: device.popular,
    aliases: device.aliases,
    seo: { title: device.seo?.title ?? "", description: device.seo?.description ?? "" },
    prices: (list?.rows ?? []).map((r) => ({
      label: r.label,
      price: r.raw,
      repairId: r.repairId ?? ACCESSORY,
      popular: !!r.popular,
      links: r.links ?? [],
    })),
    legacyUrls: device.legacyUrls,
    sources: device.sources,
    ...(device.extra ? { extra: device.extra } : {}),
    ...(list ? { priceSource: { sourceUrl: list.sourceUrl, capturedAt: list.capturedAt, updatedAt: list.updatedAt } } : {}),
  };
}

/**
 * The price as typed in the CMS: "€130,-", "€ 130", "130" or "130,00" is an amount; "op aanvraag"
 * and "binnenkort"/"verwacht" are kept as such. Null when it cannot be read (the build then stops).
 */
export function parsePrice(text: string): { amount: number | null; status: "price" | "on-request" | "expected" } | null {
  const t = text.trim().toLowerCase();
  if (!t || /aan.?raag/.test(t)) return { amount: null, status: "on-request" };
  if (/verwacht|binnenkort/.test(t)) return { amount: null, status: "expected" };
  // The amount comes first; what follows may be ",-", ",--", ".-", ",00" and the like, but no other number.
  const m = t.match(/^(?:€\s*)?(\d{1,2}(?:\.\d{3})+|\d+)([^1-9]*)$/);
  if (!m) return null;
  const amount = Number(m[1].replace(/\./g, ""));
  return amount > 0 && amount < 10000 ? { amount, status: "price" } : null;
}

const today = () => new Date().toISOString().slice(0, 10);

/** CMS file → the site's device and price list records. Errors name the device and row. */
export function fromEntry(slug: string, e: DeviceEntry, errors: string[]) {
  const id = `${e.brandId}-${slug}`;
  const path = `/reparaties/${e.brandId}/${slug}`;
  const rows = (e.prices ?? [])
    .filter((p) => p.label?.trim())
    .flatMap((p) => {
      const price = parsePrice(p.price ?? "");
      if (!price) {
        errors.push(`toestel ${e.name} (${slug}): prijs "${p.price}" bij "${p.label}" is niet te lezen (gebruik bijv. €130,- of "op aanvraag")`);
        return [];
      }
      const label = p.label.trim();
      const repairId = p.repairId === ACCESSORY ? null : p.repairId === AUTO || !p.repairId ? repairForLabel(label) : p.repairId;
      const links = (p.links ?? []).filter((l) => l.text?.trim() && l.href?.trim() && label.includes(l.text));
      return [
        {
          label,
          raw: p.price.trim() || "op aanvraag",
          ...price,
          repairId,
          ...(p.popular ? { popular: true } : {}),
          ...(links.length ? { links } : {}),
        },
      ];
    });
  const sources = e.sources?.length
    ? e.sources
    : [{ url: `${ORIGIN}${path}/`, verification: "owner-confirmed", capturedAt: today(), note: "Added in the CMS by Phone Repairs." }];
  const device = {
    id,
    slug,
    name: e.name.trim(),
    brandId: e.brandId,
    categoryId: e.categoryId,
    series: e.series?.trim() || e.name.replace(/\s*\d.*$/, "").trim() || e.name.trim(),
    order: e.order ?? 0,
    ...(Number(e.releaseYear) ? { releaseYear: Number(e.releaseYear) } : {}),
    art: e.art,
    popular: !!e.popular,
    aliases: (e.aliases ?? []).filter(Boolean),
    ...(rows.length ? { repairs: [...new Set(rows.map((r) => r.repairId).filter((r): r is string => !!r))] } : {}),
    legacyUrls: e.legacyUrls ?? [],
    sources,
    ...(e.seo?.title || e.seo?.description
      ? { seo: { ...(e.seo.title ? { title: e.seo.title } : {}), ...(e.seo.description ? { description: e.seo.description } : {}) } }
      : {}),
    extra: e.extra ?? {},
  };
  const priceList = rows.length
    ? {
        deviceId: id,
        sourceUrl: e.priceSource?.sourceUrl ?? `${ORIGIN}${path}/`,
        capturedAt: e.priceSource?.capturedAt ?? today(),
        updatedAt: e.priceSource?.updatedAt ?? today(),
        rows,
      }
    : null;
  return { device, priceList };
}
