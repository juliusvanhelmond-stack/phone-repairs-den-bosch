"use client";

import Image, { type StaticImageData } from "next/image";
import { DeviceArt } from "@/components/devices/device-art";
import type { DeviceModel } from "@/types/content";
import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import android from "@/assets/devices/android.jpg";
import galaxyTab from "@/assets/devices/galaxy-tab.jpg";
import ipad from "@/assets/devices/ipad.jpg";
import ipadHome from "@/assets/devices/ipad-home.jpg";
import iphone from "@/assets/devices/iphone.jpg";
import iphoneHome from "@/assets/devices/iphone-home.jpg";
import iphoneNotch from "@/assets/devices/iphone-notch.jpg";
import iphonePro from "@/assets/devices/iphone-pro.jpg";
import macbook from "@/assets/devices/macbook.jpg";

/**
 * Product-style photos on white, one per device type. They are licensed, unbranded
 * Adobe Stock mockups (docs/image-credits.md): representative of the type, not the
 * exact model, so the alt text says "voorbeeld". Foldables have no suitable photo yet
 * and fall back to the SVG render.
 */
const photos = {
  "iphone-pro": iphonePro,
  iphone,
  "iphone-notch": iphoneNotch,
  "iphone-home": iphoneHome,
  android,
  ipad,
  "ipad-home": ipadHome,
  "galaxy-tab": galaxyTab,
  macbook,
} satisfies Record<string, StaticImageData>;

export type DevicePhotoKey = keyof typeof photos;

type PhotoDevice = Pick<DeviceModel, "brandId" | "name" | "art">;

export function devicePhotoKey(device: PhotoDevice): DevicePhotoKey | null {
  const apple = device.brandId === "apple";
  switch (device.art) {
    case "laptop":
      return "macbook";
    case "tablet-home-button":
      return "ipad-home";
    case "tablet":
      return apple ? "ipad" : "galaxy-tab";
    case "phone-island":
      return /\bPro\b/.test(device.name) ? "iphone-pro" : "iphone";
    case "phone-notch":
      return apple ? "iphone-notch" : "android";
    case "phone-home-button":
      return "iphone-home";
    case "phone-punch-hole":
      return "android";
    default:
      return null;
  }
}

export function categoryPhoto(categoryId: string): StaticImageData {
  return categoryId === "laptop" ? macbook : categoryId === "tablet" ? ipad : iphone;
}

/** Photo of the device type on white; falls back to the SVG render when there is no photo. */
export function DevicePhoto({
  device,
  sizes,
  className,
  artClassName,
  priority,
  decorative,
}: {
  device: PhotoDevice;
  sizes: string;
  className?: string;
  /** Classes for the SVG fallback. */
  artClassName?: string;
  priority?: boolean;
  /** Set when the device name is already in adjacent text (cards, lists). */
  decorative?: boolean;
}) {
  const { t } = useI18n();
  const key = devicePhotoKey(device);
  if (!key) return <DeviceArt art={device.art} title={decorative ? undefined : device.name} className={artClassName} />;
  return (
    <Image
      src={photos[key]}
      alt={decorative ? "" : `${device.name} (${t("voorbeeldafbeelding", "example image")})`}
      sizes={sizes}
      priority={priority}
      className={cn("h-full w-full object-contain", className)}
    />
  );
}
