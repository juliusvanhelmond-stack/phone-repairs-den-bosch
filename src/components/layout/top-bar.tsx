import { Link } from "@/components/i18n/link";
import { Clock } from "lucide-react";
import { KiyohCompact } from "@/components/contact/kiyoh";
import { OpeningToday } from "@/components/contact/opening-hours";
import { LanguageSwitch } from "@/components/i18n/language-switch";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
        <div className="flex items-center gap-3">
          {/* Language left of the theme switch (client request, 2026-10-19). */}
          <LanguageSwitch />
          <ThemeToggle />
          {site.reviews?.trustindexId && (
            // Fixed box: the widget loads later and must not push the header down (layout shift).
            // Dark like the Kiyoh badge, content centred (client request, 2026-10-16). The widget's own styles cannot be
            // overridden from here, so its colours are inverted (hue turned back, so Google's colours stay) and the
            // bottom margin it adds is offset.
            <div className="flex h-14 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
              <TrustindexBadge
                widgetId={site.reviews.trustindexId}
                className="flex translate-y-[5px] items-center justify-center [filter:invert(1)_hue-rotate(180deg)] [zoom:0.64] [&_.ti-star]:[filter:invert(1)_hue-rotate(180deg)] [&_.ti-widget]:!m-0"
              />
            </div>
          )}
        </div>
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
