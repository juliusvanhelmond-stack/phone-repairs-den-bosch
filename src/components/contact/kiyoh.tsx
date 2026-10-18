import { ArrowUpRight } from "lucide-react";
import { localeTag } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import { getKiyohSummary } from "@/lib/kiyoh";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

async function loadKiyoh() {
  const { locale, t } = await getI18n();
  const summary = getKiyohSummary();
  const tag = localeTag[locale];
  return {
    t,
    summary,
    score: summary && new Intl.NumberFormat(tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(summary.score),
    count: summary && new Intl.NumberFormat(tag).format(summary.count),
  };
}

function KiyohMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimisation needed
  return <img src="/partners/kiyoh.svg" alt="" width={29} height={29} className={cn("shrink-0", className)} />;
}

/**
 * Kiyoh review badge (score of the last 12 months + total reviews), modelled on the
 * floating Kiyoh button of the current site. Without feed data it is a plain link.
 */
export async function KiyohBadge({ className }: { className?: string }) {
  const kiyoh = site.kiyoh;
  if (!kiyoh) return null;
  const { t, score, count } = await loadKiyoh();
  return (
    <a
      href={kiyoh.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        score
          ? t(`Kiyoh: ${score} uit ${count} reviews. Bekijk onze reviews`, `Kiyoh: ${score} from ${count} reviews. See our reviews`)
          : t("Bekijk onze reviews op Kiyoh", "See our reviews on Kiyoh")
      }
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-ink ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <KiyohMark className="size-7" />
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-muted">Kiyoh</span>
        {score ? (
          <span className="text-2xl font-extrabold tabular-nums">{score}</span>
        ) : (
          <span className="text-sm font-semibold">{t("Bekijk onze reviews", "See our reviews")}</span>
        )}
      </span>
      {score && (
        <span className="flex flex-col text-left leading-tight">
          <span className="text-xs text-muted tabular-nums">{t(`${count} reviews`, `${count} reviews`)}</span>
          <span className="text-sm font-semibold">{t("Bekijk onze reviews", "See our reviews")}</span>
        </span>
      )}
    </a>
  );
}

/** Compact inline link for light surfaces (contact details, device pages). */
export async function KiyohLink({ className }: { className?: string }) {
  const kiyoh = site.kiyoh;
  if (!kiyoh) return null;
  const { t, score, count } = await loadKiyoh();
  return (
    <a
      href={kiyoh.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1.5 font-medium text-accent-strong hover:text-accent", className)}
    >
      <KiyohMark className="size-4" />
      {score
        ? t(`Kiyoh ${score} (${count} reviews)`, `Kiyoh ${score} (${count} reviews)`)
        : t("Reviews op Kiyoh", "Reviews on Kiyoh")}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}

/**
 * Floating Kiyoh button on desktop, like the one on the current site: bottom left and
 * visible while scrolling, so it never competes with the WhatsApp button (bottom right).
 * On mobile the client wants it top left without following the scroll: see KiyohCompact.
 */
export async function KiyohFloat() {
  const kiyoh = site.kiyoh;
  if (!kiyoh) return null;
  const { t, score, count } = await loadKiyoh();
  // Without feed data (no KIYOH_FEED_HASH at build) it still shows, as a plain link.
  return (
    <a
      href={kiyoh.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        score
          ? t(`Kiyoh: ${score} uit ${count} reviews. Bekijk onze reviews`, `Kiyoh: ${score} from ${count} reviews. See our reviews`)
          : t("Bekijk onze reviews op Kiyoh", "See our reviews on Kiyoh")
      }
      className="tone-light fixed bottom-6 left-6 z-30 hidden h-16 items-center gap-3 rounded-full bg-white pr-6 pl-4 text-ink shadow-[var(--shadow-lift)] ring-1 ring-line transition-transform hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 md:inline-flex"
    >
      {/* As on the current site (client screenshot, 2026-10-16): mark, "Kiyoh", score, count and a call to action. */}
      <KiyohMark className="size-8" />
      <span className="text-sm text-muted">Kiyoh</span>
      {score ? (
        <>
          <span className="text-2xl font-extrabold tabular-nums">{score}</span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs text-muted tabular-nums">{t(`${count} reviews`, `${count} reviews`)}</span>
            <span className="text-sm font-semibold">{t("Bekijk onze reviews", "See our reviews")}</span>
          </span>
        </>
      ) : (
        <span className="text-sm font-semibold">{t("Bekijk onze reviews", "See our reviews")}</span>
      )}
    </a>
  );
}

/** Small inline Kiyoh score for the top bar (mobile). */
export async function KiyohCompact({ className }: { className?: string }) {
  const kiyoh = site.kiyoh;
  if (!kiyoh) return null;
  const { t, score, count } = await loadKiyoh();
  return (
    <a
      href={kiyoh.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        score
          ? t(`Kiyoh: ${score} uit ${count} reviews. Bekijk onze reviews`, `Kiyoh: ${score} from ${count} reviews. See our reviews`)
          : t("Bekijk onze reviews op Kiyoh", "See our reviews on Kiyoh")
      }
      // Always dark in the (dark) top bar, also in the light theme (client request, 2026-10-16).
      className={cn("inline-flex h-11 items-center gap-2 rounded-full bg-white/10 pr-3.5 pl-2 text-white ring-1 ring-white/15", className)}
    >
      <KiyohMark className="size-6" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.625rem] text-muted">Kiyoh</span>
        {score ? (
          <span className="mt-0.5 text-base font-extrabold tabular-nums">{score}</span>
        ) : (
          <span className="mt-0.5 text-xs font-semibold">{t("Reviews", "Reviews")}</span>
        )}
      </span>
    </a>
  );
}
