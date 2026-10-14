import { ArrowUpRight, Recycle } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";

/**
 * "Verkoop je toestel via Trade-in", as on the current homepage and pre-owned page (text
 * verbatim from the WordPress export). The link is the shop's affiliate link.
 */
export async function TradeIn() {
  const { t } = await getI18n();
  return (
    <section className="pb-16 lg:pb-20">
      <div className="container-page">
        <Reveal>
          <div className="tone-grey grid gap-6 rounded-[var(--radius-panel)] p-7 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent text-white">
              <Recycle className="size-7" aria-hidden />
            </span>
            <div>
              <h2 className="text-title font-semibold text-ink">{t("Verkoop je toestel snel via ons", "Sell your device quickly through us")}</h2>
              <p className="mt-2 leading-relaxed text-muted">
                {t(
                  "Verdien snel geld met je ‘oude’ toestel! Snel en zonder moeite via Trade-in.",
                  "Earn money quickly with your ‘old’ device! Fast and effortless via Trade-in.",
                )}
              </p>
            </div>
            <a
              href={site.partners.tradeIn}
              target="_blank"
              rel="sponsored noopener"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-white transition-colors hover:bg-accent-strong"
            >
              {t("Naar Trade-in", "Go to Trade-in")}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
