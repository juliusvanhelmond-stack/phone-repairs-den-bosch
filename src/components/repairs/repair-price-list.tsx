import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { ContentIcon } from "@/components/repairs/icon";
import { getBrand, getVerifiedPrice, repairPath } from "@/lib/catalog";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";
import { formatEuro } from "@/lib/utils";
import type { DeviceModel, RepairService } from "@/types/content";

/** Repairs for one device with verified prices, or "op aanvraag" when unknown. */
export function RepairPriceList({ device, repairs }: { device: DeviceModel; repairs: RepairService[] }) {
  const brand = getBrand(device.brandId)?.name ?? "";
  const name = device.brandId === "apple" || device.name.startsWith(brand) ? device.name : `${brand} ${device.name}`;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line">
      {repairs.map((r) => {
        const price = getVerifiedPrice(device.id, r.id);
        const wa = whatsappHref(whatsappMessage({ device: name, repair: r.name }));
        return (
          <li key={r.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
                <ContentIcon name={r.icon} className="size-5" />
              </span>
              <div>
                <h3 className="font-medium text-ink">
                  <Link href={repairPath(r.slug)} className="hover:text-accent">
                    {r.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.summary}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6 pl-15 sm:justify-end sm:pl-0">
              <div className="text-right">
                {price?.amount ? (
                  <>
                    <p className="text-xl font-semibold tracking-tight text-ink tabular-nums">{formatEuro(price.amount)}</p>
                    <p className="text-xs text-muted">incl. montage en btw</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-ink">Op aanvraag</p>
                    <p className="text-xs text-muted">vraag de prijs via WhatsApp</p>
                  </>
                )}
              </div>
              <a
                href={wa ?? site.phone.href}
                {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                aria-label={`${r.name} voor je ${name} aanvragen via ${wa ? "WhatsApp" : "telefoon"}`}
              >
                {wa ? <MessageCircle className="size-4" aria-hidden /> : <Phone className="size-4" aria-hidden />}
                Aanvragen
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
