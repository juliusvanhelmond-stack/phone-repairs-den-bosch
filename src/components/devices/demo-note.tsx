import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { isDemo } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Explains demo data status to reviewers. Hidden when demo mode is switched off. */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  if (!isDemo) return null;
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-warning-soft px-4 py-3 text-sm leading-relaxed text-warning ring-1 ring-amber-200",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
