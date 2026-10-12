import { Aura } from "@/components/ui/aura";
import { devicePath, getDevice, getRepair, getVerifiedPrice, localizeRepair, repairPath } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { isDemo, whatsappHref, whatsappMessage } from "@/lib/site";
import { IphoneExperience, type RepairInfo } from "./iphone-experience";
import { MODEL_URL } from "./config";
import { REPAIR_ORDER, REPAIR_SERVICE_IDS, type RepairKey } from "./parts";

/** Repairs whose typical duration is backed by the original site ("vaak binnen 30 minuten"). */
const VERIFIED_QUICK = new Set<RepairKey>(["display", "battery"]);

/**
 * Homepage section with the scroll-driven exploded iPhone. Repair content,
 * links and (verified) prices come from the catalog — nothing is invented here.
 */
export async function IphoneSection() {
  const { locale, t } = await getI18n();
  const device = getDevice("apple", "iphone-17");
  const repairs = Object.fromEntries(
    REPAIR_ORDER.map((key) => {
      const found = getRepair(REPAIR_SERVICE_IDS[key]);
      if (!found) throw new Error(`Unknown repair service for ${key}`);
      const service = localizeRepair(found, locale);
      const price = device ? getVerifiedPrice(device.id, service.id)?.amount : undefined;
      const info: RepairInfo = {
        name: service.name,
        summary: service.summary,
        icon: service.icon,
        detailHref: device ? devicePath(device) : repairPath(service.slug),
        bookingHref:
          whatsappHref(whatsappMessage({ device: device?.name ?? "iPhone", repair: service.name, locale })) ??
          `/afspraak?${device ? `toestel=${device.id}&` : ""}reparatie=${service.id}`,
        ...(price ? { price } : {}),
        ...(VERIFIED_QUICK.has(key) ? { duration: t("Vaak binnen 30 minuten", "Often within 30 minutes") } : {}),
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
