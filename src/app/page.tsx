import { About } from "@/components/home/about";
import { PopularBrands, PopularModels } from "@/components/home/brands-and-models";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { FinderSection } from "@/components/home/finder-section";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Location } from "@/components/home/location";
import { PopularRepairs } from "@/components/home/popular-repairs";
import { Trust } from "@/components/home/trust";
import { faqs } from "@/lib/catalog";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularBrands />
      <FinderSection />
      <PopularRepairs />
      <Trust />
      <HowItWorks />
      <PopularModels />
      <About />
      <Faq items={faqs.slice(0, 6)} />
      <Location />
      <FinalCta />
    </>
  );
}
