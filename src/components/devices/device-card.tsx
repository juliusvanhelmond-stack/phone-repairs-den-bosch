import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { DevicePhoto } from "@/components/devices/device-photo";
import { devicePath, getBrand } from "@/lib/catalog";
import type { DeviceModel } from "@/types/content";
import { cn } from "@/lib/utils";

export function DeviceCard({ device, className }: { device: DeviceModel; className?: string }) {
  const wide = device.art === "laptop";
  const medium = device.art.startsWith("tablet") || device.art === "phone-foldable";
  return (
    <Link
      href={devicePath(device)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:ring-line-strong",
        className,
      )}
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-line bg-white px-5 py-3">
        <DevicePhoto
          device={device}
          decorative
          sizes="(min-width: 1024px) 18rem, (min-width: 768px) 30vw, 45vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          artClassName={cn(
            "h-full w-auto transition-transform duration-500 ease-out group-hover:scale-[1.04]",
            wide ? "max-w-56" : medium ? "max-w-32" : "max-w-[5.5rem]",
          )}
        />
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 p-5">
        <span>
          <span className="block text-xs text-muted">{getBrand(device.brandId)?.name}</span>
          <span className="block font-medium tracking-tight text-ink">{device.name}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mist text-ink transition-colors group-hover:bg-ink group-hover:text-white">
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
