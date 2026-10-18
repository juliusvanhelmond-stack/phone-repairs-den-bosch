import { Link } from "@/components/i18n/link";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqJsonLd } from "@/lib/seo";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import type { FaqItem } from "@/types/content";
import type { Translate } from "@/lib/i18n";
import { LinkedText } from "@/components/ui/linked-text";
import { ArrowRight } from "lucide-react";

/** Extra links under some answers (client request, 2026-10-16). */
function moreLink(f: FaqItem, t: Translate): { href: string; label: string; external?: boolean } | null {
  if (f.id === "openingstijden") return { href: "/contact#openingstijden", label: t("Bekijk de openingstijden", "See the opening hours") };
  if (f.id === "parkeren") return { href: site.routeUrl, label: t("Plan je route", "Plan your route"), external: true };
  if (f.topics.includes("garantie")) return { href: "/garantie", label: t("Bekijk alle garantievoorwaarden", "See all warranty terms") };
  return null;
}

export async function FaqList({ items }: { items: FaqItem[] }) {
  const { t } = await getI18n();
  return (
    <>
      <Accordion type="single" collapsible className="border-t border-line">
        {items.map((f) => {
          const more = moreLink(f, t);
          return (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent>
                {f.answer.map((p) => (
                  <p key={p}>
                    <LinkedText text={p} />
                  </p>
                ))}
                {more && (
                  <p>
                    {more.external ? (
                      <a href={more.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent-strong hover:text-accent">
                        {more.label}
                        <ArrowRight className="size-4" aria-hidden />
                      </a>
                    ) : (
                      <Link href={more.href} className="inline-flex items-center gap-1 font-medium text-accent-strong hover:text-accent">
                        {more.label}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    )}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
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
