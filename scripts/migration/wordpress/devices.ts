/**
 * Turns the price tables of the WordPress export into devices and verbatim price lists.
 *
 * A page either describes one device (the iPhone 15 Pro page) or several (the Huawei
 * overview page, the MacBook Pro page): a table row with a model name and no price
 * starts a new device. Price rows are kept word for word; only the leading device
 * name is dropped from the label ("Huawei P30 Pro Batterij vervangen" → "Batterij vervangen").
 */
import type { MenuNode, WxrItem } from "./wxr";
import { readTableCells, type Cell } from "./wxr";

export type BrandDef = { id: string; name: string; order: number };

/** Brand order in every menu and overview, as set by the client (e-mail 2026-10-13, 23:21). */
export const BRANDS: BrandDef[] = [
  { id: "apple", name: "Apple", order: 1 },
  { id: "samsung", name: "Samsung", order: 2 },
  { id: "google", name: "Google", order: 3 },
  { id: "oppo", name: "OPPO", order: 4 },
  { id: "oneplus", name: "OnePlus", order: 5 },
  { id: "xiaomi", name: "Xiaomi", order: 6 },
  { id: "poco", name: "Poco", order: 7 },
  { id: "redmi", name: "Redmi", order: 8 },
  { id: "motorola", name: "Motorola", order: 9 },
  { id: "huawei", name: "Huawei", order: 10 },
  { id: "honor", name: "Honor", order: 11 },
  { id: "nokia", name: "Nokia", order: 12 },
  { id: "sony", name: "Sony", order: 13 },
  { id: "realme", name: "Realme", order: 14 },
  { id: "asus", name: "Asus", order: 15 },
  // Asked for in the device overview, per model (owner, e-mail 2026-10-16).
  { id: "nintendo", name: "Nintendo", order: 16 },
];

/** First path segment of the original site → brand and default category. */
const PATH_BRANDS: [RegExp, string, string][] = [
  [/^\/(iphone-reparatie|iphone-reparatie-den-bosch)(\/|$)/, "apple", "smartphone"],
  [/^\/(ipad-reparatie-den-bosch|ipad-reparatie|ipad-air-reparatie)(\/|$)/, "apple", "tablet"],
  [/^\/macbook-[a-z-]*reparatie[a-z-]*(\/|$)/, "apple", "laptop"],
  [/^\/samsung-tab-reparatie-den-bosch(\/|$)/, "samsung", "tablet"],
  [/^\/samsung-reparatie-den-bosch(\/|$)/, "samsung", "smartphone"],
  [/^\/google-pixel-reparatie(\/|$)/, "google", "smartphone"],
  [/^\/oneplus-reparatie(\/|$)/, "oneplus", "smartphone"],
  [/^\/honor-reparatie(\/|$)/, "honor", "smartphone"],
  [/^\/nokia-reparatie(\/|$)/, "nokia", "smartphone"],
  [/^\/huawei-reparatie-den-bosch(\/|$)/, "huawei", "smartphone"],
  [/^\/sony-xperia-reparatie(\/|$)/, "sony", "smartphone"],
  [/^\/xiaomi-pocophone-reparatie(\/|$)/, "poco", "smartphone"],
  [/^\/xiaomi-reparatie(\/|$)/, "xiaomi", "smartphone"],
  [/^\/redmi-reparatie-den-bosch(\/|$)/, "redmi", "smartphone"],
  [/^\/oppo-reparatie(\/|$)/, "oppo", "smartphone"],
  [/^\/asus-zenfone-reparatie(\/|$)/, "asus", "smartphone"],
  [/^\/(moto|motorola)-reparatie(\/|$)/, "motorola", "smartphone"],
  [/^\/nintendo-switch-reparatie(\/|$)/, "nintendo", "console"],
  [/^\/realme-(reparatie|7-pro)(\/|$)/, "realme", "smartphone"],
];

