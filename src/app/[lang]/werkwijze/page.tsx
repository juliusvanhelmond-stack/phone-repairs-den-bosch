import type { Metadata } from "next";
import { ExplodedPhone } from "@/components/home/exploded-phone";
import { FinalCta } from "@/components/home/final-cta";
import { FinderSection } from "@/components/home/finder-section";
import { HowItWorks, ProcessPhoto } from "@/components/home/how-it-works";
import { Trust } from "@/components/home/trust";
import { PageIntro } from "@/components/layout/page-intro";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: t("Werkwijze", "How it works"),
    description: t(
      "Zo werkt een reparatie bij Phone Repairs: kies je toestel, maak een afspraak en kijk mee terwijl je toestel wordt gerepareerd.",
      "How a repair at Phone Repairs works: choose your device, make an appointment and watch while your device is repaired.",
    ),
    path: "/werkwijze",
    locale,
  });
}

export default async function ProcessPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: t("Werkwijze", "How it works"), href: "/werkwijze" }]}
        eyebrow={t("Werkwijze", "How it works")}
        title={t("Helder, persoonlijk en snel.", "Clear, personal and fast.")}
        intro={t(
          "Van het kiezen van je toestel tot het moment dat je weer naar buiten loopt: zo verloopt een reparatie bij Phone Repairs.",
          "From choosing your device to the moment you walk back out: this is how a repair at Phone Repairs goes.",
        )}
        aside={
          <div className="mx-auto max-w-md">
            <ExplodedPhone />
          </div>
        }
      />
      <HowItWorks withHeading={false} withPhoto={false} />
      {/* The device finder right below the steps (client request 2026-10-29), then the photo. */}
      <FinderSection />
      <div className="container-page pt-20 lg:pt-28">
        <ProcessPhoto />
      </div>
      <Trust />
      <div className="pt-20 lg:pt-28">
        <FinalCta />
      </div>
    </>
  );
}
