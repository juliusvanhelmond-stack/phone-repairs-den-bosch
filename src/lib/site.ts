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
   * Official logo, sent by the client on 2026-10-14 (stacked original: /brand/logo-original.png).
   * logo.png / logo-light.png are a horizontal arrangement of the same artwork (icon and
   * wordmark cropped from the original, not redrawn); the light version has a white
   * wordmark for dark backgrounds.
   */
  logo: { src: "/brand/logo.png", width: 646, height: 144, light: "/brand/logo-light.png" } as null | {
    src: string;
    width: number;
    height: number;
    light?: string;
  },
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
   * Google Business profile with reviews: the Google Maps review link the client asked for (mail 2026-10-15).
   * Score and review count are only shown through the client's own Trustindex widget
   * (widget id from their WordPress plugin, 2026-10-12), never typed into the site.
   */
  reviews: {
    url: "https://www.google.com/maps/place/Phone+Repairs/@51.7156804,5.3213844,798m/data=!3m2!1e3!4b1!4m8!3m7!1s0x47c6ee3474713037:0xd930fb7ac597f393!8m2!3d51.7156804!4d5.3239593!9m1!1b1!16s%2Fg%2F1pv27l1d_?entry=ttu&g_ep=EgoyMDI2MTAxMS4wIKXMDSoASAFQAw%3D%3D",
    platform: "Google",
    trustindexId: "2b08aab83f291770e106912ec94",
    /** Google review carousel: the client's Trustindex widget from /beoordelingen-phone-repairs (WordPress export). */
    carouselId: "18acda436031150bd03607a064c",
  } as null | { url: string; platform: string; trustindexId: string | null; carouselId: string | null },
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
  openingNote: "7 dagen per week geopend, ook in de avond. Altijd op afspraak.",
  /**
   * Opening hours, always by appointment. Copied from the "Openingstijden" widget on the live
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
  /** "Plan je route" link the client asked for (e-mail 2026-10-16), verbatim. */
  routeUrl: "https://www.google.com/maps?ll=51.71568,5.323959&z=13&t=m&hl=nl&gl=NL&mapclient=embed&cid=15650285209832125331",
  /**
   * Partner links with the shop's own referral code (client, e-mail 2026-10-14): keep the
   * parameters exactly, they are how the shop gets paid.
   */
  partners: {
    /** Stellar data recovery intake form (Zoho), as embedded on the current /data-recovery/ page. */
    dataRecoveryForm:
      "https://forms.zohopublic.eu/ahogye/form/Diagnosis/formperma/NjvRlJCeWk-6kWpDnNOiviDvjs0WoTznjCUgcSCEIgw?ML=NL/Dutch&con1=Netherlands&con2=Netherlands&con3=Netherlands&pa=true&pc=XZZWU&pn=Phone%20Repairs",
    dataRecoveryCode: "XZZWU",
    /** Trade-in (buyback.nl) affiliate link from the current homepage. */
    tradeIn: "https://buyback.nl/?utm_source=phonerepairs&utm_medium=affiliate&utm_campaign=tradein",
  },
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
