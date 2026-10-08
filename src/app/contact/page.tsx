import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContactDetails, MapGraphic } from "@/components/home/location";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { mapsUrl, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Neem contact op met Phone Repairs in Den Bosch. Bel ${site.phone.display} of mail ${site.email}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Contact", href: "/contact" }]}
        eyebrow="Contact"
        title="We helpen je graag verder."
        intro="Bel of mail voor een afspraak of een vraag over je reparatie."
      >
        <Button asChild size="lg">
          <Link href="/afspraak">
            Maak een afspraak
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </PageIntro>
      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[var(--radius-card)] p-6 ring-1 ring-line sm:p-8">
            <h2 className="text-title font-semibold text-ink">{site.legalName}</h2>
            <ContactDetails className="mt-4" />
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open de locatie in Google Maps" className="block min-h-80">
            <MapGraphic />
          </a>
        </div>
      </section>
    </>
  );
}
