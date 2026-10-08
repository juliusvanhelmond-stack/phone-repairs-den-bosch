import { Reveal } from "@/components/motion/reveal";
import { ContentIcon } from "@/components/repairs/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { claims } from "@/lib/catalog";

export function Trust() {
  return (
    <section className="relative isolate overflow-hidden bg-night py-20 text-white lg:py-28">
      <div className="bg-grid absolute inset-0 -z-10 opacity-40 invert [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" aria-hidden />
      <div className="absolute -top-40 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" aria-hidden />
      <div className="container-page">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow="Waarom Phone Repairs"
            title="Vakwerk waar je zelf bij bent."
            intro="Geen anoniem reparatieloket, maar een persoonlijke aanpak met heldere afspraken."
          />
        </Reveal>
        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {claims.map((c, i) => (
            <li key={c.id} className="glass-dark rounded-[var(--radius-card)] p-7 lg:p-8">
              <Reveal delay={i * 0.04}>
                <ContentIcon name={c.icon} className="size-6 text-blue-300" />
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-400">{c.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
