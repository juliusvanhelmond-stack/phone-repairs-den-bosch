import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { areasByPlace, localizeLanding } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const places = areasByPlace()
    .filter((g) => g.placeKind === "plaats")
    .map((g) => g.place);
  const list = (and: string) => `${places.slice(0, 7).join(", ")} ${and} ${t("meer", "more")}`;
  return pageMetadata({
    title: t("Werkgebied", "Service area"),
    description: t(
      `Phone Repairs zit in Den Bosch en helpt ook klanten uit ${list("en")}.`,
      `Phone Repairs is based in Den Bosch and also helps customers from ${list("and")}.`,
    ),
    path: "/werkgebied",
    locale,
  });
}

export default async function AreaIndexPage() {
  const { locale, t } = await getI18n();
  const groups = areasByPlace();
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Werkgebied", "Service area"), href: "/werkgebied" }]}
        eyebrow={t("Werkgebied", "Service area")}
        title={t("Vanuit de hele regio naar Den Bosch.", "From all over the region to Den Bosch.")}
        intro={t(
          "De werkplaats zit aan de Ploossche Hof in Den Bosch. Klanten komen uit de stad zelf en uit de plaatsen eromheen.",
          "The workshop is at Ploossche Hof in Den Bosch. Customers come from the city itself and from the surrounding towns.",
        )}
      />
      <section className="py-16 lg:py-24">
        <ul className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <li key={g.place}>
              <Reveal delay={i * 0.03} className="h-full">
                <div className="h-full rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line">
                  <p className="text-xs text-muted">{g.placeKind === "wijk" ? t("Wijk in Den Bosch", "Neighbourhood in Den Bosch") : t("Plaats", "Town")}</p>
                  <h2 className="mt-1 text-title font-semibold text-ink">{g.place}</h2>
                  <ul className="mt-5 space-y-2">
                    {g.pages.map((page) => localizeLanding(page, locale)).map((p) => (
                      <li key={p.id}>
                        <Link href={p.path} className="group inline-flex items-center gap-2 text-accent-strong hover:text-accent">
                          {p.title}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <Location />
      <FinalCta />
    </>
  );
}