/** Device name prefix → brand; wins over the URL (the OnePlus Open page lives under /samsung-…). */
const NAME_BRANDS: [RegExp, string][] = [
  [/^(apple )?(iphone|ipad|macbook)/i, "apple"],
  [/^(samsung|galaxy)/i, "samsung"],
  [/^(google )?pixel/i, "google"],
  [/^oneplus/i, "oneplus"],
  [/^honor/i, "honor"],
  [/^nokia/i, "nokia"],
  [/^huawei/i, "huawei"],
  [/^(sony )?xperia/i, "sony"],
  [/^(xiaomi )?redmi/i, "redmi"],
  [/^(xiaomi )?poco/i, "poco"],
  [/^xiaomi/i, "xiaomi"],
  [/^oppo/i, "oppo"],
  [/^(asus|zenfone)/i, "asus"],
  [/^(motorola|moto)\b/i, "motorola"],
  [/^realme/i, "realme"],
  [/^nintendo/i, "nintendo"],
];

export function brandForPath(path: string): { brandId: string; categoryId: string } | null {
  const hit = PATH_BRANDS.find(([re]) => re.test(path));
  return hit ? { brandId: hit[1], categoryId: hit[2] } : null;
}

export function categoryForName(name: string, fallback: string): string {
  if (/macbook/i.test(name)) return "laptop";
  if (/\b(ipad|tab)\b/i.test(name)) return "tablet";
  if (/nintendo|switch/i.test(name)) return "console";
  return fallback === "tablet" || fallback === "laptop" ? "smartphone" : fallback;
}

export function brandForName(name: string): string | null {
  return NAME_BRANDS.find(([re]) => re.test(name.trim()))?.[1] ?? null;
}

/* ------------------------------------------------------------------ names */

const tidy = (s: string) => s.replace(/\s+/g, " ").replace(/\s+([,.)])/g, "$1").trim();

/** True for "VOG-L29", "A2160", "XT 1092", "SM-X520": upper-case model codes with a digit. */
const isCode = (token: string) =>
  (/^[A-Z0-9][A-Z0-9 -]*$/.test(token) && /\d/.test(token) && /[A-Z]/.test(token)) || /^[A-Z]{2,3}$/.test(token);
const codeTokens = (inner: string) => inner.split(/,|\/|\ben\b/).map((t) => t.trim()).filter(Boolean);
const isCodeGroup = (inner: string) => codeTokens(inner).every(isCode);

function stripCodes(raw: string): string {
  return raw.replace(/\s*\(([^)]*)\)/g, (all, inner: string) => (isCodeGroup(inner) ? "" : all));
}

/** Display name in the catalog's style; the original stays an alias. */
export function displayName(raw: string, brandId: string): string {
  let n = tidy(stripCodes(raw)).replace(/ reparatie$/i, "");
  if (brandId === "samsung") {
    n = n.replace(/^Samsung\s+(Galaxy\s+)?/i, "Galaxy ").replace(/^(?!Galaxy )([A-Z]\d)/, "Galaxy $1").replace(/\s+Plus\b/g, "+");
  }
  if (brandId === "google") n = n.replace(/^Google\s+/i, "");
  if (brandId === "sony") n = n.replace(/^Sony\s+/i, "");
  // "Nintendo Switch reparatie (HAC-001) / (HAC-001(-01)": the model is what comes before "reparatie".
  if (brandId === "nintendo") n = n.replace(/\s+reparatie\b.*$/i, "");
  if (brandId === "apple") {
    n = n
      .replace(/^Apple\s+/i, "")
      .replace(/\b(iPhone \d+)E\b/, "$1e")
      .replace(/\b(iPhone \d+) Mini\b/, "$1 mini")
      .replace(/\biPad Mini\b/, "iPad mini")
      .replace(/\biPad air\b/, "iPad Air");
  }
  return tidy(n);
}

