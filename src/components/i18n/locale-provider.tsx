"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultLocale, localizePath, translator, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(defaultLocale);

/** Makes the active locale available to Client Components. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Translator and link helper for Client Components. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(
    () => ({ locale, t: translator(locale), href: (nlPath: string) => localizePath(nlPath, locale) }),
    [locale],
  );
}
