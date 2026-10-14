import { Link } from "@/components/i18n/link";
import { ArrowRight, Eye, MapPin, ShieldCheck, Timer } from "lucide-react";
import Image from "next/image";
import heroPhoto from "@/assets/photos/hero-screen-repair.jpg";
import { ContactActions } from "@/components/contact/contact-actions";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import { Aura } from "@/components/ui/aura";

export async function Hero() {
  const { t } = await getI18n();
  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16 lg:-mt-[4.5rem] lg:pt-[4.5rem]">
      <Aura variant="hero" />
      <div
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,#000_20%,transparent_75%)]"
        aria-hidden
      />
      <div className="container-page grid items-center gap-6 pt-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-16 lg:pb-24">
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
          <p className="text-display font-semibold text-balance text-ink">
            {t("Je toestel weer als nieuw.", "Your device as good as new.")}{" "}
            <span className="text-muted">{t("Snel, vakkundig en transparant.", "Fast, skilled and transparent.")}</span>
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            {t(
              "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel professioneel gerepareerd, vaak binnen 30 minuten terwijl je meekijkt.",
              "From a broken screen to a worn-out battery. At Phone Repairs in Den Bosch your device is repaired professionally, often within 30 minutes while you watch.",
            )}
          </p>
          <ContactActions className="mt-9" email={false} />
          <Link
            href="#toestel-zoeken"
            className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-accent"
          >
            {t("Of zoek eerst je toestel", "Or find your device first")}
            <ArrowRight className="size-4 rotate-90" aria-hidden />
          </Link>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-accent" aria-hidden />
              {t("Vaak klaar binnen 30 minuten", "Often ready within 30 minutes")}
            </li>
            <li className="flex items-center gap-2">
              <Eye className="size-4 text-accent" aria-hidden />
              {t("Je kijkt mee", "You watch the repair")}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              {t("Je gegevens blijven op je toestel", "Your data stays on your device")}
            </li>
          </ul>
        </div>

        <div className="relative mt-4 lg:mt-0 lg:pl-6">
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-panel)] bg-mist shadow-[var(--shadow-lift)] ring-1 ring-line sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={heroPhoto}
              alt={t(
                "Technicus opent een smartphone met gebarsten scherm op een werkmat met reparatiegereedschap",
                "Technician opening a smartphone with a cracked screen on a work mat with repair tools",
              )}
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[62%_55%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(34_34_34/0.35),transparent_45%)]" aria-hidden />
          </div>
          <FloatingCard className="bottom-4 left-4 sm:top-8 sm:right-8 sm:bottom-auto sm:left-auto lg:-right-4" delay="0.5s">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <Timer className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t("Schermreparatie", "Screen repair")}</span>
              <span className="block text-xs text-muted">{t("Vaak binnen 30 minuten", "Often within 30 minutes")}</span>
            </span>
          </FloatingCard>
          <FloatingCard className="bottom-5 left-4 max-sm:hidden sm:bottom-8 sm:left-8 lg:left-0" delay="0.7s">
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
              <Eye className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t("Je kijkt mee", "You watch the repair")}</span>
              <span className="block text-xs text-muted">{t("Geen gesloten deuren", "No closed doors")}</span>
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
