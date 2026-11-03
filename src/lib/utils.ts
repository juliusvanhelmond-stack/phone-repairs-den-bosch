import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the custom type scale so `text-headline` is not
// mistaken for a colour and dropped next to `text-ink`.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["display", "headline", "title"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatters = Object.fromEntries(
  (["nl", "en"] as const).flatMap((locale) =>
    [0, 2].map((digits) => [
      `${locale}${digits}`,
      new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
    ]),
  ),
);
/** Euro amount in the visitor's language; whole euros without cents (€ 210 / €210, € 59,95). */
export const formatEuro = (amount: number, locale: "nl" | "en" = "nl") =>
  formatters[`${locale}${Number.isInteger(amount) ? 0 : 2}`].format(amount);

/** Normalises text for forgiving search: case, accents, spacing and "+" variants. */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Extra line under a price row (client request 2026-10-29): an original pulled battery has a
 * capacity of 94% to 100%. Matched on the row so devices added in the CMS get it too.
 */
export function priceRowNote(row: { label: string; repairId: string | null }): { nl: string; en: string } | null {
  if (row.repairId === "batterij-vervangen" && /\bpulled\b/i.test(row.label)) {
    return { nl: "Batterijcapaciteit 94% tot 100%", en: "Battery capacity 94% to 100%" };
  }
  return null;
}

/**
 * Price row label as shown on the site (client request 2026-11-03): rows that mention "origineel"
 * get an "Origineel" badge, and the brand's service pack note in brackets ("(origineel Samsung
 * service pack, zoals Samsung vereist)") is left out of the text; screen rows named after the panel
 * ("Scherm, AMOLED vervangen", "Touchscreen / LCD") read "Scherm vervangen". The CMS keeps the full label.
 */
// Screen rows named after the panel type are shown as "Scherm vervangen" (client requests 2026-11-03).
const SCREEN_LABEL = new RegExp(
  "^(Scherm, (AMOLED|LCD|OLED|QHD AMOLED|OLED 4K|(AMOLED|LCD|OLED|QHD AMOLED|Fluid OLED) en frame|" +
    "Dynamic AMOLED, frame \\/ zijkanten en ultrasonic vingerafdruklezer) vervangen" +
    "|Scherm \\(glas\\) en LCD( \\d+(\\.\\d+)?)? inch vervangen|Scherm \\(glas\\) en LCD vervangen" +
    "|Touchscreen \\/ LCD( vervangen)?|Touchscreen \\/ OLED vervangen)( origineel service pack)?",
  "i",
);

export function priceRowDisplay(label: string): { label: string; original: boolean } {
  return {
    label: label
      .replace(SCREEN_LABEL, "Scherm vervangen")
      .replace(/\s*\(originee?le? [^()]*service pack, zoals [^()]*vereist\)/gi, "")
      .trim(),
    original: /\borigine(el|le)\b/i.test(label),
  };
}

/**
 * priceRowDisplay for all rows of one device. When two rows would both read "Scherm vervangen" (one with
 * and one without the frame, e.g. Asus ROG Phone 6 Pro), the frame row says "Scherm en frame vervangen".
 */
export function priceRowsDisplay<T extends { label: string }>(rows: T[]): (T & { original: boolean })[] {
  const shown = rows.map((r) => ({ ...r, ...priceRowDisplay(r.label) }));
  return shown.map((r, i) =>
    r.label === "Scherm vervangen" && /\bframe\b/i.test(rows[i].label) && shown.some((o, j) => j !== i && o.label === "Scherm vervangen")
      ? { ...r, label: "Scherm en frame vervangen" }
      : r,
  );
}
