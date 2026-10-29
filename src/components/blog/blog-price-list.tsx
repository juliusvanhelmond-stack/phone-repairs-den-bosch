import type { BlogArticle } from "@/types/content";
import { getI18n } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

/**
 * Optional rate list below a blog post, edited by the shop in the CMS ("Prijslijst onder het
 * bericht"), e.g. "Onze Hydrogel Toppers" on the hydrogel post. Prices are shown as typed there.
 */
export async function BlogPriceList({ list, className }: { list: NonNullable<BlogArticle["priceList"]>; className?: string }) {
  const { locale, t } = await getI18n();
  return (
    <section className={cn("rounded-[var(--radius-card)] bg-surface p-7 ring-1 ring-line lg:p-9", className)} aria-labelledby="blog-prijzen">
      <h2 id="blog-prijzen" lang="nl" className="text-title font-semibold text-ink">
        {list.heading}
      </h2>
      {list.subheading && <p lang="nl" className="mt-1 text-muted">{list.subheading}</p>}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {list.items.map((item, i) => {
          const text = locale === "en" && item.textEn ? item.textEn : item.text;
          return (
            <li key={`${i}-${item.name}`} className="flex items-start justify-between gap-6 py-4">
              <span>
                {item.group && <span className="block text-xs font-semibold tracking-wide text-accent-strong uppercase">{item.group}</span>}
                <span className="block font-semibold text-ink">{item.name}</span>
                {text && <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>}
              </span>
              <span className="shrink-0 text-right font-semibold text-ink tabular-nums">
                {/^prijs op aanvraag$/i.test(item.price) ? t("Prijs op aanvraag", "Price on request") : item.price}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
