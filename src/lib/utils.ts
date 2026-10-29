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
