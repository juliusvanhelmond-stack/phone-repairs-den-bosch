import { ArrowUpRight, Star } from "lucide-react";
import { TrustindexBadge } from "@/components/contact/trustindex-badge";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Points visitors to the reviews on the Google Business profile. The score and count
 * are rendered by the Trustindex badge; the plain link stays as a fallback.
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
              `Lees de ervaringen van klanten op ${reviews.platform}. Ben je zelf geholpen? Laat daar ook een review achter.`,
              `Read what customers say on ${reviews.platform}. Were you helped yourself? Leave a review there too.`,
            )}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
        {reviews.trustindexId && (
          <TrustindexBadge
            widgetId={reviews.trustindexId}
            className="min-h-[3.25rem] min-w-[12rem] overflow-hidden rounded-2xl bg-white px-2 [&_.ti-widget]:!m-0"
          />
        )}
        <a
          href={reviews.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white underline-offset-4 hover:underline"
        >
          {t(`Bekijk alle reviews op ${reviews.platform}`, `See all reviews on ${reviews.platform}`)}
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}

/** Compact text link for light surfaces (contact details, device pages). */
export async function ReviewsLink({ className }: { className?: string }) {
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
      <Star className="size-4" aria-hidden />
      {t(`Reviews op ${reviews.platform}`, `Reviews on ${reviews.platform}`)}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
