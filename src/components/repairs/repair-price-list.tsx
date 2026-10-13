import { Link } from "@/components/i18n/link";
import { MessageCircle, Package, Phone } from "lucide-react";
import { ContentIcon } from "@/components/repairs/icon";
import { fromPrice, getBrand, getPriceList, repairPath } from "@/lib/catalog";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";
import { getI18n } from "@/lib/i18n-server";
import type { Translate } from "@/lib/i18n";
import { formatEuro } from "@/lib/utils";
import type { DeviceModel, PriceRow, RepairService } from "@/types/content";

function priceText(row: PriceRow, t: Translate, locale: "nl" | "en") {
  if (row.amount !== null) return formatEuro(row.amount, locale);
  return row.status === "expected" ? t("Binnenkort", "Coming soon") : t("Op aanvraag", "On request");
}

/**
 * The device's price list as published on the current site, grouped by repair category.
 * Each row is shown word for word; categories without rows are left out.
 */
export async function RepairPriceList({ device, repairs }: { device: DeviceModel; repairs: RepairService[] }) {
  const { locale, t } = await getI18n();
  const brand = getBrand(device.brandId)?.name ?? "";
  const name = device.brandId === "apple" || device.name.startsWith(brand) ? device.name : `${brand} ${device.name}`;
  const list = getPriceList(device.id);
  const groups = repairs
    .map((r) => ({ repair: r, rows: list?.rows.filter((row) => row.repairId === r.id) ?? [] }))
    .filter((g) => g.rows.length > 0);
  const accessories = list?.rows.filter((row) => row.repairId === null) ?? [];

  return (
    <div className="space-y-4">
      {groups.map(({ repair: r, rows }) => {
        const from = fromPrice(device.id, r.id);
        const wa = whatsappHref(whatsappMessage({ device: name, repair: r.name, locale }));
        return (
          <section
            key={r.id}
            aria-labelledby={`prijs-${r.id}`}
            className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:px-6">
              <div className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
                  <ContentIcon name={r.icon} className="size-5" />
                </span>
                <div>
                  <h3 id={`prijs-${r.id}`} className="font-medium text-ink">
                    <Link href={repairPath(r.slug)} className="hover:text-accent">
                      {r.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted">
                    {from
                      ? t(`vanaf ${formatEuro(from, locale)}`, `from ${formatEuro(from, locale)}`)
                      : t("prijs op aanvraag", "price on request")}
                    {rows.length > 1 && ` · ${t(`${rows.length} opties`, `${rows.length} options`)}`}
                  </p>
                </div>
              </div>
              <a
                href={wa ?? site.phone.href}
                {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                aria-label={t(
                  `${r.name} voor je ${name} aanvragen via ${wa ? "WhatsApp" : "telefoon"}`,
                  `Request ${r.name.toLowerCase()} for your ${name} via ${wa ? "WhatsApp" : "phone"}`,
                )}
              >
                {wa ? <MessageCircle className="size-4" aria-hidden /> : <Phone className="size-4" aria-hidden />}
                {t("Aanvragen", "Request")}
              </a>
            </div>
            <PriceRows rows={rows} t={t} locale={locale} />
          </section>
        );
      })}

      {accessories.length > 0 && (
        <section aria-labelledby="prijs-accessoires" className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line">
          <div className="flex items-center gap-4 border-b border-line p-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line">
              <Package className="size-5" aria-hidden />
            </span>
            <h3 id="prijs-accessoires" className="font-medium text-ink">
              {t("Accessoires", "Accessories")}
            </h3>
          </div>
          <PriceRows rows={accessories} t={t} locale={locale} />
        </section>
      )}
    </div>
  );
}

function PriceRows({ rows, t, locale }: { rows: PriceRow[]; t: Translate; locale: "nl" | "en" }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row, i) => (
        <li key={`${row.label}-${i}`} className="flex items-baseline justify-between gap-6 px-5 py-3 text-[0.9375rem] sm:px-6">
          <span className="text-ink-soft" lang="nl">
            {row.label}
          </span>
          <span className={row.amount !== null ? "shrink-0 font-semibold text-ink tabular-nums" : "shrink-0 text-sm text-muted"}>
            {priceText(row, t, locale)}
          </span>
        </li>
      ))}
    </ul>
  );
}
