/**
 * Locales and URL mapping. Shared by the proxy, server and client components.
 *
 * Dutch is the default and keeps the original, unprefixed URLs (`/reparaties/apple`).
 * English lives under `/en` with translated segments (`/en/repairs/apple`).
 * Internally every page is rendered under `app/[lang]/…` with the Dutch folder names;
 * the proxy rewrites public URLs to those internal paths.
 */
export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** BCP 47 tags for <html lang>, Open Graph and Intl. */
export const localeTag: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

/** First path segment, Dutch → English. */
const topLevel: Record<string, string> = {
  reparaties: "repairs",
  reparatie: "repair",
  werkwijze: "how-it-works",
  "over-ons": "about",
  "veelgestelde-vragen": "faq",
  contact: "contact",
  afspraak: "appointment",
  werkgebied: "service-area",
  "blog-post": "blog",
};

/** Second segment under a translated first segment, Dutch → English. */
const nested: Record<string, Record<string, string>> = {
  reparatie: {
    "scherm-vervangen": "screen-replacement",
    "batterij-vervangen": "battery-replacement",
    "oplaadpoort-repareren": "charging-port-repair",
    "camera-repareren": "camera-repair",
    waterschade: "water-damage",
    "achterkant-vervangen": "back-glass-replacement",
    "toetsenbord-vervangen": "keyboard-replacement",
    "overige-reparaties": "other-repairs",
  },
  "veelgestelde-vragen": {
    "zakelijke-reparatie": "business-repairs",
    "reparatie-opsturen": "mail-in-repair",
  },
};

const invert = (map: Record<string, string>) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
const topLevelBack = invert(topLevel);
const nestedBack = Object.fromEntries(
  Object.entries(nested).map(([nl, map]) => [topLevel[nl], invert(map)]),
) as Record<string, Record<string, string>>;

function splitSuffix(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i)];
}

/** Dutch path (as used in code and data) → public path for a locale. */
export function localizePath(nlPath: string, locale: Locale): string {
  if (locale === "nl") return nlPath;
  const [path, suffix] = splitSuffix(nlPath);
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return `/en${suffix}`;
  const [first, second, ...rest] = parts;
  const out = [topLevel[first] ?? first];
  if (second !== undefined) out.push(nested[first]?.[second] ?? second);
  out.push(...rest);
  return `/en/${out.join("/")}${suffix}`;
}

/** Public path → locale plus the Dutch path used internally. */
export function parsePublicPath(publicPath: string): { locale: Locale; nlPath: string } {
  const parts = publicPath.split("/").filter(Boolean);
  if (parts[0] !== "en") return { locale: "nl", nlPath: publicPath || "/" };
  const [, first, second, ...rest] = parts;
  if (first === undefined) return { locale: "en", nlPath: "/" };
  const out = [topLevelBack[first] ?? first];
  if (second !== undefined) out.push(nestedBack[first]?.[second] ?? second);
  out.push(...rest);
  return { locale: "en", nlPath: `/${out.join("/")}` };
}

/** True when an English URL uses a Dutch segment that has an English name (avoids duplicate URLs). */
export function hasUntranslatedSegment(publicPath: string): boolean {
  const parts = publicPath.split("/").filter(Boolean);
  if (parts[0] !== "en" || parts.length < 2) return false;
  if (parts[1] in topLevel && topLevel[parts[1]] !== parts[1]) return true;
  const nlFirst = topLevelBack[parts[1]];
  return !!(nlFirst && parts[2] && nested[nlFirst]?.[parts[2]] && nested[nlFirst][parts[2]] !== parts[2]);
}

/** Picks the string for the active locale: `t("Werkwijze", "How it works")`. */
export type Translate = (nl: string, en: string) => string;
export const translator =
  (locale: Locale): Translate =>
  (nl, en) =>
    locale === "en" ? en : nl;
