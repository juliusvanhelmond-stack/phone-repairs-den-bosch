import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeviceCard } from "@/components/devices/device-card";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { brandPath, brands, categories, devicesForBrand, getBrand } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// All valid params are prerendered; unknown params must return a real 404,
// so `notFound()` runs outside Suspense and navigation waits for the static page.
export const instant = false;

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/reparaties/[brand]">): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  return pageMetadata({
    title: brand.seo?.title ?? `${brand.name} reparatie in Den Bosch`,
    description:
      brand.seo?.description ??
      `${brand.name} laten repareren in Den Bosch. Kies je model en bekijk welke reparaties mogelijk zijn. Op afspraak, vaak binnen 30 minuten.`,
    path: brandPath(brand.id),
  });
}

export default async function BrandPage({ params }: PageProps<"/reparaties/[brand]">) {
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
      return { category: c, count: list.length, series };
    });

  return (
    <>
      <PageIntro
        crumbs={[
          { name: "Reparaties", href: "/reparaties" },
          { name: brand.name, href: brandPath(brand.id) },
        ]}
        eyebrow="Kies je model"
        title={`${brand.name} reparatie`}
        intro={`Selecteer je ${brand.name} toestel om te zien welke reparaties mogelijk zijn. Staat je model er niet tussen? Neem contact op, dan kijken we graag mee.`}
      >
        {sections.length > 1 && (
          <nav aria-label="Categorieën" className="flex flex-wrap gap-2">
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
        <FinalCta title={`Je ${brand.name} laten repareren?`} />
      </div>
    </>
  );
}
