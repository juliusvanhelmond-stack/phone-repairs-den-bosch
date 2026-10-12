import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { DeviceCard } from "@/components/devices/device-card";
import { FinalCta } from "@/components/home/final-cta";
import { Location } from "@/components/home/location";
import { Trust } from "@/components/home/trust";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { ContactActions } from "@/components/contact/contact-actions";
import { WhatsAppCard } from "@/components/contact/whatsapp-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Crumb } from "@/components/ui/breadcrumbs";
import { areasByPlace, devicesForBrand, popularDevices, repairPath } from "@/lib/catalog";
import type { DeviceModel, LandingPage, LandingSection } from "@/types/content";

/** Crumbs per page kind; area pages hang under /werkgebied, FAQ topics under the FAQ. */
export function landingCrumbs(page: LandingPage): Crumb[] {
  const self = { name: page.title, href: page.path };
  if (page.kind === "area") return [{ name: "Werkgebied", href: "/werkgebied" }, self];
  if (page.kind === "faq-topic") return [{ name: "Veelgestelde vragen", href: "/veelgestelde-vragen" }, self];
  return [self];
}

function focusDevices(page: LandingPage): { title: string; devices: DeviceModel[] } | null {
  switch (page.focus) {
    case undefined:
      return null;
    case "iphone":
      return { title: "Populaire iPhones", devices: devicesForBrand("apple", "smartphone").slice(0, 8) };
    case "ipad":
      return { title: "iPads", devices: devicesForBrand("apple", "tablet").slice(0, 8) };
    default:
      return { title: "Populaire toestellen", devices: popularDevices.slice(0, 8) };
  }
}

const FOCUS_NOUN: Record<string, string> = {
  telefoon: "telefoon", gsm: "telefoon", smartphone: "smartphone", mobiel: "telefoon",
  iphone: "iPhone", ipad: "iPad", scherm: "scherm",
};

export function LandingTemplate({ page }: { page: LandingPage }) {
  const focus = focusDevices(page);
  const message =
    page.kind === "area" && page.focus
      ? `Hoi Phone Repairs, ik kom uit ${page.place} en wil graag een afspraak maken voor mijn ${FOCUS_NOUN[page.focus]}.`
      : `Hoi Phone Repairs, ik heb een vraag over: ${page.title.toLowerCase()}.`;
  const otherAreas = page.kind === "area" ? areasByPlace() : [];

  return (
    <>
      <PageIntro crumbs={landingCrumbs(page)} eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
        <ContactActions message={message} />
        <DemoNote className="mt-8 max-w-2xl">
          Deze pagina houdt de URL van de huidige site ({page.path}/). De tekst is samengesteld uit wat er nu op
          staat; de volledige originele tekst wordt bij de migratie overgenomen.
          {page.unconfirmed.length > 0 && (
            <>
              {" "}
              Ook op de huidige pagina, maar pas zichtbaar na bevestiging: {page.unconfirmed.join(" ")}
            </>
          )}
        </DemoNote>
      </PageIntro>

      {page.sections.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container-page grid gap-3 md:grid-cols-2">
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 0.04} className={page.sections.length === 1 ? "md:col-span-2" : undefined}>
                <SectionCard section={s} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className={page.sections.length ? "pb-16 lg:pb-24" : "py-16 lg:py-24"}>
        <div className="container-page">
          <WhatsAppCard message={message} className="mx-auto max-w-2xl" />
        </div>
      </section>

      {page.focus === "scherm" && (
        <section className="pb-16 lg:pb-24">
          <div className="container-page">
            <Link
              href={repairPath("scherm-vervangen")}
              className="group flex items-center justify-between gap-6 rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-lift)] lg:p-9"
            >
              <span>
                <span className="block text-title font-semibold text-ink">Scherm vervangen</span>
                <span className="mt-1 block text-muted">Wat er gebeurt bij een schermreparatie en voor welke toestellen.</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-accent-strong transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {focus && (
        <section className="bg-mist py-16 lg:py-24">
          <div className="container-page">
            <SectionHeading eyebrow="Kies je toestel" title={focus.title} />
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {focus.devices.map((d) => (
                <li key={d.id}>
                  <DeviceCard device={d} />
                </li>
              ))}
            </ul>
            <Link href="/reparaties" className="mt-8 inline-flex items-center gap-2 font-medium text-accent-strong hover:text-accent">
              Alle toestellen
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <Trust />
      {page.kind === "area" && <Location />}

      {otherAreas.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container-page">
            <h2 className="text-title font-semibold text-ink">Ook voor</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {otherAreas
                .flatMap((g) => g.pages)
                .filter((p) => p.id !== page.id)
                .map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.path}
                      className="inline-block rounded-full bg-white px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      <div className={otherAreas.length ? "" : "pt-20 lg:pt-28"}>
        <FinalCta message={message} />
      </div>
    </>
  );
}

function SectionCard({ section }: { section: LandingSection }) {
  return (
    <div className="h-full rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line lg:p-9">
      <h2 className="text-title font-semibold text-ink">{section.heading}</h2>
      {section.steps.length > 0 && (
        <ol className="mt-6 space-y-4">
          {section.steps.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-sm text-accent-strong">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pt-1 leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {section.bullets.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {section.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-ink">
              <Check className="mt-1 size-4 shrink-0 text-accent-strong" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      )}
      {section.body.map((p) => (
        <p key={p} className="mt-4 leading-relaxed text-muted">
          {p}
        </p>
      ))}
    </div>
  );
}
