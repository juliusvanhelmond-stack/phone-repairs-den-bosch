import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, Phone } from "lucide-react";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { PageIntro } from "@/components/layout/page-intro";
import { brands, getBrand, repairs, sortDevices, devices } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Afspraak maken",
  description: "Maak een afspraak voor de reparatie van je smartphone, tablet of MacBook bij Phone Repairs in Den Bosch.",
  path: "/afspraak",
});

export default function AppointmentPage() {
  const formDevices = brands.flatMap((b) =>
    sortDevices(devices.filter((d) => d.brandId === b.id)).map((d) => ({
      id: d.id,
      name: d.name,
      brand: getBrand(d.brandId)?.name ?? "",
    })),
  );
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Afspraak maken", href: "/afspraak" }]}
        eyebrow="Afspraak maken"
        title="Plan je reparatie."
        intro="Phone Repairs werkt alleen op afspraak, zodat er tijd en aandacht is voor jouw toestel. Vul het formulier in of neem direct contact op."
      />
      <section className="py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
          <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-[var(--radius-card)] bg-mist" />}>
            <AppointmentForm
              devices={formDevices}
              repairs={repairs.map((r) => ({ id: r.id, name: r.name }))}
              email={site.email}
              phone={{ display: site.phone.display, href: site.phone.href }}
            />
          </Suspense>
          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] bg-night p-7 text-white">
              <h2 className="text-lg font-semibold tracking-tight">Liever direct contact?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Bel of mail, dan plannen we samen een moment in.</p>
              <div className="mt-6 space-y-2">
                <a href={site.phone.href} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/15">
                  <Phone className="size-4 text-blue-300" aria-hidden />
                  {site.phone.display}
                </a>
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 break-all transition-colors hover:bg-white/15">
                  <Mail className="size-4 shrink-0 text-blue-300" aria-hidden />
                  {site.email}
                </a>
              </div>
            </div>
            <div className="rounded-[var(--radius-card)] p-7 ring-1 ring-line">
              <h2 className="font-semibold text-ink">Goed om te weten</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>De meeste reparaties zijn binnen ongeveer 30 minuten klaar.</li>
                <li>Je kunt meekijken terwijl je toestel wordt gerepareerd.</li>
                <li>Je gegevens blijven op je toestel staan.</li>
                <li>{site.parkingNote}.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
