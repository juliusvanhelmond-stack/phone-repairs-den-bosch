import type { Locale } from "@/lib/i18n";
import { SOURCE_URLS } from "@/lib/sources";

/**
 * Business details. Only values seen on the original site are filled in;
 * unknown values are `null` and the UI hides what depends on them.
 */
export const site = {
  name: "Phone Repairs",
  legalName: "Phone Repairs Den Bosch",
  tagline: "Telefoon, tablet en MacBook reparatie in Den Bosch",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.phonerepairs.nl",
  phone: {
    display: "073 822 0013",
    href: "tel:+31738220013",
    e164: "+31738220013",
  },
  email: "info@phonerepairs.nl",
  /**
   * Official logo (put the file in /public/brand/ and set the path, e.g. "/brand/logo.svg").
   * Until then a placeholder mark in the house colours is shown.
   */
  logo: null as null | { src: string; width: number; height: number; light?: string },
  /**
   * WhatsApp runs on the shop number. Number and widget copy confirmed by the client via
   * JUNE Studio (2026-10-12), copied from the WhatsApp widget on the current site.
   * Preferred contact order: WhatsApp, phone, e-mail.
   */
  whatsapp: {
    display: "073 822 0013",
    number: "31738220013",
    title: "WhatsApp met Phone Repairs",
    intro:
      "Wij zijn het snelst bereikbaar via WhatsApp! Start een gesprek met Phone Repairs via de onderstaande knop. Ook kun je dan het gesprek gemakkelijk op een ander apparaat voortzetten. Wij zijn 7 dagen per week bereikbaar van 10 tot 20 uur. Gemiddelde reactietijd: 10 minuten.",
    hours: "7 dagen per week, 10 tot 20 uur",
  } as null | { display: string; number: string; title: string; intro: string; hours: string },
  /**
   * Google Business profile with reviews (link from the client's current site, 2026-10-12).
   * Score and review count are only shown through the client's own Trustindex widget
   * (widget id from their WordPress plugin, 2026-10-12), never typed into the site.
   */
  reviews: {
    url: "https://share.google/VZaMvnmVl8WfyaCh9",
    platform: "Google",
    trustindexId: "2b08aab83f291770e106912ec94",
  } as null | { url: string; platform: string; trustindexId: string | null },
  /**
   * Kiyoh review page (from the client's "Kiyoh Zwevende Reviews-knop" WordPress plugin, 2026-10-13).
   * Score and count are read from the Kiyoh feed at runtime (`src/lib/kiyoh.ts`), never typed in.
   */
  kiyoh: { url: "https://www.kiyoh.com/reviews/1047512/phone_repairs" } as null | { url: string },
  address: {
    street: "Ploossche Hof 13",
    /** Seen next to the street address in several search snippets of the original site. */
    postalCode: "5233 HA" as string | null,
    city: "'s-Hertogenbosch",
    cityShort: "Den Bosch",
    country: "NL",
  },
  openingNote: "7 dagen per week geopend, ook in de avond. Alleen op afspraak.",
  /**
   * Opening hours, by appointment only. Copied from the "Openingstijden" widget on the live
   * homepage (read 2026-10-13); the client allowed verbatim reuse of opening hours (2026-10-12).
   * `day` follows JavaScript (0 = Sunday).
   */
  openingHours: {
    byAppointment: true,
    source: "https://www.phonerepairs.nl/",
    capturedAt: "2026-10-13",
    days: [
      { day: 1, nl: "Maandag", en: "Monday", opens: "10:00", closes: "20:00" },
      { day: 2, nl: "Dinsdag", en: "Tuesday", opens: "09:00", closes: "20:00" },
      { day: 3, nl: "Woensdag", en: "Wednesday", opens: "09:00", closes: "20:00" },
      { day: 4, nl: "Donderdag", en: "Thursday", opens: "09:00", closes: "20:00" },
      { day: 5, nl: "Vrijdag", en: "Friday", opens: "09:00", closes: "17:00" },
      { day: 6, nl: "Zaterdag", en: "Saturday", opens: "10:00", closes: "17:00" },
      { day: 0, nl: "Zondag", en: "Sunday", opens: "11:00", closes: "17:00" },
    ],
  },
  /**
   * Terms and privacy statement: the client's current PDFs, kept on their original paths
   * in /public (linked from the footer of the current site, 2026-10-13).
   */
  legal: {
    terms: "/wp-content/uploads/2026/10/Algemene-voorwaarden-iPhone-Service-Den-Bosch-_-Phone-Repairs.pdf",
    privacy: "/wp-content/uploads/2026/09/Privacyverklaring-september-2026.pdf",
  },
  parkingNote: "Gratis parkeren voor de deur",
  sources: [SOURCE_URLS.home, SOURCE_URLS.denBosch, SOURCE_URLS.appointment],
} as const;

/** wa.me link, optionally with a prefilled message (the customer still has to press send). */
export function whatsappHref(message?: string): string | null {
  if (!site.whatsapp) return null;
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Prefilled WhatsApp message for a device and/or repair, in the visitor's language. */
export function whatsappMessage({
  device,
  repair,
  locale = "nl",
}: { device?: string; repair?: string; locale?: Locale } = {}): string {
  if (locale === "en") {
    if (device && repair) return `Hi Phone Repairs, I would like to make an appointment for my ${device}: ${repair.toLowerCase()}.`;
    if (device) return `Hi Phone Repairs, I have a question about repairing my ${device}.`;
    if (repair) return `Hi Phone Repairs, I would like to make an appointment for: ${repair.toLowerCase()}.`;
    return "Hi Phone Repairs, I would like to make an appointment.";
  }
  if (device && repair) return `Hoi Phone Repairs, ik wil graag een afspraak maken voor mijn ${device}: ${repair.toLowerCase()}.`;
  if (device) return `Hoi Phone Repairs, ik heb een vraag over de reparatie van mijn ${device}.`;
  if (repair) return `Hoi Phone Repairs, ik wil graag een afspraak maken voor: ${repair.toLowerCase()}.`;
  return "Hoi Phone Repairs, ik wil graag een afspraak maken.";
}

/** WhatsApp prompt copy. Dutch is verbatim from the current site; English is our translation. */
export function whatsappCopy(locale: Locale) {
  if (!site.whatsapp) return null;
  if (locale === "nl") return site.whatsapp;
  return {
    ...site.whatsapp,
    title: "WhatsApp Phone Repairs",
    intro:
      "WhatsApp is the fastest way to reach us! Start a conversation with Phone Repairs using the button below. You can also easily continue the conversation on another device. We are available 7 days a week from 10:00 to 20:00. Average response time: 10 minutes.",
    hours: "7 days a week, 10:00 to 20:00",
  };
}

export const fullAddress = [site.address.street, [site.address.postalCode, site.address.cityShort].filter(Boolean).join(" ")].join(", ");

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name} ${site.address.street} ${site.address.city}`,
)}`;

/** Demo mode shows data-status notes; disabled for launch. */
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Indexing stays off until the client approves the launch. */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
