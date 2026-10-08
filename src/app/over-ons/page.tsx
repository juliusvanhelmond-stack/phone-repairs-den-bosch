import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { Trust } from "@/components/home/trust";
import { DemoNote } from "@/components/devices/demo-note";
import { PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo";
import { Skyline } from "@/components/ui/skyline";

export const metadata: Metadata = pageMetadata({
  title: "Over ons",
  description: "Phone Repairs repareert smartphones, tablets en MacBooks in Den Bosch. Op afspraak, persoonlijk en vaak binnen 30 minuten.",
  path: "/over-ons",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Over ons", href: "/over-ons" }]}
        eyebrow="Over ons"
        title="Phone Repairs in Den Bosch."
        intro="Een reparatiewerkplaats voor smartphones, tablets en MacBooks, waar je persoonlijk wordt geholpen."
        bottom={<Skyline className="text-accent-strong/40" />}
      >
        <DemoNote className="max-w-2xl">
          De volledige tekst van de huidige pagina ‘Over Phone Repairs’ wordt bij de migratie overgenomen. Deze
          pagina toont alleen feiten die op de huidige website staan.
        </DemoNote>
      </PageIntro>
      <About />
      <Trust />
      <Location />
      <FinalCta />
    </>
  );
}
