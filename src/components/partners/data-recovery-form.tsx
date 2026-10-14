import { ArrowUpRight } from "lucide-react";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";

/**
 * The Stellar data recovery intake form on /data-recovery, embedded as on the current page
 * (text verbatim from the WordPress export). The form URL carries the shop's partner code.
 */
export async function DataRecoveryForm() {
  const { t } = await getI18n();
  const { dataRecoveryForm, dataRecoveryCode } = site.partners;
  return (
    <section id="aanmelden" className="scroll-mt-28 pb-16 lg:pb-24">
      <div className="container-page">
        <div className="rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-line sm:p-10">
          <h2 className="text-title font-semibold text-ink">
            {t("Meld hieronder je data recovery opdracht direct aan:", "Register your data recovery job below:")}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            {t(
              `Als je bij het aanmelden hieronder de code: ${dataRecoveryCode} invoert krijg je nog eens 3% korting op je data recovery`,
              `Enter the code ${dataRecoveryCode} when you register below and you get an extra 3% discount on your data recovery.`,
            )}
          </p>
          <a
            href={dataRecoveryForm}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong underline underline-offset-4 hover:text-accent"
          >
            {t("Formulier openen in een nieuw venster", "Open the form in a new window")}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          {/* Third-party form (Stellar, via Zoho); white like the form itself in both themes. */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <iframe
              src={dataRecoveryForm}
              title={t("Aanmeldformulier data recovery (Stellar)", "Data recovery registration form (Stellar)")}
              loading="lazy"
              className="block h-[1500px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
