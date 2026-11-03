import type { Metadata } from "next";
import { ContactDetails, MapEmbed } from "@/components/home/location";
import { ReviewsLink } from "@/components/contact/reviews-link";
import { PageIntro } from "@/components/layout/page-intro";
import { ContactActions } from "@/components/contact/contact-actions";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: "Contact",
    description: t(
      `Neem contact op met Phone Repairs in Den Bosch: WhatsApp of bel ${site.phone.display}, of mail ${site.email}.`,
      `Contact Phone Repairs in Den Bosch: WhatsApp or call ${site.phone.display}, or e-mail ${site.email}.`,
    ),
    path: "/contact",
    locale,
  });
}

export default async function ContactPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Contact", href: "/contact" }]}
        eyebrow="Contact"
        title={t("We helpen je graag verder.", "We're happy to help.")}
        intro={t(
          "Je bereikt Phone Repairs het snelst via WhatsApp. Bellen kan natuurlijk ook, en voor minder dringende vragen kun je mailen.",
          "WhatsApp is the fastest way to reach Phone Repairs. You can of course also call, and for less urgent questions you can send an e-mail.",
        )}
      >
        <ContactActions />
      </PageIntro>
      <section className="py-10 lg:py-14">
        <div className="container-page grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-8">
            <h2 className="text-title font-semibold text-ink">{site.legalName}</h2>
            <ContactDetails className="mt-4" />
            <ReviewsLink className="mt-4 flex w-fit" />
            {/* Company details (client request 2026-11-03). */}
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-line pt-5 text-sm">
              <dt className="text-muted">{t("KvK", "Chamber of Commerce")}</dt>
              <dd className="text-ink tabular-nums">{site.company.kvk}</dd>
              <dt className="text-muted">{t("Btw-id", "VAT ID")}</dt>
              <dd className="text-ink tabular-nums">{site.company.vat}</dd>
              <dt className="text-muted">IBAN</dt>
              <dd className="text-ink tabular-nums">{site.company.iban}</dd>
            </dl>
          </div>
          <MapEmbed title={t("Phone Repairs op Google Maps", "Phone Repairs on Google Maps")} className="min-h-80" />
        </div>
      </section>
    </>
  );
}
