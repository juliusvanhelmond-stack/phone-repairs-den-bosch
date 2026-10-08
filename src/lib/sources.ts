import type { SourceRef } from "@/types/content";

/** Original phonerepairs.nl URLs referenced by seed content. */
export const ORIGIN = "https://www.phonerepairs.nl";

export const SOURCE_URLS = {
  home: `${ORIGIN}/`,
  denBosch: `${ORIGIN}/telefoon-reparatie-den-bosch/`,
  smartphoneDenBosch: `${ORIGIN}/telefoon-smartphone-reparatie-den-bosch/`,
  about: `${ORIGIN}/over-phone-repairs/`,
  appointment: `${ORIGIN}/afspraak-maken/`,
  welcome: `${ORIGIN}/welkom-bij-phone-repairs-den-bosch/`,
  samsungS23: `${ORIGIN}/samsung-reparatie-den-bosch/samsung-s23/`,
  rosmalen: `${ORIGIN}/telefoon-reparatie-rosmalen/`,
} as const;

/** Date the search-index research for the seed content was performed. */
export const SEED_CAPTURED_AT = "2026-10-08";

export function searchIndexSource(url: string, note?: string): SourceRef {
  return { url, verification: "search-index", capturedAt: SEED_CAPTURED_AT, note };
}
