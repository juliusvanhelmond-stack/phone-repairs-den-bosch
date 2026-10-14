import { Link } from "@/components/i18n/link";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqJsonLd } from "@/lib/seo";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import type { FaqItem } from "@/types/content";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <>
      <Accordion type="single" collapsible className="border-t border-line">
        {items.map((f) => (
          <AccordionItem key={f.id} value={f.id}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>
              {f.answer.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <JsonLd data={faqJsonLd(items)} />
    </>
  );
}

/** `items` must already be localized (localizeFaq). */
export async function Faq({ items, title }: { items: FaqItem[]; title?: string }) {
  const { t } = await getI18n();
  return (
    <section className="tone-grey py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={title ?? t("Veelgestelde vragen", "Frequently asked questions")}
            intro={
              <>
                {t("Staat je vraag er niet bij? Bel", "Question not listed? Call")}{" "}
                <a href={site.phone.href} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {site.phone.display}
                </a>{" "}
                {t("of bekijk", "or see")}{" "}
                <Link href="/veelgestelde-vragen" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {t("alle vragen", "all questions")}
                </Link>
                .
              </>
            }
          />
        </Reveal>
        <Reveal delay={0.05}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </section>
  );
}
