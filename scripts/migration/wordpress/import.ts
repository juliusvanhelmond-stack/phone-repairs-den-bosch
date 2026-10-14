/**
 * Imports devices and price lists from the client's WordPress export (WXR).
 *
 *   npm run import:wordpress -- <path/to/export.xml> [--write]
 *
 * Without --write it only prints a report. With --write it regenerates
 * src/data/devices.json, src/data/price-lists.json and src/data/brands.json and merges
 * the original URLs into src/data/url-inventory.json (301s to the new pages).
 *
 * The export itself contains personal data (account e-mails) and is never committed;
 * only public page content is read. Prices are copied verbatim with their source URL
 * (the client gave permission to reuse all content of the current site, 2026-10-12).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  artFor,
  BRANDS,
  brandForName,
  brandForPath,
  categoryForName,
  displayName,
  menuFacts,
  nameKey,
  parsePriceCell,
  readGroups,
  repairForLabel,
  seriesFromName,
  slugify,
  stripDeviceName,
  yearFromName,
  type PriceRow,
} from "./devices";
import { importContent, INFO_PAGES } from "./content-import";
import { PAGES_DIR, readEntries } from "../../content/files";
import { readMenu, readWxr, type WxrItem } from "./wxr";

const ROOT = process.cwd();
const ORIGIN = "https://www.phonerepairs.nl";
const file = process.argv[2];
const write = process.argv.includes("--write");
if (!file || !existsSync(file)) {
  console.error("Usage: npm run import:wordpress -- <export.xml> [--write]");
  process.exit(1);
}

const { items, exportedAt } = readWxr(file);
const pages = items.filter((i) => i.type === "page" && i.status === "publish");
const facts = menuFacts(readMenu(items, "Inhoud"));
const warnings: string[] = [];

type Source = { url: string; verification: "verified-source"; capturedAt: string; note: string };
const sourceFor = (page: WxrItem): Source => ({
  url: `${ORIGIN}${page.path}/`,
  verification: "verified-source",
  capturedAt: exportedAt,
  note: `WordPress export ${exportedAt}; page last changed ${page.modified.slice(0, 10)}.`,
});

type Candidate = {
  key: string;
  brandId: string;
  categoryId: string;
  name: string;
  series: string;
  aliases: Set<string>;
  order: number;
  dedicated: boolean;
  page: WxrItem;
  rows: PriceRow[];
  legacyUrls: Set<string>;
};

/**
 * Where a link inside a price row should point on the new site: kept pages keep their
 * path, mapped pages go to their new path, external links stay; anything else is dropped.
 */
