import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqJsonLd } from "@/lib/seo";
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

export function Faq({ items, title = "Veelgestelde vragen" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={title}
            intro={
              <>
                Staat je vraag er niet bij? Bel{" "}
                <a href={site.phone.href} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {site.phone.display}
                </a>{" "}
                of bekijk{" "}
                <Link href="/veelgestelde-vragen" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  alle vragen
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
