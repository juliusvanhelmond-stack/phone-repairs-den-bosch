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

const range = (d: { opens: string; closes: string }) => `${d.opens} – ${d.closes}`;

/** "Vandaag 09:00 – 20:00 · op afspraak"; before hydration a general line. */
export function OpeningToday({ className }: { className?: string }) {
  const { t } = useI18n();
  const today = useToday();
  const day = today === null ? undefined : site.openingHours.days.find((d) => d.day === today);
  return (
    <span className={className}>
      {day ? (
        <>
          {t("Vandaag", "Today")} <span className="font-medium text-ink tabular-nums">{range(day)}</span>
        </>
      ) : (
        t("7 dagen per week geopend", "Open 7 days a week")
      )}
      {" · "}
      {t("alleen op afspraak", "by appointment only")}
    </span>
  );
}

/** All opening hours, today highlighted. */
export function OpeningHoursList({ className }: { className?: string }) {
  const { locale } = useI18n();
  const today = useToday();
  return (
    <dl className={cn("grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5", className)}>
      {site.openingHours.days.map((d) => {
        const current = d.day === today;
        return (
          <div key={d.day} className="contents">
            <dt className={cn(current ? "font-semibold text-ink" : "text-muted")}>{locale === "en" ? d.en : d.nl}</dt>
            <dd className={cn("tabular-nums", current ? "font-semibold text-ink" : "text-ink-soft")}>{range(d)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
