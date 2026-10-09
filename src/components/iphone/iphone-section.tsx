import { Aura } from "@/components/ui/aura";
import { devicePath, getDevice, getRepair, getVerifiedPrice, repairPath } from "@/lib/catalog";
import { isDemo } from "@/lib/site";
import { IphoneExperience, type RepairInfo } from "./iphone-experience";
import { MODEL_URL } from "./config";
import { REPAIR_ORDER, REPAIR_SERVICE_IDS, type RepairKey } from "./parts";

/** Repairs whose typical duration is backed by the original site ("vaak binnen 30 minuten"). */
const VERIFIED_QUICK = new Set<RepairKey>(["display", "battery"]);

/**
 * Homepage section with the scroll-driven exploded iPhone. Repair content,
 * links and (verified) prices come from the catalog — nothing is invented here.
 */
export function IphoneSection() {
  const device = getDevice("apple", "iphone-17");
  const repairs = Object.fromEntries(
    REPAIR_ORDER.map((key) => {
      const service = getRepair(REPAIR_SERVICE_IDS[key]);
      if (!service) throw new Error(`Unknown repair service for ${key}`);
      const price = device ? getVerifiedPrice(device.id, service.id)?.amount : undefined;
      const info: RepairInfo = {
        name: service.name,
        summary: service.summary,
        icon: service.icon,
        detailHref: device ? devicePath(device) : repairPath(service.slug),
        bookingHref: `/afspraak?${device ? `toestel=${device.id}&` : ""}reparatie=${service.id}`,
        ...(price ? { price } : {}),
        ...(VERIFIED_QUICK.has(key) ? { duration: "Vaak binnen 30 minuten" } : {}),
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
            ? "Demo: tijdelijk 3D-model. Het definitieve, gelicentieerde iPhone 17-model wordt nog toegevoegd."
            : undefined
        }
      />
    </div>
  );
}
