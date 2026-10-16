import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import aboutPhoto from "@/assets/photos/martijn-portrait.jpg";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Aura } from "@/components/ui/aura";
import { getI18n } from "@/lib/i18n-server";

export async function About() {
  const { t } = await getI18n();
  const facts = [
    { value: "±30 min", label: t("voor de meeste reparaties", "for most repairs") },
    { value: t("7 dagen", "7 days"), label: t("per week open, ook ’s avonds", "a week, evenings included") },
    { value: t("Gratis", "Free"), label: t("parkeren voor de deur", "parking right outside") },
  ];
  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-28">
      <Aura variant="soft" className="rotate-180" />
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-panel)] bg-mist shadow-[var(--shadow-soft)] ring-1 ring-line">
            <Image
              src={aboutPhoto}
              alt={t(
                "Martijn, eigenaar en technicus van Phone Repairs",
                "Martijn, owner and technician of Phone Repairs",
              )}
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[55%_35%]"
            />
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <SectionHeading
              eyebrow={t("Over Phone Repairs", "About Phone Repairs")}
              title={t("Persoonlijk, vakkundig en gewoon in Den Bosch.", "Personal, skilled and right here in Den Bosch.")}
              intro={t(
                "Phone Repairs repareert smartphones, tablets en MacBooks. Er wordt altijd op afspraak gewerkt, zodat er tijd en aandacht is voor jou en je toestel. Je kijkt mee terwijl er gewerkt wordt en je gegevens blijven op je toestel.",
                "Phone Repairs repairs smartphones, tablets and MacBooks. We work always by appointment, so there is time and attention for you and your device. You watch while we work, and your data stays on your device.",
              )}
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
              className="mt-10 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-accent"
            >
              {t("Meer over Phone Repairs", "More about Phone Repairs")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
