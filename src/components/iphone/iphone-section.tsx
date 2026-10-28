import { Aura } from "@/components/ui/aura";
import { devices, fromPrice, getRepair, localizeRepair, repairPath } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { isDemo, whatsappHref, whatsappMessage } from "@/lib/site";
import { IphoneExperience, type RepairInfo } from "./iphone-experience";
import { MODEL_URL } from "./config";
import { REPAIR_ORDER, REPAIR_SERVICE_IDS, type RepairKey } from "./parts";

/** Repairs whose typical duration is backed by the original site ("binnen 30 minuten"). */
const VERIFIED_QUICK = new Set<RepairKey>(["display", "battery"]);

/**
 * Homepage section with the scroll-driven exploded iPhone. Repair content,
 * links and "vanaf" prices come from the catalog (the shop's price lists) — nothing is invented here.
 * The "vanaf" price is the lowest of all iPhones (client request 2026-10-27), so it links to the
 * repair page that lists every model.
 */
export async function IphoneSection() {
  const { locale, t } = await getI18n();
  const iphones = devices.filter((d) => d.brandId === "apple" && d.categoryId === "smartphone");
  const repairs = Object.fromEntries(
    REPAIR_ORDER.map((key) => {
      const found = getRepair(REPAIR_SERVICE_IDS[key]);
      if (!found) throw new Error(`Unknown repair service for ${key}`);
      const service = localizeRepair(found, locale);
      const prices = iphones.flatMap((d) => fromPrice(d.id, service.id) ?? []);
      const price = prices.length ? Math.min(...prices) : undefined;
      const info: RepairInfo = {
        name: service.name,
        summary: service.summary,
        icon: service.icon,
        detailHref: repairPath(service.slug),
        bookingHref:
          whatsappHref(whatsappMessage({ device: "iPhone", repair: service.name, locale })) ??
          `/afspraak?reparatie=${service.id}`,
        ...(price ? { price } : {}),
        ...(VERIFIED_QUICK.has(key) ? { duration: t("Binnen 30 minuten", "Within 30 minutes") } : {}),
      };
      return [key, info];
    }),
  ) as Record<RepairKey, RepairInfo>;

  return (
    <div className="relative isolate">
      <Aura variant="center" />
      <IphoneExperience
        repairs={repairs}
        modelNote={
          isDemo && !MODEL_URL
            ? t(
                "Demo: tijdelijk 3D-model. Het definitieve, gelicentieerde iPhone 17-model wordt nog toegevoegd.",
                "Demo: temporary 3D model. The final, licensed iPhone 17 model will be added later.",
              )
            : undefined
        }
      />
    </div>
  );
}
