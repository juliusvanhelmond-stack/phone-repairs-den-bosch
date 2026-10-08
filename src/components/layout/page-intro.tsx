import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export function PageIntro({
  crumbs,
  eyebrow,
  title,
  intro,
  children,
  aside,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden border-b border-line", className)}>
      <div
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_0%,#000_10%,transparent_70%)]"
        aria-hidden
      />
      <div
        className={cn(
          "container-page grid gap-10 pt-8 pb-14 lg:pb-20",
          aside && "items-center lg:grid-cols-[1.15fr_0.85fr]",
        )}
      >
        <div className="animate-fade-up">
          <Breadcrumbs items={crumbs} className="mb-10 lg:mb-14" />
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-headline font-semibold text-balance text-ink">{title}</h1>
          {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted">{intro}</div>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {aside && <div className="animate-fade-up [animation-delay:120ms]">{aside}</div>}
      </div>
    </section>
  );
}
