import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { Trust } from "@/components/home/trust";
import { DemoNote } from "@/components/devices/demo-note";
import { PageIntro } from "@/components/layout/page-intro";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import { Skyline } from "@/components/ui/skyline";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

// Summarised from the original about pages (/over-phone-repairs/ and
// /veelgestelde-vragen/over-ons-en-onze-passie/), search-index 2026-10-12.
// Years of experience: the original pages said both 10 and 20+; the owner confirmed 20+ (mail 2026-10-29).
const story = {
  nl: [
    "Het verhaal van Phone Repairs begint bij Martijn: oprichter, eigenaar en Mobile Device Engineer.",
    "Zijn interesse in mobiele technologie begon lang geleden. Als liefhebber, jailbreaker en techblogger dook hij jarenlang in elke nieuwe smartphone en tablet. Hij testte er honderden en schreef er uitgebreide reviews over. Die kennis is de basis van zijn werk als Mobile Device Engineer. Inmiddels heeft hij meer dan 20 jaar ervaring.",
    "Vanaf het begin koos hij bewust voor een eigen, onafhankelijke weg. Geen franchise, maar persoonlijk contact, eerlijk advies en volle aandacht voor elke reparatie.",
  ],
  en: [
    "The story of Phone Repairs starts with Martijn: founder, owner and Mobile Device Engineer.",
    "His interest in mobile technology began a long time ago. As an enthusiast, jailbreaker and tech blogger he spent years exploring every new smartphone and tablet. He tested hundreds of them and wrote detailed reviews. That knowledge is the foundation of his work as a Mobile Device Engineer. By now he has more than 20 years of experience.",
    "From the start he deliberately chose his own, independent path. No franchise, but personal contact, honest advice and full attention for every repair.",
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: t("Over ons", "About us"),
    description: t(
      "Phone Repairs repareert smartphones, tablets en MacBooks in Den Bosch. Op afspraak, persoonlijk en binnen 30 minuten.",
      "Phone Repairs repairs smartphones, tablets and MacBooks in Den Bosch. By appointment, personal and within 30 minutes.",
    ),
    path: "/over-ons",
    locale,
  });
}

export default async function AboutPage() {
  const { locale, t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Over ons", "About us"), href: "/over-ons" }]}
        eyebrow={t("Over ons", "About us")}
        title="Phone Repairs in Den Bosch."
        intro={t(
          "Een reparatiewerkplaats voor smartphones, tablets en MacBooks, waar je persoonlijk wordt geholpen.",
          "A repair workshop for smartphones, tablets and MacBooks, where you are helped personally.",
        )}
        bottom={<Skyline className="text-accent-strong/40" title={t("Skyline van Den Bosch", "Den Bosch skyline")} />}
      >
        <DemoNote className="max-w-2xl">
          {t(
            "Het verhaal hieronder is samengevat uit de huidige pagina’s ‘Over Phone Repairs’ en ‘Over ons en onze passie’. De volledige tekst en een echte foto van Martijn of de werkplaats komen bij de migratie.",
            "The story below is summarised from the current pages ‘Over Phone Repairs’ and ‘Over ons en onze passie’. The full text and a real photo of Martijn or the workshop follow with the migration.",
          )}
        </DemoNote>
      </PageIntro>
      <section className="py-20 lg:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow={t("Ons verhaal", "Our story")}
              title={t("Begonnen uit liefde voor techniek.", "Started out of a love for technology.")}
            />
          </Reveal>
          <Reveal delay={0.05} className="space-y-5 text-lg leading-relaxed text-pretty text-muted">
            {story[locale].map((p) => (
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
