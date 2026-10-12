import { lang } from "next/root-params";
import { defaultLocale, isLocale, localizePath, translator, type Locale } from "@/lib/i18n";

/** Active locale in Server Components (from the `[lang]` root segment). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return value && isLocale(value) ? value : defaultLocale;
}

/** Translator plus a link helper for the active locale. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: translator(locale), href: (nlPath: string) => localizePath(nlPath, locale) };
}
