import { ArrowUpRight, Star } from "lucide-react";
import { GoogleMark } from "@/components/contact/google-mark";
import { KiyohBadge, KiyohLink } from "@/components/contact/kiyoh";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Points visitors to the reviews on Google and Kiyoh. The Kiyoh score comes from the Kiyoh feed;
 * the Google score is shown by the Trustindex badge in the top bar, this block links to the reviews.
 */
export async function ReviewsBanner({ className }: { className?: string }) {
  const { t } = await getI18n();
  const reviews = site.reviews;
  if (!reviews) return null;
  return (
    <div
      className={cn(
        "glass-dark flex flex-col gap-6 rounded-[var(--radius-card)] p-7 sm:flex-row sm:items-center sm:justify-between lg:p-8",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent-light">
          <Star className="size-6" aria-hidden />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{t("Wat klanten zeggen", "What customers say")}</h3>
          <p className="mt-1 max-w-xl leading-relaxed text-neutral-400">
            {t(
              `Lees de ervaringen van klanten op ${reviews.platform}${site.kiyoh ? " en Kiyoh" : ""}. Ben je zelf geholpen? Laat daar ook een review achter.`,
              `Read what customers say on ${reviews.platform}${site.kiyoh ? " and Kiyoh" : ""}. Were you helped yourself? Leave a review there too.`,
            )}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-3 sm:w-64">
        <KiyohBadge />
        {/* A white box like the Kiyoh badge, with the Google mark (client request, 2026-10-16). */}
        <a
          href={reviews.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(`Bekijk alle reviews op ${reviews.platform}`, `See all reviews on ${reviews.platform}`)}
          className="tone-light inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)]"
        >
          <GoogleMark className="size-7" />
          <span className="flex flex-col leading-tight">
            <span className="text-xs text-muted">{reviews.platform}</span>
            <span className="text-sm font-semibold">{t("Bekijk alle reviews", "See all reviews")}</span>
          </span>
          <ArrowUpRight className="ml-auto size-4 text-muted" aria-hidden />
        </a>
      </div>
    </div>
  );
}

/** Compact text links for light surfaces (contact details, device pages). */
export async function ReviewsLink({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-col gap-2", className)}>
      <GoogleReviewsLink />
      <KiyohLink />
    </span>
  );
}

async function GoogleReviewsLink({ className }: { className?: string }) {
  const { t } = await getI18n();
  const reviews = site.reviews;
  if (!reviews) return null;
  return (
    <a
      href={reviews.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1.5 font-medium text-accent-strong hover:text-accent", className)}
    >
      <GoogleMark className="size-4" />
      {t(`Reviews op ${reviews.platform}`, `Reviews on ${reviews.platform}`)}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
