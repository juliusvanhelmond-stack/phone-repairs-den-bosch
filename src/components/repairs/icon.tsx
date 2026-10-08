import {
  BadgeCheck,
  BatteryCharging,
  CalendarCheck,
  Camera,
  Droplets,
  Eye,
  Keyboard,
  Layers,
  PlugZap,
  Receipt,
  ShieldCheck,
  Smartphone,
  Timer,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  "battery-charging": BatteryCharging,
  "plug-zap": PlugZap,
  camera: Camera,
  droplets: Droplets,
  layers: Layers,
  keyboard: Keyboard,
  wrench: Wrench,
  timer: Timer,
  eye: Eye,
  "badge-check": BadgeCheck,
  "shield-check": ShieldCheck,
  "calendar-check": CalendarCheck,
  receipt: Receipt,
};

export function ContentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Wrench;
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}
