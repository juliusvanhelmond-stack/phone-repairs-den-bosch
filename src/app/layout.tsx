import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/ui/json-ld";
import { localBusinessJsonLd } from "@/lib/seo";
import { allowIndexing, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Phone Repairs Den Bosch · Telefoon, tablet en MacBook reparatie",
    template: "%s · Phone Repairs Den Bosch",
  },
  description:
    "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel op afspraak gerepareerd, vaak binnen 30 minuten terwijl je meekijkt.",
  applicationName: site.name,
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#inhoud"
          className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Naar de inhoud
        </a>
        <SiteHeader />
        <main id="inhoud" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={localBusinessJsonLd()} />
      </body>
    </html>
  );
}
