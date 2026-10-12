import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactActions } from "@/components/contact/contact-actions";
import { WhatsAppCard } from "@/components/contact/whatsapp-card";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { PageIntro } from "@/components/layout/page-intro";
import { brands, getBrand, localizeRepair, repairs, sortDevices, devices } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import { site, whatsappCopy, whatsappHref, whatsappMessage } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: t("Afspraak maken", "Make an appointment"),
    description: t(
      "Maak een afspraak via WhatsApp of telefoon voor de reparatie van je smartphone, tablet of MacBook bij Phone Repairs in Den Bosch.",
      "Make an appointment via WhatsApp or phone to have your smartphone, tablet or MacBook repaired at Phone Repairs in Den Bosch.",
    ),
    path: "/afspraak",
    locale,
  });
}

export default async function AppointmentPage() {
  const { locale, t } = await getI18n();
  const wa = whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined);
  const copy = whatsappCopy(locale);
  const formDevices = brands.flatMap((b) =>
    sortDevices(devices.filter((d) => d.brandId === b.id)).map((d) => ({
      id: d.id,
      name: d.name,
      brand: getBrand(d.brandId)?.name ?? "",
    })),
  );
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Afspraak maken", "Appointment"), href: "/afspraak" }]}
        eyebrow={t("Afspraak maken", "Make an appointment")}
        title={t("Plan je reparatie.", "Plan your repair.")}
        intro={t(
          "Een afspraak maak je het snelst via WhatsApp: stuur je toestel en wat er kapot is, dan plannen we samen een moment. Bellen kan natuurlijk ook.",
          "The quickest way to book is WhatsApp: send your device and what is broken, and we'll find a time together. You can of course also call.",
        )}
      >
        <ContactActions />
      </PageIntro>
      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
          <div className="space-y-8">
            <WhatsAppCard />
            <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-8">
              <h2 className="text-title font-semibold text-ink">{t("Liever een formulier?", "Prefer a form?")}</h2>
              <p className="mt-2 mb-8 text-muted">
                {t(
                  "Vul je gegevens in. Daarna verstuur je de aanvraag zelf via WhatsApp of e-mail, alles staat er al in.",
                  "Fill in your details. Then you send the request yourself via WhatsApp or e-mail, with everything already filled in.",
                )}
              </p>
              <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-[var(--radius-card)] bg-mist" />}>
                <AppointmentForm
                  devices={formDevices}
                  repairs={repairs.map((r) => localizeRepair(r, locale)).map((r) => ({ id: r.id, name: r.name }))}
                  email={site.email}
                  phone={{ display: site.phone.display, href: site.phone.href }}
                  whatsappNumber={site.whatsapp?.number ?? null}
                />
              </Suspense>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] bg-night p-7 text-white">
              <h2 className="text-lg font-semibold tracking-tight">{t("Direct contact", "Get in touch directly")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {t("Het snelst via WhatsApp", "Fastest via WhatsApp")} ({copy?.hours ?? t("dagelijks", "daily")}),{" "}
                {t("anders bellen of mailen.", "otherwise call or e-mail.")}
              </p>
              <ol className="mt-6 space-y-2">
                {wa && (
                  <li>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 font-medium transition-colors hover:bg-accent-strong">
                      <MessageCircle className="size-4" aria-hidden />
                      WhatsApp {site.whatsapp?.display}
                    </a>
                  </li>
                )}
                <li>
                  <a href={site.phone.href} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/15">
                    <Phone className="size-4 text-accent-light" aria-hidden />
                    {t("Bel", "Call")} {site.phone.display}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 break-all transition-colors hover:bg-white/15">
                    <Mail className="size-4 shrink-0 text-accent-light" aria-hidden />
                    {site.email}
                  </a>
                </li>
              </ol>
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line">
              <h2 className="font-semibold text-ink">{t("Goed om te weten", "Good to know")}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>{t("De meeste reparaties zijn binnen ongeveer 30 minuten klaar.", "Most repairs are done in about 30 minutes.")}</li>
                <li>{t("Je kunt meekijken terwijl je toestel wordt gerepareerd.", "You can watch while your device is repaired.")}</li>
                <li>{t("Je gegevens blijven op je toestel staan.", "Your data stays on your device.")}</li>
                <li>{t("Gratis parkeren voor de deur.", "Free parking right outside.")}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
