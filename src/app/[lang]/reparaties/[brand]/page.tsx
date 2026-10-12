import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeviceCard } from "@/components/devices/device-card";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { brandPath, brands, categories, devicesForBrand, getBrand, localizeCategory } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

// All valid params are prerendered; unknown params must return a real 404,
// so `notFound()` runs outside Suspense and navigation waits for the static page.
export const instant = false;

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/reparaties/[brand]">): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  return pageMetadata({
    title: (locale === "nl" && brand.seo?.title) || t(`${brand.name} reparatie in Den Bosch`, `${brand.name} repair in Den Bosch`),
    description:
      (locale === "nl" && brand.seo?.description) ||
      t(
        `${brand.name} laten repareren in Den Bosch. Kies je model en bekijk welke reparaties mogelijk zijn. Op afspraak, vaak binnen 30 minuten.`,
        `Have your ${brand.name} repaired in Den Bosch. Choose your model and see which repairs are possible. By appointment, often within 30 minutes.`,
      ),
    path: brandPath(brand.id),
    locale,
  });
}

export default async function BrandPage({ params }: PageProps<"/[lang]/reparaties/[brand]">) {
  const { locale, t } = await getI18n();
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  const sections = categories
    .filter((c) => brand.categories.includes(c.id))
    .map((c) => {
      const list = devicesForBrand(brand.id, c.id);
      const series = [...new Set(list.map((d) => d.series))].map((s) => ({
        name: s,
        devices: list.filter((d) => d.series === s),
      }));
      return { category: localizeCategory(c, locale), count: list.length, series };
    });

  return (
    <>
      <PageIntro
        crumbs={[
          { name: t("Reparaties", "Repairs"), href: "/reparaties" },
          { name: brand.name, href: brandPath(brand.id) },
        ]}
        eyebrow={t("Kies je model", "Choose your model")}
        title={t(`${brand.name} reparatie`, `${brand.name} repair`)}
        intro={t(
          `Selecteer je ${brand.name} toestel om te zien welke reparaties mogelijk zijn. Staat je model er niet tussen? Neem contact op, dan kijken we graag mee.`,
          `Select your ${brand.name} device to see which repairs are possible. Model not listed? Get in touch and we'll gladly take a look.`,
        )}
      >
        {sections.length > 1 && (
          <nav aria-label={t("Categorieën", "Categories")} className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.category.id}
                href={`#${s.category.id}`}
                className="rounded-full bg-white px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
              >
                {s.category.plural} <span className="text-muted">{s.count}</span>
              </a>
            ))}
          </nav>
        )}
      </PageIntro>

      {sections.map((s, i) => (
        <section key={s.category.id} id={s.category.id} className={i % 2 ? "bg-mist py-16 lg:py-20" : "py-16 lg:py-20"}>
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">
              {brand.name} {s.category.plural}
            </h2>
            {s.series.map((series) => (
              <div key={series.name} className="mt-10">
                {s.series.length > 1 && <h3 className="mb-4 text-sm font-medium tracking-wide text-muted uppercase">{series.name}</h3>}
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {series.devices.map((d) => (
                    <li key={d.id}>
                      <DeviceCard device={d} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="pt-4">
        <FinalCta title={t(`Je ${brand.name} laten repareren?`, `Have your ${brand.name} repaired?`)} />
      </div>
    </>
  );
}
