import Image from "next/image";
import processPhoto from "@/assets/photos/process-workbench.jpg";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Aura } from "@/components/ui/aura";
import type { Translate } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

const stepsFor = (t: Translate) => [
  {
    n: "01",
    title: t("Kies je toestel", "Choose your device"),
    body: t(
      "Selecteer je merk, model en de reparatie die je nodig hebt. Zo weet je direct waar je aan toe bent.",
      "Select your brand, model and the repair you need, so you know right away where you stand.",
    ),
  },
  {
    n: "02",
    title: t("Maak een afspraak", "Make an appointment"),
    body: t(
      "Er wordt alleen op afspraak gewerkt. Stuur een WhatsApp of bel, dan plan je samen een moment dat jou uitkomt.",
      "We work by appointment only. Send a WhatsApp or call, and you agree on a time that suits you.",
    ),
  },
  {
    n: "03",
    title: t("Laat je toestel repareren", "Have your device repaired"),
    body: t(
      "Je kijkt mee terwijl je toestel wordt gerepareerd. De meeste reparaties zijn binnen ongeveer 30 minuten klaar.",
      "You watch while your device is repaired. Most repairs are done in about 30 minutes.",
    ),
  },
];

export async function HowItWorks({ withHeading = true }: { withHeading?: boolean }) {
  const { t } = await getI18n();
  const steps = stepsFor(t);
  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-28">
      <Aura variant="center" />
      <div className="container-page">
        {withHeading && (
          <Reveal>
            <SectionHeading eyebrow={t("Werkwijze", "How it works")} title={t("Zo werkt het.", "This is how it works.")} align="center" />
          </Reveal>
        )}
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span
            className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px bg-[linear-gradient(to_right,transparent,var(--color-line-strong)_12%,var(--color-line-strong)_88%,transparent)] md:block"
            aria-hidden
          />
          {steps.map((s, i) => (
            <li key={s.n} className="relative text-center">
              <Reveal delay={i * 0.1}>
                <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-white font-mono text-sm font-medium text-ink shadow-[var(--shadow-soft)] ring-1 ring-line">
                  {s.n}
                  {i === 2 && <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-accent ring-4 ring-white" />}
                </span>
                <h3 className="mt-7 text-title font-semibold text-ink">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs leading-relaxed text-pretty text-muted">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal className="mt-16 lg:mt-20">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-mist ring-1 ring-line sm:aspect-[21/9]">
            <Image
              src={processPhoto}
              alt={t("Werkbank met geopende smartphones, onderdelen en precisiegereedschap", "Workbench with opened smartphones, parts and precision tools")}
              fill
              placeholder="blur"
              sizes="(min-width: 1280px) 76rem, 100vw"
              className="object-cover object-[50%_60%]"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-soft)] backdrop-blur sm:bottom-6 sm:left-6">
              {t("Vakwerk, onderdeel voor onderdeel", "Craftsmanship, part by part")}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
