"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Weekday in Den Bosch (0 = Sunday), independent of the visitor's time zone. */
function amsterdamDay(): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Amsterdam", weekday: "short" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/** Today's day, known only after mount: static pages render without it, so hydration stays stable. */
function useToday() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current day is only known in the browser
    setToday(amsterdamDay());
  }, []);
  return today;
}

const HOLIDAY_NOTE = "Op feestdagen gelden de openingstijden van zondag.";

type Day = { closed: boolean; opens: string; closes: string };
const range = (d: Day, closed: string) => (d.closed ? closed : `${d.opens} – ${d.closes}`);

/** "Vandaag 09:00 – 20:00 · op afspraak"; before hydration a general line. */
export function OpeningToday({ className }: { className?: string }) {
  const { t } = useI18n();
  const today = useToday();
  const day = today === null ? undefined : site.openingHours.days.find((d) => d.day === today);
  return (
    <span className={className}>
      {day ? (
        <>
          {t("Vandaag", "Today")} <span className="font-medium text-ink tabular-nums">{range(day, t("gesloten", "closed"))}</span>
        </>
      ) : (
        t("7 dagen per week geopend", "Open 7 days a week")
      )}
      {" · "}
      {t("altijd op afspraak", "always by appointment")}
    </span>
  );
}

/** All opening hours, today highlighted. */
export function OpeningHoursList({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const today = useToday();
  return (
    <div className={className}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
        {site.openingHours.days.map((d) => {
          const current = d.day === today;
          return (
            <div key={d.day} className="contents">
              <dt className={cn(current ? "font-semibold text-ink" : "text-muted")}>{locale === "en" ? d.en : d.nl}</dt>
              <dd className={cn("tabular-nums", current ? "font-semibold text-ink" : "text-ink-soft")}>{range(d, t("Gesloten", "Closed"))}</dd>
            </div>
          );
        })}
      </dl>
      {/* Note edited in the CMS; first text by the owner (e-mail 2026-10-16). */}
      {site.openingHours.note && (
        <p className="mt-3 text-sm text-muted">
          {site.openingHours.note === HOLIDAY_NOTE ? t(HOLIDAY_NOTE, "On public holidays the Sunday hours apply.") : site.openingHours.note}
        </p>
      )}
    </div>
  );
}
