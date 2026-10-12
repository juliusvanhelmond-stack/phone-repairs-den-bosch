import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { Trust } from "@/components/home/trust";
import { DemoNote } from "@/components/devices/demo-note";
import { PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo";
import { Skyline } from "@/components/ui/skyline";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

// Summarised from the original about pages (/over-phone-repairs/ and
// /veelgestelde-vragen/over-ons-en-onze-passie/), search-index 2026-10-12.
// Years of experience are left out: the original pages say both 10 and 20+.
const story = [
  "Het verhaal van Phone Repairs begint bij Martijn: oprichter, eigenaar en Mobile Device Engineer.",
  "Zijn interesse in mobiele technologie begon lang geleden. Als liefhebber, jailbreaker en techblogger dook hij jarenlang in elke nieuwe smartphone en tablet. Hij testte er honderden en schreef er uitgebreide reviews over. Die kennis is de basis van zijn werk als Mobile Device Engineer.",
  "Vanaf het begin koos hij bewust voor een eigen, onafhankelijke weg. Geen franchise, maar persoonlijk contact, eerlijk advies en volle aandacht voor elke reparatie.",
];

export const metadata: Metadata = pageMetadata({
  title: "Over ons",
  description: "Phone Repairs repareert smartphones, tablets en MacBooks in Den Bosch. Op afspraak, persoonlijk en vaak binnen 30 minuten.",
  path: "/over-ons",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Over ons", href: "/over-ons" }]}
        eyebrow="Over ons"
        title="Phone Repairs in Den Bosch."
        intro="Een reparatiewerkplaats voor smartphones, tablets en MacBooks, waar je persoonlijk wordt geholpen."
        bottom={<Skyline className="text-accent-strong/40" />}
      >
        <DemoNote className="max-w-2xl">
          Het verhaal hieronder is samengevat uit de huidige pagina’s ‘Over Phone Repairs’ en ‘Over ons en onze
          passie’. De volledige tekst en een echte foto van Martijn of de werkplaats komen bij de migratie. Het aantal
          jaren ervaring staat er verschillend (10 en 20+) en is daarom weggelaten.
        </DemoNote>
      </PageIntro>
      <section className="py-20 lg:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Ons verhaal" title="Begonnen uit liefde voor techniek." />
          </Reveal>
          <Reveal delay={0.05} className="space-y-5 text-lg leading-relaxed text-pretty text-muted">
            {story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>
      <About />
      <Trust />
      <Location />
      <FinalCta />
    </>
  );
}
