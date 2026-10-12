import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { ArrowRight, Search } from "lucide-react";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { ContentIcon } from "@/components/repairs/icon";
import { Button } from "@/components/ui/button";
import {
  brandPath,
  brandsForCategory,
  categories,
  devices,
  localizeCategory,
  localizeRepair,
  repairPath,
  repairs,
} from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: t("Reparaties voor smartphone, tablet en MacBook", "Repairs for smartphone, tablet and MacBook"),
    description: t(
      "Overzicht van alle reparaties bij Phone Repairs in Den Bosch: scherm, batterij, oplaadpoort, camera, waterschade en meer.",
      "Overview of all repairs at Phone Repairs in Den Bosch: screen, battery, charging port, camera, water damage and more.",
    ),
    path: "/reparaties",
    locale,
  });
}

export default async function RepairsOverviewPage() {
  const { locale, t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Reparaties", "Repairs"), href: "/reparaties" }]}
        eyebrow={t("Reparaties", "Repairs")}
        title={t("Alle reparaties en toestellen.", "All repairs and devices.")}
        intro={t(
          "Kies je merk of het soort reparatie. Weet je precies welk model je hebt? Gebruik dan de toestelzoeker.",
          "Choose your brand or the type of repair. Know exactly which model you have? Use the device finder.",
        )}
      >
        <Button asChild size="lg">
          <Link href="/#toestel-zoeken">
            <Search aria-hidden />
            {t("Zoek jouw toestel", "Find your device")}
          </Link>
        </Button>
      </PageIntro>

      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-4 lg:grid-cols-3">
          {categories.map((cat) => localizeCategory(cat, locale)).map((c) => (
            <div key={c.id} id={c.id} className="rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line">
              <p className="text-sm text-muted tabular-nums">{devices.filter((d) => d.categoryId === c.id).length} {t("modellen", "models")}</p>
              <h2 className="mt-1 text-title font-semibold text-ink">{c.plural}</h2>
              <ul className="mt-6 divide-y divide-line border-t border-line">
                {brandsForCategory(c.id).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={brandPath(b.id) + (b.categories.length > 1 ? `#${c.id}` : "")}
                      className="group flex items-center justify-between py-3.5 text-ink hover:text-accent"
                    >
                      {b.name}
                      <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16 lg:py-24">
        <div className="container-page">
          <h2 className="text-title font-semibold text-ink">{t("Soort reparatie", "Type of repair")}</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {repairs.map((rep) => localizeRepair(rep, locale)).map((r) => (
              <li key={r.id}>
                <Link
                  href={repairPath(r.slug)}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                >
                  <ContentIcon name={r.icon} className="size-6 text-accent" />
                  <span className="mt-6 font-medium text-ink">{r.name}</span>
                  <span className="mt-1 text-sm leading-relaxed text-muted">{r.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="pt-20 lg:pt-28">
        <FinalCta />
      </div>
    </>
  );
}
