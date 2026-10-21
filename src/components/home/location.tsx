import { Link } from "@/components/i18n/link";
import { ArrowUpRight, CalendarCheck, Car, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getI18n } from "@/lib/i18n-server";
import { OpeningHoursList } from "@/components/contact/opening-hours";
import { fullAddress, mapsUrl, site, whatsappCopy, whatsappHref, whatsappMessage } from "@/lib/site";
import { Aura } from "@/components/ui/aura";
import { ReviewsLink } from "@/components/contact/reviews-link";
import { Skyline } from "@/components/ui/skyline";

/**
 * The shop's Google Maps card (name, rating, route), the same embed as on the current site
 * (client request 2026-10-21: a real map instead of an illustration).
 */
export function MapEmbed({ title, className }: { title: string; className?: string }) {
  return (
    <div className={`tone-light relative h-full min-h-72 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line ${className ?? ""}`}>
      <iframe
        src={site.mapEmbedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}

export async function ContactDetails({ className }: { className?: string }) {
  const { locale, t } = await getI18n();
  const copy = whatsappCopy(locale);
  const wa = whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined);
  const rows = [
    ...(copy && wa
      ? [{ icon: MessageCircle, label: `WhatsApp · ${copy.hours}`, value: copy.display, href: wa, external: true }]
      : []),
    { icon: Phone, label: t("Telefoon", "Phone"), value: site.phone.display, href: site.phone.href },
    { icon: MapPin, label: t("Adres", "Address"), value: fullAddress, href: mapsUrl, external: true },
    { icon: Mail, label: "E-mail", value: site.email, href: `mailto:${site.email}` },
    { icon: CalendarCheck, label: t("Afspraak", "Appointment"), value: t("Altijd op afspraak", "Always by appointment") },
    { icon: Car, label: t("Parkeren", "Parking"), value: t(site.parkingNote, "Free parking right outside") },
  ];
  return (
    <ul className={className}>
      <li id="openingstijden" className="flex scroll-mt-28 items-start gap-4 border-b border-line py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
          <Clock className="size-[1.125rem]" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-muted">{t("Openingstijden (altijd op afspraak)", "Opening hours (always by appointment)")}</span>
          <OpeningHoursList className="mt-1.5 text-[0.9375rem]" />
        </span>
      </li>
      {rows.map((r) => (
        <li key={r.label} className="flex items-start gap-4 border-b border-line py-4 last:border-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
            <r.icon className="size-[1.125rem]" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-muted">{r.label}</span>
            {r.href ? (
              <a
                href={r.href}
                {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group inline-flex items-center gap-1 font-medium break-words text-ink hover:text-accent"
              >
                {r.value}
                {r.external && <ArrowUpRight className="size-4 text-muted group-hover:text-accent" aria-hidden />}
              </a>
            ) : (
              <span className="block font-medium text-ink">{r.value}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export async function Location() {
  const { t } = await getI18n();
  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-28">
      <Aura variant="soft" />
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow={t("Locatie & contact", "Location & contact")} title={t("Langskomen in Den Bosch.", "Visit us in Den Bosch.")} />
        </Reveal>
        <Skyline className="mt-10 text-accent-strong/45 lg:mt-12" title={t("Skyline van Den Bosch", "Den Bosch skyline")} />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="h-full">
            <div className="relative h-full">
              <MapEmbed title={t("Phone Repairs op Google Maps", "Phone Repairs on Google Maps")} />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-soft)] transition-colors hover:bg-accent hover:text-white"
              >
                Open in Google Maps
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-8">
              <ContactDetails />
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-accent"
              >
                {t("Alle contactmogelijkheden", "All ways to get in touch")}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <ReviewsLink className="mt-3 flex w-fit text-[0.9375rem]" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
