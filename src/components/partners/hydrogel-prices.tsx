import data from "@/data/hydrogel.json";
import { getI18n } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export const HYDROGEL_SLUG = "flexible-hydrogel-screen-protectors";

/** "Onze Hydrogel Toppers": the shop's hydrogel screen protector prices, as on its current rate card. */
export async function HydrogelPrices({ className }: { className?: string }) {
  const { locale, t } = await getI18n();
  return (
    <section className={cn("rounded-[var(--radius-card)] bg-surface p-7 ring-1 ring-line lg:p-9", className)} aria-labelledby="hydrogel-prijzen">
      <h2 id="hydrogel-prijzen" className="text-title font-semibold text-ink">
        {t("Onze Hydrogel Toppers", "Our hydrogel favourites")}
      </h2>
      <p className="mt-1 text-muted">{t("Inclusief professionele plaatsing", "Including professional fitting")}</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {data.items.map((item) => (
          <li key={`${item.group}${item.name}`} className="flex items-start justify-between gap-6 py-4">
            <span>
              {item.group && <span className="block text-xs font-semibold tracking-wide text-accent-strong uppercase">{item.group}</span>}
              <span className="block font-semibold text-ink">{item.name}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{locale === "en" ? item.en : item.text}</span>
            </span>
            <span className="shrink-0 text-right font-semibold text-ink tabular-nums">
              {item.price === "Prijs op aanvraag" ? t("Prijs op aanvraag", "Price on request") : item.price}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
