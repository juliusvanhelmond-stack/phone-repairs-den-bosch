import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades content in as it scrolls into view using CSS scroll-driven animations.
 * Content is always rendered visible first: browsers without support, users
 * with reduced motion and crawlers simply see the final state.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility; scroll-driven reveals are position based. */
  delay?: number;
}) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
