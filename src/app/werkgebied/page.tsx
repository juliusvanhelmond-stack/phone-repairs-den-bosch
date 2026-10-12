import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { areasByPlace } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Werkgebied",
  description: "Phone Repairs zit in Den Bosch en helpt ook klanten uit Rosmalen, Vught, Oss, Waalwijk, Zaltbommel, Boxtel, Schijndel en Geldermalsen.",
  path: "/werkgebied",
});

export default function AreaIndexPage() {
  const groups = areasByPlace();
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Werkgebied", href: "/werkgebied" }]}
        eyebrow="Werkgebied"
        title="Vanuit de hele regio naar Den Bosch."
        intro="De werkplaats zit aan de Ploossche Hof in Den Bosch. Klanten komen uit de stad zelf en uit de plaatsen eromheen."
      />
      <section className="py-16 lg:py-24">
        <ul className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <li key={g.place}>
              <Reveal delay={i * 0.03} className="h-full">
                <div className="h-full rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line">
                  <p className="text-xs text-muted">{g.placeKind === "wijk" ? "Wijk in Den Bosch" : "Plaats"}</p>
                  <h2 className="mt-1 text-title font-semibold text-ink">{g.place}</h2>
                  <ul className="mt-5 space-y-2">
                    {g.pages.map((p) => (
                      <li key={p.id}>
                        <Link href={p.path} className="group inline-flex items-center gap-2 text-accent-strong hover:text-accent">
                          {p.title}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <Location />
      <FinalCta />
    </>
  );
}
