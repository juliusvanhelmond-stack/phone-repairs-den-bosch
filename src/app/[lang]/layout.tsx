import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KiyohFloat } from "@/components/contact/kiyoh";
import { MobileActionBar } from "@/components/contact/mobile-action-bar";
import { TopBar } from "@/components/layout/top-bar";
import { WhatsAppWidget } from "@/components/contact/whatsapp-widget";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { JsonLd } from "@/components/ui/json-ld";
import { locales, translator } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { localBusinessJsonLd } from "@/lib/seo";
import { allowIndexing, site } from "@/lib/site";
import "../globals.css";

// House typeface of Phone Repairs.
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return {
    metadataBase: new URL(site.url),
    title: {
      default: t(
        "Phone Repairs Den Bosch · Telefoon, tablet en MacBook reparatie",
        "Phone Repairs Den Bosch · Phone, tablet and MacBook repair",
      ),
      template: "%s · Phone Repairs Den Bosch",
    },
    description: t(
      "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel op afspraak gerepareerd, vaak binnen 30 minuten terwijl je meekijkt.",
      "From a cracked screen to a worn-out battery. At Phone Repairs in Den Bosch your device is repaired by appointment, often within 30 minutes while you watch.",
    ),
    applicationName: site.name,
    robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#106f31",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const t = translator(locale);
  return (
    <html lang={locale} className={`${openSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <LocaleProvider locale={locale}>
          <a
            href="#inhoud"
            className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t("Naar de inhoud", "Skip to content")}
          </a>
          <TopBar />
          <SiteHeader />
          <main id="inhoud" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <MobileActionBar />
          <KiyohFloat />
          <WhatsAppWidget />
          <JsonLd data={localBusinessJsonLd()} />
        </LocaleProvider>
      </body>
    </html>
  );
}
