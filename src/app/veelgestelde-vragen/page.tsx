import type { Metadata } from "next";
import { FaqList } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { faqs } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Veelgestelde vragen",
  description: "Antwoorden op veelgestelde vragen over reparaties, afspraken, onderdelen en waterschade bij Phone Repairs in Den Bosch.",
  path: "/veelgestelde-vragen",
});

export default function FaqPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Veelgestelde vragen", href: "/veelgestelde-vragen" }]}
        eyebrow="Veelgestelde vragen"
        title="Antwoord op je vragen."
        intro="Alles over afspraken, reparatietijd, onderdelen en wat je doet bij waterschade."
      />
      <section className="py-16 lg:py-24">
        <div className="container-page max-w-3xl">
          <FaqList items={faqs} />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
