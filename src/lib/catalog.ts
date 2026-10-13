import { z } from "zod";
import {
  blogArticleSchema,
  brandSchema,
  claimSchema,
  deviceCategorySchema,
  deviceModelSchema,
  faqItemSchema,
  landingPageSchema,
  priceListSchema,
  repairServiceSchema,
  warrantyInfoSchema,
  type Brand,
  type DeviceCategory,
  type DeviceModel,
  type LandingPage,
  type PriceList,
  type PriceRow,
  type RepairService,
} from "@/types/content";

import categoriesJson from "@/data/categories.json";
import brandsJson from "@/data/brands.json";
import repairsJson from "@/data/repairs.json";
import priceListsJson from "@/data/price-lists.json";
import devicesJson from "@/data/devices.json";
import warrantyJson from "@/data/warranty.json";
import faqsJson from "@/data/faqs.json";
import claimsJson from "@/data/claims.json";
import landingPagesJson from "@/data/landing-pages.json";
import blogJson from "@/data/blog.json";
import enJson from "@/data/translations/en.json";
import type { Locale } from "@/lib/i18n";

// Data is validated once at module load, so a malformed record fails the build.
const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const categories = z.array(deviceCategorySchema).parse(categoriesJson).sort(byOrder);
export const brands = z.array(brandSchema).parse(brandsJson).sort(byOrder);
export const repairs = z.array(repairServiceSchema).parse(repairsJson).sort(byOrder);
export const priceLists = z.array(priceListSchema).parse(priceListsJson);
export const warranties = z.array(warrantyInfoSchema).parse(warrantyJson);
export const faqs = z.array(faqItemSchema).parse(faqsJson);
export const claims = z.array(claimSchema).parse(claimsJson);
export const landingPages = z.array(landingPageSchema).parse(landingPagesJson);
export const blogPosts = z.array(blogArticleSchema).parse(blogJson);
export const devices = z.array(deviceModelSchema).parse(devicesJson);

const brandById = new Map(brands.map((b) => [b.id, b]));
const categoryById = new Map(categories.map((c) => [c.id, c]));
const repairBySlug = new Map(repairs.map((r) => [r.slug, r]));
const deviceByPath = new Map(devices.map((d) => [`${d.brandId}/${d.slug}`, d]));
const priceListByDevice = new Map(priceLists.map((l) => [l.deviceId, l]));

export const getBrand = (id: string): Brand | undefined => brandById.get(id);
export const getCategory = (id: string): DeviceCategory | undefined => categoryById.get(id);
export const getRepair = (slug: string): RepairService | undefined => repairBySlug.get(slug);
export const getDevice = (brandId: string, slug: string): DeviceModel | undefined =>
  deviceByPath.get(`${brandId}/${slug}`);

/** In the order of the original site's menu (newest models first), then by name. */
export function sortDevices(list: DeviceModel[]): DeviceModel[] {
  return [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "nl", { numeric: true }));
}

export function devicesForBrand(brandId: string, categoryId?: string): DeviceModel[] {
  return sortDevices(
    devices.filter((d) => d.brandId === brandId && (!categoryId || d.categoryId === categoryId)),
  );
}

/**
 * Apple is shown per product line (client request): iPhone, iPad and MacBook are brands
 * to customers, "Apple" only distracts. URLs stay under /reparaties/apple.
 */
const APPLE_LINES: Record<string, string> = { smartphone: "iPhone", tablet: "iPad", laptop: "MacBook" };

/** Brand name as shown to visitors, per device category ("iPhone" for Apple smartphones). */
export function brandLabel(brandId: string, categoryId?: string): string {
  if (brandId === "apple" && categoryId && APPLE_LINES[categoryId]) return APPLE_LINES[categoryId];
  return brandById.get(brandId)?.name ?? brandId;
}

export type BrandEntry = { key: string; brandId: string; categoryId?: string; label: string; href: string };

/** Brands as visitors pick them: Apple split into iPhone, iPad and MacBook. */
export function brandEntries(categoryId?: string): BrandEntry[] {
  return brands
    .filter((b) => !categoryId || b.categories.includes(categoryId))
    .flatMap((b) => {
      if (b.id !== "apple") {
        const anchor = categoryId && b.categories.length > 1 ? `#${categoryId}` : "";
        return [{ key: b.id, brandId: b.id, categoryId, label: b.name, href: `${brandPath(b.id)}${anchor}` }];
      }
      return (categoryId ? [categoryId] : b.categories).map((c) => ({
        key: `apple-${c}`,
        brandId: b.id,
        categoryId: c,
        label: APPLE_LINES[c] ?? b.name,
        href: `${brandPath(b.id)}#${c}`,
      }));
    });
}

export function brandsForCategory(categoryId: string): Brand[] {
  return brands.filter((b) => b.categories.includes(categoryId));
}

export function repairsForDevice(device: DeviceModel): RepairService[] {
  if (device.repairs) {
    return device.repairs.map((slug) => repairBySlug.get(slug)).filter((r): r is RepairService => !!r);
  }
  return repairs.filter((r) => r.categories.includes(device.categoryId));
}

/**
 * The device's price table as published on the current site (verbatim rows with their
 * source URL). Every list comes from the client's WordPress export, so it may be shown.
 */
export const getPriceList = (deviceId: string): PriceList | undefined => priceListByDevice.get(deviceId);

/** Rows of one repair category, in the original order. */
export function priceRows(deviceId: string, repairId: string): PriceRow[] {
  return getPriceList(deviceId)?.rows.filter((r) => r.repairId === repairId) ?? [];
}

