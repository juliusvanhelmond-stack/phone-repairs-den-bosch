import { FileText } from "lucide-react";
import { SendInForm } from "@/components/forms/send-in-form";
import { getI18n } from "@/lib/i18n-server";
import { mailConfigured } from "@/lib/mail";
import { site } from "@/lib/site";

/** Paper form of the current site, kept on its original path in public/. */
const PAPER_FORM = "/wp-content/uploads/2026/09/Reparatieformulier-Phone-Repairs.doc";

/** The send-in form on /veelgestelde-vragen/reparatie-opsturen. */
export async function SendInSection() {
  const { t } = await getI18n();
  const online = mailConfigured();
  const address = ["Phone Repairs", site.address.street, `${site.address.postalCode ?? ""} ${site.address.city}`.trim(), "Nederland"];
  return (
    <section id="opstuurformulier" className="scroll-mt-28 pb-16 lg:pb-24">
      <div className="container-page">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-soft)] ring-1 ring-line sm:p-10">
          <p className="eyebrow mb-3">{t("Opstuurformulier", "Send-in form")}</p>
          <h2 className="text-title font-semibold text-ink">{t("Vul het formulier online in", "Fill in the form online")}</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {online
              ? t(
                  "Je formulier komt direct bij Phone Repairs binnen. Print het daarna en stuur het mee met je toestel.",
                  "Your form goes straight to Phone Repairs. Then print it and include it with your device.",
                )
              : t(
                  "Vul je gegevens in en print het formulier om mee te sturen met je toestel. Je kunt het ook via WhatsApp of e-mail versturen, alles staat er dan al in.",
                  "Fill in your details and print the form to include with your device. You can also send it via WhatsApp or e-mail, with everything already filled in.",
                )}
          </p>
          <a
            href={PAPER_FORM}
            download
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-strong underline underline-offset-4 hover:text-accent"
          >
            <FileText className="size-4" aria-hidden />
            {t("Liever op papier? Download het reparatieformulier (Word)", "Prefer paper? Download the repair form (Word, Dutch)")}
          </a>
          <div className="mt-8 border-t border-line pt-8">
            <SendInForm email={site.email} whatsappNumber={site.whatsapp?.number ?? null} termsHref={site.legal.terms} shippingAddress={address} />
          </div>
        </div>
      </div>
    </section>
  );
}
