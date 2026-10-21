import { devices, getPriceList } from "@/lib/catalog";

/**
 * Price rows of one device, for the device finder's part options (client request 2026-10-19:
 * choose the part quality and see its price). Prerendered per device at build time, so the
 * homepage does not carry the rows of all devices.
 */
export function generateStaticParams() {
  return devices.map((d) => ({ device: d.id }));
}

export type FinderPriceRow = {
  repairId: string;
  label: string;
  amount: number | null;
  status: string;
  popular: boolean;
};

export async function GET(_request: Request, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params;
  const list = getPriceList(device);
  if (!list) return Response.json([], { status: 404 });
  const rows: FinderPriceRow[] = list.rows.flatMap((r) =>
    r.repairId ? [{ repairId: r.repairId, label: r.label, amount: r.amount, status: r.status, popular: !!r.popular }] : [],
  );
  return Response.json(rows);
}
