import { Link } from "@/components/i18n/link";
import { ArrowRight, BadgeCheck, Eye, MapPin, MessageCircle, ShieldCheck, Timer } from "lucide-react";
import Image from "next/image";
import heroPhoto from "@/assets/photos/martijn-workplace.jpg";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n-server";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";
import { Aura } from "@/components/ui/aura";

export async function Hero() {
  const { locale, t } = await getI18n();
  const wa = whatsappHref(whatsappMessage({ locale }));
  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16 lg:-mt-[4.5rem] lg:pt-[4.5rem]">
      <Aura variant="hero" />
      <div className="container-page grid items-center gap-6 pt-10 pb-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-16 lg:pb-12">
        <div className="max-w-2xl animate-fade-up">
          {/* The page's H1 carries the keyword the current homepage ranks on (SEO audit HV Media). */}
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-ink-soft">
            <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-accent">
              <MapPin className="size-4" aria-hidden />
            </span>
            <h1 className="text-[0.9375rem] font-semibold whitespace-nowrap text-ink sm:text-base">
              {t(`Telefoon reparatie ${site.address.cityShort}`, `Phone repair ${site.address.cityShort}`)}
            </h1>
            <span className="hidden text-sm text-muted sm:inline">· {t("op afspraak", "by appointment")}</span>
          </div>
          <p className="text-display font-semibold text-balance text-ink lg:text-[clamp(2.75rem,1rem+2.9vw,3.75rem)]">
            {/* Martijn Derks, e-mail 20 October 2026: a more personal introduction. */}
            {t(
              "Kijk mee hoe reparatiespecialist Martijn persoonlijk je toestel repareert.",
              "Watch repair specialist Martijn personally repair your device.",
            )}{" "}
            <span className="text-muted">{t("Snel, eerlijk en vakkundig.", "Fast, honest and skilled.")}</span>
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            {t(
              "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs Den Bosch repareer ik je toestel professioneel, binnen 30 minuten terwijl je meekijkt.",
              "From a broken screen to a worn-out battery. At Phone Repairs Den Bosch I repair your device professionally, within 30 minutes while you watch.",
            )}
          </p>
          {/* Price first, WhatsApp as the second route (mail 2026-10-19). On mobile the pinned bar has WhatsApp. */}
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#toestel-zoeken">
                {t("Bekijk jouw reparatieprijs", "See your repair price")}
                <ArrowRight className="rotate-90" aria-hidden />
              </Link>
            </Button>
            {wa && (
              <Button asChild size="lg" variant="secondary" className="max-md:hidden">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  {/* Only here, next to the personal introduction (client request 2026-10-21). */}
                  {t("WhatsApp Martijn", "WhatsApp Martijn")}
                </a>
              </Button>
            )}
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-accent" aria-hidden />
              {t("Klaar binnen 30 minuten", "Ready within 30 minutes")}
            </li>
            <li className="flex items-center gap-2">
              <Eye className="size-4 text-accent" aria-hidden />
              {t("Kijk gerust mee", "Feel free to watch")}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              {t("Je gegevens blijven op je toestel", "Your data stays on your device")}
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-accent" aria-hidden />
              {t("Originele service pack onderdelen", "Original service pack parts")}
            </li>
          </ul>
        </div>

        <div className="relative mt-4 lg:mt-0 lg:pl-6">
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-panel)] bg-mist shadow-[var(--shadow-lift)] ring-1 ring-line sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={heroPhoto}
              alt={t(
                "Martijn van Phone Repairs aan zijn werkplek met reparatiegereedschap",
                "Martijn of Phone Repairs at his workbench with repair tools",
              )}
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[42%_40%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(34_34_34/0.35),transparent_45%)]" aria-hidden />
          </div>
          <FloatingCard className="bottom-4 left-4 sm:top-8 sm:right-8 sm:bottom-auto sm:left-auto lg:-right-4" delay="0.5s">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <Timer className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t("Schermreparatie", "Screen repair")}</span>
              <span className="block text-xs text-muted">{t("Binnen 30 minuten", "Within 30 minutes")}</span>
            </span>
          </FloatingCard>
          <FloatingCard className="bottom-5 left-4 max-sm:hidden sm:bottom-8 sm:left-8 lg:left-0" delay="0.7s">
            <span className="grid size-9 place-items-center rounded-xl bg-night text-white">
              <Eye className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t("Kijk gerust mee", "Feel free to watch")}</span>
              <span className="block text-xs text-muted">{t("Martijn legt graag uit wat hij doet.", "Martijn is happy to explain what he does.")}</span>
            </span>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  delay,
  children,
}: {
  className: string;
  delay: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`glass absolute flex animate-fade-up items-center gap-3 rounded-2xl py-2.5 pr-4 pl-2.5 ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden
    >
      {children}
    </div>
  );
}
