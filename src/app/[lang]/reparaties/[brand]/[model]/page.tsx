import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { BadgeCheck, Eye, ShieldCheck, Timer } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { DevicePhoto } from "@/components/devices/device-photo";
import { DeviceCard } from "@/components/devices/device-card";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { RepairPriceList } from "@/components/repairs/repair-price-list";
import { ContactActions } from "@/components/contact/contact-actions";
import { WhatsAppCard } from "@/components/contact/whatsapp-card";
import { ReviewsLink } from "@/components/contact/reviews-link";
import { JsonLd } from "@/components/ui/json-ld";
import {
  brandPath,
  devicePath,
  devices,
  faqs,
  localizeFaq,
  localizeRepair,
  generalWarranty,
  brandLabel,
  getBrand,
  getDevice,
  getPriceList,
  relatedDevices,
  repairsForDevice,
} from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { localizePath, type Translate } from "@/lib/i18n";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { whatsappMessage } from "@/lib/site";
import { cn } from "@/lib/utils";

const formatDate = (iso: string, locale: "nl" | "en") =>
  new Date(iso).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

// All valid params are prerendered; unknown params must return a real 404,
// so `notFound()` runs outside Suspense and navigation waits for the static page.
export const instant = false;

export function generateStaticParams() {
  return devices.map((d) => ({ brand: d.brandId, model: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/reparaties/[brand]/[model]">): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const { brand, model } = await params;
  const device = getDevice(brand, model);
  if (!device) return {};
  const brandName = getBrand(brand)?.name ?? "";
  const fullName = device.name.startsWith(brandName) || brand === "apple" ? device.name : `${brandName} ${device.name}`;
  return pageMetadata({
    title: (locale === "nl" && device.seo?.title) || t(`${fullName} reparatie in Den Bosch`, `${fullName} repair in Den Bosch`),
    description:
      (locale === "nl" && device.seo?.description) ||
      t(
        `${fullName} kapot? Scherm, batterij en meer laten repareren bij Phone Repairs in Den Bosch. Op afspraak, vaak binnen 30 minuten terwijl je meekijkt.`,
        `${fullName} broken? Have the screen, battery and more repaired at Phone Repairs in Den Bosch. By appointment, often within 30 minutes while you watch.`,
      ),
    path: devicePath(device),
    locale,
  });
}

const factsFor = (t: Translate) => [
  {
    icon: Timer,
    title: t("Vaak binnen 30 minuten", "Often within 30 minutes"),
    body: t("De meeste reparaties zijn klaar terwijl je wacht.", "Most repairs are done while you wait."),
  },
  {
    icon: Eye,
    title: t("Je kijkt mee", "You watch the repair"),
    body: t("Je ziet zelf hoe je toestel wordt gerepareerd.", "You see for yourself how your device is repaired."),
  },
  {
    icon: BadgeCheck,
    title: t("Originele onderdelen", "Original parts"),
    body: t("Gerepareerd met originele kwaliteit onderdelen.", "Repaired with original quality parts."),
  },
  {
    icon: ShieldCheck,
    title: t("Gegevens blijven staan", "Your data stays"),
    body: t("Je foto’s, apps en berichten blijven op je toestel.", "Your photos, apps and messages stay on your device."),
  },
];

export default async function DevicePage({ params }: PageProps<"/[lang]/reparaties/[brand]/[model]">) {
  const { locale, t } = await getI18n();
  const facts = factsFor(t);
  const { brand: brandId, model } = await params;
  const device = getDevice(brandId, model);
  const brand = getBrand(brandId);
  if (!device || !brand) notFound();

  const repairs = repairsForDevice(device).map((r) => localizeRepair(r, locale));
  const related = relatedDevices(device);
  const repairIds = new Set(repairs.map((r) => r.id));
  const deviceFaqs = faqs
    .filter((f) => f.repairIds.length === 0 || f.repairIds.some((id) => repairIds.has(id)))
    .slice(0, 6)
    .map((f) => localizeFaq(f, locale));
  const priceList = getPriceList(device.id);
  // Each published row with an amount is an Offer, under its original label.
  const offers = (priceList?.rows ?? []).flatMap((r) => (r.amount === null ? [] : [{ name: r.label, price: r.amount }]));
  const fullName = device.name.startsWith(brand.name) || brand.id === "apple" ? device.name : `${brand.name} ${device.name}`;
  const wide = device.art === "laptop";
  const medium = device.art.startsWith("tablet") || device.art === "phone-foldable";

  return (
    <>
      <PageIntro
        crumbs={[
          { name: t("Reparaties", "Repairs"), href: "/reparaties" },
          {
            name: brandLabel(brand.id, device.categoryId),
            href: brand.id === "apple" ? `${brandPath(brand.id)}#${device.categoryId}` : brandPath(brand.id),
          },
          { name: device.name, href: devicePath(device) },
        ]}
        eyebrow={brand.id === "apple" ? device.series : `${brand.name} · ${device.series}`}
        title={t(`${fullName} reparatie`, `${fullName} repair`)}
        intro={t(
          `Is je ${device.name} kapot? Bij Phone Repairs in Den Bosch wordt hij op afspraak gerepareerd. De meeste reparaties zijn binnen ongeveer 30 minuten klaar, terwijl je meekijkt.`,
          `Is your ${device.name} broken? At Phone Repairs in Den Bosch it is repaired by appointment. Most repairs are done in about 30 minutes while you watch.`,
        )}
        aside={
          <figure className="relative flex aspect-[4/3.4] flex-col overflow-hidden rounded-[var(--radius-panel)] bg-white ring-1 ring-line">
            <div className="relative flex min-h-0 flex-1 items-center justify-center p-[8%]">
              <DevicePhoto
                device={device}
                priority
                sizes="(min-width: 1024px) 34rem, 90vw"
                artClassName={cn("relative h-full w-auto", wide ? "max-w-[82%]" : medium ? "max-w-[48%]" : "max-w-[34%]")}
              />
            </div>
            <figcaption className="px-5 pb-4 text-right text-xs text-muted">{t("Afbeelding ter illustratie", "Illustrative image")}</figcaption>
          </figure>
        }
      >
        <ContactActions message={whatsappMessage({ device: fullName, locale })} />
      </PageIntro>

      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="text-title font-semibold text-ink">{t("Reparaties en prijzen", "Repairs and prices")}</h2>
            <p className="mt-2 text-muted">{t("Alle prijzen zijn inclusief montage en 21% btw.", "All prices include fitting and 21% VAT.")}</p>
            {locale === "en" && (
              <p className="mt-2 text-sm text-muted">The repair descriptions below are shown as on our Dutch price list.</p>
            )}
            {priceList ? (
              <DemoNote className="mt-6">
                {t(
                  `Prijslijst overgenomen van de huidige website (pagina laatst gewijzigd op ${formatDate(priceList.updatedAt, locale)}).`,
                  `Price list taken from the current website (page last changed on ${formatDate(priceList.updatedAt, locale)}).`,
                )}
              </DemoNote>
            ) : (
              <DemoNote className="mt-6">
                {t("Voor dit model staat op de huidige website geen prijslijst.", "The current website has no price list for this model.")}
              </DemoNote>
            )}
            <div className="mt-6">
              <RepairPriceList device={device} repairs={repairs} />
            </div>
          </div>
          <aside className="space-y-4">
            <WhatsAppCard message={whatsappMessage({ device: fullName, locale })} />
            <div className="rounded-[var(--radius-card)] bg-mist p-6 ring-1 ring-line">
              <h2 className="font-semibold text-ink">{t("Goed om te weten", "Good to know")}</h2>
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
              <ReviewsLink className="mt-6 flex w-fit text-sm" />
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <h2 className="font-semibold text-ink">{t("Garantie", "Warranty")}</h2>
              {generalWarranty?.verified && generalWarranty.durationMonths ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(
                      `${generalWarranty.durationMonths} maanden garantie op de werking van het vervangen onderdeel. Voor moederbordreparaties geldt 60 dagen; bij waterschade is er geen garantie.`,
                      `${generalWarranty.durationMonths} months warranty on the working of the replaced part. Motherboard repairs have 60 days; water damage comes without a warranty.`,
                    )}
                  </p>
                  <Link href="/garantie" className="mt-3 inline-flex text-sm font-medium text-accent-strong hover:text-accent">
                    {t("Alles over de garantie", "All about the warranty")}
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(
                    "Vraag bij je afspraak naar de garantievoorwaarden voor jouw reparatie.",
                    "Ask about the warranty terms for your repair when you make your appointment.",
                  )}
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24">
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">{t(`Andere ${device.series} modellen`, `Other ${device.series} models`)}</h2>
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

      <Faq items={deviceFaqs} title={t(`Vragen over je ${device.name}`, `Questions about your ${device.name}`)} />
      <div className="pt-20 lg:pt-28">
        <FinalCta
          title={t(`Je ${device.name} laten repareren?`, `Have your ${device.name} repaired?`)}
          message={whatsappMessage({ device: fullName, locale })}
        />
      </div>
      <JsonLd
        data={serviceJsonLd({
          name: t(`${fullName} reparatie`, `${fullName} repair`),
          path: localizePath(devicePath(device), locale),
          offers,
        })}
      />
    </>
  );
}
