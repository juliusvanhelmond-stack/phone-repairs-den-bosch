import type { Metadata } from "next";
import { FinalCta } from "@/components/home/final-cta";
import { HowItWorks } from "@/components/home/how-it-works";
import { Trust } from "@/components/home/trust";
import { PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Werkwijze",
  description: "Zo werkt een reparatie bij Phone Repairs: kies je toestel, maak een afspraak en kijk mee terwijl je toestel wordt gerepareerd.",
  path: "/werkwijze",
});

export default function ProcessPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Werkwijze", href: "/werkwijze" }]}
        eyebrow="Werkwijze"
        title="Helder, persoonlijk en snel."
        intro="Van het kiezen van je toestel tot het moment dat je weer naar buiten loopt: zo verloopt een reparatie bij Phone Repairs."
      />
      <HowItWorks withHeading={false} />
      <Trust />
      <div className="pt-20 lg:pt-28">
        <FinalCta />
      </div>
    </>
  );
}
