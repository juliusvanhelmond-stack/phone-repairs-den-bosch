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

export function MapGraphic() {
  return (
    <div className="relative h-full min-h-72 overflow-hidden rounded-[var(--radius-card)] bg-mist" aria-hidden>
      <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <rect width="600" height="420" fill="var(--color-mist)" />
        <path d="M-20 300 C 120 260, 200 330, 330 280 S 520 200, 640 230" stroke="#C7D7F5" strokeWidth="34" fill="none" />
        <g stroke="#fff" strokeLinecap="round" fill="none">
          <path d="M0 120 H600" strokeWidth="14" />
          <path d="M60 0 L180 420" strokeWidth="10" />
          <path d="M330 0 V420" strokeWidth="14" />
          <path d="M440 0 L520 420" strokeWidth="8" />
          <path d="M0 210 H330" strokeWidth="8" />
          <path d="M330 175 H600" strokeWidth="8" />
          <path d="M200 0 L250 120" strokeWidth="6" />
          <path d="M330 360 H600" strokeWidth="6" />
        </g>
        <g fill="var(--color-line)">
          <rect x="360" y="20" width="60" height="70" rx="8" />
          <rect x="460" y="40" width="110" height="50" rx="8" />
          <rect x="90" y="140" width="80" height="50" rx="8" />
          <rect x="350" y="200" width="70" height="60" rx="8" />
          <rect x="230" y="150" width="70" height="40" rx="8" />
        </g>
      </svg>
      <div className="absolute top-[42%] left-[55%] -translate-x-1/2 -translate-y-full">
        <span className="absolute top-full left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15" />
        <span className="relative grid size-12 place-items-center rounded-full rounded-br-none bg-ink text-white shadow-[var(--shadow-lift)] [transform:rotate(45deg)]">
          <MapPin className="size-5 [transform:rotate(-45deg)]" />
        </span>
      </div>
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
    { icon: CalendarCheck, label: t("Afspraak", "Appointment"), value: t("Alleen op afspraak", "By appointment only") },
    { icon: Car, label: t("Parkeren", "Parking"), value: t(site.parkingNote, "Free parking right outside") },
  ];
  return (
    <ul className={className}>
      <li id="openingstijden" className="flex scroll-mt-28 items-start gap-4 border-b border-line py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
          <Clock className="size-[1.125rem]" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-muted">{t("Openingstijden (alleen op afspraak)", "Opening hours (by appointment only)")}</span>
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
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group relative block h-full" aria-label={t("Open de locatie in Google Maps", "Open the location in Google Maps")}>
              <MapGraphic />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-soft)] transition-colors group-hover:bg-ink group-hover:text-white">
                Open in Google Maps
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-8">
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
