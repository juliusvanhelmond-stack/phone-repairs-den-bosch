import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeviceTile } from "@/components/devices/device-card";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { brandLabel, brandPath, brands, categories, devicesForBrand, getBrand, localizeCategory } from "@/lib/catalog";
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
  const name = brand.id === "apple" ? t("iPhone, iPad en MacBook", "iPhone, iPad and MacBook") : brand.name;
  return pageMetadata({
    title: (locale === "nl" && brand.seo?.title) || t(`${name} reparatie in Den Bosch`, `${name} repair in Den Bosch`),
    description:
      (locale === "nl" && brand.seo?.description) ||
      t(
        `${name} laten repareren in Den Bosch. Kies je model en bekijk welke reparaties mogelijk zijn. Op afspraak, binnen 30 minuten.`,
        `Have your ${name} repaired in Den Bosch. Choose your model and see which repairs are possible. By appointment, within 30 minutes.`,
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
      return { category: localizeCategory(c, locale), label: brandLabel(brand.id, c.id), series };
    });
  // Apple is presented by product line (client request).
  const name = brand.id === "apple" ? t("iPhone, iPad en MacBook", "iPhone, iPad and MacBook") : brand.name;

  return (
    <>
      <PageIntro
        crumbs={[
          { name: t("Reparaties", "Repairs"), href: "/reparaties" },
          { name, href: brandPath(brand.id) },
        ]}
        eyebrow={t("Kies je model", "Choose your model")}
        title={t(`${name} reparatie`, `${name} repair`)}
        intro={t(
          `Selecteer je ${name} toestel om te zien welke reparaties mogelijk zijn. Staat je model er niet tussen? Neem contact op, dan kijken we graag mee.`,
          `Select your ${name} device to see which repairs are possible. Model not listed? Get in touch and we'll gladly take a look.`,
        )}
      >
        {sections.length > 1 && (
          <nav aria-label={t("Categorieën", "Categories")} className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.category.id}
                href={`#${s.category.id}`}
                className="rounded-full bg-surface px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-night hover:text-white hover:ring-night"
              >
                {brand.id === "apple" ? s.label : s.category.plural}
              </a>
            ))}
          </nav>
        )}
      </PageIntro>

      {sections.map((s, i) => (
        <section key={s.category.id} id={s.category.id} className={i % 2 ? "bg-mist py-16 lg:py-20" : "py-16 lg:py-20"}>
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">
              {brand.id === "apple" ? s.label : `${brand.name} ${s.category.plural}`}
            </h2>
            {s.series.map((series) => (
              <div key={series.name} className="mt-7">
                {s.series.length > 1 && <h3 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">{series.name}</h3>}
                {/* Separate tiles, so an incomplete last row simply ends instead of leaving empty cells
                    (client report 2026-10-19). */}
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {series.devices.map((d) => (
                    <li key={d.id} className="overflow-hidden rounded-2xl ring-1 ring-line">
                      <DeviceTile device={d} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="pt-4">
        <FinalCta title={t(`Je ${name} laten repareren?`, `Have your ${name} repaired?`)} />
      </div>
    </>
  );
}
