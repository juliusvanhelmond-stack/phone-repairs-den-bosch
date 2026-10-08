import { cn } from "@/lib/utils";

/**
 * Soft, blurred colour fields behind a section. Pure CSS gradients (no filters
 * or images), decorative only. Parent needs `relative isolate overflow-hidden`.
 */
const variants = {
  hero: [
    "radial-gradient(42rem 30rem at 85% 8%, rgb(37 99 235 / 0.16), transparent 70%)",
    "radial-gradient(34rem 26rem at 8% 92%, rgb(14 165 233 / 0.12), transparent 70%)",
    "radial-gradient(28rem 22rem at 45% 40%, rgb(129 140 248 / 0.08), transparent 70%)",
  ],
  soft: [
    "radial-gradient(40rem 26rem at 100% 0%, rgb(37 99 235 / 0.10), transparent 70%)",
    "radial-gradient(32rem 24rem at 0% 100%, rgb(14 165 233 / 0.08), transparent 70%)",
  ],
  center: [
    "radial-gradient(46rem 30rem at 50% 0%, rgb(37 99 235 / 0.12), transparent 70%)",
    "radial-gradient(30rem 20rem at 85% 90%, rgb(129 140 248 / 0.10), transparent 70%)",
  ],
  dark: [
    "radial-gradient(40rem 26rem at 15% 0%, rgb(37 99 235 / 0.35), transparent 70%)",
    "radial-gradient(34rem 24rem at 95% 100%, rgb(14 165 233 / 0.18), transparent 70%)",
  ],
} as const;

export function Aura({ variant = "soft", className }: { variant?: keyof typeof variants; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{ backgroundImage: variants[variant].join(",") }}
    />
  );
}
