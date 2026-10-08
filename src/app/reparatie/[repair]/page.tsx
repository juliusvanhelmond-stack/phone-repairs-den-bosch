import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Phone } from "lucide-react";
import { DeviceCard } from "@/components/devices/device-card";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { HowItWorks } from "@/components/home/how-it-works";
import { PageIntro } from "@/components/layout/page-intro";
import { ContentIcon } from "@/components/repairs/icon";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { brandPath, brands, faqs, getRepair, popularDevices, repairPath, repairs } from "@/lib/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

// All valid params are prerendered; unknown params must return a real 404,
// so `notFound()` runs outside Suspense and navigation waits for the static page.
export const instant = false;

export function generateStaticParams() {
  return repairs.map((r) => ({ repair: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/reparatie/[repair]">): Promise<Metadata> {
  const repair = getRepair((await params).repair);
  if (!repair) return {};
  return pageMetadata({
    title: repair.seo?.title ?? `${repair.name} in Den Bosch`,
    description: repair.seo?.description ?? `${repair.summary} ${repair.name} bij Phone Repairs in Den Bosch, op afspraak.`,
    path: repairPath(repair.slug),
  });
}

export default async function RepairPage({ params }: PageProps<"/reparatie/[repair]">) {
  const repair = getRepair((await params).repair);
  if (!repair) notFound();

  const relevantBrands = brands.filter((b) => b.categories.some((c) => repair.categories.includes(c)));
  const examples = popularDevices.filter((d) => repair.categories.includes(d.categoryId)).slice(0, 4);
  const scopedFaqs = faqs.filter((f) => f.repairIds.includes(repair.id));
  const faqItems = [...scopedFaqs, ...faqs.filter((f) => f.repairIds.length === 0)].slice(0, 6);

  return (
    <>
      <PageIntro
        crumbs={[
          { name: "Reparaties", href: "/reparaties" },
          { name: repair.name, href: repairPath(repair.slug) },
        ]}
        eyebrow="Reparatie"
        title={repair.name}
        intro={repair.summary}
        aside={
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[var(--radius-panel)] bg-night">
            <div className="bg-grid absolute inset-0 opacity-40 invert [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" aria-hidden />
            <div className="absolute size-64 rounded-full bg-accent/40 blur-[90px]" aria-hidden />
            <span className="relative grid size-28 place-items-center rounded-[2rem] bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
              <ContentIcon name={repair.icon} className="size-12" />
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={`/afspraak?reparatie=${repair.id}`}>
              Maak een afspraak
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={site.phone.href}>
              <Phone aria-hidden />
              {site.phone.display}
            </a>
          </Button>
        </div>
      </PageIntro>

      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-pretty text-ink-soft">
            {repair.description.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {repair.advice.length > 0 && (
              <div className="flex gap-3 rounded-2xl bg-warning-soft p-5 text-base text-warning ring-1 ring-amber-200">
                <AlertTriangle className="mt-1 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">Belangrijk</p>
                  <ul className="mt-1 space-y-1">
                    {repair.advice.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-card)] bg-mist p-7 ring-1 ring-line">
            <h2 className="font-semibold text-ink">Kies je merk</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {relevantBrands.map((b) => (
                <li key={b.id}>
                  <Link
                    href={brandPath(b.id)}
                    className="block rounded-full bg-white px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/#toestel-zoeken"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:text-blue-800"
            >
              Of gebruik de toestelzoeker
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24">
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">{repair.name} voor populaire modellen</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {examples.map((d) => (
                <li key={d.id}>
                  <DeviceCard device={d} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <HowItWorks />
      <Faq items={faqItems} />
      <div className="pt-20 lg:pt-28">
        <FinalCta />
      </div>
      <JsonLd data={serviceJsonLd({ name: repair.name, path: repairPath(repair.slug), offers: [] })} />
    </>
  );
}
