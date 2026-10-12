import {
  brandPath,
  brands,
  categories,
  devicePath,
  devicesForBrand,
  localizeCategory,
  localizeRepair,
  repairPath,
  repairs,
} from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

export const mainNav = [
  { label: "Werkwijze", labelEn: "How it works", href: "/werkwijze" },
  { label: "Over ons", labelEn: "About", href: "/over-ons" },
  { label: "Veelgestelde vragen", labelEn: "FAQ", href: "/veelgestelde-vragen" },
  { label: "Contact", labelEn: "Contact", href: "/contact" },
] as const;

export type NavData = ReturnType<typeof getNavData>;

/** Serialisable menu data built on the server and passed to the client header. */
export function getNavData(locale: Locale) {
  return {
    categories: categories.map((c) => localizeCategory(c, locale)).map((c) => ({
      id: c.id,
      name: c.plural,
      brands: brands
        .filter((b) => b.categories.includes(c.id))
        .map((b) => ({
          name: b.name,
          href: brandPath(b.id) + (b.categories.length > 1 ? `#${c.id}` : ""),
          models: devicesForBrand(b.id, c.id)
            .slice(0, 4)
            .map((d) => ({ name: d.name, href: devicePath(d) })),
        })),
    })),
    repairs: repairs
      .filter((r) => r.popular)
      .map((r) => localizeRepair(r, locale))
      .map((r) => ({ name: r.name, summary: r.summary, href: repairPath(r.slug), icon: r.icon })),
  };
}
