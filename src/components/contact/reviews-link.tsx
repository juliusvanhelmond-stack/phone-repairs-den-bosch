import { ArrowUpRight, Star } from "lucide-react";
import { GoogleMark } from "@/components/contact/google-mark";
import { KiyohBadge, KiyohLink } from "@/components/contact/kiyoh";
import { getGoogleSummary } from "@/lib/google-reviews";
import { localeTag } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

async function loadGoogle() {
  const { locale, t } = await getI18n();
  const summary = getGoogleSummary();
  const tag = localeTag[locale];
  return {
    t,
    score: summary && new Intl.NumberFormat(tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(summary.score),
    count: summary && new Intl.NumberFormat(tag).format(summary.count),
  };
}

/**
 * Points visitors to the reviews on Google and Kiyoh. The Kiyoh score comes from the Kiyoh feed, the
 * Google score from the client's Trustindex badge (both fetched before each build, never typed in).
 */
export async function ReviewsBanner({ className }: { className?: string }) {
  const { t, score, count } = await loadGoogle();
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
        {/* A box like the Kiyoh badge (white, dark in the dark theme since 2026-10-29), with the Google mark
            (client request, 2026-10-16) and, since 2026-10-27, the Google score in the same layout as Kiyoh's. */}
        <a
          href={reviews.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            score
              ? t(`${reviews.platform}: ${score} uit ${count} reviews. Bekijk alle reviews`, `${reviews.platform}: ${score} from ${count} reviews. See all reviews`)
              : t(`Bekijk alle reviews op ${reviews.platform}`, `See all reviews on ${reviews.platform}`)
          }
          className="inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-ink ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)]"
        >
          <GoogleMark className="size-7" />
          <span className="flex flex-col leading-tight">
            <span className="text-xs text-muted">{reviews.platform}</span>
            {score ? (
              <span className="text-2xl font-extrabold tabular-nums">{score}</span>
            ) : (
              <span className="text-sm font-semibold">{t("Bekijk alle reviews", "See all reviews")}</span>
            )}
          </span>
          {score ? (
            <span className="flex flex-col text-left leading-tight">
              <span className="text-xs text-muted tabular-nums">{t(`${count} reviews`, `${count} reviews`)}</span>
              <span className="text-sm font-semibold">{t("Bekijk alle reviews", "See all reviews")}</span>
            </span>
          ) : (
            <ArrowUpRight className="ml-auto size-4 text-muted" aria-hidden />
          )}
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
  const { t, score, count } = await loadGoogle();
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
      {score
        ? `${reviews.platform} ${score} (${t(`${count} reviews`, `${count} reviews`)})`
        : t(`Reviews op ${reviews.platform}`, `Reviews on ${reviews.platform}`)}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
