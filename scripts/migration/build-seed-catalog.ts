/**
 * Generates the seed device catalog in src/data/devices/*.json.
 *
 * The seed catalog contains public product names only. It is NOT proof that
 * Phone Repairs repairs every listed model, and it contains no prices.
 * Once the original site is crawled or exported, `npm run migrate` output
 * replaces/enriches these records (legacy URLs, prices, original copy).
 *
 * Run: npx tsx scripts/migration/build-seed-catalog.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DeviceArt, DeviceModel, SourceRef } from "../../src/types/content";
import { SEED_CAPTURED_AT, SOURCE_URLS } from "../../src/lib/sources";

type Row = [name: string, year: number, art: DeviceArt, popular?: boolean];

const catalogNote: SourceRef = {
  url: SOURCE_URLS.home,
  verification: "search-index",
  capturedAt: SEED_CAPTURED_AT,
  note: "Homepage model menu lists iPhone and Samsung models (iPhone 7 up to Galaxy S26 Ultra) per search-index snapshot; exact list to confirm.",
};

const demoNote = (brand: string): SourceRef => ({
  url: SOURCE_URLS.home,
  verification: "demo",
  capturedAt: SEED_CAPTURED_AT,
  note: `${brand} is named as a supported brand; model list is a JUNE Studio seed and must be confirmed.`,
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/["”]/g, "")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function build(
  brandId: string,
  categoryId: string,
  series: string,
  rows: Row[],
  source: SourceRef,
  aliasPrefix?: string,
): DeviceModel[] {
  return rows.map(([name, releaseYear, art, popular]) => {
    const slug = slugify(name);
    const aliases = aliasPrefix ? [name.replace(aliasPrefix, "").trim()] : [];
    return {
      id: `${brandId}-${slug}`,
      slug,
      name,
      brandId,
      categoryId,
      series,
      releaseYear,
      art,
      popular: popular ?? false,
      aliases,
      legacyUrls: [],
      sources: [source],
    };
  });
}

const iphones: Row[] = [
  ["iPhone 7", 2016, "phone-home-button"],
  ["iPhone 7 Plus", 2016, "phone-home-button"],
  ["iPhone 8", 2017, "phone-home-button"],
  ["iPhone 8 Plus", 2017, "phone-home-button"],
  ["iPhone X", 2017, "phone-notch"],
  ["iPhone XR", 2018, "phone-notch"],
  ["iPhone XS", 2018, "phone-notch"],
  ["iPhone XS Max", 2018, "phone-notch"],
  ["iPhone 11", 2019, "phone-notch", true],
  ["iPhone 11 Pro", 2019, "phone-notch"],
  ["iPhone 11 Pro Max", 2019, "phone-notch"],
  ["iPhone SE (2020)", 2020, "phone-home-button"],
  ["iPhone 12 mini", 2020, "phone-notch"],
  ["iPhone 12", 2020, "phone-notch", true],
  ["iPhone 12 Pro", 2020, "phone-notch"],
  ["iPhone 12 Pro Max", 2020, "phone-notch"],
  ["iPhone 13 mini", 2021, "phone-notch"],
  ["iPhone 13", 2021, "phone-notch", true],
  ["iPhone 13 Pro", 2021, "phone-notch"],
  ["iPhone 13 Pro Max", 2021, "phone-notch"],
  ["iPhone SE (2022)", 2022, "phone-home-button"],
  ["iPhone 14", 2022, "phone-notch", true],
  ["iPhone 14 Plus", 2022, "phone-notch"],
  ["iPhone 14 Pro", 2022, "phone-island"],
  ["iPhone 14 Pro Max", 2022, "phone-island"],
  ["iPhone 15", 2023, "phone-island", true],
  ["iPhone 15 Plus", 2023, "phone-island"],
  ["iPhone 15 Pro", 2023, "phone-island", true],
  ["iPhone 15 Pro Max", 2023, "phone-island"],
  ["iPhone 16", 2024, "phone-island", true],
  ["iPhone 16 Plus", 2024, "phone-island"],
  ["iPhone 16 Pro", 2024, "phone-island", true],
  ["iPhone 16 Pro Max", 2024, "phone-island"],
  ["iPhone 16e", 2025, "phone-notch"],
  ["iPhone 17", 2025, "phone-island"],
  ["iPhone Air", 2025, "phone-island"],
  ["iPhone 17 Pro", 2025, "phone-island", true],
  ["iPhone 17 Pro Max", 2025, "phone-island"],
];

const ipads: Row[] = [
  ["iPad (9e generatie)", 2021, "tablet-home-button"],
  ["iPad (10e generatie)", 2022, "tablet"],
  ["iPad (A16)", 2025, "tablet"],
  ["iPad mini (6e generatie)", 2021, "tablet"],
  ["iPad mini (A17 Pro)", 2024, "tablet"],
  ["iPad Air (5e generatie)", 2022, "tablet"],
  ["iPad Air 11-inch (M2)", 2024, "tablet"],
  ["iPad Air 13-inch (M2)", 2024, "tablet"],
  ["iPad Pro 11-inch (4e generatie)", 2022, "tablet"],
  ["iPad Pro 12.9-inch (6e generatie)", 2022, "tablet"],
  ["iPad Pro 11-inch (M4)", 2024, "tablet"],
  ["iPad Pro 13-inch (M4)", 2024, "tablet"],
];

const macbooks: Row[] = [
  ["MacBook Air 13-inch (M1, 2020)", 2020, "laptop"],
  ["MacBook Air 13-inch (M2, 2022)", 2022, "laptop"],
  ["MacBook Air 15-inch (M2, 2023)", 2023, "laptop"],
  ["MacBook Air 13-inch (M3, 2024)", 2024, "laptop"],
  ["MacBook Air 15-inch (M3, 2024)", 2024, "laptop"],
  ["MacBook Air 13-inch (M4, 2025)", 2025, "laptop"],
  ["MacBook Pro 13-inch (M1, 2020)", 2020, "laptop"],
  ["MacBook Pro 14-inch (M3, 2023)", 2023, "laptop"],
  ["MacBook Pro 16-inch (M3 Pro, 2023)", 2023, "laptop"],
  ["MacBook Pro 14-inch (M4, 2024)", 2024, "laptop"],
  ["MacBook Pro 16-inch (M4 Pro, 2024)", 2024, "laptop"],
];

const galaxyS: Row[] = [
  ["Galaxy S20", 2020, "phone-punch-hole"],
  ["Galaxy S20+", 2020, "phone-punch-hole"],
  ["Galaxy S20 Ultra", 2020, "phone-punch-hole"],
  ["Galaxy S20 FE", 2020, "phone-punch-hole"],
  ["Galaxy S21", 2021, "phone-punch-hole"],
  ["Galaxy S21+", 2021, "phone-punch-hole"],
  ["Galaxy S21 Ultra", 2021, "phone-punch-hole"],
  ["Galaxy S21 FE", 2022, "phone-punch-hole"],
  ["Galaxy S22", 2022, "phone-punch-hole", true],
  ["Galaxy S22+", 2022, "phone-punch-hole"],
  ["Galaxy S22 Ultra", 2022, "phone-punch-hole"],
  ["Galaxy S23", 2023, "phone-punch-hole", true],
  ["Galaxy S23+", 2023, "phone-punch-hole"],
  ["Galaxy S23 Ultra", 2023, "phone-punch-hole"],
  ["Galaxy S23 FE", 2023, "phone-punch-hole"],
  ["Galaxy S24", 2024, "phone-punch-hole", true],
  ["Galaxy S24+", 2024, "phone-punch-hole"],
  ["Galaxy S24 Ultra", 2024, "phone-punch-hole", true],
  ["Galaxy S24 FE", 2024, "phone-punch-hole"],
  ["Galaxy S25", 2025, "phone-punch-hole", true],
  ["Galaxy S25+", 2025, "phone-punch-hole"],
  ["Galaxy S25 Ultra", 2025, "phone-punch-hole"],
  ["Galaxy S25 Edge", 2025, "phone-punch-hole"],
  ["Galaxy S25 FE", 2025, "phone-punch-hole"],
  ["Galaxy S26", 2026, "phone-punch-hole"],
  ["Galaxy S26+", 2026, "phone-punch-hole"],
  ["Galaxy S26 Ultra", 2026, "phone-punch-hole"],
];

const galaxyA: Row[] = [
  ["Galaxy A14", 2023, "phone-punch-hole"],
  ["Galaxy A15", 2023, "phone-punch-hole"],
  ["Galaxy A16", 2024, "phone-punch-hole"],
  ["Galaxy A25", 2023, "phone-punch-hole"],
  ["Galaxy A26", 2025, "phone-punch-hole"],
  ["Galaxy A34", 2023, "phone-punch-hole"],
  ["Galaxy A35", 2024, "phone-punch-hole"],
  ["Galaxy A36", 2025, "phone-punch-hole"],
  ["Galaxy A52", 2021, "phone-punch-hole"],
  ["Galaxy A53", 2022, "phone-punch-hole"],
  ["Galaxy A54", 2023, "phone-punch-hole", true],
  ["Galaxy A55", 2024, "phone-punch-hole"],
  ["Galaxy A56", 2025, "phone-punch-hole"],
];

const galaxyZ: Row[] = [
  ["Galaxy Z Flip5", 2023, "phone-flip"],
  ["Galaxy Z Flip6", 2024, "phone-flip"],
  ["Galaxy Z Flip7", 2025, "phone-flip"],
  ["Galaxy Z Fold5", 2023, "phone-foldable"],
  ["Galaxy Z Fold6", 2024, "phone-foldable"],
  ["Galaxy Z Fold7", 2025, "phone-foldable"],
];

const galaxyTab: Row[] = [
  ["Galaxy Tab A9+", 2023, "tablet"],
  ["Galaxy Tab S9", 2023, "tablet"],
  ["Galaxy Tab S9 FE", 2023, "tablet"],
  ["Galaxy Tab S10+", 2024, "tablet"],
];

const huawei: Row[] = [
  ["Huawei P Smart 2021", 2020, "phone-punch-hole"],
  ["Huawei P30", 2019, "phone-notch"],
  ["Huawei P30 Pro", 2019, "phone-notch"],
  ["Huawei P30 Lite", 2019, "phone-notch"],
  ["Huawei P40 Lite", 2020, "phone-punch-hole"],
  ["Huawei P40 Pro", 2020, "phone-punch-hole"],
  ["Huawei Mate 20 Pro", 2018, "phone-notch"],
];

const oneplus: Row[] = [
  ["OnePlus 9", 2021, "phone-punch-hole"],
  ["OnePlus 10 Pro", 2022, "phone-punch-hole"],
  ["OnePlus 11", 2023, "phone-punch-hole"],
  ["OnePlus 12", 2024, "phone-punch-hole"],
  ["OnePlus 13", 2025, "phone-punch-hole"],
  ["OnePlus Nord 3", 2023, "phone-punch-hole"],
  ["OnePlus Nord CE 3 Lite", 2023, "phone-punch-hole"],
];

const xiaomi: Row[] = [
  ["Redmi Note 12", 2023, "phone-punch-hole"],
  ["Redmi Note 13", 2024, "phone-punch-hole"],
  ["Redmi Note 13 Pro", 2024, "phone-punch-hole"],
  ["Redmi Note 14", 2025, "phone-punch-hole"],
  ["Xiaomi 13T", 2023, "phone-punch-hole"],
  ["Xiaomi 14", 2024, "phone-punch-hole"],
];

const sony: Row[] = [
  ["Xperia 1 V", 2023, "phone-punch-hole"],
  ["Xperia 5 IV", 2022, "phone-punch-hole"],
  ["Xperia 10 V", 2023, "phone-punch-hole"],
  ["Xperia 10 VI", 2024, "phone-punch-hole"],
];

const lg: Row[] = [
  ["LG G7 ThinQ", 2018, "phone-notch"],
  ["LG G8s ThinQ", 2019, "phone-notch"],
  ["LG Velvet", 2020, "phone-punch-hole"],
  ["LG K42", 2020, "phone-punch-hole"],
];

const catalog: Record<string, DeviceModel[]> = {
  apple: [
    ...build("apple", "smartphone", "iPhone", iphones, catalogNote),
    ...build("apple", "tablet", "iPad", ipads, demoNote("Apple iPad")),
    ...build("apple", "laptop", "MacBook", macbooks, demoNote("Apple MacBook")),
  ],
  samsung: [
    ...build("samsung", "smartphone", "Galaxy S", galaxyS, catalogNote, "Galaxy"),
    ...build("samsung", "smartphone", "Galaxy A", galaxyA, demoNote("Samsung"), "Galaxy"),
    ...build("samsung", "smartphone", "Galaxy Z", galaxyZ, demoNote("Samsung"), "Galaxy"),
    ...build("samsung", "tablet", "Galaxy Tab", galaxyTab, demoNote("Samsung"), "Galaxy"),
  ],
  huawei: build("huawei", "smartphone", "Huawei", huawei, demoNote("Huawei"), "Huawei"),
  oneplus: build("oneplus", "smartphone", "OnePlus", oneplus, demoNote("OnePlus"), "OnePlus"),
  xiaomi: build("xiaomi", "smartphone", "Xiaomi", xiaomi, demoNote("Xiaomi")),
  sony: build("sony", "smartphone", "Xperia", sony, demoNote("Sony")),
  lg: build("lg", "smartphone", "LG", lg, demoNote("LG"), "LG"),
};

// The Galaxy S23 has a known page on the original site.
const s23 = catalog.samsung.find((d) => d.slug === "galaxy-s23");
if (s23) {
  s23.legacyUrls = ["/samsung-reparatie-den-bosch/samsung-s23/"];
  s23.sources.push({
    url: SOURCE_URLS.samsungS23,
    verification: "search-index",
    capturedAt: SEED_CAPTURED_AT,
    note: "Original page: uses original Samsung service packs; prices include fitting and 21% VAT.",
  });
}

const outDir = join(process.cwd(), "src/data/devices");
mkdirSync(outDir, { recursive: true });
let total = 0;
for (const [brand, models] of Object.entries(catalog)) {
  const slugs = new Set<string>();
  for (const m of models) {
    if (slugs.has(m.slug)) throw new Error(`Duplicate slug ${brand}/${m.slug}`);
    slugs.add(m.slug);
  }
  writeFileSync(join(outDir, `${brand}.json`), JSON.stringify(models, null, 2) + "\n");
  total += models.length;
}
console.log(`Wrote ${total} seed device records to ${outDir}`);
