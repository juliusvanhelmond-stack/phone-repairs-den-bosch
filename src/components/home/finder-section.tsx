import { DeviceFinder } from "@/components/devices/device-finder";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { brands, categories, finderIndex, repairs } from "@/lib/catalog";
import { site } from "@/lib/site";

export function FinderSection() {
  return (
    <section id="toestel-zoeken" className="bg-mist py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Toestel zoeken"
            title="In vier stappen naar de juiste reparatie."
            intro="Kies je toestel, merk en model en zie direct welke reparaties mogelijk zijn. Daarna maak je meteen een afspraak."
            className="mb-10 lg:mb-12"
          />
        </Reveal>
        <Reveal delay={0.05}>
          <DeviceFinder
            categories={categories.map(({ id, name, plural, description }) => ({ id, name, plural, description }))}
            brands={brands.map(({ id, name, categories }) => ({ id, name, categories }))}
            repairs={repairs.map(({ id, name, summary, icon, categories, advice }) => ({
              id,
              name,
              summary,
              icon,
              categories,
              advice,
            }))}
            devices={finderIndex()}
            contact={{ phoneDisplay: site.phone.display, phoneHref: site.phone.href, email: site.email }}
          />
        </Reveal>
      </div>
    </section>
  );
}
