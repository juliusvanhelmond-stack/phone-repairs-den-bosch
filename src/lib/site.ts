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
  address: {
    street: "Ploossche Hof 13",
    /** Seen next to the street address in several search snippets of the original site. */
    postalCode: "5233 HA" as string | null,
    city: "'s-Hertogenbosch",
    cityShort: "Den Bosch",
    country: "NL",
  },
  openingNote: "7 dagen per week geopend, ook in de avond. Alleen op afspraak.",
  parkingNote: "Gratis parkeren voor de deur",
  sources: [SOURCE_URLS.home, SOURCE_URLS.denBosch, SOURCE_URLS.appointment],
} as const;

/** wa.me link, optionally with a prefilled message (the customer still has to press send). */
export function whatsappHref(message?: string): string | null {
  if (!site.whatsapp) return null;
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Prefilled WhatsApp message for a device and/or repair. */
export function whatsappMessage({ device, repair }: { device?: string; repair?: string } = {}): string {
  if (device && repair) return `Hoi Phone Repairs, ik wil graag een afspraak maken voor mijn ${device}: ${repair.toLowerCase()}.`;
  if (device) return `Hoi Phone Repairs, ik heb een vraag over de reparatie van mijn ${device}.`;
  if (repair) return `Hoi Phone Repairs, ik wil graag een afspraak maken voor: ${repair.toLowerCase()}.`;
  return "Hoi Phone Repairs, ik wil graag een afspraak maken.";
}

export const fullAddress = [site.address.street, [site.address.postalCode, site.address.cityShort].filter(Boolean).join(" ")].join(", ");

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name} ${site.address.street} ${site.address.city}`,
)}`;

/** Demo mode shows data-status notes; disabled for launch. */
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Indexing stays off until the client approves the launch. */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
