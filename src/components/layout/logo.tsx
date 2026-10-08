import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <rect x="10.5" y="6.5" width="11" height="19" rx="3" fill="none" stroke="#fff" strokeWidth="1.8" />
      <rect x="14" y="9" width="4" height="1.6" rx="0.8" fill="#fff" />
      <circle cx="24.5" cy="24.5" r="3.5" fill="#2563EB" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
  onClick,
}: {
  tone?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="Phone Repairs, naar de homepage"
    >
      <LogoMark className={tone === "dark" ? "text-ink" : "text-white"} />
      <span
        className={cn(
          "text-[1.0625rem] font-semibold tracking-[-0.02em]",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        Phone Repairs
      </span>
    </Link>
  );
}
