import { About } from "@/components/home/about";
import { Clients } from "@/components/home/clients";
import { PopularBrands, PopularModels } from "@/components/home/brands-and-models";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { FinderSection } from "@/components/home/finder-section";
import { Hero } from "@/components/home/hero";
import { IphoneSection } from "@/components/iphone/iphone-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { Location } from "@/components/home/location";
import { PopularRepairs } from "@/components/home/popular-repairs";
import { ScreenProtector } from "@/components/home/screen-protector";
import { TradeIn } from "@/components/partners/trade-in";
import { Trust } from "@/components/home/trust";
import { faqs, localizeFaq } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata, seoOverride } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  // Title of the current homepage (Yoast), kept word for word: it ranks on "telefoon reparatie Den Bosch".
  const title = t(
    "Telefoon, tablet, MacBook reparatie | Phone Repairs Den Bosch",
    "Phone, tablet and MacBook repair | Phone Repairs Den Bosch",
  );
  const meta = pageMetadata({
    title,
    description: t(
      "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel op afspraak gerepareerd, binnen 30 minuten terwijl je meekijkt.",
      "From a cracked screen to a worn-out battery. At Phone Repairs in Den Bosch your device is repaired by appointment, within 30 minutes while you watch.",
    ),
    path: "/",
    locale,
  });
  // The homepage title is complete on its own; skip the layout's "%s · Phone Repairs Den Bosch".
  // The homepage title is complete on its own, unless a title was set for "/" in the CMS.
  return seoOverride("/", locale)?.title ? meta : { ...meta, title: { absolute: title } };
}

export default async function HomePage() {
  const { locale } = await getI18n();
  return (
    <>
      <Hero />
      <PopularBrands />
      <FinderSection />
      <PopularRepairs />
      <IphoneSection />
      <Trust />
      <Clients />
      <HowItWorks />
      <PopularModels />
      <ScreenProtector />
      <TradeIn />
      <About />
      <Faq items={faqs.slice(0, 6).map((f) => localizeFaq(f, locale))} />
      <Location />
      <FinalCta />
    </>
  );
}