/** Codes such as "(VOG-L29)" or "(A2160, A2215 en A2217)" become search aliases. */
export function modelCodes(raw: string): string[] {
  return [...raw.matchAll(/\(([^)]*)\)/g)].flatMap((m) => (isCodeGroup(m[1]) ? codeTokens(m[1]) : []));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["”″']/g, "")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Dedupe key; MacBooks are identified by their A-number ("A2485"), named differently per page. */
export const nameKey = (brandId: string, name: string) => {
  const macbook = /macbook/i.test(name) && name.match(/\bA\d{4}\b/);
  if (macbook) return `${brandId}:macbook-${macbook[0].toLowerCase()}`;
  return `${brandId}:${slugify(name.replace(/\bplus\b/gi, "+")).replace(/-(5g|4g)$/, "")}`;
};

/* ----------------------------------------------------------------- prices */

export type PriceStatus = "price" | "on-request" | "expected";
export type PriceRow = {
  label: string;
  /** Marked "Meest gekozen" on the original page. */
  popular?: boolean;
  /** Links in the label, e.g. "premium OLED" → the explanation page (paths already mapped). */
  links?: { text: string; href: string }[];
  /** Cell text exactly as on the original page. */
  raw: string;
  amount: number | null;
  status: PriceStatus;
  /** Our repair category; null for accessories (cables, chargers). */
  repairId: string | null;
};

const PRICE_CELL = /€|aanvraag|aan1raag|verwacht/i;

export function parsePriceCell(raw: string): Pick<PriceRow, "amount" | "status"> | null {
  if (/aanvraag|aan1raag/i.test(raw)) return { amount: null, status: "on-request" };
  if (/verwacht/i.test(raw)) return { amount: null, status: "expected" };
  const m = raw.match(/€\s*(\d{1,2}(?:\.\d{3})+|\d+)/);
  if (!m) return null;
  const amount = Number(m[1].replace(/\./g, ""));
  return amount > 0 && amount < 5000 ? { amount, status: "price" } : null;
}

const RULES: [string | null, RegExp][] = [
  [null, /\b(kabel|oplader|lader|adapter|hoes|hoesje|case|screenprotector|hydrogel|tempered glass)\b/i],
  ["waterschade", /vocht|water|vloeistof|chemisch reinig/i],
  // "Achterkant glas vervangen (incl. cameralenzen …)" is a back repair; "Camera's aan de achterkant" a camera repair.
  ["achterkant-vervangen", /^(achterkant|achterglas|achterzijde|volledig midframe|midframe|behuizing|back ?cover)/i],
  ["camera-repareren", /camera|lens/i],
  ["achterkant-vervangen", /achterkant|achterglas|back ?cover|behuizing|midframe/i],
  ["scherm-vervangen", /scherm|display|lcd|oled|glas|touch/i],
  ["batterij-vervangen", /batterij|accu/i],
  ["oplaadpoort-repareren", /oplaad|laadpoort|laadconnector|dock|usb|lightning connector/i],
  ["toetsenbord-vervangen", /toetsenbord|keyboard/i],
];

export function repairForLabel(label: string): string | null {
  for (const [id, re] of RULES) if (re.test(label)) return id;
  return "overige-reparaties";
}

/** Drops the device name the original repeats at the start of most labels. */
export function stripDeviceName(label: string, names: string[]): string {
  const clean = tidy(label.replace(/^€\s*/, ""));
  const lower = clean.toLowerCase();
  for (const n of [...names].sort((a, b) => b.length - a.length)) {
    const candidate = tidy(n.replace(/\([^)]*\)/g, "")).toLowerCase();
    if (candidate.length > 3 && lower.startsWith(candidate + " ")) {
      const rest = clean.slice(candidate.length).trim();
      return rest.charAt(0).toUpperCase() + rest.slice(1);
    }
  }
  return clean;
}

/* ---------------------------------------------------------------- devices */

export type SourceRow = { label: string; raw: string; links: Cell["links"]; popular: boolean };
export type DeviceGroup = { heading: string | null; codes: string[]; rows: SourceRow[] };

/** The green "Meest gekozen" label is an image in the original price tables. */
const POPULAR_BADGE = /^IMG_8250\b/;

