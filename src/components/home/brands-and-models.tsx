import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { DeviceCard } from "@/components/devices/device-card";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrandMark } from "@/components/devices/brand-mark";
import { brandEntries, popularDevices } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";

export async function PopularBrands() {
  const { t } = await getI18n();
  return (
    <section className="tone-grey py-14">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          {t(
            "Reparaties voor alle gangbare merken. Kies je merk voor een overzicht van modellen.",
            "Repairs for all common brands. Choose your brand for an overview of models.",
          )}
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
          {brandEntries().map((b) => (
            <li key={b.key}>
              <Link
                href={b.href}
                className="group flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-5 text-[1.0625rem] font-semibold tracking-tight text-ink-soft shadow-[var(--shadow-soft)] ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
              >
                <BrandMark brandId={b.brandId} className="size-[1.125rem]" />
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function PopularModels() {
  const { t } = await getI18n();
  const items = popularDevices.slice(0, 8);
  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow={t("Populaire modellen", "Popular models")}
              title={t("Veelgevraagde toestellen.", "Frequently requested devices.")}
              intro={t("Bekijk direct welke reparaties mogelijk zijn voor jouw model.", "See straight away which repairs are possible for your model.")}
            />
          </Reveal>
          <Link
            href="/reparaties"
            className="inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-accent"
          >
            {t("Alle toestellen", "All devices")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((d, i) => (
            <li key={d.id}>
              <Reveal delay={i * 0.04} className="h-full">
                <DeviceCard device={d} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
