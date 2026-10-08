import { z } from "zod";
import {
  brandSchema,
  claimSchema,
  deviceCategorySchema,
  deviceModelSchema,
  faqItemSchema,
  repairPriceSchema,
  repairServiceSchema,
  warrantyInfoSchema,
  type Brand,
  type DeviceCategory,
  type DeviceModel,
  type RepairPrice,
  type RepairService,
} from "@/types/content";

import categoriesJson from "@/data/categories.json";
import brandsJson from "@/data/brands.json";
import repairsJson from "@/data/repairs.json";
import pricesJson from "@/data/prices.json";
import warrantyJson from "@/data/warranty.json";
import faqsJson from "@/data/faqs.json";
import claimsJson from "@/data/claims.json";
import apple from "@/data/devices/apple.json";
import samsung from "@/data/devices/samsung.json";
import huawei from "@/data/devices/huawei.json";
import oneplus from "@/data/devices/oneplus.json";
import xiaomi from "@/data/devices/xiaomi.json";
import sony from "@/data/devices/sony.json";
import lg from "@/data/devices/lg.json";

// Data is validated once at module load, so a malformed record fails the build.
const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const categories = z.array(deviceCategorySchema).parse(categoriesJson).sort(byOrder);
export const brands = z.array(brandSchema).parse(brandsJson).sort(byOrder);
export const repairs = z.array(repairServiceSchema).parse(repairsJson).sort(byOrder);
export const prices = z.array(repairPriceSchema).parse(pricesJson);
export const warranties = z.array(warrantyInfoSchema).parse(warrantyJson);
export const faqs = z.array(faqItemSchema).parse(faqsJson);
export const claims = z.array(claimSchema).parse(claimsJson);
export const devices = z
  .array(deviceModelSchema)
  .parse([...apple, ...samsung, ...huawei, ...oneplus, ...xiaomi, ...sony, ...lg]);

const brandById = new Map(brands.map((b) => [b.id, b]));
const categoryById = new Map(categories.map((c) => [c.id, c]));
const repairBySlug = new Map(repairs.map((r) => [r.slug, r]));
const deviceByPath = new Map(devices.map((d) => [`${d.brandId}/${d.slug}`, d]));
const priceByKey = new Map(prices.map((p) => [`${p.deviceId}:${p.repairId}`, p]));

export const getBrand = (id: string): Brand | undefined => brandById.get(id);
export const getCategory = (id: string): DeviceCategory | undefined => categoryById.get(id);
export const getRepair = (slug: string): RepairService | undefined => repairBySlug.get(slug);
export const getDevice = (brandId: string, slug: string): DeviceModel | undefined =>
  deviceByPath.get(`${brandId}/${slug}`);

/** Newest first, then by name. */
export function sortDevices(list: DeviceModel[]): DeviceModel[] {
  return [...list].sort(
    (a, b) => b.releaseYear - a.releaseYear || a.name.localeCompare(b.name, "nl", { numeric: true }),
  );
}

export function devicesForBrand(brandId: string, categoryId?: string): DeviceModel[] {
  return sortDevices(
    devices.filter((d) => d.brandId === brandId && (!categoryId || d.categoryId === categoryId)),
  );
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

/** Returns only prices that may be shown publicly. */
export function getVerifiedPrice(deviceId: string, repairId: string): RepairPrice | undefined {
  const price = priceByKey.get(`${deviceId}:${repairId}`);
  return price?.verified && price.amount !== null && price.sources.length > 0 ? price : undefined;
}

export function relatedDevices(device: DeviceModel, limit = 4): DeviceModel[] {
  const sameSeries = devices.filter(
    (d) => d.id !== device.id && d.brandId === device.brandId && d.series === device.series,
  );
  return sameSeries
    .sort(
      (a, b) =>
        Math.abs(a.releaseYear - device.releaseYear) - Math.abs(b.releaseYear - device.releaseYear) ||
        b.releaseYear - a.releaseYear,
    )
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
> & { repairs: string[]; prices: Record<string, number> };

export function finderIndex(): FinderDevice[] {
  return sortDevices(devices).map((d) => {
    const deviceRepairs = repairsForDevice(d).map((r) => r.id);
    const verified: Record<string, number> = {};
    for (const repairId of deviceRepairs) {
      const p = getVerifiedPrice(d.id, repairId);
      if (p?.amount) verified[repairId] = p.amount;
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
    };
  });
}
