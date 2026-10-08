import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export const steps = [
  {
    n: "01",
    title: "Kies je toestel",
    body: "Selecteer je merk, model en de reparatie die je nodig hebt. Zo weet je direct waar je aan toe bent.",
  },
  {
    n: "02",
    title: "Maak een afspraak",
    body: "Er wordt alleen op afspraak gewerkt. Bel, mail of vul het formulier in en kies een moment dat jou uitkomt.",
  },
  {
    n: "03",
    title: "Laat je toestel repareren",
    body: "Je kijkt mee terwijl je toestel wordt gerepareerd. De meeste reparaties zijn binnen ongeveer 30 minuten klaar.",
  },
];

export function HowItWorks({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-page">
        {withHeading && (
          <Reveal>
            <SectionHeading eyebrow="Werkwijze" title="Zo werkt het." align="center" />
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
      </div>
    </section>
  );
}
