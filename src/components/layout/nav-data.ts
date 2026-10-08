import {
  brandPath,
  brands,
  categories,
  devicePath,
  devicesForBrand,
  repairPath,
  repairs,
} from "@/lib/catalog";

export const mainNav = [
  { label: "Werkwijze", href: "/werkwijze" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Veelgestelde vragen", href: "/veelgestelde-vragen" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavData = ReturnType<typeof getNavData>;

/** Serialisable menu data built on the server and passed to the client header. */
export function getNavData() {
  return {
    categories: categories.map((c) => ({
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
      .map((r) => ({ name: r.name, summary: r.summary, href: repairPath(r.slug), icon: r.icon })),
  };
}
