import type { Metadata } from "next";
import { FaqList } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { faqs, faqTopicPages } from "@/lib/catalog";
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
          <h2 className="mt-16 text-title font-semibold text-ink">Meer informatie</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {faqTopicPages.map((p) => (
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
