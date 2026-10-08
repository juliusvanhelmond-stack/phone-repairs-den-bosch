import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeviceCard } from "@/components/devices/device-card";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { brandPath, brands, devices, popularDevices } from "@/lib/catalog";

export function PopularBrands() {
  return (
    <section className="border-y border-white/80 bg-white/55 py-14">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Reparaties voor alle gangbare merken. Kies je merk voor een overzicht van modellen.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={brandPath(b.id)}
                className="group flex h-12 items-center justify-between gap-3 rounded-full bg-white px-5 text-[1.0625rem] font-semibold tracking-tight text-ink-soft shadow-[var(--shadow-soft)] ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
              >
                {b.name}
                <span className="text-xs font-normal text-muted tabular-nums group-hover:text-slate-300">
                  {devices.filter((d) => d.brandId === b.id).length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PopularModels() {
  const items = popularDevices.slice(0, 8);
  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Populaire modellen"
              title="Veelgevraagde toestellen."
              intro="Bekijk direct welke reparaties mogelijk zijn voor jouw model."
            />
          </Reveal>
          <Link
            href="/reparaties"
            className="inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-blue-800"
          >
            Alle toestellen
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((d, i) => (
            <li key={d.id}>
              <Reveal delay={i * 0.04} className="h-full">
                <DeviceCard device={d} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
