import type { Metadata } from "next";
import { FaqList } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { faqs, faqTopicPages, localizeFaq, localizeLanding } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { WhatsAppCard } from "@/components/contact/whatsapp-card";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: t("Veelgestelde vragen", "Frequently asked questions"),
    description: t(
      "Antwoorden op veelgestelde vragen over reparaties, afspraken, onderdelen en waterschade bij Phone Repairs in Den Bosch.",
      "Answers to frequently asked questions about repairs, appointments, parts and water damage at Phone Repairs in Den Bosch.",
    ),
    path: "/veelgestelde-vragen",
    locale,
  });
}

export default async function FaqPage() {
  const { locale, t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Veelgestelde vragen", "FAQ"), href: "/veelgestelde-vragen" }]}
        eyebrow={t("Veelgestelde vragen", "Frequently asked questions")}
        title={t("Antwoord op je vragen.", "Answers to your questions.")}
        intro={t(
          "Alles over afspraken, reparatietijd, onderdelen en wat je doet bij waterschade. Staat je vraag er niet bij? Stuur een WhatsApp.",
          "Everything about appointments, repair times, parts and what to do after water damage. Question not listed? Send us a WhatsApp.",
        )}
      />
      <section className="py-16 lg:py-24">
        <div className="container-page max-w-3xl">
          <FaqList items={faqs.map((f) => localizeFaq(f, locale))} />
          <WhatsAppCard className="mt-12" message={t("Hoi Phone Repairs, ik heb een vraag.", "Hi Phone Repairs, I have a question.")} />
          <h2 className="mt-16 text-title font-semibold text-ink">{t("Meer informatie", "More information")}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {faqTopicPages.map((page) => localizeLanding(page, locale)).map((p) => (
              <li key={p.id}>
                <Link
                  href={p.path}
                  className="group flex h-full items-center justify-between gap-4 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <span>
                    <span className="block font-semibold text-ink">{p.title}</span>
                    <span className="mt-1 block text-sm text-muted">{p.intro}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-accent-strong transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
