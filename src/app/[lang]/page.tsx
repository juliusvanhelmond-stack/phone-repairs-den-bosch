import { About } from "@/components/home/about";
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
import { Trust } from "@/components/home/trust";
import { faqs, localizeFaq } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const title = t(
    "Phone Repairs Den Bosch · Telefoon, tablet en MacBook reparatie",
    "Phone Repairs Den Bosch · Phone, tablet and MacBook repair",
  );
  const meta = pageMetadata({
    title,
    description: t(
      "Van een gebroken scherm tot een versleten batterij. Bij Phone Repairs in Den Bosch wordt je toestel op afspraak gerepareerd, vaak binnen 30 minuten terwijl je meekijkt.",
      "From a cracked screen to a worn-out battery. At Phone Repairs in Den Bosch your device is repaired by appointment, often within 30 minutes while you watch.",
    ),
    path: "/",
    locale,
  });
  // The homepage title is complete on its own; skip the layout's "%s · Phone Repairs Den Bosch".
  return { ...meta, title: { absolute: title } };
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
      <HowItWorks />
      <PopularModels />
      <ScreenProtector />
      <About />
      <Faq items={faqs.slice(0, 6).map((f) => localizeFaq(f, locale))} />
      <Location />
      <FinalCta />
    </>
  );
}
