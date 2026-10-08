import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeviceArt } from "@/components/devices/device-art";
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
      <div className="flex h-44 items-end justify-center overflow-hidden bg-mist px-6 pt-8">
        <DeviceArt
          art={device.art}
          className={cn(
            "translate-y-10 transition-transform duration-500 ease-out group-hover:translate-y-6",
            wide ? "w-56" : medium ? "w-32" : "w-[5.5rem]",
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
