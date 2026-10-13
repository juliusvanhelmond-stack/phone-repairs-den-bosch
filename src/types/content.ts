import { z } from "zod";

/**
 * Content model for Phone Repairs.
 *
 * Every record that originates from the existing website carries `sources`,
 * so each value on the new site can be traced back to an original URL.
 * Unknown fields from imports are preserved in `extra` instead of discarded.
 */

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case");

/**
 * How trustworthy a piece of content is.
 * - `verified-source`: extracted from the live original page (crawler/export).
 * - `search-index`: seen in a public search-engine snapshot of the original page;
 *   must be confirmed against the live page before launch.
 * - `owner-confirmed`: confirmed directly by Phone Repairs.
 * - `demo`: written by JUNE Studio for the demo; never presented as a fact.
 */
export const verificationSchema = z.enum([
  "verified-source",
  "search-index",
  "owner-confirmed",
  "demo",
]);
export type Verification = z.infer<typeof verificationSchema>;

export const sourceRefSchema = z.object({
  url: z.url(),
  verification: verificationSchema,
  capturedAt: z.iso.date().optional(),
  note: z.string().optional(),
});
export type SourceRef = z.infer<typeof sourceRefSchema>;

export const seoMetaSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(170).optional(),
  canonicalPath: z.string().startsWith("/").optional(),
  noindex: z.boolean().optional(),
});
export type SeoMeta = z.infer<typeof seoMetaSchema>;

const extraSchema = z.record(z.string(), z.unknown()).optional();

export const deviceCategorySchema = z.object({
  id: slugSchema,
  name: z.string(),
  plural: z.string(),
  description: z.string(),
  order: z.number().int(),
});
export type DeviceCategory = z.infer<typeof deviceCategorySchema>;

export const brandSchema = z.object({
  id: slugSchema,
  name: z.string(),
  categories: z.array(slugSchema).min(1),
  popular: z.boolean().default(false),
  order: z.number().int(),
  legacyUrls: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).default([]),
  seo: seoMetaSchema.optional(),
});
export type Brand = z.infer<typeof brandSchema>;

/** Visual used for the device; the site draws devices as SVG, no stock photos. */
export const deviceArtSchema = z.enum([
  "phone-home-button",
  "phone-notch",
  "phone-island",
  "phone-punch-hole",
  "phone-foldable",
  "phone-flip",
  "tablet",
  "tablet-home-button",
  "laptop",
]);
export type DeviceArt = z.infer<typeof deviceArtSchema>;

export const deviceModelSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  name: z.string(),
  brandId: slugSchema,
  categoryId: slugSchema,
  series: z.string(),
  /** Position in the original site's menu (lower = shown first, newest models first). */
  order: z.number().int().default(0),
  releaseYear: z.number().int().min(2010).max(2030).optional(),
  art: deviceArtSchema,
  popular: z.boolean().default(false),
  aliases: z.array(z.string()).default([]),
  /** Overrides the category default set of repairs. */
  repairs: z.array(slugSchema).optional(),
  legacyUrls: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).default([]),
  seo: seoMetaSchema.optional(),
  extra: extraSchema,
});
export type DeviceModel = z.infer<typeof deviceModelSchema>;

export const repairServiceSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  name: z.string(),
  shortName: z.string(),
  summary: z.string(),
  description: z.array(z.string()).min(1),
  icon: z.string(),
  categories: z.array(slugSchema).min(1),
  order: z.number().int(),
  popular: z.boolean().default(false),
  /** Advice that is safety-relevant (e.g. water damage) shown prominently. */
  advice: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).default([]),
  seo: seoMetaSchema.optional(),
});
export type RepairService = z.infer<typeof repairServiceSchema>;

/**
 * A price for one repair on one device.
 * `amount: null` means the price is unknown and is shown as "op aanvraag".
 * A price is only rendered when `verified` is true and a source URL exists.
 */
export const repairPriceSchema = z
  .object({
    deviceId: slugSchema,
    repairId: slugSchema,
    amount: z.number().positive().nullable(),
    currency: z.literal("EUR"),
    includesVat: z.boolean(),
    includesLabour: z.boolean(),
    variant: z.string().optional(),
    verified: z.boolean(),
    sources: z.array(sourceRefSchema),
    capturedAt: z.iso.date().optional(),
    notes: z.string().optional(),
  })
  .refine((p) => !p.verified || (p.amount !== null && p.sources.length > 0), {
    message: "A verified price needs an amount and at least one source",
  });
export type RepairPrice = z.infer<typeof repairPriceSchema>;

/**
 * The full price table of one device, copied row by row from its original page.
 * `raw` is the cell text as published ("€210,-", "op aanvraag"); `amount` is parsed from it.
 * `repairId` links the row to one of our repair categories (null for accessories).
 */
export const priceRowSchema = z.object({
  label: z.string().min(1),
  raw: z.string(),
  amount: z.number().positive().nullable(),
  status: z.enum(["price", "on-request", "expected"]),
  repairId: slugSchema.nullable(),
});
export type PriceRow = z.infer<typeof priceRowSchema>;

