import { Link } from "@/components/i18n/link";
import { ArrowRight, Check, X } from "lucide-react";
import Image from "next/image";
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
import { areasByPlace, devicesForBrand, localizeLanding, popularDevices, repairPath } from "@/lib/catalog";
import type { Translate } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import type { DeviceModel, LandingPage, LandingSection } from "@/types/content";

/** Crumbs per page kind (page already localized); area pages hang under /werkgebied, FAQ topics under the FAQ. */
export function landingCrumbs(page: LandingPage, t: Translate): Crumb[] {
  const self = { name: page.title, href: page.path };
  if (page.kind === "area") return [{ name: t("Werkgebied", "Service area"), href: "/werkgebied" }, self];
  if (page.kind === "faq-topic") return [{ name: t("Veelgestelde vragen", "FAQ"), href: "/veelgestelde-vragen" }, self];
  return [self];
}

function focusDevices(page: LandingPage, t: Translate): { title: string; devices: DeviceModel[] } | null {
  switch (page.focus) {
    case undefined:
      return null;
    case "iphone":
      return { title: t("Populaire iPhones", "Popular iPhones"), devices: devicesForBrand("apple", "smartphone").slice(0, 8) };
    case "ipad":
      return { title: "iPads", devices: devicesForBrand("apple", "tablet").slice(0, 8) };
    default:
      return { title: t("Populaire toestellen", "Popular devices"), devices: popularDevices.slice(0, 8) };
  }
}

const FOCUS_NOUN: Record<string, [string, string]> = {
  telefoon: ["telefoon", "phone"],
  gsm: ["telefoon", "phone"],
  smartphone: ["smartphone", "smartphone"],
  mobiel: ["telefoon", "phone"],
  iphone: ["iPhone", "iPhone"],
  ipad: ["iPad", "iPad"],
  scherm: ["scherm", "screen"],
};

export async function LandingTemplate({ page: source, children }: { page: LandingPage; children?: React.ReactNode }) {
  const { locale, t } = await getI18n();
  const page = localizeLanding(source, locale);
  const focus = focusDevices(page, t);
  const noun = page.focus ? FOCUS_NOUN[page.focus] : null;
  const message =
    page.kind === "area" && noun
      ? t(
          `Hoi Phone Repairs, ik kom uit ${page.place} en wil graag een afspraak maken voor mijn ${noun[0]}.`,
          `Hi Phone Repairs, I'm from ${page.place} and would like to make an appointment for my ${noun[1]}.`,
        )
      : t(`Hoi Phone Repairs, ik heb een vraag over: ${page.title.toLowerCase()}.`, `Hi Phone Repairs, I have a question about: ${page.title.toLowerCase()}.`);
  const otherAreas = page.kind === "area" ? areasByPlace() : [];

  return (
    <>
      <PageIntro crumbs={landingCrumbs(page, t)} eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
        <ContactActions message={message} />
        <DemoNote className="mt-8 max-w-2xl">
          {t(
            `Deze pagina houdt de URL van de huidige site (${page.path}/). De tekst is samengesteld uit wat er nu op staat; de volledige originele tekst wordt bij de migratie overgenomen.`,
            `The Dutch version keeps the URL of the current site (${page.path}/). The text is put together from what is on it now and translated by us; the full original text follows with the migration.`,
          )}
          {page.unconfirmed.length > 0 && (
            <>
              {" "}
              {t("Ook op de huidige pagina, maar pas zichtbaar na bevestiging:", "Also on the current page, but only shown once confirmed:")}{" "}
              {page.unconfirmed.join(" ")}
            </>
          )}
        </DemoNote>
      </PageIntro>

      {page.sections.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container-page grid gap-3 md:grid-cols-2">
            {page.sections.map((s, i) => (
              <Reveal
                key={s.heading}
                delay={i * 0.04}
                className={page.sections.length === 1 || s.image ? "md:col-span-2" : undefined}
              >
                <SectionCard section={s} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {children}

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
                <span className="block text-title font-semibold text-ink">{t("Scherm vervangen", "Screen replacement")}</span>
                <span className="mt-1 block text-muted">
                  {t(
                    "Wat er gebeurt bij een schermreparatie en voor welke toestellen.",
                    "What happens during a screen repair and for which devices.",
                  )}
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-accent-strong transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {focus && (
        <section className="bg-mist py-16 lg:py-24">
          <div className="container-page">
            <SectionHeading eyebrow={t("Kies je toestel", "Choose your device")} title={focus.title} />
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {focus.devices.map((d) => (
                <li key={d.id}>
                  <DeviceCard device={d} />
                </li>
              ))}
            </ul>
            <Link href="/reparaties" className="mt-8 inline-flex items-center gap-2 font-medium text-accent-strong hover:text-accent">
              {t("Alle toestellen", "All devices")}
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
            <h2 className="text-title font-semibold text-ink">{t("Ook voor", "Also for")}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {otherAreas
                .flatMap((g) => g.pages)
                .filter((p) => p.id !== page.id)
                .map((p) => localizeLanding(p, locale))
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
      {section.intro.map((p) => (
        <p key={p} className="mt-4 leading-relaxed text-muted">
          {p}
        </p>
      ))}
      {section.steps.length > 0 && (
        <ol className="mt-6 space-y-4">
          {section.steps.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent-strong">
                {i + 1}
              </span>
              <span className="pt-1 leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {section.bullets.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {section.bullets.map((b) => {
            // Exclusions on the original site start with "✕": a red cross instead of a checkmark.
            const excluded = /^[✕✗✘×❌]\s*/.test(b);
            return (
              <li key={b} className="flex items-start gap-3 text-ink">
                {excluded ? (
                  <X className="mt-1 size-4 shrink-0 text-danger" strokeWidth={3} aria-hidden />
                ) : (
                  <Check className="mt-1 size-4 shrink-0 text-accent-strong" aria-hidden />
                )}
                {excluded ? b.replace(/^[✕✗✘×❌]\s*/, "") : b}
              </li>
            );
          })}
        </ul>
      )}
      {section.body.map((p) => (
        <p key={p} className="mt-4 leading-relaxed text-muted">
          {p}
        </p>
      ))}
      {section.image && (
        <a href={section.image.src} target="_blank" rel="noopener" className="mt-6 block max-w-xl overflow-hidden rounded-2xl ring-1 ring-line">
          <Image
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            sizes="(min-width: 768px) 42rem, 100vw"
            className="h-auto w-full"
          />
        </a>
      )}
    </div>
  );
}
