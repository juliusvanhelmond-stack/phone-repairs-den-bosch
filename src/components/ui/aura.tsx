import { cn } from "@/lib/utils";

/**
 * Soft, blurred colour fields behind a section. Pure CSS gradients (no filters
 * or images), decorative only. Parent needs `relative isolate overflow-hidden`.
 */
const variants = {
  hero: [
    "radial-gradient(42rem 30rem at 85% 8%, rgb(16 111 49 / 0.13), transparent 70%)",
    "radial-gradient(34rem 26rem at 8% 92%, rgb(110 168 120 / 0.12), transparent 70%)",
    "radial-gradient(28rem 22rem at 45% 40%, rgb(81 81 81 / 0.05), transparent 70%)",
  ],
  soft: [
    "radial-gradient(40rem 26rem at 100% 0%, rgb(16 111 49 / 0.09), transparent 70%)",
    "radial-gradient(32rem 24rem at 0% 100%, rgb(110 168 120 / 0.08), transparent 70%)",
  ],
  center: [
    "radial-gradient(46rem 30rem at 50% 0%, rgb(16 111 49 / 0.1), transparent 70%)",
    "radial-gradient(30rem 20rem at 85% 90%, rgb(110 168 120 / 0.08), transparent 70%)",
  ],
  dark: [
    "radial-gradient(40rem 26rem at 15% 0%, rgb(16 111 49 / 0.45), transparent 70%)",
    "radial-gradient(34rem 24rem at 95% 100%, rgb(110 168 120 / 0.16), transparent 70%)",
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
