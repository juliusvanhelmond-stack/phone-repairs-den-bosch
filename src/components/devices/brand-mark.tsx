import { BRAND_MARKS } from "@/components/devices/brand-marks";
import { cn } from "@/lib/utils";

/** Monochrome brand logo (Simple Icons) or nothing when the brand only has a wordmark. */
export function BrandMark({ brandId, className }: { brandId: string; className?: string }) {
  const path = BRAND_MARKS[brandId];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5 shrink-0 fill-current", className)}>
      <path d={path} />
    </svg>
  );
}