export function readGroups(html: string): DeviceGroup[] {
  const groups: DeviceGroup[] = [];
  let current: DeviceGroup | null = null;
  const start = (heading: string | null, codes: string[] = []) => {
    current = { heading, codes, rows: [] };
    groups.push(current);
  };
  for (const table of readTableCells(html)) {
    for (const row of table) {
      const cells = row.map((c) => c.text);
      const [first = "", second = ""] = cells;
      const last = cells[cells.length - 1] ?? "";
      if (cells.length >= 2 && /^reparatie\b/i.test(first) && !PRICE_CELL.test(second)) {
        start(second, [...modelCodes(second), ...(first.match(/\b[A-Z]\d{4}\b/g) ?? [])]);
      } else if (cells.length >= 2 && PRICE_CELL.test(last) && first) {
        if (!current) start(null);
        current!.rows.push({
          label: first,
          raw: last,
          links: row[0].links,
          popular: row.some((c) => c.images.some((img) => POPULAR_BADGE.test(img))),
        });
      } else if (cells.length >= 2 && last.trim() === "-") {
        // Not offered for this model: skipped.
      } else if (/vervangen|repareren|herstel|reinig/i.test(first)) {
        // A repair row whose price cell is empty on the original page: skipped, it is no model heading.
      } else if (first && !PRICE_CELL.test(first)) {
        const code = cells.length >= 2 && /^[A-Z0-9-]{4,}$/.test(second.trim()) ? [second.trim()] : [];
        start(first, [...modelCodes(first), ...code]);
      }
    }
  }
  return groups.filter((g) => g.rows.length > 0);
}

/** Menu facts per page: series label, position and the label used in the menu. */
export type MenuFacts = { order: number; series: string | null; label: string; brandRoot: boolean };

export function menuFacts(roots: MenuNode[]): Map<string, MenuFacts> {
  const facts = new Map<string, MenuFacts>();
  let order = 0;
  const isSeries = (n: MenuNode) => /\bserie\b/i.test(n.label);
  const visit = (node: MenuNode, series: string | null, depth: number) => {
    order += 1;
    const ownSeries = isSeries(node) ? node.label.replace(/\s*serie\s*$/i, "").trim() : series;
    if (node.path && !facts.has(node.path)) {
      facts.set(node.path, { order, series: ownSeries, label: node.label, brandRoot: depth === 1 });
    }
    for (const child of node.children) visit(child, ownSeries, depth + 1);
  };
  for (const root of roots) {
    if (/^(telefoon|tablet) reparatie$/i.test(root.label)) {
      for (const brand of root.children) visit(brand, null, 1);
    } else if (/^macbook reparatie$/i.test(root.label)) {
      // The MacBook overview is brand level; its children (Pro, Air, Neo) are series pages.
      visit({ ...root, children: [] }, null, 1);
      for (const c of root.children) visit({ ...c, label: `${c.label.replace(/\s*reparatie$/i, "")} serie` }, null, 2);
    }
  }
  return facts;
}

/** Series for devices that are not grouped in the menu: the name up to its first number. */
export function seriesFromName(name: string): string {
  const head = name.replace(/\s*\d.*$/, "").trim();
  return head || name;
}

export function yearFromName(name: string): number | undefined {
  const y = name.match(/\b(20[12]\d)\b/);
  return y ? Number(y[1]) : undefined;
}

export type Art =
  | "phone-home-button"
  | "phone-notch"
  | "phone-island"
  | "phone-punch-hole"
  | "phone-foldable"
  | "phone-flip"
  | "tablet"
  | "tablet-home-button"
  | "laptop"
  | "console";

export function artFor(name: string, brandId: string, categoryId: string): Art {
  if (categoryId === "laptop") return "laptop";
  if (categoryId === "console") return "console";
  if (categoryId === "tablet") {
    const old = /\biPad (Air (2|3)\b|mini [2-5]\b|[2-9]\b|(Pro )?(9\.7|10\.5)|Mini [2-5]\b|Air 2019)|\biPad [2-9] 20(1\d|20|21)\b/i;
    return brandId === "apple" && old.test(name) ? "tablet-home-button" : "tablet";
  }
  if (/fold|\bopen\b|magic v|\bduo\b/i.test(name)) return "phone-foldable";
  if (/flip|razr/i.test(name)) return "phone-flip";
  if (brandId === "apple") {
    if (/\biPhone (SE|[4-8]\b|[4-8]s|[4-8] Plus|5c)/i.test(name)) return "phone-home-button";
    if (/\biPhone (X|XR|XS|11|12|13|16e)\b|\biPhone 14( Plus)?$/i.test(name)) return "phone-notch";
    return "phone-island";
  }
  return "phone-punch-hole";
}

export function pageDevices(page: WxrItem): DeviceGroup[] {
  return readGroups(page.content);
}