/** Lowest published price for a repair category ("vanaf €…"); undefined when all rows are on request. */
export function fromPrice(deviceId: string, repairId: string): number | undefined {
  const amounts = priceRows(deviceId, repairId).flatMap((r) => (r.amount === null ? [] : [r.amount]));
  return amounts.length ? Math.min(...amounts) : undefined;
}

/** Neighbours in the same series, closest in the menu first. */
export function relatedDevices(device: DeviceModel, limit = 4): DeviceModel[] {
  return devices
    .filter((d) => d.id !== device.id && d.brandId === device.brandId && d.series === device.series)
    .sort((a, b) => Math.abs(a.order - device.order) - Math.abs(b.order - device.order))
    .slice(0, limit);
}

export const popularDevices = sortDevices(devices.filter((d) => d.popular));

export const devicePath = (d: Pick<DeviceModel, "brandId" | "slug">) => `/reparaties/${d.brandId}/${d.slug}`;
export const brandPath = (brandId: string) => `/reparaties/${brandId}`;
export const repairPath = (slug: string) => `/reparatie/${slug}`;

export const generalWarranty = warranties.find((w) => w.id === "algemeen");

/** Lightweight shape sent to the client-side device finder. */
export type FinderDevice = Pick<
  DeviceModel,
  "id" | "slug" | "name" | "brandId" | "categoryId" | "series" | "releaseYear" | "art" | "aliases"
> & {
  repairs: string[];
  /** Lowest published price per repair category. */
  prices: Record<string, number>;
  /** Number of price rows per repair category (several part qualities). */
  options: Record<string, number>;
};

export function finderIndex(): FinderDevice[] {
  return sortDevices(devices).map((d) => {
    const deviceRepairs = repairsForDevice(d).map((r) => r.id);
    const verified: Record<string, number> = {};
    const options: Record<string, number> = {};
    for (const repairId of deviceRepairs) {
      const from = fromPrice(d.id, repairId);
      if (from) verified[repairId] = from;
      options[repairId] = priceRows(d.id, repairId).length;
    }
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      brandId: d.brandId,
      categoryId: d.categoryId,
      series: d.series,
      releaseYear: d.releaseYear,
      art: d.art,
      aliases: d.aliases,
      repairs: deviceRepairs,
      prices: verified,
      options,
    };
  });
}

const landingByPath = new Map(landingPages.map((p) => [p.path, p]));
export const getLandingPage = (path: string): LandingPage | undefined => landingByPath.get(path);
export const areaPages = landingPages.filter((p) => p.kind === "area");
export const servicePages = landingPages.filter((p) => p.kind === "service");
export const faqTopicPages = landingPages.filter((p) => p.kind === "faq-topic");

/** Places served, each with its area pages (original URLs), in data order. */
export function areasByPlace(): { place: string; placeKind: "wijk" | "plaats"; pages: LandingPage[] }[] {
  const groups = new Map<string, { place: string; placeKind: "wijk" | "plaats"; pages: LandingPage[] }>();
  for (const page of areaPages) {
    const place = page.place ?? page.title;
    const group = groups.get(place) ?? { place, placeKind: page.placeKind ?? "plaats", pages: [] };
    group.pages.push(page);
    groups.set(place, group);
  }
  return [...groups.values()];
}

export const blogPath = (slug: string) => `/blog-post/${slug}`;
export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

/* --------------------------------------------------------------------------
 * Translations. Content is stored in Dutch; English overlays live in
 * src/data/translations/en.json keyed by record id (same sources apply).
 * ------------------------------------------------------------------------ */
const landingSectionText = z.object({
  heading: z.string(),
  intro: z.array(z.string()).default([]),
  body: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
});
const translationsSchema = z.object({
  categories: z.record(z.string(), z.object({ name: z.string(), plural: z.string(), description: z.string() })),
  repairs: z.record(
    z.string(),
    z.object({
      name: z.string(),
      shortName: z.string(),
      summary: z.string(),
      description: z.array(z.string()),
      advice: z.array(z.string()),
    }),
  ),
  faqs: z.record(z.string(), z.object({ question: z.string(), answer: z.array(z.string()) })),
  claims: z.record(z.string(), z.object({ title: z.string(), body: z.string() })),
  landingPages: z.record(
    z.string(),
    z.object({
      title: z.string(),
      eyebrow: z.string(),
      intro: z.string(),
      seo: z.object({ title: z.string().max(70), description: z.string().max(170) }),
      sections: z.array(landingSectionText),
      unconfirmed: z.array(z.string()),
    }),
  ),
  blog: z.record(z.string(), z.object({ title: z.string(), excerpt: z.string(), summary: z.array(z.string()) })),
});
export const englishContent = translationsSchema.parse(enJson);

function overlay<T extends { id: string }, O extends object>(item: T, table: Record<string, O>, locale: Locale): T {
  if (locale === "nl") return item;
  const extra = table[item.id];
  return extra ? { ...item, ...extra } : item;
}

export const localizeCategory = (c: DeviceCategory, locale: Locale) => overlay(c, englishContent.categories, locale);
export const localizeRepair = (r: RepairService, locale: Locale) => overlay(r, englishContent.repairs, locale);
export const localizeFaq = (f: z.infer<typeof faqItemSchema>, locale: Locale) => overlay(f, englishContent.faqs, locale);
export const localizeClaim = (c: z.infer<typeof claimSchema>, locale: Locale) => overlay(c, englishContent.claims, locale);
export const localizeLanding = (p: LandingPage, locale: Locale) => overlay(p, englishContent.landingPages, locale);
export const localizeBlog = (p: z.infer<typeof blogArticleSchema>, locale: Locale) => overlay(p, englishContent.blog, locale);
