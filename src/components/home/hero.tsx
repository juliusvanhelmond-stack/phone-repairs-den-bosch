import Link from "next/link";
import { ArrowRight, Eye, MapPin, ShieldCheck, Timer } from "lucide-react";
import { ExplodedPhone } from "@/components/home/exploded-phone";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16 lg:-mt-[4.5rem] lg:pt-[4.5rem]">
      <div
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,#000_20%,transparent_75%)]"
        aria-hidden
      />
      <div className="container-page grid items-center gap-6 pt-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-16 lg:pb-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-1.5 text-sm text-ink-soft shadow-[var(--shadow-ring)]">
            <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent">
              <MapPin className="size-3.5" aria-hidden />
            </span>
            Reparaties op afspraak in {site.address.cityShort}
          </p>
          <h1 className="text-display font-semibold text-balance text-ink">
            Je toestel weer als nieuw.{" "}
            <span className="text-muted">Snel, vakkundig en transparant.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">
            Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel
            professioneel gerepareerd, vaak binnen 30 minuten terwijl je meekijkt.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#toestel-zoeken">
                Zoek jouw toestel
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/afspraak">Maak een afspraak</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-accent" aria-hidden />
              Vaak klaar binnen 30 minuten
            </li>
            <li className="flex items-center gap-2">
              <Eye className="size-4 text-accent" aria-hidden />
              Je kijkt mee
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              Je gegevens blijven op je toestel
            </li>
          </ul>
        </div>

        <div className="relative -mx-4 mt-24 -mb-12 sm:mx-0 sm:mt-10 sm:mb-0 lg:mt-0">
          <ExplodedPhone />
          <FloatingCard className="top-[14%] right-[2%] sm:right-[6%]" delay="0.9s">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <Timer className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Schermreparatie</span>
              <span className="block text-xs text-muted">Vaak binnen 30 minuten</span>
            </span>
          </FloatingCard>
          <FloatingCard className="bottom-[24%] left-[2%] sm:left-[8%]" delay="1.1s">
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
              <Eye className="size-[1.125rem]" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Je kijkt mee</span>
              <span className="block text-xs text-muted">Geen gesloten deuren</span>
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
      className={`absolute hidden animate-fade-up sm:flex items-center gap-3 rounded-2xl bg-white/85 py-2.5 pr-4 pl-2.5 shadow-[var(--shadow-lift)] ring-1 ring-line backdrop-blur-md ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden
    >
      {children}
    </div>
  );
}
