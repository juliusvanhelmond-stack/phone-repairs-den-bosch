import { BRAND_MARKS } from "@/components/devices/brand-marks";
import { DeviceFinder } from "@/components/devices/device-finder";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { brandLabel, brands, categories, finderIndex, localizeCategory, localizeRepair, repairs } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import { Aura } from "@/components/ui/aura";

export async function FinderSection() {
  const { locale, t } = await getI18n();
  return (
    <section id="toestel-zoeken" className="relative isolate overflow-hidden bg-mist py-20 lg:py-28">
      <Aura variant="center" />
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow={t("Toestel zoeken", "Find your device")}
            title={t("In vier stappen naar de juiste reparatie.", "The right repair in four steps.")}
            intro={t(
              "Kies je toestel, merk en model en zie direct welke reparaties mogelijk zijn. Daarna maak je meteen een afspraak.",
              "Choose your device type, brand and model and see straight away which repairs are possible. Then book right away.",
            )}
            className="mb-10 lg:mb-12"
          />
        </Reveal>
        <Reveal delay={0.05}>
          <DeviceFinder
            categories={categories
              .map((c) => localizeCategory(c, locale))
              .map(({ id, name, plural, description }) => ({ id, name, plural, description }))}
            brands={brands.map(({ id, name, categories }) => ({
              id,
              name,
              categories,
              labels: Object.fromEntries(categories.map((c) => [c, brandLabel(id, c)])),
              mark: BRAND_MARKS[id] ?? null,
            }))}
            repairs={repairs.map((r) => localizeRepair(r, locale)).map(({ id, name, summary, icon, categories, advice }) => ({
              id,
              name,
              summary,
              icon,
              categories,
              advice,
            }))}
            devices={finderIndex()}
            contact={{
              phoneDisplay: site.phone.display,
              phoneHref: site.phone.href,
              email: site.email,
              whatsappNumber: site.whatsapp?.number ?? null,
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}
