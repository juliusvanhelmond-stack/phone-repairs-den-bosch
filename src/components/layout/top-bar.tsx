import { Link } from "@/components/i18n/link";
import { Clock } from "lucide-react";
import { KiyohCompact } from "@/components/contact/kiyoh";
import { OpeningToday } from "@/components/contact/opening-hours";
import { TrustindexBadge } from "@/components/contact/trustindex-badge";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";

/**
 * Bar above the header on every page (client requirements): opening hours "op afspraak",
 * the Google review badge top right and, on mobile, the Kiyoh score top left. It scrolls
 * away with the page; the header below it stays sticky.
 */
export async function TopBar() {
  const { t } = await getI18n();
  return (
    <div className="tone-dark text-sm">
      <div className="container-page flex min-h-14 items-center justify-between gap-3 py-2">
        <KiyohCompact className="md:hidden" />
        <Link
          href="/contact#openingstijden"
          className="hidden items-center gap-2 text-muted transition-colors hover:text-ink md:inline-flex"
          aria-label={t("Openingstijden bekijken", "View opening hours")}
        >
          <Clock className="size-4 text-accent-strong" aria-hidden />
          <OpeningToday />
        </Link>
        {site.reviews?.trustindexId && (
          // Fixed box: the widget loads later and must not push the header down (layout shift).
          <div className="flex h-14 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl has-[.ti-widget]:bg-white">
            <TrustindexBadge
              widgetId={site.reviews.trustindexId}
              className="flex items-center justify-center [zoom:0.64] [&_.ti-widget]:!m-0"
            />
          </div>
        )}
      </div>
      <Link
        href="/contact#openingstijden"
        className="flex items-center justify-center gap-2 border-t border-line px-4 py-2 text-[0.8125rem] text-muted md:hidden"
      >
        <Clock className="size-3.5 text-accent-strong" aria-hidden />
        <OpeningToday />
      </Link>
    </div>
  );
}
