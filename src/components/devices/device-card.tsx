import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { DevicePhoto } from "@/components/devices/device-photo";
import { devicePath, getBrand } from "@/lib/catalog";
import type { DeviceModel } from "@/types/content";
import { cn } from "@/lib/utils";

/** `compact`: denser cards for long model lists (brand pages), so a visitor finds a model faster (2026-10-15). */
export function DeviceCard({ device, compact, className }: { device: DeviceModel; compact?: boolean; className?: string }) {
  const wide = device.art === "laptop";
  const medium = device.art.startsWith("tablet") || device.art === "phone-foldable";
  return (
    <Link
      href={devicePath(device)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:ring-line-strong",
        className,
      )}
    >
      <div className={cn("relative flex items-center justify-center tone-light overflow-hidden border-b border-line bg-white", compact ? "h-20 px-3 py-2 sm:h-28 lg:h-32" : "h-44 px-5 py-3")}>
        <DevicePhoto
          device={device}
          decorative
          sizes={compact ? "(min-width: 1280px) 12rem, (min-width: 768px) 22vw, 45vw" : "(min-width: 1024px) 18rem, (min-width: 768px) 30vw, 45vw"}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          artClassName={cn(
            "h-full w-auto transition-transform duration-500 ease-out group-hover:scale-[1.04]",
            compact ? (wide ? "max-w-40" : medium ? "max-w-24" : "max-w-16") : wide ? "max-w-56" : medium ? "max-w-32" : "max-w-[5.5rem]",
          )}
        />
      </div>
      <div className={cn("flex flex-1 items-center justify-between gap-3", compact ? "px-3.5 py-3" : "p-5")}>
        <span>
          <span className="block text-xs text-muted">{getBrand(device.brandId)?.name}</span>
          <span className={cn("block font-medium tracking-tight text-ink", compact && "text-[0.9375rem] leading-snug")}>{device.name}</span>
        </span>
        <span className={cn("grid shrink-0 place-items-center rounded-full bg-mist text-ink transition-colors group-hover:bg-night group-hover:text-white", compact ? "size-7 max-sm:hidden" : "size-9")}>
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
