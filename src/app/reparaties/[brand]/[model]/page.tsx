import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Eye, Phone, ShieldCheck, Timer } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { DeviceArt } from "@/components/devices/device-art";
import { DeviceCard } from "@/components/devices/device-card";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { RepairPriceList } from "@/components/repairs/repair-price-list";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import {
  brandPath,
  devicePath,
  devices,
  faqs,
  generalWarranty,
  getBrand,
  getDevice,
  getVerifiedPrice,
  relatedDevices,
  repairsForDevice,
} from "@/lib/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// All valid params are prerendered; unknown params must return a real 404,
// so `notFound()` runs outside Suspense and navigation waits for the static page.
export const instant = false;

export function generateStaticParams() {
  return devices.map((d) => ({ brand: d.brandId, model: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/reparaties/[brand]/[model]">): Promise<Metadata> {
  const { brand, model } = await params;
  const device = getDevice(brand, model);
  if (!device) return {};
  const brandName = getBrand(brand)?.name ?? "";
  const fullName = device.name.startsWith(brandName) || brand === "apple" ? device.name : `${brandName} ${device.name}`;
  return pageMetadata({
    title: device.seo?.title ?? `${fullName} reparatie in Den Bosch`,
    description:
      device.seo?.description ??
      `${fullName} kapot? Scherm, batterij en meer laten repareren bij Phone Repairs in Den Bosch. Op afspraak, vaak binnen 30 minuten terwijl je meekijkt.`,
    path: devicePath(device),
  });
}

const facts = [
  { icon: Timer, title: "Vaak binnen 30 minuten", body: "De meeste reparaties zijn klaar terwijl je wacht." },
  { icon: Eye, title: "Je kijkt mee", body: "Je ziet zelf hoe je toestel wordt gerepareerd." },
  { icon: BadgeCheck, title: "Originele onderdelen", body: "Gerepareerd met originele kwaliteit onderdelen." },
  { icon: ShieldCheck, title: "Gegevens blijven staan", body: "Je foto’s, apps en berichten blijven op je toestel." },
];

export default async function DevicePage({ params }: PageProps<"/reparaties/[brand]/[model]">) {
  const { brand: brandId, model } = await params;
  const device = getDevice(brandId, model);
  const brand = getBrand(brandId);
  if (!device || !brand) notFound();

  const repairs = repairsForDevice(device);
  const related = relatedDevices(device);
  const repairIds = new Set(repairs.map((r) => r.id));
  const deviceFaqs = faqs.filter((f) => f.repairIds.length === 0 || f.repairIds.some((id) => repairIds.has(id))).slice(0, 6);
  const offers = repairs
    .map((r) => ({ name: r.name, price: getVerifiedPrice(device.id, r.id)?.amount }))
    .filter((o): o is { name: string; price: number } => typeof o.price === "number");
  const fullName = device.name.startsWith(brand.name) || brand.id === "apple" ? device.name : `${brand.name} ${device.name}`;
  const wide = device.art === "laptop";
  const medium = device.art.startsWith("tablet") || device.art === "phone-foldable";

  return (
    <>
      <PageIntro
        crumbs={[
          { name: "Reparaties", href: "/reparaties" },
          { name: brand.name, href: brandPath(brand.id) },
          { name: device.name, href: devicePath(device) },
        ]}
        eyebrow={`${brand.name} · ${device.series}`}
        title={`${fullName} reparatie`}
        intro={`Is je ${device.name} kapot? Bij Phone Repairs in Den Bosch wordt hij op afspraak gerepareerd. De meeste reparaties zijn binnen ongeveer 30 minuten klaar, terwijl je meekijkt.`}
        aside={
          <div className="relative flex aspect-[4/3.4] items-end justify-center overflow-hidden rounded-[var(--radius-panel)] bg-mist ring-1 ring-line">
            <div className="absolute inset-x-[15%] bottom-0 h-1/2 rounded-full bg-accent/10 blur-3xl" aria-hidden />
            <DeviceArt
              art={device.art}
              title={`Illustratie ${device.name}`}
              className={cn("relative translate-y-[12%]", wide ? "w-[82%]" : medium ? "w-[48%]" : "w-[34%]")}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={`/afspraak?toestel=${device.id}`}>
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
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="text-title font-semibold text-ink">Reparaties en prijzen</h2>
            <p className="mt-2 text-muted">Alle prijzen zijn inclusief montage en 21% btw.</p>
            <DemoNote className="mt-6">
              Prijzen worden pas getoond als ze uit de bestaande website zijn overgenomen en gecontroleerd. Voor
              dit model is nog geen prijs geïmporteerd.
            </DemoNote>
            <div className="mt-6">
              <RepairPriceList device={device} repairs={repairs} />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] bg-mist p-6 ring-1 ring-line">
              <h2 className="font-semibold text-ink">Goed om te weten</h2>
              <ul className="mt-5 space-y-5">
                {facts.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <f.icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                    <span>
                      <span className="block text-[0.9375rem] font-medium text-ink">{f.title}</span>
                      <span className="block text-sm leading-relaxed text-muted">{f.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <h2 className="font-semibold text-ink">Garantie</h2>
              {generalWarranty?.verified && generalWarranty.durationMonths ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {generalWarranty.durationMonths} maanden garantie op {generalWarranty.scope.toLowerCase()}.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Vraag bij je afspraak naar de garantievoorwaarden voor jouw reparatie.
                </p>
              )}
              <DemoNote className="mt-4">
                De huidige website noemt zowel 12 maanden als 90 dagen garantie. Dit wordt eerst met Phone Repairs
                afgestemd.
              </DemoNote>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24">
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">Andere {device.series} modellen</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((d) => (
                <li key={d.id}>
                  <DeviceCard device={d} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Faq items={deviceFaqs} title={`Vragen over je ${device.name}`} />
      <div className="pt-20 lg:pt-28">
        <FinalCta title={`Je ${device.name} laten repareren?`} />
      </div>
      <JsonLd data={serviceJsonLd({ name: `${fullName} reparatie`, path: devicePath(device), offers })} />
    </>
  );
}
