import { Reveal } from "@/components/motion/reveal";
import { ContentIcon } from "@/components/repairs/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { claims, localizeClaim } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { ReviewsBanner } from "@/components/contact/reviews-link";
import { TrustindexBadge } from "@/components/contact/trustindex-badge";
import { KiyohReviews } from "@/components/contact/kiyoh-reviews";
import { site } from "@/lib/site";

export async function Trust() {
  const { locale, t } = await getI18n();
  return (
    <section className="relative isolate overflow-hidden bg-night py-20 text-white lg:py-28">
            <div className="absolute -top-40 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" aria-hidden />
      <div className="container-page">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow={t("Waarom Phone Repairs", "Why Phone Repairs")}
            title={t("Vakwerk waar je zelf bij bent.", "Craftsmanship you can watch.")}
            intro={t(
              "Geen anoniem reparatieloket, maar een persoonlijke aanpak met heldere afspraken.",
              "Not an anonymous repair counter, but a personal approach with clear agreements.",
            )}
          />
        </Reveal>
        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => localizeClaim(claim, locale)).map((c, i) => (
            <li key={c.id} className="glass-dark rounded-[var(--radius-card)] p-7 lg:p-8">
              <Reveal delay={i * 0.04}>
                <ContentIcon name={c.icon} className="size-6 text-accent-light" />
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-neutral-400">{c.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        {site.reviews?.carouselId && (
          // Google reviews as the client's Trustindex widget renders them (asked for on 2026-10-15).
          // In the dark theme the card is dark too (client request 2026-10-29). The widget's own styles cannot be set
          // from here, so its colours are inverted (hue turned back) and photos and logos are inverted again.
          <div className="tone-light mt-3 rounded-[var(--radius-card)] bg-white p-4 text-ink sm:p-6 dark:bg-surface">
            <TrustindexBadge
              widgetId={site.reviews.carouselId}
              className="min-h-40 dark:[filter:invert(1)_hue-rotate(180deg)] dark:[&_img]:[filter:invert(1)_hue-rotate(180deg)] dark:[&_.ti-widget-header]:!bg-transparent"
            />
          </div>
        )}
        <KiyohReviews className="mt-3" />
        <Reveal>
          <ReviewsBanner className="mt-3" />
        </Reveal>
      </div>
    </section>
  );
}
