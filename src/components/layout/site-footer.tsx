import { Link } from "@/components/i18n/link";
import { Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { brandPath, brands, landingPages, localizeLanding, localizeRepair, repairPath, repairs } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { fullAddress, mapsUrl, site, whatsappHref, whatsappMessage } from "@/lib/site";

const moreIds = [
  "waterschade-reparatie-phone-repairs",
  "moederbord-reparatie-den-bosch",
  "data-recovery",
  "nintendo-switch-reparatie",
  "pre-owned-toestellen",
  "bijzondere-merken-reparatie",
  "zakelijke-reparatie",
  "reparatie-opsturen",
];
/** Info pages kept from the current site, listed with the company links. */
const infoIds = [
  "garantie",
  "originele-onderdelen-phone-repairs",
  "iphone-premium-oled-scherm",
  "iphone-onderdelen-kalibreren",
  "verzekering",
  "duurzaamheid-en-telefoonreparatie",
  "klantenservice-phone-repairs",
];

export async function SiteFooter() {
  const { locale, t } = await getI18n();
  const wa = whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined);
  const companyLinks = [
    { label: t("Werkwijze", "How it works"), href: "/werkwijze" },
    { label: t("Over ons", "About us"), href: "/over-ons" },
    { label: t("Veelgestelde vragen", "FAQ"), href: "/veelgestelde-vragen" },
    { label: "Contact", href: "/contact" },
    { label: t("Afspraak maken", "Make an appointment"), href: "/afspraak" },
    { label: t("Werkgebied", "Service area"), href: "/werkgebied" },
    { label: "Blog", href: "/blog-post" },
  ];
  const pageLinks = (ids: string[]) =>
    ids.flatMap((id) => {
      const page = landingPages.find((p) => p.id === id);
      return page ? [{ label: localizeLanding(page, locale).title, href: page.path }] : [];
    });
  const moreLinks = pageLinks(moreIds);
  companyLinks.push(
    ...pageLinks(infoIds).map((l) =>
      l.href === "/iphone-onderdelen-kalibreren" ? { ...l, label: t("iPhone onderdelen kalibreren", "Calibrating iPhone parts") } : l,
    ),
  );
  return (
    <footer className="bg-night text-neutral-300">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1fr_1fr] lg:py-20">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-neutral-400">
            {t(
              `Reparatie van smartphones, tablets en MacBooks in ${site.address.cityShort}. Op afspraak, vaak binnen 30 minuten klaar.`,
              `Repair of smartphones, tablets and MacBooks in ${site.address.cityShort}. By appointment, often ready within 30 minutes.`,
            )}
          </p>
          <ul className="mt-6 space-y-3 text-[0.9375rem]">
            {wa && (
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 font-medium text-white transition-colors hover:text-accent-light"
                >
                  <MessageCircle className="size-4 text-accent-light" aria-hidden />
                  WhatsApp {site.whatsapp?.display}
                </a>
              </li>
            )}
            <li>
              <a href={site.phone.href} className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="size-4 text-neutral-500" aria-hidden />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <Mail className="size-4 text-neutral-500" aria-hidden />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <MapPin className="size-4 text-neutral-500" aria-hidden />
                {fullAddress}
              </a>
            </li>
            {site.reviews && (
              <li>
                <a
                  href={site.reviews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors hover:text-white"
                >
                  <Star className="size-4 text-neutral-500" aria-hidden />
                  {t("Reviews op", "Reviews on")} {site.reviews.platform}
                </a>
              </li>
            )}
          </ul>
        </div>
        <FooterColumn
          title={t("Reparaties", "Repairs")}
          links={repairs.map((r) => ({ label: localizeRepair(r, locale).name, href: repairPath(r.slug) }))}
        />
        <FooterColumn title={t("Merken", "Brands")} links={brands.map((b) => ({ label: b.name, href: brandPath(b.id) }))} />
        <FooterColumn title={t("Meer", "More")} links={moreLinks} />
        <FooterColumn title="Phone Repairs" links={companyLinks} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.legalName}</p>
          <p>{t("Ontwerpvoorstel door JUNE Studio · niet geïndexeerd", "Design proposal by JUNE Studio · not indexed")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-white">{title}</p>
      <ul className="space-y-2.5 text-[0.9375rem]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
