import type { Metadata } from "next";
import type { FaqItem } from "@/types/content";
import { localeTag, localizePath, type Locale } from "@/lib/i18n";
import { allowIndexing, site } from "@/lib/site";

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

/**
 * Shared metadata builder: canonical URL per language, hreflang alternates,
 * Open Graph and the noindex guard. `path` is the Dutch path.
 */
export function pageMetadata({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}): Metadata {
  const url = localizePath(path, locale);
  // Titles copied from the current site may already end in the site name; skip the template then.
  const branded = title.endsWith(" · Phone Repairs Den Bosch");
  return {
    title: branded ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: { nl: path, en: localizePath(path, "en"), "x-default": path },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: localeTag[locale].replace("-", "_"),
      type: "website",
    },
    robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": absoluteUrl("/#business"),
    name: site.legalName,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
      addressCountry: site.address.country,
    },
    areaServed: ["'s-Hertogenbosch", "Rosmalen"],
    openingHoursSpecification: site.openingHours.days.map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.day]}`,
      opens: d.opens,
      closes: d.closes,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") },
    })),
  };
}

/** Service schema; offers are only included for verified prices. */
export function serviceJsonLd({
  name,
  path,
  offers,
}: {
  name: string;
  path: string;
  offers: { name: string; price: number }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    url: absoluteUrl(path),
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: "'s-Hertogenbosch",
    ...(offers.length
      ? {
          offers: offers.map((o) => ({
            "@type": "Offer",
            name: o.name,
            price: o.price.toFixed(2),
            priceCurrency: "EUR",
          })),
        }
      : {}),
  };
}
