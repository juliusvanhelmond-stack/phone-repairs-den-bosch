import {
  brandEntries,
  categories,
  devicePath,
  devicesForBrand,
  getBlogPost,
  blogPath,
  landingPages,
  localizeCategory,
  localizeLanding,
  localizeRepair,
  repairPath,
  repairs,
} from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

/**
 * "Overig" in the header (client request 2026-10-31): the extra pages in the client's wording, shown from
 * the longest to the shortest name (client request 2026-11-03).
 */
const moreLinks: { label: string; labelEn?: string; page?: string; blog?: string; href?: string; external?: boolean }[] = [
  { label: "Hydrogel screenprotector", blog: "flexible-hydrogel-screen-protectors" },
  { label: "Waterschade reparatie", page: "waterschade-reparatie-phone-repairs" },
  { label: "Telefoon- en tablethulp", page: "telefoon-en-tablet-hulp" },
  { label: "Moederbord reparatie", page: "moederbord-reparatie-den-bosch" },
  { label: "Pre-owned toestellen", page: "pre-owned-toestellen" },
  { label: "Originele onderdelen", page: "originele-onderdelen-phone-repairs" },
  { label: "Reparatie opsturen", page: "reparatie-opsturen" },
  { label: "Verzekering", page: "verzekering" },
  // Added on client request 2026-11-02.
  { label: "Data recovery", page: "data-recovery" },
  { label: "Klantenservice", page: "klantenservice-phone-repairs" },
  { label: "Blog", href: "/blog-post" },
  // The shop's Trade-in partner link with its referral code (client request 2026-11-03), kept exactly.
  { label: "Toestel verkopen?", labelEn: "Sell your device?", href: site.partners.tradeIn, external: true },
];

export const mainNav = [
  {
    label: "Werkwijze",
    labelEn: "How it works",
    href: "/werkwijze",
    // Dropdown with a direct link to the device finder on /werkwijze (client request 2026-10-29).
    children: [
      { label: "Zo werkt een reparatie", labelEn: "How a repair works", href: "/werkwijze" },
      { label: "Bekijk jouw reparatieprijs", labelEn: "See your repair price", href: "/werkwijze#toestel-zoeken" },
    ],
  },
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
      brands: brandEntries(c.id).map((b) => ({
          name: b.label,
          href: b.href,
          models: devicesForBrand(b.brandId, c.id)
            .slice(0, 4)
            .map((d) => ({ name: d.name, href: devicePath(d) })),
      })),
    })),
    repairs: repairs
      .filter((r) => r.popular)
      .map((r) => localizeRepair(r, locale))
      .map((r) => ({ name: r.name, summary: r.summary, href: repairPath(r.slug), icon: r.icon })),
    // Pages deleted in the CMS drop out; English uses the page's translated title.
    more: moreLinks
      .flatMap((l): { label: string; href: string; external?: boolean }[] => {
        if (l.href) return [{ label: locale === "en" && l.labelEn ? l.labelEn : l.label, href: l.href, ...(l.external ? { external: true } : {}) }];
        if (l.blog) return getBlogPost(l.blog) ? [{ label: locale === "en" ? "Hydrogel screen protector" : l.label, href: blogPath(l.blog) }] : [];
        const page = landingPages.find((p) => p.id === l.page);
        return page ? [{ label: locale === "en" ? localizeLanding(page, locale).title : l.label, href: page.path }] : [];
      })
      .sort((a, b) => b.label.length - a.label.length),
  };
}
