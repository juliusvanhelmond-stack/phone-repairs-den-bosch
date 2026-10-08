import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import aboutPhoto from "@/assets/photos/about-workshop.jpg";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const facts = [
  { value: "±30 min", label: "voor de meeste reparaties" },
  { value: "7 dagen", label: "per week open, ook ’s avonds" },
  { value: "Gratis", label: "parkeren voor de deur" },
];

export function About() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-panel)] bg-mist shadow-[var(--shadow-soft)] ring-1 ring-line">
            <Image
              src={aboutPhoto}
              alt="Technicus onderzoekt met een loep de binnenkant van een smartphone in een reparatiewerkplaats"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[60%_50%]"
            />
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <SectionHeading
              eyebrow="Over Phone Repairs"
              title="Persoonlijk, vakkundig en gewoon in Den Bosch."
              intro="Phone Repairs repareert smartphones, tablets en MacBooks. Er wordt alleen op afspraak gewerkt, zodat er tijd en aandacht is voor jou en je toestel. Je kijkt mee terwijl er gewerkt wordt en je gegevens blijven op je toestel."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {facts.map((f) => (
                <div key={f.value}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{f.value}</dd>
                  <dd className="mt-1 text-sm leading-snug text-muted">{f.label}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/over-ons"
              className="mt-10 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent hover:text-accent-strong"
            >
              Meer over Phone Repairs
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
