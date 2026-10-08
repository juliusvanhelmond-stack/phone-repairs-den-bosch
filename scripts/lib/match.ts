import { brands, devices, getBrand } from "../../src/lib/catalog";
import { normalizeSearch } from "../../src/lib/utils";

const REPAIR_KEYWORDS: [string, RegExp][] = [
  ["scherm-vervangen", /scherm|display|glas(?!.*achter)|lcd|oled/i],
  ["batterij-vervangen", /batterij|accu/i],
  ["oplaadpoort-repareren", /oplaad|laadconnector|laadpoort|dock|usb-?c|lightning/i],
  ["camera-repareren", /camera|lens/i],
  ["achterkant-vervangen", /achterkant|achterglas|backcover|behuizing/i],
  ["waterschade", /water|vocht/i],
  ["toetsenbord-vervangen", /toetsenbord|keyboard/i],
];

export function matchRepair(label: string): string {
  return REPAIR_KEYWORDS.find(([, re]) => re.test(label))?.[0] ?? "overige-reparaties";
}

/** Maps an original URL to a catalog device via legacyUrls, then by slug similarity. */
export function matchDevice(url: string): string | null {
  const path = new URL(url).pathname;
  const byLegacy = devices.find((d) => d.legacyUrls.some((l) => l.replace(/\/$/, "") === path.replace(/\/$/, "")));
  if (byLegacy) return byLegacy.id;
  const segment = normalizeSearch(path.split("/").filter(Boolean).pop() ?? "");
  if (!segment) return null;
  const candidates = devices.filter((d) => {
    const brand = getBrand(d.brandId)?.name ?? "";
    const names = [d.name, `${brand} ${d.name}`, d.name.replace(/^Galaxy /, `${brand} `), ...d.aliases].map(normalizeSearch);
    return names.includes(segment);
  });
  return candidates.length === 1 ? candidates[0].id : null;
}

export const knownBrandIds = brands.map((b) => b.id);