export const priceListSchema = z
  .object({
    deviceId: slugSchema,
    sourceUrl: z.url(),
    /** Date of the export the rows were taken from. */
    capturedAt: z.iso.date(),
    /** Last change of the original page. */
    updatedAt: z.iso.date(),
    rows: z.array(priceRowSchema).min(1),
  })
  .refine((l) => l.rows.every((r) => (r.status === "price") === (r.amount !== null)), {
    message: "A row has an amount exactly when its status is 'price'",
  });
export type PriceList = z.infer<typeof priceListSchema>;

export const warrantyInfoSchema = z.object({
  id: slugSchema,
  scope: z.string(),
  durationMonths: z.number().int().positive().nullable(),
  terms: z.array(z.string()),
  verified: z.boolean(),
  sources: z.array(sourceRefSchema),
});
export type WarrantyInfo = z.infer<typeof warrantyInfoSchema>;

export const faqItemSchema = z.object({
  id: slugSchema,
  question: z.string(),
  answer: z.array(z.string()).min(1),
  topics: z.array(z.string()).default([]),
  /** Device/repair scoping; empty means general. */
  repairIds: z.array(slugSchema).default([]),
  sources: z.array(sourceRefSchema).default([]),
});
export type FaqItem = z.infer<typeof faqItemSchema>;

export const infoPageSchema = z.object({
  id: slugSchema,
  path: z.string().startsWith("/"),
  title: z.string(),
  legacyUrls: z.array(z.string()).default([]),
  body: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).default([]),
  seo: seoMetaSchema.optional(),
  extra: extraSchema,
});
export type InfoPage = z.infer<typeof infoPageSchema>;

export const blogArticleSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  title: z.string(),
  publishedAt: z.iso.date().optional(),
  updatedAt: z.iso.date().optional(),
  author: z.string().optional(),
  excerpt: z.string().optional(),
  /** Short summary of the original post, shown until the full text is migrated. */
  summary: z.array(z.string()).default([]),
  /** Full migrated body; empty until the post is exported from the original site. */
  bodyHtml: z.string().default(""),
  legacyUrls: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).default([]),
  seo: seoMetaSchema.optional(),
  extra: extraSchema,
});
export type BlogArticle = z.infer<typeof blogArticleSchema>;

export const claimSchema = z.object({
  id: slugSchema,
  title: z.string(),
  body: z.string(),
  icon: z.string(),
  sources: z.array(sourceRefSchema).min(1),
});
export type Claim = z.infer<typeof claimSchema>;

/** Migration status per discovered original URL. */
export const migrationStatusSchema = z.enum([
  "discovered",
  "fetched",
  "parsed",
  "mapped",
  "migrated",
  "redirected",
  "excluded",
  "blocked",
]);
export type MigrationStatus = z.infer<typeof migrationStatusSchema>;

export const urlRecordSchema = z.object({
  url: z.url(),
  discoveredVia: z.enum(["search-index", "sitemap", "wp-rest", "crawl", "inferred", "manual"]),
  pageType: z.enum(["home", "device", "brand", "repair", "area", "info", "faq", "blog", "booking", "unknown"]),
  status: migrationStatusSchema,
  targetPath: z.string().nullable(),
  redirect: z.boolean(),
  title: z.string().optional(),
  notes: z.string().optional(),
});
export type UrlRecord = z.infer<typeof urlRecordSchema>;

/**
 * Pages that keep their original URL on the new site: local area pages,
 * extra services (Nintendo Switch, pre-owned) and FAQ sub-pages.
 * `path` is the original path without trailing slash.
 */
export const landingSectionSchema = z.object({
  heading: z.string(),
  /** Paragraphs shown before the list (imported pages keep their reading order). */
  intro: z.array(z.string()).default([]),
  body: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
});
export type LandingSection = z.infer<typeof landingSectionSchema>;

export const areaFocusSchema = z.enum(["telefoon", "gsm", "smartphone", "mobiel", "iphone", "ipad", "scherm"]);
export type AreaFocus = z.infer<typeof areaFocusSchema>;

export const landingPageSchema = z.object({
  id: slugSchema,
  path: z.string().regex(/^(\/[a-z0-9-]+)+$/, "path must be a lowercase path without trailing slash"),
  kind: z.enum(["area", "service", "faq-topic"]),
  /** Title of the original page, kept for reference and SEO comparison. */
  originalTitle: z.string(),
  title: z.string(),
  eyebrow: z.string(),
  intro: z.string(),
  seo: z.object({ title: z.string().max(70), description: z.string().max(170) }),
  /** Area pages only. */
  place: z.string().optional(),
  placeKind: z.enum(["wijk", "plaats"]).optional(),
  focus: areaFocusSchema.optional(),
  sections: z.array(landingSectionSchema).default([]),
  /** Facts seen on the original page that are not published until the owner confirms them. */
  unconfirmed: z.array(z.string()).default([]),
  legacyUrls: z.array(z.string()).default([]),
  sources: z.array(sourceRefSchema).min(1),
});
export type LandingPage = z.infer<typeof landingPageSchema>;
