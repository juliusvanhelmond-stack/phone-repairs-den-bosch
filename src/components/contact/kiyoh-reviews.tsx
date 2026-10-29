import { ArrowUpRight } from "lucide-react";
import { localeTag } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import { getKiyohSummary } from "@/lib/kiyoh";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Latest Kiyoh reviews as a sideways-scrolling row, next to the Google review widget (client
 * request, 2026-10-16). The reviews come from the client's Kiyoh feed at build time, verbatim.
 * White in the light theme, dark in the dark theme (client request 2026-10-29).
 */
export async function KiyohReviews({ className }: { className?: string }) {
  const kiyoh = site.kiyoh;
  const summary = getKiyohSummary();
  if (!kiyoh || !summary?.reviews.length) return null;
  const { locale, t } = await getI18n();
  const tag = localeTag[locale];
  const score = new Intl.NumberFormat(tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(summary.score);
  const date = (iso: string) => new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  return (
    <div className={cn("rounded-[var(--radius-card)] bg-surface p-5 text-ink sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
          <img src="/partners/kiyoh.svg" alt="" width={28} height={28} />
          Kiyoh
          <span className="text-xl font-extrabold tabular-nums">{score}</span>
          <span className="text-sm font-normal text-muted">
            {t(`${new Intl.NumberFormat(tag).format(summary.count)} reviews`, `${new Intl.NumberFormat(tag).format(summary.count)} reviews`)}
          </span>
        </p>
        <a
          href={kiyoh.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-strong hover:text-accent"
        >
          {t("Alle reviews op Kiyoh", "All reviews on Kiyoh")}
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
      <ul
        lang="nl"
        className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
        tabIndex={0}
        aria-label={t("Recente reviews op Kiyoh", "Recent reviews on Kiyoh")}
      >
        {summary.reviews.map((r) => (
          <li key={`${r.author}${r.date}`} className="w-72 shrink-0 snap-start rounded-2xl bg-mist p-4 ring-1 ring-line">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{r.author}</span>
              <span className="rounded-md bg-accent px-1.5 py-0.5 text-sm font-bold text-white tabular-nums">{r.rating}</span>
            </div>
            <p className="text-xs text-muted">
              {[r.city, date(r.date)].filter(Boolean).join(" · ")}
            </p>
            {r.title && <p className="mt-3 font-medium">{r.title}</p>}
            {r.text && <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted">{r.text}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
