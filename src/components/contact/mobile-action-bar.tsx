import { MessageCircle, Phone } from "lucide-react";
import { getI18n } from "@/lib/i18n-server";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";

/**
 * WhatsApp and call buttons pinned to the bottom of the screen on mobile (client requirement:
 * they stay visible while scrolling). The spacer keeps the footer from hiding behind them.
 */
export async function MobileActionBar() {
  const { locale, t } = await getI18n();
  const wa = whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined);
  return (
    <>
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label={t("Snel contact", "Quick contact")}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-surface/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white active:bg-accent-strong"
          >
            <MessageCircle className="size-5" aria-hidden />
            WhatsApp
          </a>
        )}
        <a
          href={site.phone.href}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-ink ring-1 ring-line-strong ring-inset ${wa ? "" : "col-span-2"}`}
        >
          <Phone className="size-5" aria-hidden />
          {t("Bellen", "Call")}
        </a>
      </nav>
    </>
  );
}
