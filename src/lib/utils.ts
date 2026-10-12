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

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const euroEn = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" });
/** Euro amount in the visitor's language (€ 60,00 / €60.00). */
export const formatEuro = (amount: number, locale: "nl" | "en" = "nl") =>
  (locale === "en" ? euroEn : euro).format(amount);

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