const knownTargets = (() => {
  const landing: { path: string }[] = readEntries(ROOT, PAGES_DIR);
  const inventory: { url: string; targetPath: string | null }[] = JSON.parse(readFileSync(join(ROOT, "src/data/url-inventory.json"), "utf8"));
  const map = new Map<string, string>();
  for (const l of landing) map.set(l.path, l.path);
  for (const r of inventory) if (r.targetPath) map.set(new URL(r.url).pathname.replace(/\/$/, ""), r.targetPath);
  return map;
})();
/** Typos and moved pages linked from the original price tables. */
const LINK_ALIASES: Record<string, string> = {
  "/phone-batterij-vervanging": "/iphone-batterij-vervanging",
  "/moederbord-reparatie": "/moederbord-reparatie-den-bosch",
};
function resolveLink(href: string): string | null {
  if (/^https?:\/\//.test(href) && !/phonerepairs\.nl/i.test(href)) return href;
  const path = href.replace(/^https?:\/\/(www\.)?phonerepairs\.nl/i, "").split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const aliased = LINK_ALIASES[path] ?? path;
  return knownTargets.get(aliased) ?? null;
}

const candidates = new Map<string, Candidate>();
const seriesPages = new Set<string>();
let fallbackOrder = 10_000;

/** Summary pages repeating models from their detail pages, with other (older) prices. */
const SUMMARY_PAGES = new Set(["/macbook-reparatie-den-bosch"]);

for (const page of pages) {
  if (SUMMARY_PAGES.has(page.path)) {
    seriesPages.add(page.path);
    warnings.push(`${page.path}: summary page, prices taken from the detail pages instead`);
    continue;
  }
  const pathBrand = brandForPath(page.path);
  const fact = facts.get(page.path);
  const groups = readGroups(page.content);
  if (!groups.length) {
    if (pathBrand) seriesPages.add(page.path);
    continue;
  }
  const titleBrand = brandForName(fact?.label ?? page.title);
  if (!pathBrand && !titleBrand) continue;
  // Area pages (e.g. /iphone-reparatie-vught) have no own models; their tables are skipped.
  if (!pathBrand && !/^\/[a-z0-9-]+$/.test(page.path)) continue;

  const headed = groups.filter((g) => g.heading);
  const depth = page.path.split("/").filter(Boolean).length;
  const seriesLike = /\bserie\b/i.test(fact?.label ?? page.title);
  const single = headed.length <= 1 && !seriesLike && !(fact?.brandRoot || (depth === 1 && pathBrand && !titleBrand));
  if (!single) seriesPages.add(page.path);

  const units = single
    ? [{ heading: fact?.label ?? page.title, codes: groups.flatMap((g) => g.codes), extra: headed[0]?.heading, rows: groups.flatMap((g) => g.rows) }]
    : groups.map((g) => ({ heading: g.heading, codes: g.codes, extra: undefined as string | undefined, rows: g.rows }));

  units.forEach((unit, index) => {
    if (!unit.heading) {
      warnings.push(`${page.path}: ${unit.rows.length} price rows before the first model heading skipped`);
      return;
    }
    const brandId = brandForName(unit.heading) ?? titleBrand ?? pathBrand!.brandId;
    const categoryId = categoryForName(unit.heading, pathBrand?.categoryId ?? "smartphone");
    const name = displayName(unit.heading, brandId);
    if (!single && (/vervangen|repareren|herstel/i.test(unit.heading) || /^macbook (pro|air)$/i.test(name))) {
      warnings.push(`${page.path}: heading "${unit.heading}" is not a model; ${unit.rows.length} rows skipped`);
      return;
    }
    const key = nameKey(brandId, name);
    const names = [unit.heading, unit.extra ?? "", name, `${BRANDS.find((b) => b.id === brandId)?.name} ${name}`].filter(Boolean);
    const rows: PriceRow[] = [];
    for (const r of unit.rows) {
      const price = parsePriceCell(r.raw);
      if (!price) {
        warnings.push(`${page.path}: unreadable price "${r.raw}" for "${r.label}"`);
        continue;
      }
      const label = stripDeviceName(r.label, names);
      const links = r.links
        .map((l) => ({ text: l.text, href: resolveLink(l.href) }))
        .filter((l): l is { text: string; href: string } => !!l.href && label.includes(l.text));
      rows.push({
        label,
        raw: r.raw,
        ...price,
        repairId: repairForLabel(label),
        ...(r.popular ? { popular: true } : {}),
        ...(links.length ? { links } : {}),
      });
    }
    const candidate: Candidate = {
      key,
      brandId,
      categoryId,
      name,
      series: displayName(fact?.series ?? "", brandId) || seriesFromName(name),
      aliases: new Set([unit.heading, ...(unit.extra ? [unit.extra] : []), ...unit.codes].map((a) => a.replace(/\s+/g, " ").trim())),
      order: (fact?.order ?? fallbackOrder++) * 100 + index,
      dedicated: single,
      page,
      rows,
      legacyUrls: new Set(single ? [page.path] : []),
    };
    const existing = candidates.get(key);
    if (!existing) {
      candidates.set(key, candidate);
      return;
    }
    // Same model on a dedicated page and in an overview table: the dedicated page wins,
    // unless it is older than the overview.
    const preferNew =
      (candidate.dedicated && !existing.dedicated) ||
      (candidate.dedicated === existing.dedicated && candidate.page.modified > existing.page.modified);
    const [keep, drop] = preferNew ? [candidate, existing] : [existing, candidate];
    // Two tables on the same page for one model: combine their rows.
    if (keep.page === drop.page) {
      const labels = new Set(keep.rows.map((r) => r.label.toLowerCase()));
      keep.rows.push(...drop.rows.filter((r) => !labels.has(r.label.toLowerCase())));
    }
    for (const a of drop.aliases) keep.aliases.add(a);
    for (const l of drop.legacyUrls) keep.legacyUrls.add(l);
    keep.order = Math.min(keep.order, drop.order);
    if (keep.series === seriesFromName(keep.name) && drop.series !== seriesFromName(drop.name)) keep.series = drop.series;
    candidates.set(key, keep);
    warnings.push(`duplicate ${name}: kept ${keep.page.path} (${keep.rows.length} rows), also in ${drop.page.path} (${drop.rows.length} rows)`);
  });
}

/* ----------------------------------------------------------------- report */
const list = [...candidates.values()].sort((a, b) => a.order - b.order);
const byBrand = new Map<string, Candidate[]>();
for (const c of list) byBrand.set(c.brandId, [...(byBrand.get(c.brandId) ?? []), c]);
const rowCount = list.reduce((n, c) => n + c.rows.length, 0);
console.log(`Export ${exportedAt}: ${list.length} devices, ${rowCount} price rows`);
for (const [brand, cs] of byBrand) {
  const cats = [...new Set(cs.map((c) => c.categoryId))].join("/");
  console.log(`  ${brand.padEnd(9)} ${String(cs.length).padStart(4)} devices (${cats})  e.g. ${cs.slice(0, 4).map((c) => c.name).join(", ")}`);
}
const unmapped = list.flatMap((c) => c.rows).filter((r) => r.repairId === "overige-reparaties");
console.log(`rows → overige-reparaties: ${unmapped.length}; accessories: ${list.flatMap((c) => c.rows).filter((r) => !r.repairId).length}`);
if (process.argv.includes("--verbose")) {
  for (const w of warnings) console.log("  ! " + w);
  for (const c of list) console.log(`${c.brandId}\t${c.series}\t${c.name}\t${c.rows.length}\t${c.page.path}\t[${[...c.aliases].join(" | ")}]`);
}
console.log(`${warnings.length} warnings (--verbose to list)`);

if (!write) process.exit(0);

/* ------------------------------------------------------------------ write */
type OldDevice = { id: string; brandId: string; slug: string; releaseYear?: number; popular?: boolean; art?: string };
const oldDevices: OldDevice[] = (() => {
  const path = join(ROOT, "src/data/devices.json");
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  return ["apple", "samsung", "huawei", "oneplus", "xiaomi", "sony", "lg"].flatMap((b) => {
    const p = join(ROOT, `src/data/devices/${b}.json`);
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
  });
})();
const hint = new Map(oldDevices.map((d) => [`${d.brandId}/${d.slug}`, d]));

const yoast = (page: WxrItem) => {
  const clean = (s: string | undefined, max: number) =>
    s && !/%%|9[.,]8|beoordeling/i.test(s) && s.length <= max ? s.replace(/\s+/g, " ").trim() : undefined;
  // Old-style titles ("… reparatie - Phone Repairs - bel: 073-8220013") are replaced by the
  // site's own title format (SEO audit HV Media, 2026-10-13); hand-written titles are kept.
  const title = clean(page.meta._yoast_wpseo_title, 70);
  const seo = { title: title && !/\bbel:?\s*073/i.test(title) ? title : undefined, description: clean(page.meta._yoast_wpseo_metadesc, 170) };
  return seo.title || seo.description ? seo : undefined;
};

const usedSlugs = new Set<string>();
const devices = list.map((c) => {
  let slug = slugify(c.name);
  while (usedSlugs.has(`${c.brandId}/${slug}`)) slug = `${slug}-2`;
  usedSlugs.add(`${c.brandId}/${slug}`);
  const old = hint.get(`${c.brandId}/${slug}`);
  const releaseYear = old?.releaseYear ?? yearFromName(c.name);
  c.aliases.delete(c.name);
  return {
    id: `${c.brandId}-${slug}`,
    slug,
    name: c.name,
    brandId: c.brandId,
    categoryId: c.categoryId,
    series: c.series,
    order: c.order,
    ...(releaseYear ? { releaseYear } : {}),
    art: artFor(c.name, c.brandId, c.categoryId),
    popular: old?.popular ?? false,
    aliases: [...c.aliases].filter((a) => a && a.toLowerCase() !== c.name.toLowerCase()),
    repairs: [...new Set(c.rows.map((r) => r.repairId).filter((r): r is string => !!r))],
    legacyUrls: [...c.legacyUrls].map((p) => `${ORIGIN}${p}/`),
    sources: [sourceFor(c.page)],
    ...(c.dedicated && yoast(c.page) ? { seo: yoast(c.page) } : {}),
    extra: { wordpress: { pageId: c.page.id, pageTitle: c.page.title, modified: c.page.modified } },
  };
});

const priceLists = list.map((c, i) => ({
  deviceId: devices[i].id,
  sourceUrl: `${ORIGIN}${c.page.path}/`,
  capturedAt: exportedAt,
  updatedAt: c.page.modified.slice(0, 10),
  rows: c.rows,
}));

const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
writeFileSync(join(ROOT, "src/data/devices.json"), json(devices));
writeFileSync(join(ROOT, "src/data/price-lists.json"), json(priceLists));

// Brands: keep hand-written fields, refresh categories and original URLs.
type BrandJson = { id: string; name: string; categories: string[]; popular: boolean; order: number; legacyUrls: string[]; sources: Source[] };
const oldBrands: BrandJson[] = JSON.parse(readFileSync(join(ROOT, "src/data/brands.json"), "utf8"));
const brandRoots = new Map<string, string[]>();
for (const [path, fact] of facts) {
  const b = fact.brandRoot ? brandForPath(path)?.brandId ?? brandForName(fact.label) : null;
  if (b) brandRoots.set(b, [...(brandRoots.get(b) ?? []), path]);
}
const brands = BRANDS.filter((b) => byBrand.has(b.id)).map((b) => {
  const old = oldBrands.find((o) => o.id === b.id);
  const order = ["smartphone", "tablet", "laptop"];
  const roots = brandRoots.get(b.id) ?? [];
  const rootPage = pages.find((p) => p.path === roots[0]);
  return {
    id: b.id,
    name: b.name,
    categories: [...new Set(byBrand.get(b.id)!.map((c) => c.categoryId))].sort((x, y) => order.indexOf(x) - order.indexOf(y)),
    popular: old?.popular ?? ["apple", "samsung"].includes(b.id),
    order: b.order,
    legacyUrls: roots.map((p) => `${ORIGIN}${p}/`),
    sources: rootPage ? [sourceFor(rootPage)] : (old?.sources ?? []),
  };
});
writeFileSync(join(ROOT, "src/data/brands.json"), json(brands));

// URL inventory: every original device, series and brand URL gets a 301 to its new page.
type UrlRecord = { url: string; discoveredVia: string; pageType: string; status: string; targetPath: string | null; redirect: boolean; title?: string; notes?: string };
const inventoryPath = join(ROOT, "src/data/url-inventory.json");
const inventory: UrlRecord[] = JSON.parse(readFileSync(inventoryPath, "utf8"));
const byUrl = new Map(inventory.map((r) => [r.url, r]));
const upsert = (rec: UrlRecord) => {
  const old = byUrl.get(rec.url);
  byUrl.set(rec.url, old ? { ...old, ...rec, notes: old.notes ?? rec.notes, discoveredVia: old.discoveredVia } : rec);
};
devices.forEach((d) => {
  for (const url of d.legacyUrls) {
    upsert({ url, discoveredVia: "manual", pageType: "device", status: "redirected", targetPath: `/reparaties/${d.brandId}/${d.slug}`, redirect: true, title: d.extra.wordpress.pageTitle, notes: `WordPress export ${exportedAt}` });
  }
});
for (const b of brands) {
  for (const url of b.legacyUrls) {
    upsert({ url, discoveredVia: "manual", pageType: "brand", status: "redirected", targetPath: `/reparaties/${b.id}`, redirect: true, notes: `WordPress export ${exportedAt}` });
  }
}
for (const path of seriesPages) {
  const url = `${ORIGIN}${path}/`;
  if (byUrl.has(url) && byUrl.get(url)!.pageType !== "brand") continue;
  const brandId = brandForPath(path)?.brandId ?? brandForName(pages.find((p) => p.path === path)?.title ?? "");
  if (!brandId || !brands.some((b) => b.id === brandId) || devices.some((d) => d.legacyUrls.includes(url))) continue;
  upsert({ url, discoveredVia: "manual", pageType: "brand", status: "redirected", targetPath: `/reparaties/${brandId}`, redirect: true, title: pages.find((p) => p.path === path)?.title, notes: `Series/overview page, WordPress export ${exportedAt}` });
}
// Text content: info pages, FAQs, blog posts.
const content = importContent(items, exportedAt, ROOT);
for (const line of content.report) console.log(line);
for (const slug of content.removedBlogSlugs) {
  upsert({ url: `${ORIGIN}/blog-post/${slug}/`, discoveredVia: "manual", pageType: "blog", status: "redirected", targetPath: "/blog-post", redirect: true, notes: `Post no longer published (WordPress trash); WordPress export ${exportedAt}` });
}

// Info pages keep their original URL.
for (const def of INFO_PAGES) {
  const page = pages.find((p) => p.path === def.path);
  if (page) upsert({ url: `${ORIGIN}${def.path}/`, discoveredVia: "manual", pageType: "info", status: "migrated", targetPath: def.path, redirect: false, title: page.title, notes: `Kept on its original URL; WordPress export ${exportedAt}` });
}

// Remaining pages of the old site, mapped to their counterpart (only where no decision exists yet).
const landingPages = readEntries<{ path: string; kind: string; place?: string }>(ROOT, PAGES_DIR);
const livePaths = new Set(landingPages.map((p) => p.path));
const MAPPED: [RegExp, string][] = [
  [/^\/(iphone|telefoon)-batterij-vervang(en|ing)(-den-bosch)?$/, "/reparatie/batterij-vervangen"],
  [/^\/telefoon-scherm-reparatie-den-bosch$/, "/reparatie/scherm-vervangen"],
  [/^\/oplaadpoort-reparatie-den-bosch$/, "/reparatie/oplaadpoort-repareren"],
  [/^\/iphone-compatibel-oled-schermen$/, "/iphone-premium-oled-scherm"],
  [/^\/openingstijden-phone-repairs$/, "/contact"],
  [/^\/afspraak-met-phone-repairs-maken$/, "/afspraak"],
  [/^\/(beoordelingen-phone-repairs|telefoonwinkel-den-bosch|veelgestelde-vragen\/sitemap-phone-repairs)$/, "/"],
  // Series and overview pages without own counterpart (SEO audit HV Media, 2026-10-13): to the brand.
  [/^\/(iphone-[\w-]*serie+(-\d)?|iphone-air-serie)$/, "/reparaties/apple"],
  [/^\/(google-)?pixel-[\w-]*serie$/, "/reparaties/google"],
  [/^\/(samsung-z-flip|samsung-reparatie-den-bosch-\d)$/, "/reparaties/samsung"],
  [/^\/umidigi-reparatie$/, "/bijzondere-merken-reparatie"],
  [/^\/helpie_faq_page$/, "/veelgestelde-vragen"],
  [/^\/onze-diensten$/, "/reparaties"],
  [/^\/onderdelen$/, "/originele-onderdelen-phone-repairs"],
  [/^\/boekapparaat$/, "/afspraak"],
  // Account, vacancy and test pages of the old site.
  [/^\/(test|mijn-account|status-van-de-vacature|bekijk-je-vacature)$/, "/"],
];
const AREA = /^\/(?:telefoon|gsm|iphone|ipad|mobiel|scherm|smartphone|samsung|huawei)-reparaties?-(.+?)(?:-\d)?$/;
for (const page of pages) {
  const url = `${ORIGIN}${page.path}/`;
  if (byUrl.has(url) || livePaths.has(page.path) || page.path === "/") continue;
  const mapped = MAPPED.find(([re]) => re.test(page.path))?.[1];
  const area = page.path.match(AREA);
  let target = mapped;
  if (!target && area) {
    const place = area[1].replace(/-den-bosch$/, "");
    const same = landingPages.filter((l) => l.kind === "area" && l.place && slugify(l.place) === place);
    target = same.find((l) => l.path.startsWith("/telefoon-"))?.path ?? same[0]?.path ?? (/den-bosch|professioneel|centrum/.test(place) ? "/" : "/werkgebied");
  }
  if (!target) continue;
  upsert({ url, discoveredVia: "manual", pageType: area ? "area" : "info", status: "redirected", targetPath: target, redirect: true, title: page.title, notes: `${area ? "Area page bundled per place" : "Mapped to its counterpart"}; WordPress export ${exportedAt}` });
}

writeFileSync(inventoryPath, "[\n" + [...byUrl.values()].map((r) => "  " + JSON.stringify(r)).join(",\n") + "\n]\n");
console.log(`Wrote ${devices.length} devices, ${priceLists.length} price lists, ${brands.length} brands, ${byUrl.size} URL records.`);
