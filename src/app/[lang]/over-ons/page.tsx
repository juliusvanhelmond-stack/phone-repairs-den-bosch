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
import aboutJson from "@/content/over-ons.json";
import type { Locale } from "@/lib/i18n";

// The text is edited by the shop in the CMS ("Over ons", src/content/over-ons.json, client request
// 2026-10-29). It started from the original about pages (/over-phone-repairs/ and
// /veelgestelde-vragen/over-ons-en-onze-passie/); the owner confirmed 20+ years of experience (mail 2026-10-29).
type AboutText = { title: string; intro: string; storyEyebrow: string; storyTitle: string; story: string };
function aboutText(locale: Locale): AboutText & { paragraphs: string[] } {
  const nl = aboutJson as AboutText & { en?: Partial<AboutText> };
  const pick = (k: keyof AboutText) => (locale === "en" && nl.en?.[k]?.trim()) || nl[k] || "";
  const text = { title: pick("title"), intro: pick("intro"), storyEyebrow: pick("storyEyebrow"), storyTitle: pick("storyTitle"), story: pick("story") };
  return { ...text, paragraphs: text.story.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean) };
}

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
  const text = aboutText(locale);
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Over ons", "About us"), href: "/over-ons" }]}
        eyebrow={t("Over ons", "About us")}
        title={text.title}
        intro={text.intro}
        bottom={<Skyline className="text-accent-strong/40" title={t("Skyline van Den Bosch", "Den Bosch skyline")} />}
      >
        <DemoNote className="max-w-2xl">
          {t(
            "Het verhaal hieronder is samengevat uit de huidige pagina’s ‘Over Phone Repairs’ en ‘Over ons en onze passie’. De volledige tekst en een echte foto van Martijn of de werkplaats komen bij de migratie.",
            "The story below is summarised from the current pages ‘Over Phone Repairs’ and ‘Over ons en onze passie’. The full text and a real photo of Martijn or the workshop follow with the migration.",
          )}
        </DemoNote>
      </PageIntro>
      <section className="py-10 lg:py-14">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow={text.storyEyebrow}
              title={text.storyTitle}
            />
          </Reveal>
          <Reveal delay={0.05} className="space-y-5 text-lg leading-relaxed text-pretty text-muted">
            {text.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>
      <About withLink={false} />
      <Trust />
      <Location />
      <FinalCta />
    </>
  );
}
