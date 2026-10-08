import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "accent" | "warning" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-mist text-ink-soft ring-1 ring-line ring-inset",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "warning" && "bg-warning-soft text-warning ring-1 ring-amber-200 ring-inset",
        tone === "dark" && "bg-white/10 text-white ring-1 ring-white/15 ring-inset",
        className,
      )}
      {...props}
    />
  );
}
